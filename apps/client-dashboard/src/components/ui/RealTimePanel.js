import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { BoltIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useRealTimeSimulator } from '../../hooks/useRealTimeSimulator';
const RealTimePanel = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [events, setEvents] = useState([]);
    const { isConnected, connectionError } = useWebSocket();
    const { simulateEvent } = useRealTimeSimulator();
    useEffect(() => {
        // Limpiar eventos antiguos (mantener solo los últimos 50)
        if (events.length > 50) {
            setEvents(events.slice(-50));
        }
    }, [events]);
    const addEvent = (type, data) => {
        const newEvent = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            data,
            timestamp: new Date().toISOString(),
        };
        setEvents(prev => [newEvent, ...prev]);
    };
    const handleSimulateEvent = (eventType) => {
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
    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString();
    };
    const getEventColor = (type) => {
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
        return (_jsx("button", { onClick: () => setIsOpen(true), className: "fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40", children: _jsx(BoltIcon, { className: "h-6 w-6" }) }));
    }
    return (_jsxs("div", { className: "fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50", children: [_jsxs("div", { className: "p-4 border-b border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(BoltIcon, { className: "h-5 w-5 text-blue-600" }), _jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Eventos en Tiempo Real" })] }), _jsx("button", { onClick: () => setIsOpen(false), className: "text-gray-400 hover:text-gray-600", children: _jsx(XMarkIcon, { className: "h-5 w-5" }) })] }), _jsxs("div", { className: "mt-2 flex items-center space-x-4", children: [_jsxs("div", { className: `flex items-center space-x-1 text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`, children: [_jsx("div", { className: `w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}` }), _jsx("span", { children: isConnected ? 'Conectado' : 'Desconectado' })] }), connectionError && (_jsx("span", { className: "text-xs text-red-600", children: connectionError }))] })] }), _jsxs("div", { className: "p-4 border-b border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h4", { className: "text-sm font-medium text-gray-700", children: "Simulador de Eventos" }), _jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { onClick: () => handleSimulateEvent('campaign_update'), className: "px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200", children: "Campa\u00F1a" }), _jsx("button", { onClick: () => handleSimulateEvent('call_update'), className: "px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200", children: "Llamada" }), _jsx("button", { onClick: () => handleSimulateEvent('agent_update'), className: "px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200", children: "Agente" }), _jsx("button", { onClick: () => handleSimulateEvent('system_notification'), className: "px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200", children: "Sistema" })] })] }), _jsx("div", { className: "flex space-x-2", children: _jsx("button", { onClick: clearEvents, className: "px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200", children: "Limpiar" }) })] }), _jsx("div", { className: "max-h-64 overflow-y-auto", children: events.length === 0 ? (_jsx("div", { className: "p-4 text-center text-gray-500 text-sm", children: "No hay eventos recientes" })) : (_jsx("div", { className: "space-y-2 p-4", children: events.map((event) => (_jsxs("div", { className: `p-3 rounded-lg border ${getEventColor(event.type)}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("span", { className: "text-xs font-medium uppercase", children: event.type.replace('_', ' ') }), _jsx("span", { className: "text-xs opacity-75", children: formatTimestamp(event.timestamp) })] }), _jsx("p", { className: "text-sm", children: event.data.message || JSON.stringify(event.data) })] }, event.id))) })) })] }));
};
export default RealTimePanel;
