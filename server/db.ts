import { eq, and, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
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
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Store operations
export async function getStoreBySlug(slug: string): Promise<Store | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(stores).where(eq(stores.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getStoreById(storeId: number): Promise<Store | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Ticket operations
export async function createTicket(data: {
  storeId: number;
  token: string;
  guestName: string;
  partySize: number;
  sequenceNumber: string;
  source: "qr" | "kiosk";
}): Promise<Ticket> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(tickets).values({
    storeId: data.storeId,
    token: data.token,
    guestName: data.guestName,
    partySize: data.partySize,
    sequenceNumber: data.sequenceNumber,
    source: data.source,
    status: "WAITING",
  });

  const inserted = await db
    .select()
    .from(tickets)
    .where(eq(tickets.token, data.token))
    .limit(1);

  if (!inserted.length) throw new Error("Failed to create ticket");
  return inserted[0];
}

export async function getTicketByToken(token: string): Promise<Ticket | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(tickets).where(eq(tickets.token, token)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTicketById(ticketId: number): Promise<Ticket | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(tickets).where(eq(tickets.id, ticketId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getWaitingTickets(storeId: number): Promise<Ticket[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(tickets)
    .where(
      and(
        eq(tickets.storeId, storeId),
        eq(tickets.status, "WAITING")
      )
    )
    .orderBy(asc(tickets.createdAt));
}

export async function getActiveTickets(storeId: number): Promise<Ticket[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(tickets)
    .where(
      and(
        eq(tickets.storeId, storeId),
        eq(tickets.status, "CALLED")
      )
    )
    .orderBy(asc(tickets.calledAt));
}

export async function getAllTickets(storeId: number): Promise<Ticket[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(tickets)
    .where(eq(tickets.storeId, storeId))
    .orderBy(desc(tickets.createdAt));
}

export async function updateTicketStatus(
  ticketId: number,
  status: "WAITING" | "CALLED" | "SEATED" | "SKIPPED" | "CANCELLED"
): Promise<Ticket | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const now = new Date();
  const updateData: Record<string, unknown> = { status, updatedAt: now };

  if (status === "CALLED") {
    updateData.calledAt = now;
  } else if (status === "SEATED") {
    updateData.seatedAt = now;
  } else if (status === "SKIPPED") {
    updateData.skippedAt = now;
  } else if (status === "CANCELLED") {
    updateData.cancelledAt = now;
  }

  await db.update(tickets).set(updateData).where(eq(tickets.id, ticketId));

  return await getTicketById(ticketId);
}

// Push subscription operations
export async function savePushSubscription(data: {
  ticketId: number;
  endpoint: string;
  p256dh: string;
  auth: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(pushSubscriptions).values(data);
}

export async function getPushSubscriptionsByTicketId(ticketId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.ticketId, ticketId));
}

// Print job operations
export async function createPrintJob(data: {
  ticketId: number;
  storeId: number;
}): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(printJobs).values({
    ticketId: data.ticketId,
    storeId: data.storeId,
    status: "pending",
  });
}

export async function updatePrintJobStatus(
  jobId: number,
  status: "pending" | "success" | "failed",
  errorMessage?: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(printJobs)
    .set({
      status,
      errorMessage,
      completedAt: new Date(),
    })
    .where(eq(printJobs.id, jobId));
}

// Staff assignment operations
export async function getStaffByStoreId(storeId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(staffAssignments)
    .where(eq(staffAssignments.storeId, storeId));
}

export async function getStoresByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(staffAssignments)
    .where(eq(staffAssignments.userId, userId));
}

// Notification state operations
export async function updateTicketNotificationState(
  ticketId: number,
  state: { notificationSent3?: boolean; notificationSent1?: boolean }
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: Record<string, unknown> = { updatedAt: new Date() };

  if (state.notificationSent3 !== undefined) {
    updateData.notificationSent3 = state.notificationSent3;
  }
  if (state.notificationSent1 !== undefined) {
    updateData.notificationSent1 = state.notificationSent1;
  }

  await db.update(tickets).set(updateData).where(eq(tickets.id, ticketId));
}

// Numbering Reset Helpers
export async function updateStoreNumberingReset(
  storeSlug: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(stores)
    .set({ lastNumberingResetAt: new Date() })
    .where(eq(stores.slug, storeSlug));
}
