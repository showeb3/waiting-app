// OAuth callback handler for Cloudflare Pages
// Self-contained with no server dependencies
import { drizzle } from "drizzle-orm/d1";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { eq, sql } from "drizzle-orm";

interface Env {
    DB: D1Database;
}

// Define users table inline
const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    openId: text("openId").notNull().unique(),
    name: text("name"),
    email: text("email"),
    loginMethod: text("loginMethod"),
    role: text("role", { enum: ["user", "admin", "staff"] }).default("user").notNull(),
    lastSignedIn: integer("lastSignedIn", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

const COOKIE_NAME = "session";
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export const onRequest: PagesFunction<Env> = async (context) => {
    const url = new URL(context.request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code || !state) {
        return new Response(JSON.stringify({ error: "code and state are required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const db = drizzle(context.env.DB);

        // For mock OAuth, we always use the same user
        const mockOpenId = "local-owner";

        // Upsert user
        const existing = await db.select().from(users).where(eq(users.openId, mockOpenId)).get();

        if (!existing) {
            await db.insert(users).values({
                openId: mockOpenId,
                name: "Local Admin",
                email: "admin@example.com",
                loginMethod: "email",
                role: "admin",
                lastSignedIn: new Date(),
            }).run();
        } else {
            await db.update(users)
                .set({ lastSignedIn: new Date() })
                .where(eq(users.id, existing.id))
                .run();
        }

        // Create mock session token (in real app, use JWT)
        const sessionToken = `mock_session_${Date.now()}`;

        // Set cookie (Changed to SameSite=None)
        const headers = new Headers();
        headers.set("Content-Type", "application/json");
        headers.set(
            "Set-Cookie",
            `${COOKIE_NAME}=${sessionToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=${ONE_YEAR_MS / 1000}`
        );

        return new Response(JSON.stringify({
            success: true,
            message: "Login successful",
            token: sessionToken, // Return token for client-side storage
            user: {              // Optional: return user info immediately
                openId: mockOpenId,
                role: existing ? existing.role : "admin"
            }
        }), {
            status: 200,
            headers,
        });
    } catch (error) {
        console.error("[OAuth] Callback failed", error);
        return new Response(JSON.stringify({ error: "OAuth callback failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};
