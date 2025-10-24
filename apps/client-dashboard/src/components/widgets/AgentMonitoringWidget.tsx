import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  PhoneIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Button from '../ui/Button';
import { apiClient } from '../../lib/api';
import { useRealTimeData } from '../../hooks/useRealTimeData';

interface AgentMonitoringWidgetProps {
  className?: string;
}

interface Agent {
  id: string;
  name: string;
  type: 'inbound' | 'outbound' | 'general';
  status: 'active' | 'inactive' | 'busy' | 'away';
  currentCall?: {
    id: string;
    phoneNumber: string;
    startTime: Date;
    duration: number;
  };
  stats: {
    callsToday: number;
    callsThisWeek: number;
    averageCallDuration: number;
    successRate: number;
    lastActivity: Date;
  };
  voiceSettings: {
    voiceName: string;
    speed: number;
    pitch: number;
  };
}

const AgentMonitoringWidget: React.FC<AgentMonitoringWidgetProps> = ({ className = '' }) => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const { subscribe, unsubscribe } = useRealTimeData({
    queryKey: ['agents', 'monitoring'],
    endpoint: '/agents/monitoring',
    interval: 5000,
    enabled: true,
  });
  const queryClient = useQueryClient();

  // Fetch agents data
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['agents', 'monitoring'],
    queryFn: () => apiClient.get<Agent[]>('/agents'),
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  useEffect(() => {
    // Subscribe to agent status updates
    const handleAgentUpdate = (data: any) => {
      console.log('🤖 Agent update received:', data);
      queryClient.invalidateQueries({ queryKey: ['agents', 'monitoring'] });
    };

    // Subscribe to call updates
    const handleCallUpdate = (data: any) => {
      console.log('📞 Call update for agent:', data);
      queryClient.invalidateQueries({ queryKey: ['agents', 'monitoring'] });
    };

    subscribe('agent_update', handleAgentUpdate);
    subscribe('call_update', handleCallUpdate);

    return () => {
      unsubscribe('agent_update');
      unsubscribe('call_update');
    };
  }, [subscribe, unsubscribe, queryClient]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-blue-100 text-blue-800';
      case 'away':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'busy': return 'Ocupado';
      case 'away': return 'Ausente';
      case 'inactive': return 'Inactivo';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case 'busy':
        return <PhoneIcon className="w-4 h-4 text-blue-600" />;
      case 'away':
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />;
      case 'inactive':
        return <XCircleIcon className="w-4 h-4 text-gray-600" />;
      default:
        return <UserIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPhoneNumber = (number: string) => {
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const match = cleaned.match(/^1(\d{3})(\d{3})(\d{4})$/);
      if (match) {
        return `+1 (${match[1]}) ${match[2]}-${match[3]}`;
      }
    }
    return number;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'inbound': return 'bg-green-100 text-green-800';
      case 'outbound': return 'bg-blue-100 text-blue-800';
      case 'general': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'inbound': return 'Entrante';
      case 'outbound': return 'Saliente';
      case 'general': return 'General';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 flex items-center">
          <UserIcon className="w-4 h-4 mr-2" />
          Monitoreo de Agentes ({agents.length})
        </h3>
      </div>

      <div className="p-4 space-y-4">
        {agents.length === 0 ? (
          <div className="text-center py-8">
            <UserIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No hay agentes configurados</p>
          </div>
        ) : (
          agents.map((agent) => (
            <div
              key={agent.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedAgent === agent.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
            >
              {/* Agent Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getStatusIcon(agent.status)}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{agent.name}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                        {getStatusText(agent.status)}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(agent.type)}`}>
                        {getTypeText(agent.type)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {agent.voiceSettings.voiceName}
                  </p>
                  <p className="text-xs text-gray-400">
                    Velocidad: {agent.voiceSettings.speed}x
                  </p>
                </div>
              </div>

              {/* Current Call */}
              {agent.currentCall && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <PhoneIcon className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          {formatPhoneNumber(agent.currentCall.phoneNumber)}
                        </p>
                        <p className="text-xs text-blue-700">
                          Iniciada: {formatTime(agent.currentCall.startTime)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-blue-900">
                        {formatDuration(agent.currentCall.duration)}
                      </p>
                      <p className="text-xs text-blue-700">En curso</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Expanded Details */}
              {selectedAgent === agent.id && (
                <div className="border-t border-gray-200 pt-3 space-y-3">
                  {/* Statistics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">
                        {agent.stats.callsToday}
                      </p>
                      <p className="text-xs text-gray-500">Llamadas hoy</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">
                        {agent.stats.callsThisWeek}
                      </p>
                      <p className="text-xs text-gray-500">Esta semana</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">
                        {formatDuration(agent.stats.averageCallDuration)}
                      </p>
                      <p className="text-xs text-gray-500">Duración promedio</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">
                        {agent.stats.successRate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500">Tasa de éxito</p>
                    </div>
                  </div>

                  {/* Success Rate Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Tasa de éxito</span>
                      <span>{agent.stats.successRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          agent.stats.successRate >= 80 ? 'bg-green-500' :
                          agent.stats.successRate >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${agent.stats.successRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Last Activity */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-xs font-medium text-gray-900">Última actividad</p>
                          <p className="text-xs text-gray-500">
                            {formatTime(agent.stats.lastActivity)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="p-1"
                        >
                          <PlayIcon className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="p-1"
                        >
                          <PauseIcon className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Voice Settings */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <h5 className="text-xs font-medium text-purple-900 mb-2">Configuración de voz</h5>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <p className="font-medium text-purple-900">{agent.voiceSettings.voiceName}</p>
                        <p className="text-purple-700">Voz</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-purple-900">{agent.voiceSettings.speed}x</p>
                        <p className="text-purple-700">Velocidad</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-purple-900">{agent.voiceSettings.pitch}</p>
                        <p className="text-purple-700">Tono</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AgentMonitoringWidget;
