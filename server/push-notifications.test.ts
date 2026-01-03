import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  checkAndSendAlmostYourTurnNotification,
  checkAndSendYourTurnNextNotification,
} from "./push-notifications";

// Mock dependencies
vi.mock("./db", () => ({
  getTicketById: vi.fn(),
  getStoreById: vi.fn(),
  getWaitingTickets: vi.fn(),
  updateTicketNotificationState: vi.fn(),
  getPushSubscriptionsByTicketId: vi.fn(),
}));

vi.mock("web-push", () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: vi.fn(),
  },
}));

describe("Push Notifications", () => {
  describe("checkAndSendAlmostYourTurnNotification", () => {
    it("should send notification when ticket is 3 positions ahead", async () => {
      const { getTicketById, getStoreById, getWaitingTickets, updateTicketNotificationState } =
        await import("./db");
      const { default: webpush } = await import("web-push");

      const mockTicket = {
        id: 2,
        storeId: 1,
        token: "test-token-2",
        guestName: "佐藤花子",
        partySize: 3,
        status: "WAITING" as const,
        sequenceNumber: "A-002",
        createdAt: new Date(),
        calledAt: null,
        seatedAt: null,
        skippedAt: null,
        cancelledAt: null,
        source: "qr" as const,
        notificationSent3: false,
        notificationSent1: false,
        updatedAt: new Date(),
      };

      const mockStore = {
        id: 1,
        slug: "demo",
        name: "Demo Store",
        nameEn: "Demo Store",
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

      const mockWaitingTickets = [
        { id: 1, sequenceNumber: "A-001" },
        { id: 2, sequenceNumber: "A-002" },
        { id: 3, sequenceNumber: "A-003" },
      ];

      const { getPushSubscriptionsByTicketId } = await import("./db");
      vi.mocked(getTicketById).mockResolvedValue(mockTicket);
      vi.mocked(getStoreById).mockResolvedValue(mockStore);
      vi.mocked(getWaitingTickets).mockResolvedValue(mockWaitingTickets as any);
      vi.mocked(getPushSubscriptionsByTicketId).mockResolvedValue([
        {
          id: 1,
          ticketId: 2,
          endpoint: "https://example.com/push",
          p256dh: "test-key",
          auth: "test-auth",
          createdAt: new Date(),
        },
      ] as any);
      vi.mocked(updateTicketNotificationState).mockResolvedValue(undefined);
      vi.mocked(webpush.sendNotification).mockResolvedValue({} as any);

      const result = await checkAndSendAlmostYourTurnNotification(2, 1, "ja");

      expect(result).toBe(true);
      expect(vi.mocked(updateTicketNotificationState)).toHaveBeenCalledWith(2, {
        notificationSent3: true,
      });
    });

    it("should not send notification if already sent", async () => {
      const { getTicketById } = await import("./db");

      const mockTicket = {
        id: 2,
        storeId: 1,
        token: "test-token-2",
        guestName: "佐藤花子",
        partySize: 3,
        status: "WAITING" as const,
        sequenceNumber: "A-002",
        createdAt: new Date(),
        calledAt: null,
        seatedAt: null,
        skippedAt: null,
        cancelledAt: null,
        source: "qr" as const,
        notificationSent3: true, // Already sent
        notificationSent1: false,
        updatedAt: new Date(),
      };

      vi.mocked(getTicketById).mockResolvedValue(mockTicket);

      const result = await checkAndSendAlmostYourTurnNotification(2, 1, "ja");

      expect(result).toBe(false);
    });

    it("should not send notification if ticket is not WAITING", async () => {
      const { getTicketById } = await import("./db");

      const mockTicket = {
        id: 2,
        storeId: 1,
        token: "test-token-2",
        guestName: "佐藤花子",
        partySize: 3,
        status: "SEATED" as const,
        sequenceNumber: "A-002",
        createdAt: new Date(),
        calledAt: new Date(),
        seatedAt: new Date(),
        skippedAt: null,
        cancelledAt: null,
        source: "qr" as const,
        notificationSent3: false,
        notificationSent1: false,
        updatedAt: new Date(),
      };

      vi.mocked(getTicketById).mockResolvedValue(mockTicket);

      const result = await checkAndSendAlmostYourTurnNotification(2, 1, "ja");

      expect(result).toBe(false);
    });
  });

  describe("checkAndSendYourTurnNextNotification", () => {
    it("should send notification when ticket is next (1 position ahead)", async () => {
      const { getTicketById, getStoreById, getWaitingTickets, updateTicketNotificationState } =
        await import("./db");
      const { default: webpush } = await import("web-push");

      const mockTicket = {
        id: 2,
        storeId: 1,
        token: "test-token-2",
        guestName: "佐藤花子",
        partySize: 3,
        status: "WAITING" as const,
        sequenceNumber: "A-002",
        createdAt: new Date(),
        calledAt: null,
        seatedAt: null,
        skippedAt: null,
        cancelledAt: null,
        source: "qr" as const,
        notificationSent3: true,
        notificationSent1: false,
        updatedAt: new Date(),
      };

      const mockStore = {
        id: 1,
        slug: "demo",
        name: "Demo Store",
        nameEn: "Demo Store",
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

      const mockWaitingTickets = [
        { id: 1, sequenceNumber: "A-001" },
        { id: 2, sequenceNumber: "A-002" },
      ];

      const { getPushSubscriptionsByTicketId } = await import("./db");
      vi.mocked(getTicketById).mockResolvedValue(mockTicket);
      vi.mocked(getStoreById).mockResolvedValue(mockStore);
      vi.mocked(getWaitingTickets).mockResolvedValue(mockWaitingTickets as any);
      vi.mocked(getPushSubscriptionsByTicketId).mockResolvedValue([
        {
          id: 1,
          ticketId: 2,
          endpoint: "https://example.com/push",
          p256dh: "test-key",
          auth: "test-auth",
          createdAt: new Date(),
        },
      ] as any);
      vi.mocked(updateTicketNotificationState).mockResolvedValue(undefined);
      vi.mocked(webpush.sendNotification).mockResolvedValue({} as any);

      const result = await checkAndSendYourTurnNextNotification(2, 1, "ja");

      expect(result).toBe(true);
      expect(vi.mocked(updateTicketNotificationState)).toHaveBeenCalledWith(2, {
        notificationSent1: true,
      });
    });
  });
});
