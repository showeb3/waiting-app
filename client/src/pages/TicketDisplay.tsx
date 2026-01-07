import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Bell, BellOff } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useNotification } from "@/hooks/useNotification";
import NotificationToast from "@/components/NotificationToast";

// Embedded notification sound (simple chime)
const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

export default function TicketDisplay() {
  const [, params] = useRoute("/w/:storeSlug/ticket/:token");
  const [, navigate] = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isEnablingNotifications, setIsEnablingNotifications] = useState(false);
  const { notifications, removeNotification } = useNotification();
  const [previousStatus, setPreviousStatus] = useState<string>("waiting");
  // Track groups ahead for sound trigger
  const [previousGroupsAhead, setPreviousGroupsAhead] = useState<number>(9999);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const token = params?.token || "";
  const storeSlug = params?.storeSlug || "";

  // Initialize audio
  useEffect(() => {
    const audio = new Audio(NOTIFICATION_SOUND);
    // iOS Safari requires explicit load() sometimes
    audio.load();
    audioRef.current = audio;
  }, []);

  // Fetch ticket details
  const { data, isLoading, refetch } = trpc.tickets.getByToken.useQuery(
    { token },
    { enabled: !!token, refetchInterval: 3000 } // Refetch every 3 seconds
  );

  // Safely extract data for top-level hooks
  const ticket = data?.ticket;
  const currentCalling = data?.currentCalling;
  const groupsAhead = data?.groupsAhead;
  const store = data?.store;

  const isCalled = ticket?.status === "called";
  // Default to 3 if not set
  const threshold = store?.notificationThreshold3 ?? 3;
  const isNear = ticket?.status === "waiting" && groupsAhead !== undefined && groupsAhead <= threshold;

  // Sound trigger for Near state
  useEffect(() => {
    if (groupsAhead !== undefined && ticket) {
      // Trigger if we crossed the threshold downwards (e.g. 4 -> 3)
      // AND we are strictly in waiting state
      if (groupsAhead <= threshold && previousGroupsAhead > threshold && ticket.status === "waiting") {
        try {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(console.error);
          }
          if (navigator.vibrate) navigator.vibrate(200);
          toast.info(t("ticket.comingSoon"));
        } catch (e) {
          console.error("Pre-call sound failed", e);
        }
      }
      setPreviousGroupsAhead(groupsAhead);
    }
  }, [groupsAhead, threshold, ticket?.status, previousGroupsAhead]); // Added previousGroupsAhead to deps to match logic

  // Unlock audio on first user interaction
  useEffect(() => {
    // ... (existing unlockAudio logic)
    const unlockAudio = () => {
      if (audioRef.current) {
        audioRef.current.volume = 0;
        audioRef.current.play().then(() => {
          audioRef.current!.pause();
          audioRef.current!.currentTime = 0;
          audioRef.current!.volume = 1;
        }).catch(() => { });
        toast.success(t("ticket.soundReady"));
      }
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);

    // Request Screen Wake Lock to keep device awake
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          // @ts-ignore - types might be missing
          wakeLock = await navigator.wakeLock.request('screen');
          console.log('Wake Lock is active');
        } catch (err: any) {
          console.error(`${err.name}, ${err.message}`);
        }
      }
    };

    // Try to request wake lock on load and visibility change
    requestWakeLock();

    const handleVisibilityChange = () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock !== null) {
        // @ts-ignore
        wakeLock.release().then(() => {
          wakeLock = null;
        });
      }
    };
  }, []);

  // Play sound and vibrate when status changes to 'called'
  useEffect(() => {
    // Cast status to string to avoid type errors if schema definition varies
    const currentStatus = data?.ticket?.status as string | undefined;

    if (currentStatus === "called" && previousStatus === "waiting") {
      try {
        // Sound - reusing unlocked instance
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          const playPromise = audioRef.current.play();

          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("Audio played successfully");
              })
              .catch(e => {
                console.error("Audio play failed:", e);
                toast.error("Audio Error: " + e.message);
              });
          }
        } else {
          toast.error("Audio ref is null");
        }

        // Vibration (Pattern: Vibrate 500ms, Pause 200ms, Vibrate 500ms)
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          try {
            navigator.vibrate([500, 200, 500]);
          } catch (e) {
            console.error("Vibration failed", e);
          }
        }

        toast.success(
          <div>
            <p className="font-bold text-lg">{t("ticket.yourTurn")}</p>
            <p className="text-sm opacity-90">{t("ticket.checkSilentMode")}</p>
          </div>
        );
      } catch (err: any) {
        console.error("Failed to play notification", err);
        toast.error("Err: " + err.message);
      }
    }
    if (currentStatus) {
      setPreviousStatus(currentStatus);
    }
  }, [data?.ticket?.status, previousStatus, language]);

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
    if (!("serviceWorker" in navigator)) {
      toast.error(t("notifications.notSupported"));
      return;
    }

    if (!import.meta.env.VITE_VAPID_PUBLIC_KEY) {
      console.error("VITE_VAPID_PUBLIC_KEY is missing");
      toast.error(t("notifications.serverConfigMissing"));
      return;
    }

    setIsEnablingNotifications(true);

    try {
      const registration = await navigator.serviceWorker.ready;

      // Check if PushManager exists (iOS Safari requires Add to Home Screen)
      if (!registration.pushManager) {
        setIsEnablingNotifications(false);
        toast.error(t("ticket.iosPushError"));
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setIsEnablingNotifications(false);
        toast.error(t("notifications.permissionDenied"));
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
      });

      subscribePushMutation.mutate({
        token,
        subscription: subscription.toJSON() as any,
      });
    } catch (error: any) {
      setIsEnablingNotifications(false);
      console.error("Failed to enable notifications:", error);
      toast.error(`Failed: ${error.message || "Unknown error"}`);
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

  if (!data || !ticket) {
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

  return (
    <div className={`min-h-screen flex flex-col ${isCalled ? 'bg-red-50' : isNear ? 'bg-yellow-50' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
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

      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">{t("guest.title")}</h1>
        <div className="flex gap-2">
          <Button variant={language === "ja" ? "default" : "outline"} size="sm" onClick={() => setLanguage("ja")}>日本語</Button>
          <Button variant={language === "en" ? "default" : "outline"} size="sm" onClick={() => setLanguage("en")}>English</Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Your Number */}
          <Card className={`p-8 shadow-lg transition-colors duration-500 ${isCalled
            ? 'bg-red-100 border-4 border-red-500'
            : isNear
              ? 'bg-yellow-100 border-4 border-yellow-400'
              : 'bg-white'
            }`}>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">{t("ticket.yourNumber")}</p>
              <p className={`text-6xl font-bold ${isCalled ? 'text-red-600 animate-pulse' : isNear ? 'text-yellow-700' : 'text-indigo-600'}`}>
                {ticket.sequenceNumber}
              </p>

              {isCalled && (
                <div className="mt-4 p-2 bg-red-100 text-red-700 font-bold rounded-lg text-lg animate-bounce">
                  {t("ticket.yourTurn")}
                </div>
              )}

              {isNear && !isCalled && (
                <div className="mt-4 space-y-2">
                  <div className="p-2 bg-yellow-200 text-yellow-800 font-bold rounded-lg text-lg animate-pulse">
                    {t("ticket.comingSoon")}
                  </div>
                  <div className="text-sm font-bold text-red-600 bg-white/50 p-2 rounded border border-red-200">
                    <p>{t("ticket.cancelGuidance")}</p>
                    <p className="mt-1">{t("ticket.skipWarning")}</p>
                  </div>
                </div>
              )}

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
            {/* Guidance Message for keeping screen open */}
            <div className="bg-white/80 p-3 rounded-md text-sm text-gray-700 text-center border">
              <p>🔔 <strong>{t("ticket.soundGuidanceTitle")}</strong></p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-indigo-600 h-auto py-1"
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play();
                    toast.success("Sound Test OK 🔊");
                  }
                }}
              >
                {t("ticket.soundTest")}
              </Button>
            </div>



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
        </div>
      </div>
    </div>
  );
}
