import React, { useState, useEffect } from 'react';
import { 
  BoltIcon, 
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useRealTimeSimulator } from '../../hooks/useRealTimeSimulator';

interface Event {
  id: string;
  type: string;
  data: any;
  timestamp: string;
}

const RealTimePanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const { isConnected, connectionError } = useWebSocket();
  const { simulateEvent } = useRealTimeSimulator();

  useEffect(() => {
    // Limpiar eventos antiguos (mantener solo los últimos 50)
    if (events.length > 50) {
      setEvents(events.slice(-50));
    }
  }, [events]);

  const addEvent = (type: string, data: any) => {
    const newEvent: Event = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      data,
      timestamp: new Date().toISOString(),
    };
    setEvents(prev => [newEvent, ...prev]);
  };

  const handleSimulateEvent = (eventType: string) => {
    const eventData = {
      id: Math.random().toString(36).substr(2, 9),
      message: `Evento simulado: ${eventType}`,
    };
    
    simulateEvent(eventType, eventData);
    addEvent(eventType, eventData);
  };

  const clearEvents = () => {
    setEvents([]);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'campaign_update':
        return 'text-blue-600 bg-blue-50';
      case 'call_update':
        return 'text-green-600 bg-green-50';
      case 'agent_update':
        return 'text-purple-600 bg-purple-50';
      case 'system_notification':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
      >
        <BoltIcon className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BoltIcon className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Eventos en Tiempo Real</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mt-2 flex items-center space-x-4">
          <div className={`flex items-center space-x-1 text-sm ${
            isConnected ? 'text-green-600' : 'text-red-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
          </div>
          
          {connectionError && (
            <span className="text-xs text-red-600">{connectionError}</span>
          )}
        </div>
      </div>

      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">Simulador de Eventos</h4>
          <div className="flex space-x-2">
            <button
              onClick={() => handleSimulateEvent('campaign_update')}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Campaña
            </button>
            <button
              onClick={() => handleSimulateEvent('call_update')}
              className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Llamada
            </button>
            <button
              onClick={() => handleSimulateEvent('agent_update')}
              className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
            >
              Agente
            </button>
            <button
              onClick={() => handleSimulateEvent('system_notification')}
              className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
            >
              Sistema
            </button>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={clearEvents}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {events.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No hay eventos recientes
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {events.map((event) => (
              <div
                key={event.id}
                className={`p-3 rounded-lg border ${getEventColor(event.type)}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium uppercase">
                    {event.type.replace('_', ' ')}
                  </span>
                  <span className="text-xs opacity-75">
                    {formatTimestamp(event.timestamp)}
                  </span>
                </div>
                <p className="text-sm">
                  {event.data.message || JSON.stringify(event.data)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimePanel;
