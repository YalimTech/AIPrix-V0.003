import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon, XCircleIcon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRealTimeData } from '../../hooks/useRealTimeData';
import { useAppStore } from '../../store/appStore';
import Button from '../ui/Button';
const SystemAlertsWidget = ({ className = '' }) => {
    const [alerts, setAlerts] = useState([]);
    const [filter, setFilter] = useState('unread');
    const [_expandedAlert, _setExpandedAlert] = useState(null);
    const { subscribe, unsubscribe } = useRealTimeData({
        queryKey: ['system', 'alerts'],
        endpoint: '/system/alerts',
        interval: 10000,
        enabled: true,
    });
    const addNotification = useAppStore((state) => state.addNotification);
    useEffect(() => {
        // Subscribe to system alerts
        const handleSystemAlert = (data) => {
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
        const handleIntegrationUpdate = (data) => {
            console.log('🔗 Integration update:', data);
            if (data.status === 'error') {
                const alert = {
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
        const handleBillingAlert = (data) => {
            console.log('💳 Billing alert:', data);
            const alert = {
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
    const getAlertIcon = (type) => {
        switch (type) {
            case 'error':
                return _jsx(XCircleIcon, { className: "w-5 h-5 text-red-600" });
            case 'warning':
                return _jsx(ExclamationTriangleIcon, { className: "w-5 h-5 text-yellow-600" });
            case 'info':
                return _jsx(InformationCircleIcon, { className: "w-5 h-5 text-blue-600" });
            case 'success':
                return _jsx(CheckCircleIcon, { className: "w-5 h-5 text-green-600" });
            default:
                return _jsx(BellIcon, { className: "w-5 h-5 text-gray-600" });
        }
    };
    const getAlertColor = (type) => {
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
    const getCategoryColor = (category) => {
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
    const formatTime = (date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (minutes < 1)
            return 'Ahora';
        if (minutes < 60)
            return `Hace ${minutes}m`;
        if (hours < 24)
            return `Hace ${hours}h`;
        if (days < 7)
            return `Hace ${days}d`;
        return date.toLocaleDateString('es-ES');
    };
    const markAsRead = (alertId) => {
        setAlerts(prev => prev.map(alert => alert.id === alertId ? { ...alert, isRead: true } : alert));
    };
    const dismissAlert = (alertId) => {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    };
    const handleAlertAction = (alertId, action) => {
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
    return (_jsxs("div", { className: `bg-white border border-gray-200 rounded-lg ${className}`, children: [_jsx("div", { className: "px-4 py-3 border-b border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h3", { className: "text-sm font-medium text-gray-900 flex items-center", children: [_jsx(BellIcon, { className: "w-4 h-4 mr-2" }), "Alertas del Sistema", unreadCount > 0 && (_jsx("span", { className: "ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800", children: unreadCount }))] }), _jsxs("div", { className: "flex space-x-1", children: [_jsx("button", { onClick: () => setFilter('unread'), className: `px-2 py-1 text-xs font-medium rounded ${filter === 'unread'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'text-gray-500 hover:text-gray-700'}`, children: "Sin leer" }), _jsx("button", { onClick: () => setFilter('action_required'), className: `px-2 py-1 text-xs font-medium rounded ${filter === 'action_required'
                                        ? 'bg-red-100 text-red-800'
                                        : 'text-gray-500 hover:text-gray-700'}`, children: "Acci\u00F3n requerida" }), _jsx("button", { onClick: () => setFilter('all'), className: `px-2 py-1 text-xs font-medium rounded ${filter === 'all'
                                        ? 'bg-gray-100 text-gray-800'
                                        : 'text-gray-500 hover:text-gray-700'}`, children: "Todas" })] })] }) }), _jsx("div", { className: "p-4 space-y-3 max-h-96 overflow-y-auto custom-scrollbar", children: filteredAlerts.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(BellIcon, { className: "w-8 h-8 text-gray-400 mx-auto mb-2" }), _jsxs("p", { className: "text-sm text-gray-500", children: [filter === 'unread' && 'No hay alertas sin leer', filter === 'action_required' && 'No hay alertas que requieran acción', filter === 'all' && 'No hay alertas'] })] })) : (filteredAlerts.map((alert) => (_jsxs("div", { className: `border rounded-lg p-3 transition-all ${getAlertColor(alert.type)} ${!alert.isRead ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`, children: [_jsx("div", { className: "flex items-start justify-between", children: _jsxs("div", { className: "flex items-start space-x-3 flex-1", children: [_jsx("div", { className: "flex-shrink-0 mt-0.5", children: getAlertIcon(alert.type) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-1", children: [_jsx("h4", { className: "text-sm font-medium text-gray-900 truncate", children: alert.title }), _jsx("span", { className: `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(alert.category)}`, children: alert.category }), alert.actionRequired && (_jsx("span", { className: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800", children: "Acci\u00F3n requerida" }))] }), _jsx("p", { className: "text-sm text-gray-700 mb-2", children: alert.message }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-xs text-gray-500", children: formatTime(alert.timestamp) }), _jsxs("div", { className: "flex items-center space-x-2", children: [!alert.isRead && (_jsx("button", { onClick: () => markAsRead(alert.id), className: "text-xs text-blue-600 hover:text-blue-800", children: "Marcar como le\u00EDdo" })), _jsx("button", { onClick: () => dismissAlert(alert.id), className: "text-gray-400 hover:text-gray-600", children: _jsx(XMarkIcon, { className: "w-4 h-4" }) })] })] })] })] }) }), alert.actions && alert.actions.length > 0 && (_jsx("div", { className: "mt-3 pt-3 border-t border-gray-200", children: _jsx("div", { className: "flex space-x-2", children: alert.actions.map((action, index) => (_jsx(Button, { onClick: () => handleAlertAction(alert.id, action.action), variant: action.variant, size: "sm", children: action.label }, index))) }) }))] }, alert.id)))) }), alerts.length > 0 && (_jsx("div", { className: "px-4 py-3 border-t border-gray-200 bg-gray-50", children: _jsxs("div", { className: "flex items-center justify-between text-xs text-gray-500", children: [_jsxs("span", { children: [unreadCount, " sin leer \u2022 ", actionRequiredCount, " requieren acci\u00F3n"] }), _jsx("button", { onClick: () => setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true }))), className: "text-blue-600 hover:text-blue-800", children: "Marcar todas como le\u00EDdas" })] }) }))] }));
};
export default SystemAlertsWidget;
