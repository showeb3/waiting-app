import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock database functions
vi.mock("./db", () => ({
  getStoreBySlug: vi.fn(),
  getStoreById: vi.fn(),
  createTicket: vi.fn(),
  getTicketByToken: vi.fn(),
  getTicketById: vi.fn(),
  getWaitingTickets: vi.fn(),
  getActiveTickets: vi.fn(),
  getAllTickets: vi.fn(),
  updateTicketStatus: vi.fn(),
  savePushSubscription: vi.fn(),
  getPushSubscriptionsByTicketId: vi.fn(),
  createPrintJob: vi.fn(),
  updatePrintJobStatus: vi.fn(),
  getStaffByStoreId: vi.fn(),
  getStoresByUserId: vi.fn(),
}));

function createMockContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("tRPC Routers", () => {
  describe("tickets.create", () => {
    it("should create a ticket with valid input", async () => {
      const { getStoreBySlug, createTicket, getAllTickets } = await import("./db");
      const mockStore = {
        id: 1,
        slug: "test-store",
        name: "Test Store",
        nameEn: "Test Store EN",
        ownerId: 1,
        isOpen: true,
        operatingHours: null,
        notificationThreshold3: 3,
        notificationThreshold1: 1,
        skipRecoveryMode: "end" as const,
        printMethod: "local_bridge" as const,
        kioskSettings: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(getStoreBySlug).mockResolvedValue(mockStore);
      vi.mocked(getAllTickets).mockResolvedValue([]);
      vi.mocked(createTicket).mockResolvedValue({
        id: 1,
        storeId: 1,
        token: "test-token",
        guestName: "John Doe",
        partySize: 2,
        status: "WAITING",
        sequenceNumber: "A-001",
        createdAt: new Date(),
        calledAt: null,
        seatedAt: null,
        skippedAt: null,
        cancelledAt: null,
        source: "qr",
        updatedAt: new Date(),
      });

      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.tickets.create({
        storeSlug: "test-store",
        guestName: "John Doe",
        partySize: 2,
        source: "qr",
      });

      expect(result).toHaveProperty("token");
      expect(result).toHaveProperty("sequenceNumber");
      expect(result.sequenceNumber).toBe("A-001");
    });

    it("should reject invalid party size", async () => {
      const caller = appRouter.createCaller(createMockContext());

      try {
        await caller.tickets.create({
          storeSlug: "test-store",
          guestName: "John Doe",
          partySize: 0,
          source: "qr",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });

    it("should reject empty guest name", async () => {
      const caller = appRouter.createCaller(createMockContext());

      try {
        await caller.tickets.create({
          storeSlug: "test-store",
          guestName: "",
          partySize: 2,
          source: "qr",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });
  });

  describe("tickets.getByToken", () => {
    it("should return ticket details with groups ahead", async () => {
      const { getTicketByToken, getStoreById, getActiveTickets, getWaitingTickets } =
        await import("./db");

      const mockTicket = {
        id: 1,
        storeId: 1,
        token: "test-token",
        guestName: "John Doe",
        partySize: 2,
        status: "WAITING" as const,
        sequenceNumber: "A-001",
        createdAt: new Date(),
        calledAt: null,
        seatedAt: null,
        skippedAt: null,
        cancelledAt: null,
        source: "qr" as const,
        updatedAt: new Date(),
      };

      const mockStore = {
        id: 1,
        slug: "test-store",
        name: "Test Store",
        nameEn: "Test Store EN",
        ownerId: 1,
        isOpen: true,
        operatingHours: null,
        notificationThreshold3: 3,
        notificationThreshold1: 1,
        skipRecoveryMode: "end" as const,
        printMethod: "local_bridge" as const,
        kioskSettings: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(getTicketByToken).mockResolvedValue(mockTicket);
      vi.mocked(getStoreById).mockResolvedValue(mockStore);
      vi.mocked(getActiveTickets).mockResolvedValue([]);
      vi.mocked(getWaitingTickets).mockResolvedValue([mockTicket]);

      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.tickets.getByToken({ token: "test-token" });

      expect(result.ticket).toEqual(mockTicket);
      expect(result.store).toEqual(mockStore);
      expect(result.groupsAhead).toBe(0);
    });
  });

  describe("admin.callNext", () => {
    it("should call next waiting ticket", async () => {
      const { getStoreBySlug, getWaitingTickets, updateTicketStatus } =
        await import("./db");

      const mockStore = {
        id: 1,
        slug: "test-store",
        name: "Test Store",
        nameEn: "Test Store EN",
        ownerId: 1,
        isOpen: true,
        operatingHours: null,
        notificationThreshold3: 3,
        notificationThreshold1: 1,
        skipRecoveryMode: "end" as const,
        printMethod: "local_bridge" as const,
        kioskSettings: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTicket = {
        id: 1,
        storeId: 1,
        token: "test-token",
        guestName: "John Doe",
        partySize: 2,
        status: "WAITING" as const,
        sequenceNumber: "A-001",
        createdAt: new Date(),
        calledAt: null,
        seatedAt: null,
        skippedAt: null,
        cancelledAt: null,
        source: "qr" as const,
        updatedAt: new Date(),
      };

      const calledTicket = {
        ...mockTicket,
        status: "CALLED" as const,
        calledAt: new Date(),
      };

      vi.mocked(getStoreBySlug).mockResolvedValue(mockStore);
      vi.mocked(getWaitingTickets).mockResolvedValue([mockTicket]);
      vi.mocked(updateTicketStatus).mockResolvedValue(calledTicket);

      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.admin.callNext({ storeSlug: "test-store" });

      expect(result.ticket.status).toBe("CALLED");
      expect(vi.mocked(updateTicketStatus)).toHaveBeenCalledWith(1, "CALLED");
    });
  });

  describe("admin.seat", () => {
    it("should mark ticket as seated", async () => {
      const { getTicketById, updateTicketStatus } = await import("./db");

      const mockTicket = {
        id: 1,
        storeId: 1,
        token: "test-token",
        guestName: "John Doe",
        partySize: 2,
        status: "CALLED" as const,
        sequenceNumber: "A-001",
        createdAt: new Date(),
        calledAt: new Date(),
        seatedAt: null,
        skippedAt: null,
        cancelledAt: null,
        source: "qr" as const,
        updatedAt: new Date(),
      };

      vi.mocked(getTicketById).mockResolvedValue(mockTicket);
      vi.mocked(updateTicketStatus).mockResolvedValue({
        ...mockTicket,
        status: "SEATED",
        seatedAt: new Date(),
      });

      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.admin.seat({ ticketId: 1 });

      expect(result.success).toBe(true);
      expect(vi.mocked(updateTicketStatus)).toHaveBeenCalledWith(1, "SEATED");
    });

    it("should reject non-called tickets", async () => {
      const { getTicketById } = await import("./db");

      const mockTicket = {
        id: 1,
        storeId: 1,
        token: "test-token",
        guestName: "John Doe",
        partySize: 2,
        status: "WAITING" as const,
        sequenceNumber: "A-001",
        createdAt: new Date(),
        calledAt: null,
        seatedAt: null,
        skippedAt: null,
        cancelledAt: null,
        source: "qr" as const,
        updatedAt: new Date(),
      };

      vi.mocked(getTicketById).mockResolvedValue(mockTicket);

      const caller = appRouter.createCaller(createMockContext());

      try {
        await caller.admin.seat({ ticketId: 1 });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });
  });

  describe("tickets.cancel", () => {
    it("should cancel a waiting ticket", async () => {
      const { getTicketByToken, updateTicketStatus } = await import("./db");

      const mockTicket = {
        id: 1,
        storeId: 1,
        token: "test-token",
        guestName: "John Doe",
        partySize: 2,
        status: "WAITING" as const,
        sequenceNumber: "A-001",
        createdAt: new Date(),
        calledAt: null,
        seatedAt: null,
        skippedAt: null,
        cancelledAt: null,
        source: "qr" as const,
        updatedAt: new Date(),
      };

      vi.mocked(getTicketByToken).mockResolvedValue(mockTicket);
      vi.mocked(updateTicketStatus).mockResolvedValue({
        ...mockTicket,
        status: "CANCELLED",
        cancelledAt: new Date(),
      });

      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.tickets.cancel({ token: "test-token" });

      expect(result.success).toBe(true);
      expect(vi.mocked(updateTicketStatus)).toHaveBeenCalledWith(1, "CANCELLED");
    });

    it("should reject cancelling seated tickets", async () => {
      const { getTicketByToken } = await import("./db");

      const mockTicket = {
        id: 1,
        storeId: 1,
        token: "test-token",
        guestName: "John Doe",
        partySize: 2,
        status: "SEATED" as const,
        sequenceNumber: "A-001",
        createdAt: new Date(),
        calledAt: new Date(),
        seatedAt: new Date(),
        skippedAt: null,
        cancelledAt: null,
        source: "qr" as const,
        updatedAt: new Date(),
      };

      vi.mocked(getTicketByToken).mockResolvedValue(mockTicket);

      const caller = appRouter.createCaller(createMockContext());

      try {
        await caller.tickets.cancel({ token: "test-token" });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });
  });
});
