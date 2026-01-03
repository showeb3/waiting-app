import { useLanguage } from "@/contexts/LanguageContext";
import { Bell, AlertCircle, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface NotificationToastProps {
  id: string;
  type: "almost_your_turn" | "your_turn_next" | "info" | "warning";
  titleKey: string;
  bodyKey: string;
  onClose: (id: string) => void;
}

export default function NotificationToast({
  id,
  type,
  titleKey,
  bodyKey,
  onClose,
}: NotificationToastProps) {
  const { t } = useLanguage();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose(id), 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(id), 300);
  };

  // Determine colors and icons based on notification type
  const getStyles = () => {
    switch (type) {
      case "almost_your_turn":
        return {
          bgColor: "bg-blue-50 border-blue-200",
          titleColor: "text-blue-900",
          bodyColor: "text-blue-700",
          icon: <Bell className="h-5 w-5 text-blue-600" />,
          accentColor: "bg-blue-500",
        };
      case "your_turn_next":
        return {
          bgColor: "bg-green-50 border-green-200",
          titleColor: "text-green-900",
          bodyColor: "text-green-700",
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          accentColor: "bg-green-500",
        };
      case "warning":
        return {
          bgColor: "bg-yellow-50 border-yellow-200",
          titleColor: "text-yellow-900",
          bodyColor: "text-yellow-700",
          icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
          accentColor: "bg-yellow-500",
        };
      default:
        return {
          bgColor: "bg-gray-50 border-gray-200",
          titleColor: "text-gray-900",
          bodyColor: "text-gray-700",
          icon: <Bell className="h-5 w-5 text-gray-600" />,
          accentColor: "bg-gray-500",
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`fixed top-4 right-4 max-w-sm transition-all duration-300 ${
        isExiting ? "opacity-0 translate-x-full" : "opacity-100 translate-x-0"
      }`}
    >
      <div
        className={`border-l-4 rounded-lg shadow-lg p-4 ${styles.bgColor}`}
        style={{ borderLeftColor: styles.accentColor.replace("bg-", "") }}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>

          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-sm ${styles.titleColor}`}>
              {t(titleKey)}
            </h3>
            <p className={`text-sm mt-1 ${styles.bodyColor}`}>
              {t(bodyKey)}
            </p>
          </div>

          <button
            onClick={handleClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${styles.accentColor} animate-pulse`}
            style={{
              animation: "shrink 5s linear forwards",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
