import webpush from "web-push";
import {
  getPushSubscriptionsByTicketId,
  getTicketById,
  getWaitingTickets,
  getStoreById,
  updateTicketNotificationState,
} from "./db";
import { getTranslation, Language } from "@shared/i18n";

// Configure web-push with VAPID keys
// In production, these should be stored securely in environment variables
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || "your-public-key";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "your-private-key";

if (vapidPublicKey !== "your-public-key" && vapidPrivateKey !== "your-private-key") {
  webpush.setVapidDetails(
    "mailto:support@waiting-management.local",
    vapidPublicKey,
    vapidPrivateKey
  );
}

interface NotificationPayload {
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
export async function sendPushNotificationToTicket(
  ticketId: number,
  payload: NotificationPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const subscriptions = await getPushSubscriptionsByTicketId(ticketId);

    if (subscriptions.length === 0) {
      console.log(`[Push] No subscriptions for ticket ${ticketId}`);
      return { success: false, error: "No subscriptions found" };
    }

    let successCount = 0;
    let failureCount = 0;

    for (const subscription of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        };

        await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
        successCount++;
      } catch (error) {
        console.error(`[Push] Failed to send to subscription:`, error);
        failureCount++;
      }
    }

    console.log(
      `[Push] Sent to ticket ${ticketId}: ${successCount} success, ${failureCount} failed`
    );

    return {
      success: successCount > 0,
      error: failureCount > 0 ? `${failureCount} subscriptions failed` : undefined,
    };
  } catch (error) {
    console.error(`[Push] Error sending notification:`, error);
    return { success: false, error: String(error) };
  }
}

/**
 * Check and send "almost your turn" notification (3 groups ahead)
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

    // Check if we already sent this notification
    if (ticket.notificationSent3 === true) {
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
      const groupsAhead = ticketIndex;
      const title =
        language === "ja"
          ? "もうすぐお呼びします"
          : "Your turn is coming soon";
      const body =
        language === "ja"
          ? `あと${groupsAhead}組でお呼びします`
          : `${groupsAhead} groups ahead`;

      const payload: NotificationPayload = {
        title,
        body,
        icon: "/icon-192.png",
        badge: "/icon-96.png",
        tag: `ticket-${ticketId}-almost`,
        requireInteraction: true,
        data: {
          ticketId,
          storeId,
          type: "almost-your-turn",
          url: `/w/${store.slug}/ticket/${ticket.token}`,
        },
        actions: [
          {
            action: "view",
            title: language === "ja" ? "確認" : "View",
          },
        ],
      };

      const result = await sendPushNotificationToTicket(ticketId, payload);

      if (result.success) {
        // Mark notification as sent
        await updateTicketNotificationState(ticketId, { notificationSent3: true });
        console.log(`[Push] Sent "almost your turn" notification to ticket ${ticketId}`);
        return true;
      }

      return false;
    }

    return false;
  } catch (error) {
    console.error(`[Push] Error checking almost-your-turn:`, error);
    return false;
  }
}

/**
 * Check and send "your turn next" notification (1 group ahead)
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

    // Check if we already sent this notification
    if (ticket.notificationSent1 === true) {
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
      const title = language === "ja" ? "次はあなたです" : "You're next!";
      const body =
        language === "ja"
          ? "準備をお願いします"
          : "Please get ready";

      const payload: NotificationPayload = {
        title,
        body,
        icon: "/icon-192.png",
        badge: "/icon-96.png",
        tag: `ticket-${ticketId}-next`,
        requireInteraction: true,
        data: {
          ticketId,
          storeId,
          type: "your-turn-next",
          url: `/w/${store.slug}/ticket/${ticket.token}`,
        },
        actions: [
          {
            action: "view",
            title: language === "ja" ? "確認" : "View",
          },
        ],
      };

      const result = await sendPushNotificationToTicket(ticketId, payload);

      if (result.success) {
        // Mark notification as sent
        await updateTicketNotificationState(ticketId, { notificationSent1: true });
        console.log(`[Push] Sent "your turn next" notification to ticket ${ticketId}`);
        return true;
      }

      return false;
    }

    return false;
  } catch (error) {
    console.error(`[Push] Error checking your-turn-next:`, error);
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

    const store = await getStoreById(ticket.storeId);
    if (!store) {
      return false;
    }

    const title = language === "ja" ? "ご注意" : "Notice";
    const body =
      language === "ja"
        ? "不在のためスキップされました。再度登録をお願いします。"
        : "You were skipped due to absence. Please re-register.";

    const payload: NotificationPayload = {
      title,
      body,
      icon: "/icon-192.png",
      badge: "/icon-96.png",
      tag: `ticket-${ticketId}-skip`,
      requireInteraction: false,
      data: {
        ticketId,
        storeId: ticket.storeId,
        type: "skip-notification",
        url: `/w/${store.slug}`,
      },
    };

    return (await sendPushNotificationToTicket(ticketId, payload)).success;
  } catch (error) {
    console.error(`[Push] Error sending skip notification:`, error);
    return false;
  }
}

/**
 * Get VAPID public key for client-side subscription
 */
export function getVapidPublicKey(): string {
  return vapidPublicKey;
}
