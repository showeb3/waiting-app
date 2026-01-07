import { DrizzleD1Database } from "drizzle-orm/d1";
import { User } from "../../drizzle/schema-d1";

/**
 * Context for Cloudflare Workers tRPC handlers
 */
export interface WorkerContext {
    req: Request;
    db: DrizzleD1Database;
    user: User | null;
}

/**
 * Create context for tRPC handlers in Cloudflare Workers
 * This replaces the Express-based context
 */
export async function createWorkerContext(params: {
    req: Request;
    db: DrizzleD1Database;
}): Promise<WorkerContext> {
    // TODO: Implement cookie-based authentication
    // For now, return null user
    return {
        req: params.req,
        db: params.db,
        user: null,
    };
}
