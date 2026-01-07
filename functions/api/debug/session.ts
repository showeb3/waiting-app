// Debug endpoint to check session and DB connection
import { drizzle } from "drizzle-orm/d1";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { eq, sql } from "drizzle-orm";

interface Env {
    DB: D1Database;
}

// Define D1 schema inline
const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    openId: text("openId").notNull().unique(),
    name: text("name"),
    email: text("email"),
    loginMethod: text("loginMethod"),
    role: text("role", { enum: ["user", "admin", "staff"] }).default("user").notNull(),
    lastSignedIn: integer("lastSignedIn", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

export const onRequest: PagesFunction<Env> = async (context) => {
    const cookieHeader = context.request.headers.get("Cookie") || context.request.headers.get("cookie");

    const debugInfo: any = {
        timestamp: new Date().toISOString(),
        url: context.request.url,
        headers: {
            cookie: cookieHeader ? "Present" : "Missing",
            cookieLength: cookieHeader ? cookieHeader.length : 0,
        },
        cookieParsed: null,
        dbStatus: "Unknown",
        userFound: false,
        userData: null,
        error: null,
    };

    try {
        // Parse cookie
        if (cookieHeader) {
            const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
                const parts = cookie.trim().split("=");
                if (parts.length >= 2) {
                    const key = parts[0];
                    const value = parts.slice(1).join("=");
                    acc[key] = value;
                }
                return acc;
            }, {} as Record<string, string>);

            debugInfo.cookieParsed = cookies;

            if (cookies["session"]) {
                // Query DB
                const db = drizzle(context.env.DB);
                debugInfo.dbStatus = "Connecting";

                try {
                    const result = await db.select().from(users)
                        .where(eq(users.openId, "local-owner"))
                        .get();

                    debugInfo.dbStatus = "Connected";

                    if (result) {
                        debugInfo.userFound = true;
                        debugInfo.userData = result;
                    } else {
                        debugInfo.userFound = false;
                        debugInfo.message = "User 'local-owner' not found in DB";
                    }
                } catch (dbError: any) {
                    debugInfo.dbStatus = "Error";
                    debugInfo.dbError = dbError.message;
                }
            } else {
                debugInfo.message = "Session cookie not found";
            }
        } else {
            debugInfo.message = "No Cookie header received";
        }

        return new Response(JSON.stringify(debugInfo, null, 2), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (e: any) {
        debugInfo.error = e.message;
        return new Response(JSON.stringify(debugInfo, null, 2), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};
