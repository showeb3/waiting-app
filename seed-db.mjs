/**
 * Seed script to populate demo data into the database
 * Run with: node seed-db.mjs
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);

try {
  console.log("🌱 Seeding database with demo data...");

  // Create demo stores
  const storeData = [
    {
      slug: "demo",
      name: "デモ店舗",
      nameEn: "Demo Restaurant",
      ownerId: 1,
      isOpen: true,
      operatingHours: JSON.stringify({ open: "09:00", close: "23:00" }),
      notificationThreshold3: 3,
      notificationThreshold1: 1,
      skipRecoveryMode: "end",
      printMethod: "local_bridge",
      kioskSettings: JSON.stringify({ autoResetSeconds: 5, fontSize: "large" }),
    },
    {
      slug: "restaurant-a",
      name: "レストランA",
      nameEn: "Restaurant A",
      ownerId: 1,
      isOpen: true,
      operatingHours: JSON.stringify({ open: "11:00", close: "22:00" }),
      notificationThreshold3: 3,
      notificationThreshold1: 1,
      skipRecoveryMode: "near",
      printMethod: "direct",
      kioskSettings: JSON.stringify({ autoResetSeconds: 5, fontSize: "large" }),
    },
    {
      slug: "restaurant-b",
      name: "レストランB",
      nameEn: "Restaurant B",
      ownerId: 1,
      isOpen: true,
      operatingHours: JSON.stringify({ open: "10:00", close: "21:00" }),
      notificationThreshold3: 2,
      notificationThreshold1: 1,
      skipRecoveryMode: "resubmit",
      printMethod: "local_bridge",
      kioskSettings: JSON.stringify({ autoResetSeconds: 5, fontSize: "large" }),
    },
  ];

  // Insert stores
  for (const store of storeData) {
    const query = `
      INSERT INTO stores (
        slug, name, nameEn, ownerId, isOpen, operatingHours,
        notificationThreshold3, notificationThreshold1, skipRecoveryMode,
        printMethod, kioskSettings
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        nameEn = VALUES(nameEn),
        isOpen = VALUES(isOpen),
        operatingHours = VALUES(operatingHours),
        notificationThreshold3 = VALUES(notificationThreshold3),
        notificationThreshold1 = VALUES(notificationThreshold1),
        skipRecoveryMode = VALUES(skipRecoveryMode),
        printMethod = VALUES(printMethod),
        kioskSettings = VALUES(kioskSettings)
    `;

    await connection.execute(query, [
      store.slug,
      store.name,
      store.nameEn,
      store.ownerId,
      store.isOpen,
      store.operatingHours,
      store.notificationThreshold3,
      store.notificationThreshold1,
      store.skipRecoveryMode,
      store.printMethod,
      store.kioskSettings,
    ]);

    console.log(`✓ Created/Updated store: ${store.slug}`);
  }

  // Create or update demo admin user
  const demoUserId = 1;
  const demoUserQuery = `
    INSERT INTO users (id, openId, name, email, loginMethod, role)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      role = VALUES(role),
      lastSignedIn = NOW()
  `;

  await connection.execute(demoUserQuery, [
    demoUserId,
    "demo-user-001",
    "Demo Admin",
    "demo@example.com",
    "manus",
    "admin",
  ]);

  // Also seed the user from .env if different
  const envOwnerId = process.env.OWNER_OPEN_ID;
  if (envOwnerId && envOwnerId !== "demo-user-001") {
    await connection.execute(demoUserQuery, [
      2, // Different ID
      envOwnerId,
      "Local Owner",
      "owner@example.com",
      "manus",
      "admin",
    ]);
    console.log(`Created/Updated local owner admin: ${envOwnerId}`);
  }

  console.log("Created/Updated demo admin user");

  // Create demo tickets for the demo store
  const demoStoreId = 1; // Assuming first store has ID 1
  const ticketData = [
    {
      storeId: demoStoreId,
      token: "demo-token-001",
      guestName: "田中太郎",
      partySize: 2,
      status: "WAITING",
      sequenceNumber: "A-001",
      source: "qr",
    },
    {
      storeId: demoStoreId,
      token: "demo-token-002",
      guestName: "佐藤花子",
      partySize: 3,
      status: "WAITING",
      sequenceNumber: "A-002",
      source: "qr",
    },
    {
      storeId: demoStoreId,
      token: "demo-token-003",
      guestName: "鈴木次郎",
      partySize: 1,
      status: "CALLED",
      sequenceNumber: "A-003",
      source: "kiosk",
      calledAt: new Date(),
    },
  ];

  // Insert demo tickets
  for (const ticket of ticketData) {
    const query = `
      INSERT INTO tickets (
        storeId, token, guestName, partySize, status,
        sequenceNumber, source, calledAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        guestName = VALUES(guestName),
        partySize = VALUES(partySize),
        status = VALUES(status)
    `;

    await connection.execute(query, [
      ticket.storeId,
      ticket.token,
      ticket.guestName,
      ticket.partySize,
      ticket.status,
      ticket.sequenceNumber,
      ticket.source,
      ticket.calledAt || null,
    ]);

    console.log(`✓ Created ticket: ${ticket.sequenceNumber} (${ticket.guestName})`);
  }

  console.log("\n✨ Database seeded successfully!");
} catch (error) {
  console.error("❌ Error seeding database:", error);
  process.exit(1);
} finally {
  await connection.end();
}
