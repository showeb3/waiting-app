import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import {
  publicProcedure,
  protectedProcedure,
  router,
} from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";
import {
  createTicket,
  getTicketByToken,
  getTicketById,
  getWaitingTickets,
  getActiveTickets,
  getAllTickets,
  updateTicketStatus,
  getStoreBySlug,
  getStoreById,
  savePushSubscription,
  getPushSubscriptionsByTicketId,
  createPrintJob,
  updatePrintJobStatus,
  getStaffByStoreId,
  getStoresByUserId,
  updateTicketNotificationState,
} from "./db";
import { adminProcedure } from "./_core/trpc";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import {
  checkAndSendAlmostYourTurnNotification,
  checkAndSendYourTurnNextNotification,
  getVapidPublicKey,
} from "./push-notifications";

// Helper: Generate sequence number (e.g., "A-001")
function generateSequenceNumber(ticketCount: number): string {
  const prefix = "A"; // Can be extended for multiple prefixes
  const number = String(ticketCount + 1).padStart(3, "0");
  return `${prefix}-${number}`;
}

// Helper: Calculate groups ahead
async function getGroupsAhead(storeId: number, ticketId: number): Promise<number> {
  const waitingTickets = await getWaitingTickets(storeId);
  const ticketIndex = waitingTickets.findIndex((t) => t.id === ticketId);
  return ticketIndex > 0 ? ticketIndex : 0;
}

// Helper: Get current calling ticket
async function getCurrentCallingTicket(storeId: number) {
  const activeTickets = await getActiveTickets(storeId);
  return activeTickets.length > 0 ? activeTickets[0] : null;
}

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Guest API - Ticket Management
  tickets: router({
    // Create a new ticket (QR or Kiosk)
    create: publicProcedure
      .input(
        z.object({
          storeSlug: z.string(),
          guestName: z.string().min(1),
          partySize: z.number().int().min(1),
          source: z.enum(["qr", "kiosk"]),
        })
      )
      .mutation(async ({ input }) => {
        const store = await getStoreBySlug(input.storeSlug);
        if (!store) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Store not found",
          });
        }

        if (!store.isOpen) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Store is currently closed",
          });
        }

        // Generate unique token for guest
        const token = nanoid(16);

        // Get all tickets to determine sequence number
        const allTickets = await getAllTickets(store.id);
        const sequenceNumber = generateSequenceNumber(allTickets.length);

        // Create ticket
        const ticket = await createTicket({
          storeId: store.id,
          token,
          guestName: input.guestName,
          partySize: input.partySize,
          sequenceNumber,
          source: input.source,
        });

        // If kiosk source, create print job
        if (input.source === "kiosk") {
          await createPrintJob({
            ticketId: ticket.id,
            storeId: store.id,
          });
        }

        return {
          token: ticket.token,
          sequenceNumber: ticket.sequenceNumber,
          storeSlug: input.storeSlug,
        };
      }),

    // Get ticket details
    getByToken: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const ticket = await getTicketByToken(input.token);
        if (!ticket) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Ticket not found",
          });
        }

        const store = await getStoreById(ticket.storeId);
        if (!store) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Store not found",
          });
        }

        const currentCalling = await getCurrentCallingTicket(ticket.storeId);
        const groupsAhead = await getGroupsAhead(ticket.storeId, ticket.id);

        return {
          ticket,
          store,
          currentCalling,
          groupsAhead,
        };
      }),

    // Cancel ticket (guest action)
    cancel: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input }) => {
        const ticket = await getTicketByToken(input.token);
        if (!ticket) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Ticket not found",
          });
        }

        if (ticket.status === "SEATED" || ticket.status === "CANCELLED") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot cancel this ticket",
          });
        }

        await updateTicketStatus(ticket.id, "CANCELLED");

        return { success: true };
      }),

    // Subscribe to push notifications
    subscribePush: publicProcedure
      .input(
        z.object({
          token: z.string(),
          subscription: z.object({
            endpoint: z.string(),
            keys: z.object({
              p256dh: z.string(),
              auth: z.string(),
            }),
          }),
        })
      )
      .mutation(async ({ input }) => {
        const ticket = await getTicketByToken(input.token);
        if (!ticket) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Ticket not found",
          });
        }

        await savePushSubscription({
          ticketId: ticket.id,
          endpoint: input.subscription.endpoint,
          p256dh: input.subscription.keys.p256dh,
          auth: input.subscription.keys.auth,
        });

        return { success: true };
      }),
  }),

  // Staff Admin API
  admin: router({
    // Get all tickets for a store
    getTickets: adminProcedure
      .input(z.object({ storeSlug: z.string() }))
      .query(async ({ input, ctx }) => {
        const store = await getStoreBySlug(input.storeSlug);
        if (!store) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Store not found",
          });
        }

        // TODO: Add role-based access check
        const allTickets = await getAllTickets(store.id);

        return allTickets.map((ticket) => ({
          ...ticket,
          waitTime: ticket.createdAt
            ? Math.floor((Date.now() - ticket.createdAt.getTime()) / 60000)
            : 0,
        }));
      }),

    // Call next ticket
    callNext: protectedProcedure
      .input(z.object({ storeSlug: z.string() }))
      .mutation(async ({ input }) => {
        const store = await getStoreBySlug(input.storeSlug);
        if (!store) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Store not found",
          });
        }

        const waitingTickets = await getWaitingTickets(store.id);
        if (waitingTickets.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No waiting tickets",
          });
        }

        const nextTicket = waitingTickets[0];
        const updatedTicket = await updateTicketStatus(nextTicket.id, "CALLED");

        // Trigger notifications for remaining tickets
        const remainingTickets = waitingTickets.slice(1);
        for (const ticket of remainingTickets) {
          await checkAndSendAlmostYourTurnNotification(ticket.id, store.id, "ja");
          await checkAndSendYourTurnNextNotification(ticket.id, store.id, "ja");
        }

        return { ticket: updatedTicket || nextTicket };
      }),

    // Mark ticket as seated
    seat: protectedProcedure
      .input(z.object({ ticketId: z.number() }))
      .mutation(async ({ input }) => {
        const ticket = await getTicketById(input.ticketId);
        if (!ticket) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Ticket not found",
          });
        }

        if (ticket.status !== "CALLED") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Only called tickets can be seated",
          });
        }

        await updateTicketStatus(ticket.id, "SEATED");

        return { success: true };
      }),

    // Skip ticket
    skip: adminProcedure
      .input(z.object({ ticketId: z.number() }))
      .mutation(async ({ input }) => {
        const ticket = await getTicketById(input.ticketId);
        if (!ticket) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Ticket not found",
          });
        }

        if (ticket.status !== "CALLED") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Only called tickets can be skipped",
          });
        }

        await updateTicketStatus(ticket.id, "SKIPPED");

        // TODO: Handle skip recovery based on store settings

        return { success: true };
      }),

    // Cancel ticket (staff action)
    cancel: adminProcedure
      .input(z.object({ ticketId: z.number() }))
      .mutation(async ({ input }) => {
        const ticket = await getTicketById(input.ticketId);
        if (!ticket) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Ticket not found",
          });
        }

        await updateTicketStatus(ticket.id, "CANCELLED");

        return { success: true };
      }),

    // Get store settings
    getStore: adminProcedure
      .input(z.object({ storeSlug: z.string() }))
      .query(async ({ input }) => {
        const store = await getStoreBySlug(input.storeSlug);
        if (!store) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Store not found",
          });
        }

        return store;
      }),

    // Update store settings
    updateStore: adminProcedure
      .input(
        z.object({
          storeSlug: z.string(),
          name: z.string().optional(),
          isOpen: z.boolean().optional(),
          notificationThreshold3: z.number().optional(),
          notificationThreshold1: z.number().optional(),
          skipRecoveryMode: z.enum(["end", "near", "resubmit"]).optional(),
          printMethod: z.enum(["local_bridge", "direct"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        // TODO: Implement store update logic
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
