import { useEffect, useState, useCallback } from "react";

export interface NotificationMessage {
  id: string;
  type: "almost_your_turn" | "your_turn_next" | "info" | "warning";
  titleKey: string;
  bodyKey: string;
  duration?: number;
}

export function useNotification() {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);

  // Listen for messages from Service Worker
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "PUSH_NOTIFICATION") {
        const payload = event.data.payload;

        // Map push notification to UI notification
        let notificationType: "almost_your_turn" | "your_turn_next" | "info" = "info";
        if (payload.body?.includes("3")) {
          notificationType = "almost_your_turn";
        } else if (payload.body?.includes("next") || payload.body?.includes("次")) {
          notificationType = "your_turn_next";
        }

        const notification: NotificationMessage = {
          id: `${Date.now()}`,
          type: notificationType,
          titleKey: "notification.title",
          bodyKey: "notification.body",
          duration: 5000,
        };

        addNotification(notification);
      }
    };

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", handleMessage);

      return () => {
        navigator.serviceWorker.removeEventListener("message", handleMessage);
      };
    }
  }, []);

  const addNotification = useCallback((notification: NotificationMessage) => {
    setNotifications((prev) => [...prev, notification]);

    // Auto-remove notification after duration
    if (notification.duration) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, notification.duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
  };
}
