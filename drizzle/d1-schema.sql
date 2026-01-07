-- D1 Database Schema for Waiting Management App
-- Generated from drizzle/schema.ts (converted from MySQL to SQLite)

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  openId TEXT NOT NULL UNIQUE,
  name TEXT,
  email TEXT,
  loginMethod TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin', 'staff')),
  createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
  updatedAt INTEGER NOT NULL DEFAULT (unixepoch()),
  lastSignedIn INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS stores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  nameEn TEXT,
  ownerId INTEGER NOT NULL,
  isOpen INTEGER NOT NULL DEFAULT 1,
  operatingHours TEXT,
  notificationThreshold3 INTEGER NOT NULL DEFAULT 3,
  notificationThreshold1 INTEGER NOT NULL DEFAULT 1,
  skipRecoveryMode TEXT NOT NULL DEFAULT 'end' CHECK(skipRecoveryMode IN ('end', 'near', 'resubmit')),
  printMethod TEXT NOT NULL DEFAULT 'local_bridge' CHECK(printMethod IN ('local_bridge', 'direct')),
  kioskSettings TEXT,
  terminalConfigured INTEGER NOT NULL DEFAULT 0,
  createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
  updatedAt INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  storeId INTEGER NOT NULL,
  sequenceNumber INTEGER NOT NULL,
  guestName TEXT NOT NULL,
  partySize INTEGER NOT NULL,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'WAITING' CHECK(status IN ('WAITING', 'CALLED', 'SEATED', 'SKIPPED', 'CANCELLED')),
  deviceType TEXT NOT NULL DEFAULT 'web' CHECK(deviceType IN ('kiosk', 'web')),
  qrToken TEXT,
  notifiedAt3 INTEGER,
  notifiedAt1 INTEGER,
  notes TEXT,
  createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
  updatedAt INTEGER NOT NULL DEFAULT (unixepoch()),
  calledAt INTEGER,
  completedAt INTEGER,
  FOREIGN KEY (storeId) REFERENCES stores(id)
);

CREATE TABLE IF NOT EXISTS staffAssignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  storeId INTEGER NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff' CHECK(role IN ('admin', 'staff')),
  createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
  updatedAt INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (storeId) REFERENCES stores(id)
);

CREATE TABLE IF NOT EXISTS pushSubscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER,
  ticketId INTEGER,
  endpoint TEXT NOT NULL UNIQUE,
  keysP256dh TEXT NOT NULL,
  keysAuth TEXT NOT NULL,
  createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (ticketId) REFERENCES tickets(id)
);

CREATE TABLE IF NOT EXISTS printJobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  storeId INTEGER NOT NULL,
  ticketId INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'sent', 'printed', 'failed')),
  printerType TEXT NOT NULL CHECK(printerType IN ('local_bridge', 'direct')),
  payload TEXT NOT NULL,
  sentAt INTEGER,
  completedAt INTEGER,
  createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (storeId) REFERENCES stores(id),
  FOREIGN KEY (ticketId) REFERENCES tickets(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tickets_store_status ON tickets(storeId, status);
CREATE INDEX IF NOT EXISTS idx_tickets_qrToken ON tickets(qrToken);
CREATE INDEX IF NOT EXISTS idx_staffAssignments_user ON staffAssignments(userId);
CREATE INDEX IF NOT EXISTS idx_staffAssignments_store ON staffAssignments(storeId);
