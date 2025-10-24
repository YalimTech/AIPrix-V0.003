import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
export const useRealTimeUpdates = () => {
    const queryClient = useQueryClient();
    const { subscribe, unsubscribe } = useWebSocket();
    useEffect(() => {
        // Función para invalidar queries específicas
        const invalidateQueries = (queryKey) => {
            queryClient.invalidateQueries({ queryKey });
        };
        // Suscribirse a actualizaciones de campañas
        const handleCampaignUpdate = (data) => {
            console.log('🔄 Actualizando datos de campañas:', data);
            invalidateQueries(['campaigns']);
            invalidateQueries(['dashboard', 'stats']);
        };
        // Suscribirse a actualizaciones de llamadas
        const handleCallUpdate = (data) => {
            console.log('🔄 Actualizando datos de llamadas:', data);
            invalidateQueries(['calls']);
            invalidateQueries(['dashboard', 'stats']);
            invalidateQueries(['dashboard', 'recent-activity']);
        };
        // Suscribirse a actualizaciones de agentes
        const handleAgentUpdate = (data) => {
            console.log('🔄 Actualizando datos de agentes:', data);
            invalidateQueries(['agents']);
            invalidateQueries(['dashboard', 'stats']);
        };
        // Suscribirse a actualizaciones de contactos
        const handleContactUpdate = (data) => {
            console.log('🔄 Actualizando datos de contactos:', data);
            invalidateQueries(['contacts']);
            invalidateQueries(['dashboard', 'stats']);
        };
        // Suscribirse a actualizaciones de números telefónicos
        const handlePhoneNumberUpdate = (data) => {
            console.log('🔄 Actualizando datos de números telefónicos:', data);
            // Invalidar solo queries específicas para evitar recargas completas con exact: true
            invalidateQueries({
                queryKey: ['phoneNumbers', 'purchased', 'optimized'],
                exact: true
            });
            invalidateQueries({
                queryKey: ['phoneNumbers', 'available'],
                exact: true
            });
            invalidateQueries({
                queryKey: ['dashboard', 'stats'],
                exact: true
            });
        };
        // Suscribirse a eventos
        subscribe('campaign_update', handleCampaignUpdate);
        subscribe('call_update', handleCallUpdate);
        subscribe('agent_update', handleAgentUpdate);
        subscribe('contact_update', handleContactUpdate);
        subscribe('phone_number_update', handlePhoneNumberUpdate);
        // Limpiar suscripciones
        return () => {
            unsubscribe('campaign_update', handleCampaignUpdate);
            unsubscribe('call_update', handleCallUpdate);
            unsubscribe('agent_update', handleAgentUpdate);
            unsubscribe('contact_update', handleContactUpdate);
            unsubscribe('phone_number_update', handlePhoneNumberUpdate);
        };
    }, [queryClient, subscribe, unsubscribe]);
    return {
        // Función para forzar actualización de datos específicos
        refreshData: (queryKey) => {
            queryClient.invalidateQueries({ queryKey });
        },
    };
};
