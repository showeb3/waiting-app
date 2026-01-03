import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createUnauthenticatedContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Admin Routes Authentication", () => {
  describe("admin.getTickets", () => {
    it("should allow admin user to access", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.admin.getTickets({ storeSlug: "demo" });
      } catch (error: any) {
        expect(error.code).not.toBe("UNAUTHORIZED");
        expect(error.code).not.toBe("FORBIDDEN");
      }
    });

    it("should reject unauthenticated user", async () => {
      const ctx = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.admin.getTickets({ storeSlug: "demo" });
        expect.fail("Should have thrown UNAUTHORIZED");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });
  });

  describe("admin.seat", () => {
    it("should allow admin user to access", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.admin.seat({ ticketId: 999 });
      } catch (error: any) {
        expect(error.code).not.toBe("UNAUTHORIZED");
        expect(error.code).not.toBe("FORBIDDEN");
      }
    });

    it("should reject unauthenticated user", async () => {
      const ctx = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.admin.seat({ ticketId: 999 });
        expect.fail("Should have thrown UNAUTHORIZED");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });
  });

  describe("admin.skip", () => {
    it("should allow admin user to access", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.admin.skip({ ticketId: 999 });
      } catch (error: any) {
        expect(error.code).not.toBe("UNAUTHORIZED");
        expect(error.code).not.toBe("FORBIDDEN");
      }
    });

    it("should reject unauthenticated user", async () => {
      const ctx = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.admin.skip({ ticketId: 999 });
        expect.fail("Should have thrown UNAUTHORIZED");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });
  });

  describe("admin.cancel", () => {
    it("should allow admin user to access", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.admin.cancel({ ticketId: 999 });
      } catch (error: any) {
        expect(error.code).not.toBe("UNAUTHORIZED");
        expect(error.code).not.toBe("FORBIDDEN");
      }
    });

    it("should reject unauthenticated user", async () => {
      const ctx = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.admin.cancel({ ticketId: 999 });
        expect.fail("Should have thrown UNAUTHORIZED");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });
  });

  describe("admin.getStore", () => {
    it("should allow admin user to access", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.admin.getStore({ storeSlug: "demo" });
      } catch (error: any) {
        expect(error.code).not.toBe("UNAUTHORIZED");
        expect(error.code).not.toBe("FORBIDDEN");
      }
    });

    it("should reject unauthenticated user", async () => {
      const ctx = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.admin.getStore({ storeSlug: "demo" });
        expect.fail("Should have thrown UNAUTHORIZED");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });
  });

  describe("admin.updateStore", () => {
    it("should allow admin user to access", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.admin.updateStore({
          storeSlug: "demo",
          name: "Updated Store",
        });
      } catch (error: any) {
        expect(error.code).not.toBe("UNAUTHORIZED");
        expect(error.code).not.toBe("FORBIDDEN");
      }
    });

    it("should reject unauthenticated user", async () => {
      const ctx = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.admin.updateStore({
          storeSlug: "demo",
          name: "Updated Store",
        });
        expect.fail("Should have thrown UNAUTHORIZED");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });
  });
});
