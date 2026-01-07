/// <reference types="@cloudflare/workers-types" />

// Global type definitions for Cloudflare Pages Functions
declare global {
    interface Env {
        DB: D1Database;
    }

    type PagesFunction<Env = unknown> = (context: {
        request: Request;
        env: Env;
        params: Record<string, string>;
        waitUntil: (promise: Promise<any>) => void;
        next: () => Promise<Response>;
        data: Record<string, any>;
    }) => Response | Promise<Response>;
}

export { };
