import React, { useState } from 'react';
import { 
  BellIcon, 
  XMarkIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useAppStore } from '../../store/appStore';
import { useBrowserNotifications } from '../../hooks/useBrowserNotifications';
import Button from './Button';

interface NotificationCenterProps {
  className?: string;
}

// interface NotificationItem {
//   id: string;
//   type: 'success' | 'error' | 'warning' | 'info';
//   title: string;
//   message: string;
//   timestamp: Date;
//   read: boolean;
//   persistent?: boolean;
//   actions?: Array<{
//     label: string;
//     action: () => void;
//     variant: 'primary' | 'secondary';
//   }>;
// }

const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('unread');
  
  const { notifications, removeNotification, markAsRead, clearNotifications } = useAppStore();
  const { permission, requestPermission } = useBrowserNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <InformationCircleIcon className="w-5 h-5 text-blue-600" />;
      default:
        return <BellIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  // const _getNotificationColor = (type: string) => {
  //   switch (type) {
  //     case 'success':
  //       return 'border-green-200 bg-green-50';
  //     case 'error':
  //       return 'border-red-200 bg-red-50';
  //     case 'warning':
  //       return 'border-yellow-200 bg-yellow-50';
  //     case 'info':
  //       return 'border-blue-200 bg-blue-50';
  //     default:
  //       return 'border-gray-200 bg-gray-50';
  //   }
  // };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes}m`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    return date.toLocaleDateString('es-ES');
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'read':
        return notification.read;
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleRequestPermission = async () => {
    await requestPermission();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Notificaciones</h3>
            <div className="flex items-center space-x-2">
              {/* Browser Notification Permission */}
              {!permission.granted && (
                <button
                  onClick={handleRequestPermission}
                  className="text-xs text-blue-600 hover:text-blue-800"
                  title="Habilitar notificaciones del navegador"
                >
                  🔔
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-gray-200">
            {[
              { id: 'unread', label: 'Sin leer', count: unreadCount },
              { id: 'read', label: 'Leídas', count: notifications.filter(n => n.read).length },
              { id: 'all', label: 'Todas', count: notifications.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`flex-1 px-4 py-2 text-sm font-medium text-center transition-colors ${
                  filter === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label} {tab.count > 0 && `(${tab.count})`}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  {filter === 'unread' && 'No hay notificaciones sin leer'}
                  {filter === 'read' && 'No hay notificaciones leídas'}
                  {filter === 'all' && 'No hay notificaciones'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 transition-colors hover:bg-gray-50 ${
                      !notification.read ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            
                            {/* Actions */}
                            {notification.actions && notification.actions.length > 0 && (
                              <div className="flex space-x-2 mt-3">
                                {notification.actions.map((action, index) => (
                                  <Button
                                    key={index}
                                    onClick={action.action}
                                    variant={action.variant}
                                    size="sm"
                                  >
                                    {action.label}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-2">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                                title="Marcar como leída"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => removeNotification(notification.id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center text-xs text-gray-500">
                            <ClockIcon className="w-3 h-3 mr-1" />
                            {formatTime(new Date(notification.timestamp))}
                          </div>
                          
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    notifications.forEach(n => markAsRead(n.id));
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Marcar todas como leídas
                </button>
                <button
                  onClick={() => {
                    clearNotifications();
                  }}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Limpiar todas
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationCenter;
