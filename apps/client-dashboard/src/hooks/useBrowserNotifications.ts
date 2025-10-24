import { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';

interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export const useBrowserNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: false,
  });
  
  const addNotification = useAppStore((state) => state.addNotification);

  useEffect(() => {
    if ('Notification' in window) {
      const updatePermission = () => {
        const status = Notification.permission;
        setPermission({
          granted: status === 'granted',
          denied: status === 'denied',
          default: status === 'default',
        });
      };

      updatePermission();
      
      // Listen for permission changes
      // const handlePermissionChange = () => updatePermission();
      // Note: Notification API doesn't have addEventListener in all browsers
      // This is a placeholder for future implementation

      return () => {
        // Note: Notification API doesn't have removeEventListener in all browsers
        // This is a placeholder for future implementation
      };
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      addNotification({
        type: 'warning',
        title: 'Notificaciones no soportadas',
        message: 'Tu navegador no soporta notificaciones',
      });
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      addNotification({
        type: 'warning',
        title: 'Notificaciones bloqueadas',
        message: 'Las notificaciones están bloqueadas. Por favor habilítalas en la configuración del navegador.',
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      addNotification({
        type: 'error',
        title: 'Error al solicitar permisos',
        message: 'No se pudieron solicitar los permisos de notificación',
      });
      return false;
    }
  };

  const showNotification = async (
    title: string,
    options: NotificationOptions = {}
  ): Promise<boolean> => {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission !== 'granted') {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        return false;
      }
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'prix-agent-notification',
        requireInteraction: false,
        silent: false,
        ...options,
      });

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Handle click
      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Navigate to relevant page if URL is provided
        if (options.data?.url) {
          window.location.href = options.data.url;
        }
      };

      return true;
    } catch (error) {
      console.error('Error showing notification:', error);
      return false;
    }
  };

  const showCallNotification = async (
    phoneNumber: string,
    direction: 'inbound' | 'outbound',
    agentName?: string
  ) => {
    const title = direction === 'inbound' ? 'Llamada entrante' : 'Llamada saliente';
    const body = direction === 'inbound' 
      ? `Llamada entrante de ${phoneNumber}`
      : `Llamada saliente a ${phoneNumber}`;

    return showNotification(title, {
      body,
      icon: '/icons/phone-icon.png',
      badge: '/icons/phone-badge.png',
      tag: `call-${direction}-${phoneNumber}`,
      requireInteraction: true,
      data: {
        url: '/call-logs',
        type: 'call',
        phoneNumber,
        direction,
        agentName,
      },
    });
  };

  const showCampaignNotification = async (
    campaignName: string,
    status: 'started' | 'completed' | 'paused' | 'failed',
    stats?: { calls: number; successful: number; failed: number }
  ) => {
    const title = `Campaña: ${campaignName}`;
    let body = '';

    switch (status) {
      case 'started':
        body = 'La campaña ha comenzado';
        break;
      case 'completed':
        body = `Campaña completada. ${stats?.successful || 0} llamadas exitosas de ${stats?.calls || 0} totales`;
        break;
      case 'paused':
        body = 'La campaña ha sido pausada';
        break;
      case 'failed':
        body = 'La campaña ha fallado';
        break;
    }

    return showNotification(title, {
      body,
      icon: '/icons/campaign-icon.png',
      badge: '/icons/campaign-badge.png',
      tag: `campaign-${campaignName}`,
      requireInteraction: status === 'failed',
      data: {
        url: '/campaigns',
        type: 'campaign',
        campaignName,
        status,
        stats,
      },
    });
  };

  const showSystemNotification = async (
    type: 'error' | 'warning' | 'info' | 'success',
    title: string,
    message: string,
    actionUrl?: string
  ) => {
    const icons = {
      error: '/icons/error-icon.png',
      warning: '/icons/warning-icon.png',
      info: '/icons/info-icon.png',
      success: '/icons/success-icon.png',
    };

    return showNotification(title, {
      body: message,
      icon: icons[type],
      tag: `system-${type}`,
      requireInteraction: type === 'error',
      data: {
        url: actionUrl,
        type: 'system',
        level: type,
      },
    });
  };

  const showBillingNotification = async (
    type: 'low_balance' | 'payment_failed' | 'payment_success' | 'auto_refill',
    amount?: number
  ) => {
    const notifications = {
      low_balance: {
        title: 'Balance bajo',
        body: `Tu balance actual es de $${amount?.toFixed(2) || '0.00'}. Considera agregar fondos.`,
        url: '/billing',
      },
      payment_failed: {
        title: 'Pago fallido',
        body: 'El pago automático ha fallado. Por favor actualiza tu método de pago.',
        url: '/billing',
      },
      payment_success: {
        title: 'Pago exitoso',
        body: `Se han agregado $${amount?.toFixed(2) || '0.00'} a tu cuenta.`,
        url: '/billing',
      },
      auto_refill: {
        title: 'Auto-refill activado',
        body: `Se han agregado $${amount?.toFixed(2) || '0.00'} automáticamente a tu cuenta.`,
        url: '/billing',
      },
    };

    const notification = notifications[type];
    if (!notification) return false;

    return showNotification(notification.title, {
      body: notification.body,
      icon: '/icons/billing-icon.png',
      tag: `billing-${type}`,
      requireInteraction: type === 'payment_failed',
      data: {
        url: notification.url,
        type: 'billing',
        billingType: type,
        amount,
      },
    });
  };

  const showIntegrationNotification = async (
    service: string,
    status: 'connected' | 'disconnected' | 'error',
    message?: string
  ) => {
    const title = `Integración: ${service}`;
    let body = '';

    switch (status) {
      case 'connected':
        body = `${service} se ha conectado exitosamente`;
        break;
      case 'disconnected':
        body = `${service} se ha desconectado`;
        break;
      case 'error':
        body = message || `Error en la integración con ${service}`;
        break;
    }

    return showNotification(title, {
      body,
      icon: '/icons/integration-icon.png',
      tag: `integration-${service}`,
      requireInteraction: status === 'error',
      data: {
        url: '/integrations',
        type: 'integration',
        service,
        status,
      },
    });
  };

  const clearNotifications = () => {
    // Note: There's no direct way to clear all notifications
    // This is a placeholder for future implementation
    console.log('Clearing notifications is not directly supported by the Notification API');
  };

  return {
    permission,
    requestPermission,
    showNotification,
    showCallNotification,
    showCampaignNotification,
    showSystemNotification,
    showBillingNotification,
    showIntegrationNotification,
    clearNotifications,
  };
};
