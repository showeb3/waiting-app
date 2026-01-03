import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "staff"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Store table: represents a restaurant/venue
 */
export const stores = mysqlTable("stores", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  nameEn: varchar("nameEn", { length: 255 }),
  ownerId: int("ownerId").notNull(),
  isOpen: boolean("isOpen").default(true).notNull(),
  operatingHours: text("operatingHours"), // JSON: { open: "09:00", close: "23:00" }
  notificationThreshold3: int("notificationThreshold3").default(3).notNull(), // 残り3番目の通知
  notificationThreshold1: int("notificationThreshold1").default(1).notNull(), // 1番目の通知
  skipRecoveryMode: mysqlEnum("skipRecoveryMode", ["end", "near", "resubmit"]).default("end").notNull(), // A/B/C
  printMethod: mysqlEnum("printMethod", ["local_bridge", "direct"]).default("local_bridge").notNull(),
  kioskSettings: text("kioskSettings"), // JSON: { autoResetSeconds: 5, fontSize: "large" }
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Store = typeof stores.$inferSelect;
export type InsertStore = typeof stores.$inferInsert;

/**
 * Ticket table: represents a waiting entry
 */
export const tickets = mysqlTable("tickets", {
  id: int("id").autoincrement().primaryKey(),
  storeId: int("storeId").notNull(),
  token: varchar("token", { length: 64 }).notNull().unique(), // Unique identifier for guest
  guestName: varchar("guestName", { length: 255 }).notNull(),
  partySize: int("partySize").notNull(),
  status: mysqlEnum("status", ["WAITING", "CALLED", "SEATED", "SKIPPED", "CANCELLED"]).default("WAITING").notNull(),
  sequenceNumber: varchar("sequenceNumber", { length: 10 }).notNull(), // e.g., "A-012"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  calledAt: timestamp("calledAt"),
  seatedAt: timestamp("seatedAt"),
  skippedAt: timestamp("skippedAt"),
  cancelledAt: timestamp("cancelledAt"),
  source: mysqlEnum("source", ["qr", "kiosk"]).default("qr").notNull(),
  notificationSent3: boolean("notificationSent3").default(false).notNull(),
  notificationSent1: boolean("notificationSent1").default(false).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = typeof tickets.$inferInsert;

/**
 * Push subscription table: stores PWA push notification subscriptions
 */
export const pushSubscriptions = mysqlTable("pushSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull(),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(), // VAPID key
  auth: text("auth").notNull(), // VAPID key
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;

/**
 * Print job table: tracks ticket printing
 */
export const printJobs = mysqlTable("printJobs", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull(),
  storeId: int("storeId").notNull(),
  status: mysqlEnum("status", ["pending", "success", "failed"]).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type PrintJob = typeof printJobs.$inferSelect;
export type InsertPrintJob = typeof printJobs.$inferInsert;

/**
 * Staff table: links users to stores with role assignment
 */
export const staffAssignments = mysqlTable("staffAssignments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  storeId: int("storeId").notNull(),
  role: mysqlEnum("role", ["staff", "manager"]).default("staff").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StaffAssignment = typeof staffAssignments.$inferSelect;
export type InsertStaffAssignment = typeof staffAssignments.$inferInsert;
