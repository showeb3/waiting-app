// Simplified database wrapper that makes D1 compatible with existing code
// This allows us to reuse most of the existing router logic with minimal changes
import { DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "../drizzle/schema-d1";

// Re-export all types for compatibility
export * from "../drizzle/schema-d1";
export type { DrizzleD1Database };

// Database connection factory
export function createD1Connection(d1: D1Database): DrizzleD1Database {
    return drizzle(d1, { schema });
}

// Simple wrapper functions for the most common operations
// These match the signatures used in the existing routers

export async function getStoreBySlug(db: DrizzleD1Database, slug: string) {
    const result = await db.query.stores.findFirst({
        where: (stores, { eq }) => eq(stores.slug, slug),
    });
    return result || null;
}

export async function getStoreById(db: DrizzleD1Database, id: number) {
    const result = await db.query.stores.findFirst({
        where: (stores, { eq }) => eq(stores.id, id),
    });
    return result || null;
}

export async function createTicket(db: DrizzleD1Database, ticket: schema.InsertTicket) {
    const result = await db.insert(schema.tickets).values(ticket).returning().get();
    return result;
}

export async function getTicketById(db: DrizzleD1Database, id: number) {
    const result = await db.query.tickets.findFirst({
        where: (tickets, { eq }) => eq(tickets.id, id),
    });
    return result || null;
}

export async function getTicketByToken(db: DrizzleD1Database, token: string) {
    const result = await db.query.tickets.findFirst({
        where: (tickets, { eq }) => eq(tickets.qrToken, token),
    });
    return result || null;
}

export async function getWaitingTickets(db: DrizzleD1Database, storeId: number) {
    const results = await db.query.tickets.findMany({
        where: (tickets, { eq, and }) =>
            and(eq(tickets.storeId, storeId), eq(tickets.status, "WAITING")),
        orderBy: (tickets, { asc }) => [asc(tickets.createdAt)],
    });
    return results;
}

export async function getActiveTickets(db: DrizzleD1Database, storeId: number) {
    const results = await db.query.tickets.findMany({
        where: (tickets, { eq, and }) =>
            and(eq(tickets.storeId, storeId), eq(tickets.status, "CALLED")),
        orderBy: (tickets, { desc }) => [desc(tickets.calledAt)],
    });
    return results;
}

export async function getAllTickets(db: DrizzleD1Database, storeId: number) {
    const results = await db.query.tickets.findMany({
        where: (tickets, { eq }) => eq(tickets.storeId, storeId),
        orderBy: (tickets, { desc }) => [desc(tickets.createdAt)],
    });
    return results;
}

export async function updateTicketStatus(
    db: DrizzleD1Database,
    id: number,
    status: schema.Ticket["status"],
    extraUpdates?: Partial<schema.Ticket>
) {
    const updates: any = { status, updatedAt: new Date(), ...extraUpdates };

    const result = await db
        .update(schema.tickets)
        .set(updates)
        .where((tickets, { eq }) => eq(schema.tickets.id, id))
        .returning()
        .get();

    return result || null;
}

// Stub implementations for features we'll implement later
export async function savePushSubscription() {
    console.warn("[DB] Push subscriptions not yet implemented for D1");
}

export async function getPushSubscriptionsByTicketId() {
    return [];
}

export async function createPrintJob() {
    console.warn("[DB] Print jobs not yet implemented for D1");
}

export async function updatePrintJobStatus() {
    console.warn("[DB] Print jobs not yet implemented for D1");
}

export async function getStaffByStoreId(db: DrizzleD1Database, storeId: number) {
    const results = await db.query.staffAssignments.findMany({
        where: (staff, { eq }) => eq(staff.storeId, storeId),
        with: {
            user: true,
        },
    });
    return results;
}

export async function getStoresByUserId(db: DrizzleD1Database, userId: number) {
    const assignments = await db.query.staffAssignments.findMany({
        where: (staff, { eq }) => eq(staff.userId, userId),
    });

    const storeIds = assignments.map(a => a.storeId);
    if (storeIds.length === 0) return [];

    const stores = await db.query.stores.findMany({
        where: (stores, { inArray }) => inArray(stores.id, storeIds),
    });

    return stores;
}

export async function updateTicketNotificationState(
    db: DrizzleD1Database,
    ticketId: number,
    which: "3" | "1"
) {
    const field = which === "3" ? "notifiedAt3" : "notifiedAt1";
    await db
        .update(schema.tickets)
        .set({ [field]: new Date() })
        .where((tickets, { eq }) => eq(schema.tickets.id, ticketId))
        .run();
}
