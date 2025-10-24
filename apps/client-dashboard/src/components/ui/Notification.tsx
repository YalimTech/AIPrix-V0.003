import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
// import { useAppStore } from '../../store/appStore';
// import RealTimeNotification from './RealTimeNotification';

interface NotificationProps {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  timestamp: number;
  onClose?: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  id,
  type,
  title,
  message,
  timestamp,
  onClose,
}) => {
  // eslint-disable-line @typescript-eslint/no-unused-vars
  // Simple notification without Zustand
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Llamar onClose para eliminar de localStorage también
      onClose?.();
    }, 4000); // 4 segundos para que se vea bien

    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case "error":
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />;
      case "warning":
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />;
      case "info":
        return <InformationCircleIcon className="w-5 h-5 text-blue-400" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "info":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`max-w-md w-full bg-white shadow-xl rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden border ${getBgColor()}`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3">{getIcon()}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 leading-tight">
                  {title}
                </p>
                <p className="mt-1 text-sm text-gray-600 leading-relaxed break-words">
                  {message}
                </p>
              </div>
              <button
                className="ml-3 flex-shrink-0 inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 p-1 rounded-md hover:bg-gray-100"
                onClick={() => {
                  setIsVisible(false);
                  onClose?.();
                }}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const NotificationContainer: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Cargar notificaciones desde localStorage
    const loadNotifications = () => {
      const stored = localStorage.getItem("notifications");
      if (stored) {
        try {
          setNotifications(JSON.parse(stored));
        } catch (error) {
          console.error("Error parsing notifications:", error);
        }
      }
    };

    loadNotifications();

    // Escuchar cambios en localStorage
    const handleStorageChange = () => {
      loadNotifications();
    };

    window.addEventListener("storage", handleStorageChange);

    // También escuchar cambios del mismo tab
    const interval = setInterval(loadNotifications, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const removeNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    localStorage.setItem("notifications", JSON.stringify(updated));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          id={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          timestamp={notification.timestamp}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default Notification;
