import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { CogIcon, CheckCircleIcon, ExclamationTriangleIcon, LinkIcon, PhoneIcon, MicrophoneIcon, CreditCardIcon, } from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { useAppStore } from '../store/appStore';
import Button from '../components/ui/Button';
import { TwilioConfigModal, VoiceCloningModal, WebhookConfigModal, AutoRefillModal } from '../components/modals';
const IntegrationsPage = () => {
    const [_selectedIntegration, _setSelectedIntegration] = useState(null);
    const [showTwilioConfig, setShowTwilioConfig] = useState(false);
    const [showVoiceCloning, setShowVoiceCloning] = useState(false);
    const [showWebhookConfig, setShowWebhookConfig] = useState(false);
    const [showAutoRefill, setShowAutoRefill] = useState(false);
    const queryClient = useQueryClient();
    const addNotification = useAppStore((state) => state.addNotification);
    // Fetch integrations status
    const { data: integrations = [], isLoading } = useQuery({
        queryKey: ['integrations'],
        queryFn: () => apiClient.get('/integrations'),
        refetchInterval: 30000, // Refetch every 30 seconds
    });
    const testIntegration = useMutation({
        mutationFn: (integrationId) => apiClient.post(`/integrations/${integrationId}/test`),
        onSuccess: (_data, _integrationId) => {
            addNotification({
                type: 'success',
                title: 'Integración probada',
                message: `La integración ${_integrationId} está funcionando correctamente`,
            });
            queryClient.invalidateQueries({ queryKey: ['integrations'] });
        },
        onError: (error) => {
            addNotification({
                type: 'error',
                title: 'Error en integración',
                message: error.message || 'No se pudo probar la integración',
            });
        },
    });
    const getStatusIcon = (status) => {
        switch (status) {
            case 'connected':
                return _jsx(CheckCircleIcon, { className: "w-5 h-5 text-green-600" });
            case 'disconnected':
                return _jsx(ExclamationTriangleIcon, { className: "w-5 h-5 text-gray-400" });
            case 'error':
                return _jsx(ExclamationTriangleIcon, { className: "w-5 h-5 text-red-600" });
            case 'pending':
                return _jsx(ExclamationTriangleIcon, { className: "w-5 h-5 text-yellow-600" });
            default:
                return _jsx(ExclamationTriangleIcon, { className: "w-5 h-5 text-gray-400" });
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'connected':
                return 'bg-green-100 text-green-800';
            case 'disconnected':
                return 'bg-gray-100 text-gray-800';
            case 'error':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    const getStatusText = (status) => {
        switch (status) {
            case 'connected': return 'Conectado';
            case 'disconnected': return 'Desconectado';
            case 'error': return 'Error';
            case 'pending': return 'Pendiente';
            default: return status;
        }
    };
    const getIntegrationIcon = (type) => {
        switch (type) {
            case 'twilio':
                return _jsx(PhoneIcon, { className: "w-6 h-6 text-blue-600" });
            case 'elevenlabs':
                return _jsx(MicrophoneIcon, { className: "w-6 h-6 text-purple-600" });
            case 'openai':
                return _jsx(CogIcon, { className: "w-6 h-6 text-green-600" });
            case 'deepgram':
                return _jsx(MicrophoneIcon, { className: "w-6 h-6 text-orange-600" });
            case 'webhook':
                return _jsx(LinkIcon, { className: "w-6 h-6 text-indigo-600" });
            case 'billing':
                return _jsx(CreditCardIcon, { className: "w-6 h-6 text-emerald-600" });
            default:
                return _jsx(CogIcon, { className: "w-6 h-6 text-gray-600" });
        }
    };
    const getIntegrationName = (type) => {
        switch (type) {
            case 'twilio': return 'Twilio';
            case 'elevenlabs': return 'ElevenLabs';
            case 'openai': return 'OpenAI';
            case 'deepgram': return 'Deepgram';
            case 'webhook': return 'Webhooks';
            case 'billing': return 'Facturación';
            default: return type;
        }
    };
    const getIntegrationDescription = (type) => {
        switch (type) {
            case 'twilio':
                return 'Gestiona llamadas telefónicas y mensajes SMS';
            case 'elevenlabs':
                return 'Síntesis de voz y clonación de voz';
            case 'openai':
                return 'Inteligencia artificial y procesamiento de lenguaje natural';
            case 'deepgram':
                return 'Reconocimiento de voz y transcripción';
            case 'webhook':
                return 'Notificaciones en tiempo real y automatización';
            case 'billing':
                return 'Gestión de pagos y facturación automática';
            default:
                return 'Integración del sistema';
        }
    };
    const handleConfigure = (type) => {
        switch (type) {
            case 'twilio':
                setShowTwilioConfig(true);
                break;
            case 'elevenlabs':
                setShowVoiceCloning(true);
                break;
            case 'webhook':
                setShowWebhookConfig(true);
                break;
            case 'billing':
                setShowAutoRefill(true);
                break;
            default:
                addNotification({
                    type: 'info',
                    title: 'Configuración no disponible',
                    message: 'Esta integración no requiere configuración adicional',
                });
        }
    };
    const formatLastSync = (date) => {
        if (!date)
            return 'Nunca';
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (minutes < 1)
            return 'Hace un momento';
        if (minutes < 60)
            return `Hace ${minutes}m`;
        if (hours < 24)
            return `Hace ${hours}h`;
        if (days < 7)
            return `Hace ${days}d`;
        return new Date(date).toLocaleDateString('es-ES');
    };
    if (isLoading) {
        return (_jsx("div", { className: "p-6", children: _jsxs("div", { className: "animate-pulse", children: [_jsx("div", { className: "h-8 bg-gray-300 rounded w-1/3 mb-6" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [1, 2, 3, 4, 5, 6].map((i) => (_jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [_jsx("div", { className: "h-6 bg-gray-300 rounded w-1/2 mb-4" }), _jsx("div", { className: "h-4 bg-gray-300 rounded w-3/4 mb-2" }), _jsx("div", { className: "h-4 bg-gray-300 rounded w-1/2" })] }, i))) })] }) }));
    }
    return (_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Integraciones" }), _jsx("p", { className: "text-gray-600", children: "Configura y gestiona las integraciones con servicios externos" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: integrations.map((integration) => (_jsxs("div", { className: `bg-white border rounded-lg p-6 transition-all hover:shadow-md ${integration.status === 'error'
                        ? 'border-red-200 bg-red-50'
                        : 'border-gray-200'}`, children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [getIntegrationIcon(integration.type), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: getIntegrationName(integration.type) }), _jsx("p", { className: "text-sm text-gray-600", children: getIntegrationDescription(integration.type) })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [getStatusIcon(integration.status), _jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`, children: getStatusText(integration.status) })] })] }), _jsxs("div", { className: "space-y-2 mb-4", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-500", children: "\u00DAltima sincronizaci\u00F3n:" }), _jsx("span", { className: "text-gray-900", children: formatLastSync(integration.lastSync) })] }), integration.errorMessage && (_jsx("div", { className: "bg-red-100 border border-red-200 rounded-lg p-3", children: _jsx("p", { className: "text-sm text-red-700", children: integration.errorMessage }) }))] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Button, { onClick: () => handleConfigure(integration.type), variant: "primary", size: "sm", className: "flex-1", children: integration.status === 'connected' ? 'Configurar' : 'Conectar' }), integration.status === 'connected' && (_jsx(Button, { onClick: () => testIntegration.mutate(integration.id), variant: "outline", size: "sm", isLoading: testIntegration.isPending, children: "Probar" }))] })] }, integration.id))) }), _jsxs("div", { className: "mt-8 bg-white border border-gray-200 rounded-lg p-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Resumen de integraciones" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: integrations.filter(i => i.status === 'connected').length }), _jsx("p", { className: "text-sm text-gray-600", children: "Conectadas" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-yellow-600", children: integrations.filter(i => i.status === 'pending').length }), _jsx("p", { className: "text-sm text-gray-600", children: "Pendientes" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-red-600", children: integrations.filter(i => i.status === 'error').length }), _jsx("p", { className: "text-sm text-gray-600", children: "Con errores" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-gray-600", children: integrations.filter(i => i.status === 'disconnected').length }), _jsx("p", { className: "text-sm text-gray-600", children: "Desconectadas" })] })] })] }), _jsx(TwilioConfigModal, { isOpen: showTwilioConfig, onClose: () => setShowTwilioConfig(false), onSave: (config) => {
                    console.log('Twilio config saved:', config);
                    setShowTwilioConfig(false);
                } }), _jsx(VoiceCloningModal, { isOpen: showVoiceCloning, onClose: () => setShowVoiceCloning(false), onSave: (config) => {
                    console.log('Voice cloning config saved:', config);
                    setShowVoiceCloning(false);
                } }), _jsx(WebhookConfigModal, { isOpen: showWebhookConfig, onClose: () => setShowWebhookConfig(false), onSave: (url) => {
                    console.log('Webhook URL saved:', url);
                    setShowWebhookConfig(false);
                } }), _jsx(AutoRefillModal, { isOpen: showAutoRefill, onClose: () => setShowAutoRefill(false), onSave: (amount) => {
                    console.log('Auto refill amount saved:', amount);
                    setShowAutoRefill(false);
                } })] }));
};
export default IntegrationsPage;
