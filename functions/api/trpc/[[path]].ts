// Minimal tRPC handler with cookie authentication & D1 support
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import { drizzle } from "drizzle-orm/d1";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { eq, sql, and, or } from "drizzle-orm";
import superjson from "superjson";

interface Env {
    DB: D1Database;
}

// Define D1 schema inline
const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    openId: text("openId").notNull().unique(),
    name: text("name"),
    email: text("email"),
    loginMethod: text("loginMethod"),
    role: text("role", { enum: ["user", "admin", "staff"] }).default("user").notNull(),
    lastSignedIn: integer("lastSignedIn", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

const stores = sqliteTable("stores", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    nameEn: text("nameEn"),
    ownerId: integer("ownerId").notNull(),
    isOpen: integer("isOpen", { mode: "boolean" }).default(true).notNull(),
    settings: text("settings"), // JSON string
    lastNumberingResetAt: integer("lastNumberingResetAt", { mode: "timestamp" }),
});

const tickets = sqliteTable("tickets", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    storeId: integer("storeId").notNull(),
    token: text("token").notNull(),
    partySize: integer("partySize").notNull(),
    guestName: text("guestName").notNull(),
    sequenceNumber: integer("sequenceNumber").notNull(),
    status: text("status", { enum: ["waiting", "called", "completed", "cancelled"] }).default("waiting").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    calledAt: integer("calledAt", { mode: "timestamp" }),
    completedAt: integer("completedAt", { mode: "timestamp" }),
});

const COOKIE_NAME = "session";

// Parse cookies from request
function getCookie(request: Request, name: string): string | null {
    const cookieHeader = request.headers.get("Cookie") || request.headers.get("cookie");

    if (!cookieHeader) {
        return null;
    }

    const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
        const parts = cookie.trim().split("=");
        if (parts.length >= 2) {
            const key = parts[0];
            const value = parts.slice(1).join("=");
            acc[key] = value;
        }
        return acc;
    }, {} as Record<string, string>);

    return cookies[name] || null;
}

// Create tRPC context with authentication
async function createContext(request: Request, db: any) {
    let user = null;

    console.log("[tRPC] Creating context. URL:", request.url);

    // Check for session cookie
    let sessionToken = getCookie(request, COOKIE_NAME);

    // Also check Authorization header (Bearer token)
    if (!sessionToken) {
        const authHeader = request.headers.get("Authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
            sessionToken = authHeader.substring(7);
            console.log("[tRPC] Found Bearer token in header");
        }
    }

    if (sessionToken) {
        // For mock auth, if cookie exists, user is authenticated as local-owner
        try {
            const result = await db.select().from(users)
                .where(eq(users.openId, "local-owner"))
                .get();

            if (result) {
                user = result;
                console.log("[tRPC Context] User authenticated:", result.openId, result.role);
            }
        } catch (e: any) {
            console.error("[tRPC] DB Query Error:", e.message, e);
        }
    } else {
        console.log("[tRPC] No session token found");
    }

    return {
        req: request,
        db,
        user,
    };
}

type Context = Awaited<ReturnType<typeof createContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
        return {
            ...shape,
            data: {
                ...shape.data,
                zodError:
                    error.cause instanceof z.ZodError
                        ? error.cause.flatten()
                        : null,
            },
        };
    },
});

// Define router
const appRouter = t.router({
    auth: t.router({
        me: t.procedure.query(({ ctx }) => {
            console.log("[tRPC auth.me] Returning user", ctx.user?.openId);
            return ctx.user;
        }),
    }),

    stores: t.router({
        getBySlug: t.procedure
            .input(z.object({ slug: z.string() }))
            .query(async ({ ctx, input }) => {
                const result = await ctx.db.select().from(stores)
                    .where(eq(stores.slug, input.slug))
                    .get();

                if (!result) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Store not found",
                    });
                }

                return result;
            }),
    }),

    tickets: t.router({
        create: t.procedure
            .input(z.object({
                storeSlug: z.string(),
                guestName: z.string(),
                partySize: z.number().min(1)
            }))
            .mutation(async ({ ctx, input }) => {
                const store = await ctx.db.select().from(stores).where(eq(stores.slug, input.storeSlug)).get();
                if (!store) throw new TRPCError({ code: "NOT_FOUND", message: "Store not found" });

                // Calculate numbering start boundary (Automatic Daily Reset + Manual Reset support)
                const now = new Date();

                // Calculate today's midnight in JST (UTC+9)
                const jstDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
                jstDate.setHours(0, 0, 0, 0);

                // UTC equivalent calculation
                const nowMs = now.getTime();
                const offsetMs = 9 * 60 * 60 * 1000;
                const jstNowMs = nowMs + offsetMs;
                const jstTodayStartMs = Math.floor(jstNowMs / (24 * 60 * 60 * 1000)) * (24 * 60 * 60 * 1000);
                const todayStartUtcMs = jstTodayStartMs - offsetMs;
                const todayStart = new Date(todayStartUtcMs);

                // Determine effective boundary: Max(TodayStart, LastManualReset)
                let effectiveBoundary = todayStart;
                if (store.lastNumberingResetAt && store.lastNumberingResetAt > todayStart) {
                    effectiveBoundary = store.lastNumberingResetAt;
                }

                // Count tickets created AFTER the boundary
                const countResult = await ctx.db.select({ count: sql<number>`COUNT(*)` })
                    .from(tickets)
                    .where(and(
                        eq(tickets.storeId, store.id),
                        sql`${tickets.createdAt} >= ${effectiveBoundary}`
                    ))
                    .get();

                const nextNum = (countResult?.count || 0) + 1;
                const token = Math.random().toString(36).substring(2, 12).toUpperCase();

                await ctx.db.insert(tickets).values({
                    storeId: store.id,
                    token,
                    partySize: input.partySize,
                    guestName: input.guestName,
                    sequenceNumber: nextNum,
                    status: "waiting",
                    createdAt: now,
                }).run();

                return {
                    success: true,
                    storeSlug: store.slug,
                    token: token,
                    ticket: {
                        sequenceNumber: nextNum,
                        guestName: input.guestName,
                        waitTime: 5 * nextNum // mock wait time
                    }
                };
            }),

        getByToken: t.procedure
            .input(z.object({ token: z.string() }))
            .query(async ({ ctx, input }) => {
                const ticket = await ctx.db.select().from(tickets).where(eq(tickets.token, input.token)).get();
                if (!ticket) throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });

                const store = await ctx.db.select().from(stores).where(eq(stores.id, ticket.storeId)).get();

                const currentCalling = await ctx.db.select().from(tickets)
                    .where(and(eq(tickets.storeId, ticket.storeId), eq(tickets.status, "called")))
                    .orderBy(sql`${tickets.calledAt} DESC`)
                    .limit(1)
                    .get();

                try {
                    const groupsAheadResult = await ctx.db.select({ count: sql<number>`COUNT(*)` })
                        .from(tickets)
                        .where(and(
                            eq(tickets.storeId, ticket.storeId),
                            eq(tickets.status, "waiting"),
                            sql`${tickets.id} < ${ticket.id}`
                        ))
                        .get();

                    return {
                        ticket,
                        currentCalling: currentCalling || null,
                        groupsAhead: groupsAheadResult?.count || 0,
                        storeSlug: store ? store.slug : ""
                    };
                } catch (e) {
                    console.error("Error calculating groups ahead", e);
                    return {
                        ticket,
                        currentCalling: currentCalling || null,
                        groupsAhead: 0,
                        storeSlug: store ? store.slug : ""
                    };
                }
            }),

        cancel: t.procedure
            .input(z.object({ token: z.string() }))
            .mutation(async ({ ctx, input }) => {
                await ctx.db.update(tickets)
                    .set({ status: "cancelled", completedAt: new Date() })
                    .where(eq(tickets.token, input.token))
                    .run();
                return { success: true };
            }),

        subscribePush: t.procedure
            .input(z.object({ token: z.string(), subscription: z.any() }))
            .mutation(async ({ ctx, input }) => {
                console.log("Push subscription received", input);
                return { success: true };
            }),
    }),

    admin: t.router({
        getTickets: t.procedure
            .input(z.object({ storeSlug: z.string() }))
            .query(async ({ ctx, input }) => {
                // Get store first
                const store = await ctx.db.select().from(stores).where(eq(stores.slug, input.storeSlug)).get();
                if (!store) throw new TRPCError({ code: "NOT_FOUND", message: "Store not found" });

                // Get tickets (waiting or called only)
                const result = await ctx.db.select().from(tickets)
                    .where(
                        and(
                            eq(tickets.storeId, store.id),
                            or(eq(tickets.status, "waiting"), eq(tickets.status, "called"))
                        )
                    )
                    .all();

                // Sort by createdAt ASC (oldest first)
                return result.sort((a: any, b: any) => {
                    const timeA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
                    const timeB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
                    return timeA - timeB;
                });
            }),

        callNext: t.procedure
            .input(z.object({ storeSlug: z.string().optional(), ticketId: z.number().optional() }))
            .mutation(async ({ ctx, input }) => {
                const now = new Date();

                if (input.ticketId) {
                    // Call specific ticket
                    await ctx.db.update(tickets)
                        .set({ status: "called", calledAt: now })
                        .where(eq(tickets.id, input.ticketId))
                        .run();
                } else if (input.storeSlug) {
                    // Find next waiting ticket
                    const store = await ctx.db.select().from(stores).where(eq(stores.slug, input.storeSlug)).get();
                    if (!store) throw new TRPCError({ code: "NOT_FOUND", message: "Store not found" });

                    const nextTicket = await ctx.db.select().from(tickets)
                        .where(and(eq(tickets.storeId, store.id), eq(tickets.status, "waiting")))
                        .orderBy(tickets.createdAt) // oldest first
                        .limit(1)
                        .get();

                    if (nextTicket) {
                        await ctx.db.update(tickets)
                            .set({ status: "called", calledAt: now })
                            .where(eq(tickets.id, nextTicket.id))
                            .run();
                    } else {
                        throw new TRPCError({ code: "NOT_FOUND", message: "No waiting tickets" });
                    }
                }
                return { success: true };
            }),

        completeTicket: t.procedure
            .input(z.object({ ticketId: z.number() }))
            .mutation(async ({ ctx, input }) => {
                const now = new Date();
                await ctx.db.update(tickets)
                    .set({ status: "completed", completedAt: now })
                    .where(eq(tickets.id, input.ticketId))
                    .run();
                return { success: true };
            }),

        cancel: t.procedure
            .input(z.object({ ticketId: z.number() }))
            .mutation(async ({ ctx, input }) => {
                const now = new Date();
                await ctx.db.update(tickets)
                    .set({ status: "cancelled", completedAt: now })
                    .where(eq(tickets.id, input.ticketId))
                    .run();
                return { success: true };
            }),

        skip: t.procedure
            .input(z.object({ ticketId: z.number() }))
            .mutation(async ({ ctx, input }) => {
                const now = new Date();
                // Map skip to cancelled for now to fit schema
                await ctx.db.update(tickets)
                    .set({ status: "cancelled", completedAt: now }) // Using cancelled status
                    .where(eq(tickets.id, input.ticketId))
                    .run();
                return { success: true };
            }),

        getStore: t.procedure
            .input(z.object({ slug: z.string() }))
            .query(async ({ ctx, input }) => {
                const store = await ctx.db.select().from(stores).where(eq(stores.slug, input.slug)).get();
                if (!store) throw new TRPCError({ code: "NOT_FOUND", message: "Store not found" });
                return store;
            }),

        updateStore: t.procedure
            .input(z.object({
                slug: z.string(),
                name: z.string().optional(),
                isOpen: z.boolean().optional(),
                // Settings fields
                notificationThreshold3: z.number().optional(),
                notificationThreshold1: z.number().optional(),
                skipRecoveryMode: z.string().optional(),
                printMethod: z.string().optional(),
                autoResetSeconds: z.number().optional(),
            }))
            .mutation(async ({ ctx, input }) => {
                const store = await ctx.db.select().from(stores).where(eq(stores.slug, input.slug)).get();
                if (!store) throw new TRPCError({ code: "NOT_FOUND", message: "Store not found" });

                // Construct settings object
                let currentSettings = {};
                try {
                    if (store.settings) {
                        currentSettings = JSON.parse(store.settings);
                    }
                } catch (e) {
                    console.error("Failed to parse settings:", e);
                }

                const newSettings = {
                    ...currentSettings,
                    ...(input.notificationThreshold3 !== undefined && { notificationThreshold3: input.notificationThreshold3 }),
                    ...(input.notificationThreshold1 !== undefined && { notificationThreshold1: input.notificationThreshold1 }),
                    ...(input.skipRecoveryMode !== undefined && { skipRecoveryMode: input.skipRecoveryMode }),
                    ...(input.printMethod !== undefined && { printMethod: input.printMethod }),
                    ...(input.autoResetSeconds !== undefined && { autoResetSeconds: input.autoResetSeconds }),
                };

                const updateData: any = {
                    settings: JSON.stringify(newSettings)
                };

                if (input.name !== undefined) updateData.name = input.name;
                if (input.isOpen !== undefined) updateData.isOpen = input.isOpen;

                await ctx.db.update(stores)
                    .set(updateData)
                    .where(eq(stores.id, store.id))
                    .run();

                return { success: true };
            }),

        resetNumbering: t.procedure
            .input(z.object({
                slug: z.string()
            }))
            .mutation(async ({ ctx, input }) => {
                const store = await ctx.db.select().from(stores).where(eq(stores.slug, input.slug)).get();
                if (!store) throw new TRPCError({ code: "NOT_FOUND", message: "Store not found" });

                await ctx.db.update(stores)
                    .set({ lastNumberingResetAt: new Date() })
                    .where(eq(stores.id, store.id))
                    .run();

                return { success: true };
            }),
    }),
});

export type AppRouter = typeof appRouter;

// Cloudflare Pages Function Handler
export const onRequest: PagesFunction<Env> = async (context) => {
    const db = drizzle(context.env.DB);

    return fetchRequestHandler({
        endpoint: "/api/trpc",
        req: context.request,
        router: appRouter,
        createContext: async ({ req }) => createContext(req, db),
        onError: ({ path, error }) => {
            console.error(`tRPC Error on '${path}':`, error);
        },
    });
};
