import { getPushSubscriptionsByTicketId, getTicketById, getWaitingTickets, getStoreById } from "./db";
import { getTranslation, Language } from "@shared/i18n";

interface PushMessage {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  data?: Record<string, any>;
  actions?: Array<{ action: string; title: string }>;
}

/**
 * Send push notification to a ticket holder
 */
export async function sendPushNotification(
  ticketId: number,
  message: PushMessage
): Promise<boolean> {
  try {
    const subscriptions = await getPushSubscriptionsByTicketId(ticketId);

    if (subscriptions.length === 0) {
      console.log(`[Notifications] No subscriptions for ticket ${ticketId}`);
      return false;
    }

    // TODO: Implement actual push notification sending using web-push library
    // For now, just log the notification
    console.log(`[Notifications] Sending to ticket ${ticketId}:`, message);

    return true;
  } catch (error) {
    console.error(`[Notifications] Failed to send notification:`, error);
    return false;
  }
}

/**
 * Check if ticket should receive "almost your turn" notification (3 groups ahead)
 */
export async function checkAndSendAlmostYourTurnNotification(
  ticketId: number,
  storeId: number,
  language: Language = "ja"
): Promise<boolean> {
  try {
    const ticket = await getTicketById(ticketId);
    if (!ticket || ticket.status !== "WAITING") {
      return false;
    }

    const store = await getStoreById(storeId);
    if (!store) {
      return false;
    }

    const waitingTickets = await getWaitingTickets(storeId);
    const ticketIndex = waitingTickets.findIndex((t) => t.id === ticketId);

    // Send notification if groups ahead <= threshold
    if (ticketIndex >= 0 && ticketIndex <= store.notificationThreshold3) {
      const message: PushMessage = {
        title: getTranslation(language, "notifications.almostYourTurn"),
        body: getTranslation(language, "notifications.almostYourTurn"),
        tag: `ticket-${ticketId}-almost`,
        requireInteraction: true,
        data: {
          ticketId,
          storeId,
          type: "almost-your-turn",
        },
        actions: [
          {
            action: "cancel",
            title: getTranslation(language, "ticket.cancelTicket"),
          },
        ],
      };

      return await sendPushNotification(ticketId, message);
    }

    return false;
  } catch (error) {
    console.error(`[Notifications] Error checking almost-your-turn:`, error);
    return false;
  }
}

/**
 * Check if ticket should receive "your turn next" notification (1 group ahead)
 */
export async function checkAndSendYourTurnNextNotification(
  ticketId: number,
  storeId: number,
  language: Language = "ja"
): Promise<boolean> {
  try {
    const ticket = await getTicketById(ticketId);
    if (!ticket || ticket.status !== "WAITING") {
      return false;
    }

    const store = await getStoreById(storeId);
    if (!store) {
      return false;
    }

    const waitingTickets = await getWaitingTickets(storeId);
    const ticketIndex = waitingTickets.findIndex((t) => t.id === ticketId);

    // Send notification if groups ahead <= threshold (1)
    if (ticketIndex >= 0 && ticketIndex <= store.notificationThreshold1) {
      const message: PushMessage = {
        title: getTranslation(language, "notifications.yourTurnNext"),
        body: getTranslation(language, "notifications.yourTurnNext"),
        tag: `ticket-${ticketId}-next`,
        requireInteraction: true,
        data: {
          ticketId,
          storeId,
          type: "your-turn-next",
        },
        actions: [
          {
            action: "cancel",
            title: getTranslation(language, "ticket.cancelTicket"),
          },
        ],
      };

      return await sendPushNotification(ticketId, message);
    }

    return false;
  } catch (error) {
    console.error(`[Notifications] Error checking your-turn-next:`, error);
    return false;
  }
}

/**
 * Send skip notification to ticket holder
 */
export async function sendSkipNotification(
  ticketId: number,
  language: Language = "ja"
): Promise<boolean> {
  try {
    const ticket = await getTicketById(ticketId);
    if (!ticket) {
      return false;
    }

    const message: PushMessage = {
      title: getTranslation(language, "notifications.warning"),
      body: "You were skipped due to absence. Please re-register if you wish to continue waiting.",
      tag: `ticket-${ticketId}-skip`,
      requireInteraction: false,
      data: {
        ticketId,
        type: "skip-notification",
      },
    };

    return await sendPushNotification(ticketId, message);
  } catch (error) {
    console.error(`[Notifications] Error sending skip notification:`, error);
    return false;
  }
}

/**
 * Send owner notification for system events
 */
export async function notifyOwnerOfEvent(
  title: string,
  content: string,
  storeId?: number
): Promise<boolean> {
  try {
    // TODO: Implement owner notification using the built-in notifyOwner helper
    console.log(`[Owner Notification] ${title}: ${content}`);
    return true;
  } catch (error) {
    console.error(`[Owner Notification] Error:`, error);
    return false;
  }
}
