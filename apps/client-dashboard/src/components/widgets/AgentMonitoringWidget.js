import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { UserIcon, PhoneIcon, ClockIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Button from '../ui/Button';
import { apiClient } from '../../lib/api';
import { useRealTimeData } from '../../hooks/useRealTimeData';
const AgentMonitoringWidget = ({ className = '' }) => {
    const [selectedAgent, setSelectedAgent] = useState(null);
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
        queryFn: () => apiClient.get('/agents'),
        refetchInterval: 10000, // Refetch every 10 seconds
    });
    useEffect(() => {
        // Subscribe to agent status updates
        const handleAgentUpdate = (data) => {
            console.log('🤖 Agent update received:', data);
            queryClient.invalidateQueries({ queryKey: ['agents', 'monitoring'] });
        };
        // Subscribe to call updates
        const handleCallUpdate = (data) => {
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
    const getStatusColor = (status) => {
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
    const getStatusText = (status) => {
        switch (status) {
            case 'active': return 'Activo';
            case 'busy': return 'Ocupado';
            case 'away': return 'Ausente';
            case 'inactive': return 'Inactivo';
            default: return status;
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'active':
                return _jsx(CheckCircleIcon, { className: "w-4 h-4 text-green-600" });
            case 'busy':
                return _jsx(PhoneIcon, { className: "w-4 h-4 text-blue-600" });
            case 'away':
                return _jsx(ExclamationTriangleIcon, { className: "w-4 h-4 text-yellow-600" });
            case 'inactive':
                return _jsx(XCircleIcon, { className: "w-4 h-4 text-gray-600" });
            default:
                return _jsx(UserIcon, { className: "w-4 h-4 text-gray-600" });
        }
    };
    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    const formatPhoneNumber = (number) => {
        const cleaned = number.replace(/\D/g, '');
        if (cleaned.length === 11 && cleaned.startsWith('1')) {
            const match = cleaned.match(/^1(\d{3})(\d{3})(\d{4})$/);
            if (match) {
                return `+1 (${match[1]}) ${match[2]}-${match[3]}`;
            }
        }
        return number;
    };
    const formatTime = (date) => {
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    const getTypeColor = (type) => {
        switch (type) {
            case 'inbound': return 'bg-green-100 text-green-800';
            case 'outbound': return 'bg-blue-100 text-blue-800';
            case 'general': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const getTypeText = (type) => {
        switch (type) {
            case 'inbound': return 'Entrante';
            case 'outbound': return 'Saliente';
            case 'general': return 'General';
            default: return type;
        }
    };
    if (isLoading) {
        return (_jsx("div", { className: `bg-white border border-gray-200 rounded-lg p-4 ${className}`, children: _jsxs("div", { className: "animate-pulse", children: [_jsx("div", { className: "h-4 bg-gray-300 rounded w-1/3 mb-4" }), _jsx("div", { className: "space-y-3", children: [1, 2, 3].map((i) => (_jsx("div", { className: "h-16 bg-gray-300 rounded" }, i))) })] }) }));
    }
    return (_jsxs("div", { className: `bg-white border border-gray-200 rounded-lg ${className}`, children: [_jsx("div", { className: "px-4 py-3 border-b border-gray-200", children: _jsxs("h3", { className: "text-sm font-medium text-gray-900 flex items-center", children: [_jsx(UserIcon, { className: "w-4 h-4 mr-2" }), "Monitoreo de Agentes (", agents.length, ")"] }) }), _jsx("div", { className: "p-4 space-y-4", children: agents.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(UserIcon, { className: "w-8 h-8 text-gray-400 mx-auto mb-2" }), _jsx("p", { className: "text-sm text-gray-500", children: "No hay agentes configurados" })] })) : (agents.map((agent) => (_jsxs("div", { className: `border rounded-lg p-4 cursor-pointer transition-all ${selectedAgent === agent.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'}`, onClick: () => setSelectedAgent(selectedAgent === agent.id ? null : agent.id), children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "flex-shrink-0", children: getStatusIcon(agent.status) }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: agent.name }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`, children: getStatusText(agent.status) }), _jsx("span", { className: `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(agent.type)}`, children: getTypeText(agent.type) })] })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-xs text-gray-500", children: agent.voiceSettings.voiceName }), _jsxs("p", { className: "text-xs text-gray-400", children: ["Velocidad: ", agent.voiceSettings.speed, "x"] })] })] }), agent.currentCall && (_jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(PhoneIcon, { className: "w-4 h-4 text-blue-600" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-blue-900", children: formatPhoneNumber(agent.currentCall.phoneNumber) }), _jsxs("p", { className: "text-xs text-blue-700", children: ["Iniciada: ", formatTime(agent.currentCall.startTime)] })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-sm font-semibold text-blue-900", children: formatDuration(agent.currentCall.duration) }), _jsx("p", { className: "text-xs text-blue-700", children: "En curso" })] })] }) })), selectedAgent === agent.id && (_jsxs("div", { className: "border-t border-gray-200 pt-3 space-y-3", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-lg font-semibold text-gray-900", children: agent.stats.callsToday }), _jsx("p", { className: "text-xs text-gray-500", children: "Llamadas hoy" })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-lg font-semibold text-gray-900", children: agent.stats.callsThisWeek }), _jsx("p", { className: "text-xs text-gray-500", children: "Esta semana" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-lg font-semibold text-gray-900", children: formatDuration(agent.stats.averageCallDuration) }), _jsx("p", { className: "text-xs text-gray-500", children: "Duraci\u00F3n promedio" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("p", { className: "text-lg font-semibold text-gray-900", children: [agent.stats.successRate.toFixed(1), "%"] }), _jsx("p", { className: "text-xs text-gray-500", children: "Tasa de \u00E9xito" })] })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-xs text-gray-500 mb-1", children: [_jsx("span", { children: "Tasa de \u00E9xito" }), _jsxs("span", { children: [agent.stats.successRate.toFixed(1), "%"] })] }), _jsx("div", { className: "w-full h-2 bg-gray-200 rounded-full overflow-hidden", children: _jsx("div", { className: `h-full transition-all duration-300 ${agent.stats.successRate >= 80 ? 'bg-green-500' :
                                                    agent.stats.successRate >= 60 ? 'bg-yellow-500' :
                                                        'bg-red-500'}`, style: { width: `${agent.stats.successRate}%` } }) })] }), _jsx("div", { className: "bg-gray-50 border border-gray-200 rounded-lg p-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(ClockIcon, { className: "w-4 h-4 text-gray-400 mr-2" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-medium text-gray-900", children: "\u00DAltima actividad" }), _jsx("p", { className: "text-xs text-gray-500", children: formatTime(agent.stats.lastActivity) })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Button, { size: "sm", variant: "outline", className: "p-1", children: _jsx(PlayIcon, { className: "w-3 h-3" }) }), _jsx(Button, { size: "sm", variant: "outline", className: "p-1", children: _jsx(PauseIcon, { className: "w-3 h-3" }) })] })] }) }), _jsxs("div", { className: "bg-purple-50 border border-purple-200 rounded-lg p-3", children: [_jsx("h5", { className: "text-xs font-medium text-purple-900 mb-2", children: "Configuraci\u00F3n de voz" }), _jsxs("div", { className: "grid grid-cols-3 gap-2 text-xs", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "font-medium text-purple-900", children: agent.voiceSettings.voiceName }), _jsx("p", { className: "text-purple-700", children: "Voz" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("p", { className: "font-medium text-purple-900", children: [agent.voiceSettings.speed, "x"] }), _jsx("p", { className: "text-purple-700", children: "Velocidad" })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "font-medium text-purple-900", children: agent.voiceSettings.pitch }), _jsx("p", { className: "text-purple-700", children: "Tono" })] })] })] })] }))] }, agent.id)))) })] }));
};
export default AgentMonitoringWidget;
