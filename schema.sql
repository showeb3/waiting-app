CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    openId TEXT NOT NULL UNIQUE,
    name TEXT,
    email TEXT,
    loginMethod TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    lastSignedIn INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS stores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    nameEn TEXT,
    ownerId INTEGER NOT NULL,
    isOpen INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    storeId INTEGER NOT NULL,
    token TEXT NOT NULL,
    partySize INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'waiting',
    createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
    calledAt INTEGER,
    completedAt INTEGER
);

-- Insert demo store if not exists
INSERT OR IGNORE INTO stores (slug, name, nameEn, ownerId) VALUES ('demo', 'Demo Store', 'Demo Store English', 1);
