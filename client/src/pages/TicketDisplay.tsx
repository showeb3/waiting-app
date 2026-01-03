import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Bell, BellOff } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useNotification } from "@/hooks/useNotification";
import NotificationToast from "@/components/NotificationToast";

export default function TicketDisplay() {
  const [, params] = useRoute("/w/:storeSlug/ticket/:token");
  const [, navigate] = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isEnablingNotifications, setIsEnablingNotifications] = useState(false);
  const { notifications, removeNotification } = useNotification();

  const token = params?.token || "";
  const storeSlug = params?.storeSlug || "";

  // Fetch ticket details
  const { data, isLoading, refetch } = trpc.tickets.getByToken.useQuery(
    { token },
    { enabled: !!token, refetchInterval: 3000 } // Refetch every 3 seconds
  );

  // Cancel mutation
  const cancelMutation = trpc.tickets.cancel.useMutation({
    onSuccess: () => {
      toast.success(t("ticket.cancelSuccess"));
      setTimeout(() => {
        navigate(`/w/${storeSlug}`);
      }, 1500);
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  // Subscribe to push notifications
  const subscribePushMutation = trpc.tickets.subscribePush.useMutation({
    onSuccess: () => {
      setNotificationsEnabled(true);
      setIsEnablingNotifications(false);
      toast.success(t("ticket.notificationsEnabled"));
    },
    onError: (error) => {
      setIsEnablingNotifications(false);
      toast.error(error.message || t("common.error"));
    },
  });

  const handleEnableNotifications = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      toast.error("Notifications not supported");
      return;
    }

    setIsEnablingNotifications(true);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setIsEnablingNotifications(false);
        toast.error("Notification permission denied");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
      });

      subscribePushMutation.mutate({
        token,
        subscription: subscription.toJSON() as any,
      });
    } catch (error) {
      setIsEnablingNotifications(false);
      console.error("Failed to enable notifications:", error);
      toast.error("Failed to enable notifications");
    }
  };

  const handleCancel = () => {
    if (confirm(t("ticket.confirmCancel"))) {
      cancelMutation.mutate({ token });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="p-8 text-center">
          <p className="text-gray-600">{t("ticket.refreshing")}</p>
          <Button onClick={() => refetch()} className="mt-4">
            {t("common.next")}
          </Button>
        </Card>
      </div>
    );
  }

  const { ticket, currentCalling, groupsAhead } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Notification Toasts */}
      <div className="fixed top-0 right-0 z-50 pointer-events-none">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationToast
              id={notification.id}
              type={notification.type}
              titleKey={notification.titleKey}
              bodyKey={notification.bodyKey}
              onClose={removeNotification}
            />
          </div>
        ))}
      </div>

      {/* Header with Language Toggle */}
      <div className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">{t("guest.title")}</h1>
        <div className="flex gap-2">
          <Button
            variant={language === "ja" ? "default" : "outline"}
            size="sm"
            onClick={() => setLanguage("ja")}
          >
            日本語
          </Button>
          <Button
            variant={language === "en" ? "default" : "outline"}
            size="sm"
            onClick={() => setLanguage("en")}
          >
            English
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Your Number */}
          <Card className="p-8 bg-white shadow-lg">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">{t("ticket.yourNumber")}</p>
              <p className="text-6xl font-bold text-indigo-600">{ticket.sequenceNumber}</p>
              <p className="text-gray-500 text-sm mt-4">
                {t("guest.enterPartySize")}: {ticket.partySize}
              </p>
            </div>
          </Card>

          {/* Current Status */}
          <Card className="p-6 bg-white shadow-lg">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t("ticket.currentCalling")}</span>
                <span className="text-2xl font-bold text-green-600">
                  {currentCalling?.sequenceNumber || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t("ticket.groupsAhead")}</span>
                <span className="text-2xl font-bold text-blue-600">
                  {groupsAhead} {t("ticket.groups")}
                </span>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleEnableNotifications}
              disabled={notificationsEnabled || isEnablingNotifications}
              className="w-full"
              variant={notificationsEnabled ? "secondary" : "default"}
            >
              {isEnablingNotifications ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("common.loading")}
                </>
              ) : notificationsEnabled ? (
                <>
                  <Bell className="mr-2 h-4 w-4" />
                  {t("ticket.notificationsEnabled")}
                </>
              ) : (
                <>
                  <BellOff className="mr-2 h-4 w-4" />
                  {t("ticket.enableNotifications")}
                </>
              )}
            </Button>

            <Button
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
              variant="destructive"
              className="w-full"
            >
              {cancelMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                t("ticket.cancelTicket")
              )}
            </Button>
          </div>

          {/* Info */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <p className="text-sm text-gray-700">
              {t("notifications.almostYourTurn")}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
