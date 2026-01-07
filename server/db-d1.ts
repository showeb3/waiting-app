import { eq, and, desc, asc, sql } from "drizzle-orm";
import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import {
    InsertUser,
    users,
    stores,
    tickets,
    pushSubscriptions,
    printJobs,
    staffAssignments,
    Ticket,
    Store,
    User,
} from "../drizzle/schema-d1";

/**
 * Initialize database connection from D1 binding
 */
export function getDb(d1: D1Database): DrizzleD1Database {
    return drizzle(d1);
}

/**
 * Upsert user (insert or update based on openId)
 */
export async function upsertUser(db: DrizzleD1Database, user: InsertUser): Promise<void> {
    if (!user.openId) {
        throw new Error("User openId is required for upsert");
    }

    try {
        // Check if user exists
        const existing = await db
            .select()
            .from(users)
            .where(eq(users.openId, user.openId))
            .get();

        if (existing) {
            // Update existing user
            const updateData: Partial<InsertUser> = {};
            if (user.name !== undefined) updateData.name = user.name;
            if (user.email !== undefined) updateData.email = user.email;
            if (user.loginMethod !== undefined) updateData.loginMethod = user.loginMethod;
            if (user.lastSignedIn !== undefined) updateData.lastSignedIn = user.lastSignedIn;

            if (Object.keys(updateData).length > 0) {
                await db
                    .update(users)
                    .set({ ...updateData, updatedAt: new Date() })
                    .where(eq(users.id, existing.id))
                    .run();
            }
        } else {
            // Insert new user
            await db.insert(users).values(user).run();
        }
    } catch (error) {
        console.error("[Database] Failed to upsert user:", error);
        throw error;
    }
}

/**
 * Get user by openId
 */
export async function getUserByOpenId(db: DrizzleD1Database, openId: string): Promise<User | null> {
    const result = await db
        .select()
        .from(users)
        .where(eq(users.openId, openId))
        .get();

    return result || null;
}

/**
 * Get user by ID
 */
export async function getUserById(db: DrizzleD1Database, id: number): Promise<User | null> {
    const result = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .get();

    return result || null;
}

/**
 * Get store by slug
 */
export async function getStoreBySlug(db: DrizzleD1Database, slug: string): Promise<Store | null> {
    const result = await db
        .select()
        .from(stores)
        .where(eq(stores.slug, slug))
        .get();

    return result || null;
}

/**
 * Get all stores for a user
 */
export async function getStoresForUser(db: DrizzleD1Database, userId: number): Promise<Store[]> {
    const assignments = await db
        .select({ storeId: staffAssignments.storeId })
        .from(staffAssignments)
        .where(eq(staffAssignments.userId, userId))
        .all();

    if (assignments.length === 0) return [];

    const storeIds = assignments.map(a => a.storeId);

    const results = await db
        .select()
        .from(stores)
        .where(eq(stores.id, storeIds[0])) // Simplified for now
        .all();

    return results;
}

/**
 * Get tickets for store
 */
export async function getTicketsForStore(
    db: DrizzleD1Database,
    storeId: number,
    status?: Ticket["status"]
): Promise<Ticket[]> {
    let query = db.select().from(tickets).where(eq(tickets.storeId, storeId));

    if (status) {
        query = query.where(and(eq(tickets.storeId, storeId), eq(tickets.status, status))) as any;
    }

    const results = await query.orderBy(desc(tickets.createdAt)).all();
    return results;
}

/**
 * Create ticket
 */
export async function createTicket(db: DrizzleD1Database, ticket: InsertTicket): Promise<Ticket> {
    const result = await db
        .insert(tickets)
        .values(ticket)
        .returning()
        .get();

    return result;
}

/**
 * Update ticket
 */
export async function updateTicket(
    db: DrizzleD1Database,
    id: number,
    updates: Partial<Ticket>
): Promise<Ticket | null> {
    const result = await db
        .update(tickets)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(tickets.id, id))
        .returning()
        .get();

    return result || null;
}

/**
 * Check if user has access to store
 */
export async function userHasAccessToStore(
    db: DrizzleD1Database,
    userId: number,
    storeId: number
): Promise<boolean> {
    const assignment = await db
        .select()
        .from(staffAssignments)
        .where(and(eq(staffAssignments.userId, userId), eq(staffAssignments.storeId, storeId)))
        .get();

    return !!assignment;
}

// Numbering Reset Helpers
/**
 * Get count of tickets created after a certain date
 */
export async function getTicketCountAfter(
    db: DrizzleD1Database,
    storeId: number,
    after: Date
): Promise<number> {
    const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(tickets)
        .where(
            and(
                eq(tickets.storeId, storeId),
                sql`${tickets.createdAt} >= ${after}`
            )
        )
        .get();

    return result?.count || 0;
}

/**
 * Update store's last numbering reset time
 */
export async function updateStoreNumberingReset(
    db: DrizzleD1Database,
    storeSlug: string
): Promise<void> {
    await db
        .update(stores)
        .set({ lastNumberingResetAt: new Date() })
        .where(eq(stores.slug, storeSlug))
        .run();
}

// Export all for compatibility
export { users, stores, tickets, pushSubscriptions, printJobs, staffAssignments };
export type { User, Store, Ticket, InsertUser, InsertTicket };
