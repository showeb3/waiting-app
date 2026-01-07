import {
    integer,
    sqliteTable,
    text,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 */
export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    openId: text("openId").notNull().unique(),
    name: text("name"),
    email: text("email"),
    loginMethod: text("loginMethod"),
    role: text("role", { enum: ["user", "admin", "staff"] }).default("user").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    lastSignedIn: integer("lastSignedIn", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Store table: represents a restaurant/venue
 */
export const stores = sqliteTable("stores", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    nameEn: text("nameEn"),
    ownerId: integer("ownerId").notNull(),
    isOpen: integer("isOpen", { mode: "boolean" }).default(true).notNull(),
    operatingHours: text("operatingHours"), // JSON: { open: "09:00", close: "23:00" }
    notificationThreshold3: integer("notificationThreshold3").default(3).notNull(),
    notificationThreshold1: integer("notificationThreshold1").default(1).notNull(),
    skipRecoveryMode: text("skipRecoveryMode", { enum: ["end", "near", "resubmit"] }).default("end").notNull(),
    printMethod: text("printMethod", { enum: ["local_bridge", "direct"] }).default("local_bridge").notNull(),
    kioskSettings: text("kioskSettings"), // JSON
    terminalConfigured: integer("terminalConfigured", { mode: "boolean" }).default(false).notNull(),
    lastNumberingResetAt: integer("lastNumberingResetAt", { mode: "timestamp" }), // 手動/自動リセットの基準日時
    createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

export type Store = typeof stores.$inferSelect;
export type InsertStore = typeof stores.$inferInsert;

/**
 * Ticket table: represents a waiting entry
 */
export const tickets = sqliteTable("tickets", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    storeId: integer("storeId").notNull(),
    sequenceNumber: integer("sequenceNumber").notNull(),
    guestName: text("guestName").notNull(),
    partySize: integer("partySize").notNull(),
    phone: text("phone"),
    status: text("status", { enum: ["WAITING", "CALLED", "SEATED", "SKIPPED", "CANCELLED"] }).default("WAITING").notNull(),
    deviceType: text("deviceType", { enum: ["kiosk", "web"] }).default("web").notNull(),
    qrToken: text("qrToken"),
    notifiedAt3: integer("notifiedAt3", { mode: "timestamp" }),
    notifiedAt1: integer("notifiedAt1", { mode: "timestamp" }),
    notes: text("notes"),
    createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    calledAt: integer("calledAt", { mode: "timestamp" }),
    completedAt: integer("completedAt", { mode: "timestamp" }),
});

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = typeof tickets.$inferInsert;

/**
 * Push subscription table: stores PWA push notification subscriptions
 */
export const pushSubscriptions = sqliteTable("pushSubscriptions", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("userId"),
    ticketId: integer("ticketId"),
    endpoint: text("endpoint").notNull().unique(),
    keysP256dh: text("keysP256dh").notNull(),
    keysAuth: text("keysAuth").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;

/**
 * Print job table: tracks ticket printing
 */
export const printJobs = sqliteTable("printJobs", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    storeId: integer("storeId").notNull(),
    ticketId: integer("ticketId").notNull(),
    status: text("status", { enum: ["pending", "sent", "printed", "failed"] }).default("pending").notNull(),
    printerType: text("printerType", { enum: ["local_bridge", "direct"] }).notNull(),
    payload: text("payload").notNull(),
    sentAt: integer("sentAt", { mode: "timestamp" }),
    completedAt: integer("completedAt", { mode: "timestamp" }),
    createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

export type PrintJob = typeof printJobs.$inferSelect;
export type InsertPrintJob = typeof printJobs.$inferInsert;

/**
 * Staff table: links users to stores with role assignment
 */
export const staffAssignments = sqliteTable("staffAssignments", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("userId").notNull(),
    storeId: integer("storeId").notNull(),
    role: text("role", { enum: ["admin", "staff"] }).default("staff").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

export type StaffAssignment = typeof staffAssignments.$inferSelect;
export type InsertStaffAssignment = typeof staffAssignments.$inferInsert;
