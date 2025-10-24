import React, { useState } from "react";
import {
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "success",
      title: "New account registered",
      message:
        "TechCorp has successfully registered and activated their account.",
      timestamp: "2024-09-29 10:45:12",
      read: false,
    },
    {
      id: 2,
      type: "warning",
      title: "High CPU usage detected",
      message:
        "Server CPU usage has reached 85% on the main application server.",
      timestamp: "2024-09-29 10:42:33",
      read: false,
    },
    {
      id: 3,
      type: "info",
      title: "System maintenance scheduled",
      message: "Scheduled maintenance will begin at 2:00 AM UTC tomorrow.",
      timestamp: "2024-09-29 10:38:45",
      read: true,
    },
    {
      id: 4,
      type: "error",
      title: "Payment processing failed",
      message:
        "Failed to process payment for account StartupXYZ. Please investigate.",
      timestamp: "2024-09-29 10:35:22",
      read: false,
    },
    {
      id: 5,
      type: "success",
      title: "Backup completed successfully",
      message: "Daily backup has been completed and stored securely.",
      timestamp: "2024-09-29 10:30:15",
      read: true,
    },
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "warning":
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case "info":
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "info":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(
      notifications.filter((notification) => notification.id !== id),
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, read: true })),
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">
            System notifications and alerts
          </p>
        </div>
        <div className="flex space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Notification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BellIcon className="h-8 w-8 text-gray-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-semibold text-gray-900">
                {notifications.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-semibold text-sm">
                  {unreadCount}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Unread</p>
              <p className="text-2xl font-semibold text-gray-900">
                {unreadCount}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Warnings</p>
              <p className="text-2xl font-semibold text-gray-900">
                {notifications.filter((n) => n.type === "warning").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Errors</p>
              <p className="text-2xl font-semibold text-gray-900">
                {notifications.filter((n) => n.type === "error").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No notifications
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              You're all caught up! No new notifications.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`border rounded-lg p-4 ${getNotificationBgColor(notification.type)} ${
                !notification.read ? "ring-2 ring-red-500 ring-opacity-50" : ""
              }`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`text-sm font-medium ${
                        !notification.read ? "text-gray-900" : "text-gray-700"
                      }`}
                    >
                      {notification.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p
                    className={`mt-1 text-sm ${
                      !notification.read ? "text-gray-800" : "text-gray-600"
                    }`}
                  >
                    {notification.message}
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    {notification.timestamp}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
