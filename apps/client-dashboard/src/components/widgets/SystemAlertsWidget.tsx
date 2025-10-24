import React, { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  BellIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useRealTimeData } from '../../hooks/useRealTimeData';
import { useAppStore } from '../../store/appStore';
import Button from '../ui/Button';

interface SystemAlertsWidgetProps {
  className?: string;
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  category: 'system' | 'integration' | 'billing' | 'security' | 'performance';
  actionRequired?: boolean;
  actions?: Array<{
    label: string;
    action: string;
    variant: 'primary' | 'secondary' | 'danger';
  }>;
}

const SystemAlertsWidget: React.FC<SystemAlertsWidgetProps> = ({ className = '' }) => {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'action_required'>('unread');
  const [_expandedAlert, _setExpandedAlert] = useState<string | null>(null);
  
  const { subscribe, unsubscribe } = useRealTimeData({
    queryKey: ['system', 'alerts'],
    endpoint: '/system/alerts',
    interval: 10000,
    enabled: true,
  });
  const addNotification = useAppStore((state) => state.addNotification);

  useEffect(() => {
    // Subscribe to system alerts
    const handleSystemAlert = (data: SystemAlert) => {
      console.log('🚨 System alert received:', data);
      
      const newAlert = {
        ...data,
        id: data.id || Date.now().toString(),
        timestamp: new Date(data.timestamp || Date.now()),
        isRead: false,
      };
      
      setAlerts(prev => [newAlert, ...prev.slice(0, 49)]); // Keep last 50 alerts
      
      // Show browser notification for critical alerts
      if (data.type === 'error' || (data.type === 'warning' && data.actionRequired)) {
        if (Notification.permission === 'granted') {
          new Notification(data.title, {
            body: data.message,
            icon: '/favicon.ico',
          });
        }
      }
      
      // Show in-app notification
      addNotification({
        type: data.type,
        title: data.title,
        message: data.message,
      });
    };

    // Subscribe to integration status updates
    const handleIntegrationUpdate = (data: any) => {
      console.log('🔗 Integration update:', data);
      
      if (data.status === 'error') {
        const alert: SystemAlert = {
          id: `integration-${data.service}-${Date.now()}`,
          type: 'error',
          title: `Error en integración: ${data.service}`,
          message: data.message || 'La integración ha fallado',
          timestamp: new Date(),
          isRead: false,
          category: 'integration',
          actionRequired: true,
          actions: [
            {
              label: 'Reintentar',
              action: 'retry_integration',
              variant: 'primary',
            },
            {
              label: 'Ver configuración',
              action: 'view_config',
              variant: 'secondary',
            },
          ],
        };
        
        setAlerts(prev => [alert, ...prev.slice(0, 49)]);
      }
    };

    // Subscribe to billing alerts
    const handleBillingAlert = (data: any) => {
      console.log('💳 Billing alert:', data);
      
      const alert: SystemAlert = {
        id: `billing-${Date.now()}`,
        type: data.type || 'warning',
        title: data.title || 'Alerta de facturación',
        message: data.message,
        timestamp: new Date(),
        isRead: false,
        category: 'billing',
        actionRequired: data.actionRequired || false,
        actions: data.actions || [],
      };
      
      setAlerts(prev => [alert, ...prev.slice(0, 49)]);
    };

    subscribe('system_alert', handleSystemAlert);
    subscribe('integration_update', handleIntegrationUpdate);
    subscribe('billing_alert', handleBillingAlert);

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      unsubscribe('system_alert');
      unsubscribe('integration_update');
      unsubscribe('billing_alert');
    };
  }, [subscribe, unsubscribe, addNotification]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <InformationCircleIcon className="w-5 h-5 text-blue-600" />;
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      default:
        return <BellIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'system':
        return 'bg-gray-100 text-gray-800';
      case 'integration':
        return 'bg-blue-100 text-blue-800';
      case 'billing':
        return 'bg-green-100 text-green-800';
      case 'security':
        return 'bg-red-100 text-red-800';
      case 'performance':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  const markAsRead = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, isRead: true } : alert
      )
    );
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const handleAlertAction = (alertId: string, action: string) => {
    // Handle different alert actions
    switch (action) {
      case 'retry_integration':
        // Trigger integration retry
        console.log('Retrying integration for alert:', alertId);
        break;
      case 'view_config':
        // Open configuration modal
        console.log('Opening config for alert:', alertId);
        break;
      case 'add_funds':
        // Open add funds modal
        console.log('Opening add funds for alert:', alertId);
        break;
      default:
        console.log('Unknown action:', action);
    }
    
    // Mark as read after action
    markAsRead(alertId);
  };

  const filteredAlerts = alerts.filter(alert => {
    switch (filter) {
      case 'unread':
        return !alert.isRead;
      case 'action_required':
        return alert.actionRequired;
      default:
        return true;
    }
  });

  const unreadCount = alerts.filter(alert => !alert.isRead).length;
  const actionRequiredCount = alerts.filter(alert => alert.actionRequired).length;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 flex items-center">
            <BellIcon className="w-4 h-4 mr-2" />
            Alertas del Sistema
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {unreadCount}
              </span>
            )}
          </h3>
          
          {/* Filter Buttons */}
          <div className="flex space-x-1">
            <button
              onClick={() => setFilter('unread')}
              className={`px-2 py-1 text-xs font-medium rounded ${
                filter === 'unread'
                  ? 'bg-blue-100 text-blue-800'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sin leer
            </button>
            <button
              onClick={() => setFilter('action_required')}
              className={`px-2 py-1 text-xs font-medium rounded ${
                filter === 'action_required'
                  ? 'bg-red-100 text-red-800'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Acción requerida
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-1 text-xs font-medium rounded ${
                filter === 'all'
                  ? 'bg-gray-100 text-gray-800'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Todas
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8">
            <BellIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {filter === 'unread' && 'No hay alertas sin leer'}
              {filter === 'action_required' && 'No hay alertas que requieran acción'}
              {filter === 'all' && 'No hay alertas'}
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded-lg p-3 transition-all ${
                getAlertColor(alert.type)
              } ${!alert.isRead ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
            >
              {/* Alert Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0 mt-0.5">
                    {getAlertIcon(alert.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {alert.title}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(alert.category)}`}>
                        {alert.category}
                      </span>
                      {alert.actionRequired && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Acción requerida
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">
                      {alert.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {formatTime(alert.timestamp)}
                      </p>
                      
                      <div className="flex items-center space-x-2">
                        {!alert.isRead && (
                          <button
                            onClick={() => markAsRead(alert.id)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Marcar como leído
                          </button>
                        )}
                        <button
                          onClick={() => dismissAlert(alert.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alert Actions */}
              {alert.actions && alert.actions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex space-x-2">
                    {alert.actions.map((action, index) => (
                      <Button
                        key={index}
                        onClick={() => handleAlertAction(alert.id, action.action)}
                        variant={action.variant}
                        size="sm"
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {alerts.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {unreadCount} sin leer • {actionRequiredCount} requieren acción
            </span>
            <button
              onClick={() => setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })))}
              className="text-blue-600 hover:text-blue-800"
            >
              Marcar todas como leídas
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemAlertsWidget;
