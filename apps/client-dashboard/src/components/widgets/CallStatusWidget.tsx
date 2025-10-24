import React, { useState, useEffect } from 'react';
import { 
  PhoneIcon, 
  PhoneArrowUpRightIcon,
  PhoneArrowDownLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAppStore } from '../../store/appStore';

interface CallStatusWidgetProps {
  className?: string;
}

interface CallStatus {
  id: string;
  direction: 'inbound' | 'outbound';
  status: 'initiated' | 'ringing' | 'answered' | 'completed' | 'failed' | 'busy' | 'no-answer';
  phoneNumber: string;
  agentName?: string;
  startTime?: Date;
  duration?: number;
  error?: string;
}

const CallStatusWidget: React.FC<CallStatusWidgetProps> = ({ className = '' }) => {
  const [activeCalls, setActiveCalls] = useState<CallStatus[]>([]);
  const [recentCalls, setRecentCalls] = useState<CallStatus[]>([]);
  const { subscribe, unsubscribe } = useWebSocket();
  const addNotification = useAppStore((state) => state.addNotification);

  useEffect(() => {
    // Subscribe to call events
    const handleCallUpdate = (data: any) => {
      console.log('📞 Call update received:', data);
      
      if (data.status === 'initiated' || data.status === 'ringing' || data.status === 'answered') {
        // Add to active calls
        setActiveCalls(prev => {
          const existing = prev.find(call => call.id === data.callId);
          if (existing) {
            return prev.map(call => 
              call.id === data.callId 
                ? { ...call, ...data, startTime: new Date() }
                : call
            );
          } else {
            return [...prev, {
              id: data.callId,
              direction: data.direction || 'outbound',
              status: data.status,
              phoneNumber: data.phoneNumber,
              agentName: data.agentName,
              startTime: new Date(),
            }];
          }
        });
      } else {
        // Move to recent calls and remove from active
        setActiveCalls(prev => {
          const call = prev.find(call => call.id === data.callId);
          if (call) {
            const completedCall = {
              ...call,
              ...data,
              duration: data.duration,
              error: data.error,
            };
            
            setRecentCalls(prev => [completedCall, ...prev.slice(0, 9)]); // Keep last 10
            
            return prev.filter(call => call.id !== data.callId);
          }
          return prev;
        });

        // Show notification for completed calls
        if (data.status === 'completed') {
          addNotification({
            type: 'success',
            title: 'Llamada completada',
            message: `Llamada a ${data.phoneNumber} completada (${formatDuration(data.duration || 0)})`,
          });
        } else if (data.status === 'failed') {
          addNotification({
            type: 'error',
            title: 'Llamada fallida',
            message: `Llamada a ${data.phoneNumber} falló: ${data.error || 'Error desconocido'}`,
          });
        }
      }
    };

    subscribe('call_update', handleCallUpdate);

    return () => {
      unsubscribe('call_update', handleCallUpdate);
    };
  }, [subscribe, unsubscribe, addNotification]);

  const getStatusIcon = (status: string, direction: string) => {
    switch (status) {
      case 'initiated':
      case 'ringing':
        return direction === 'inbound' ? 
          <PhoneArrowDownLeftIcon className="w-4 h-4 text-blue-600" /> :
          <PhoneArrowUpRightIcon className="w-4 h-4 text-blue-600" />;
      case 'answered':
        return <PhoneIcon className="w-4 h-4 text-green-600" />;
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircleIcon className="w-4 h-4 text-red-600" />;
      case 'busy':
      case 'no-answer':
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />;
      default:
        return <PhoneIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'initiated':
      case 'ringing':
        return 'bg-blue-100 text-blue-800';
      case 'answered':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'busy':
      case 'no-answer':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'initiated': return 'Iniciada';
      case 'ringing': return 'Sonando';
      case 'answered': return 'Contestada';
      case 'completed': return 'Completada';
      case 'failed': return 'Fallida';
      case 'busy': return 'Ocupado';
      case 'no-answer': return 'Sin respuesta';
      default: return status;
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

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 flex items-center">
          <PhoneIcon className="w-4 h-4 mr-2" />
          Estado de Llamadas
        </h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Active Calls */}
        {activeCalls.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
              Llamadas Activas ({activeCalls.length})
            </h4>
            <div className="space-y-2">
              {activeCalls.map((call) => (
                <div key={call.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(call.status, call.direction)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatPhoneNumber(call.phoneNumber)}
                      </p>
                      <p className="text-xs text-gray-600">
                        {call.agentName && `${call.agentName} • `}
                        {call.direction === 'inbound' ? 'Entrante' : 'Saliente'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(call.status)}`}>
                      {getStatusText(call.status)}
                    </span>
                    {call.startTime && (
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(call.startTime)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Calls */}
        {recentCalls.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
              Llamadas Recientes
            </h4>
            <div className="space-y-2">
              {recentCalls.slice(0, 5).map((call) => (
                <div key={call.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(call.status, call.direction)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatPhoneNumber(call.phoneNumber)}
                      </p>
                      <p className="text-xs text-gray-600">
                        {call.agentName && `${call.agentName} • `}
                        {call.direction === 'inbound' ? 'Entrante' : 'Saliente'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(call.status)}`}>
                      {getStatusText(call.status)}
                    </span>
                    <div className="flex items-center space-x-2 mt-1">
                      {call.duration !== undefined && (
                        <div className="flex items-center text-xs text-gray-500">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          {formatDuration(call.duration)}
                        </div>
                      )}
                      {call.startTime && (
                        <p className="text-xs text-gray-500">
                          {formatTime(call.startTime)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Calls State */}
        {activeCalls.length === 0 && recentCalls.length === 0 && (
          <div className="text-center py-8">
            <PhoneIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No hay llamadas activas</p>
            <p className="text-xs text-gray-400">Las llamadas aparecerán aquí en tiempo real</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallStatusWidget;
