import React, { useState } from 'react';
import { 
  CogIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  LinkIcon,
  PhoneIcon,
  MicrophoneIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { useAppStore } from '../store/appStore';
import Button from '../components/ui/Button';
import { 
  TwilioConfigModal, 
  VoiceCloningModal, 
  WebhookConfigModal,
  AutoRefillModal 
} from '../components/modals';

interface Integration {
  id: string;
  name: string;
  type: 'twilio' | 'elevenlabs' | 'openai' | 'deepgram' | 'webhook' | 'billing';
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  lastSync?: Date;
  errorMessage?: string;
  config?: any;
}

const IntegrationsPage: React.FC = () => {
  const [_selectedIntegration, _setSelectedIntegration] = useState<string | null>(null);
  const [showTwilioConfig, setShowTwilioConfig] = useState(false);
  const [showVoiceCloning, setShowVoiceCloning] = useState(false);
  const [showWebhookConfig, setShowWebhookConfig] = useState(false);
  const [showAutoRefill, setShowAutoRefill] = useState(false);
  
  const queryClient = useQueryClient();
  const addNotification = useAppStore((state) => state.addNotification);

  // Fetch integrations status
  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => apiClient.get<Integration[]>('/integrations'),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const testIntegration = useMutation({
    mutationFn: (integrationId: string) => 
      apiClient.post(`/integrations/${integrationId}/test`),
    onSuccess: (_data, _integrationId) => {
      addNotification({
        type: 'success',
        title: 'Integración probada',
        message: `La integración ${_integrationId} está funcionando correctamente`,
      });
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Error en integración',
        message: error.message || 'No se pudo probar la integración',
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'disconnected':
        return <ExclamationTriangleIcon className="w-5 h-5 text-gray-400" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Conectado';
      case 'disconnected': return 'Desconectado';
      case 'error': return 'Error';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'twilio':
        return <PhoneIcon className="w-6 h-6 text-blue-600" />;
      case 'elevenlabs':
        return <MicrophoneIcon className="w-6 h-6 text-purple-600" />;
      case 'openai':
        return <CogIcon className="w-6 h-6 text-green-600" />;
      case 'deepgram':
        return <MicrophoneIcon className="w-6 h-6 text-orange-600" />;
      case 'webhook':
        return <LinkIcon className="w-6 h-6 text-indigo-600" />;
      case 'billing':
        return <CreditCardIcon className="w-6 h-6 text-emerald-600" />;
      default:
        return <CogIcon className="w-6 h-6 text-gray-600" />;
    }
  };

  const getIntegrationName = (type: string) => {
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

  const getIntegrationDescription = (type: string) => {
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

  const handleConfigure = (type: string) => {
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

  const formatLastSync = (date?: Date) => {
    if (!date) return 'Nunca';
    
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Hace un momento';
    if (minutes < 60) return `Hace ${minutes}m`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    return new Date(date).toLocaleDateString('es-ES');
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Integraciones</h1>
        <p className="text-gray-600">
          Configura y gestiona las integraciones con servicios externos
        </p>
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className={`bg-white border rounded-lg p-6 transition-all hover:shadow-md ${
              integration.status === 'error' 
                ? 'border-red-200 bg-red-50' 
                : 'border-gray-200'
            }`}
          >
            {/* Integration Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getIntegrationIcon(integration.type)}
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {getIntegrationName(integration.type)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {getIntegrationDescription(integration.type)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {getStatusIcon(integration.status)}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                  {getStatusText(integration.status)}
                </span>
              </div>
            </div>

            {/* Status Details */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Última sincronización:</span>
                <span className="text-gray-900">{formatLastSync(integration.lastSync)}</span>
              </div>
              
              {integration.errorMessage && (
                <div className="bg-red-100 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{integration.errorMessage}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <Button
                onClick={() => handleConfigure(integration.type)}
                variant="primary"
                size="sm"
                className="flex-1"
              >
                {integration.status === 'connected' ? 'Configurar' : 'Conectar'}
              </Button>
              
              {integration.status === 'connected' && (
                <Button
                  onClick={() => testIntegration.mutate(integration.id)}
                  variant="outline"
                  size="sm"
                  isLoading={testIntegration.isPending}
                >
                  Probar
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Integration Status Summary */}
      <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen de integraciones</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {integrations.filter(i => i.status === 'connected').length}
            </div>
            <p className="text-sm text-gray-600">Conectadas</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {integrations.filter(i => i.status === 'pending').length}
            </div>
            <p className="text-sm text-gray-600">Pendientes</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {integrations.filter(i => i.status === 'error').length}
            </div>
            <p className="text-sm text-gray-600">Con errores</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {integrations.filter(i => i.status === 'disconnected').length}
            </div>
            <p className="text-sm text-gray-600">Desconectadas</p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TwilioConfigModal
        isOpen={showTwilioConfig}
        onClose={() => setShowTwilioConfig(false)}
        onSave={(config) => {
          console.log('Twilio config saved:', config);
          setShowTwilioConfig(false);
        }}
      />
      
      <VoiceCloningModal
        isOpen={showVoiceCloning}
        onClose={() => setShowVoiceCloning(false)}
        onSave={(config) => {
          console.log('Voice cloning config saved:', config);
          setShowVoiceCloning(false);
        }}
      />
      
      <WebhookConfigModal
        isOpen={showWebhookConfig}
        onClose={() => setShowWebhookConfig(false)}
        onSave={(url) => {
          console.log('Webhook URL saved:', url);
          setShowWebhookConfig(false);
        }}
      />
      
      <AutoRefillModal
        isOpen={showAutoRefill}
        onClose={() => setShowAutoRefill(false)}
        onSave={(amount) => {
          console.log('Auto refill amount saved:', amount);
          setShowAutoRefill(false);
        }}
      />
    </div>
  );
};

export default IntegrationsPage;
