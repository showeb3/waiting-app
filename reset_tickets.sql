DROP TABLE IF EXISTS tickets;
CREATE TABLE tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    storeId INTEGER NOT NULL,
    token TEXT NOT NULL,
    partySize INTEGER NOT NULL,
    guestName TEXT NOT NULL,
    sequenceNumber INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'waiting',
    createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
    calledAt INTEGER,
    completedAt INTEGER
);
