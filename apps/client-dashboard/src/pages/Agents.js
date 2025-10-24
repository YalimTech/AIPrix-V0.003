import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ArrowPathIcon, Cog6ToothIcon, EllipsisVerticalIcon, ExclamationTriangleIcon, PlusIcon, } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { useAgents, useCreateAgent, useImportElevenLabsAgent, useSyncElevenLabsAgents, useUpdateAgent, } from "../hooks/useAgents";
import { useAppStore } from "../store/appStore";
const Agents = () => {
    // const [showAddPhoneModal, setShowAddPhoneModal] = useState(false);
    // const [showMakeCallModal, setShowMakeCallModal] = useState(false);
    const [editingAgent, setEditingAgent] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const { data: apiAgents, isLoading, error } = useAgents();
    const createAgentMutation = useCreateAgent();
    const updateAgentMutation = useUpdateAgent();
    const syncElevenLabsMutation = useSyncElevenLabsAgents();
    const importElevenLabsMutation = useImportElevenLabsAgent();
    // const deleteAgentMutation = useDeleteAgent(); // No se usa actualmente
    const addNotification = useAppStore((state) => state.addNotification);
    // Handle errors
    React.useEffect(() => {
        if (error) {
            addNotification({
                type: "error",
                title: "Error al cargar agentes",
                message: "No se pudieron cargar los agentes",
            });
        }
    }, [error, addNotification]);
    const handleCreateAgent = async (agentData) => {
        try {
            await createAgentMutation.mutateAsync(agentData);
            addNotification({
                type: "success",
                title: "Agente Creado",
                message: "El agente se ha creado exitosamente",
            });
            setShowCreateModal(false);
        }
        catch (error) {
            addNotification({
                type: "error",
                title: "Error al crear agente",
                message: "No se pudo crear el agente",
            });
        }
    };
    const handleUpdateAgent = async (agentData) => {
        try {
            await updateAgentMutation.mutateAsync(agentData);
            addNotification({
                type: "success",
                title: "Agente Actualizado",
                message: "El agente se ha actualizado exitosamente",
            });
            setEditingAgent(null);
        }
        catch (error) {
            addNotification({
                type: "error",
                title: "Error al actualizar agente",
                message: "No se pudo actualizar el agente",
            });
        }
    };
    const handleSyncElevenLabs = async () => {
        try {
            const result = (await syncElevenLabsMutation.mutateAsync());
            addNotification({
                type: "success",
                title: "Sincronización Completada",
                message: `Se sincronizaron ${result.data.created} agentes nuevos y ${result.data.updated} agentes actualizados`,
            });
        }
        catch (error) {
            addNotification({
                type: "error",
                title: "Error de Sincronización",
                message: "No se pudieron sincronizar los agentes de ElevenLabs",
            });
        }
    };
    const handleImportAgent = async (agentId) => {
        try {
            const result = (await importElevenLabsMutation.mutateAsync(agentId));
            addNotification({
                type: "success",
                title: "Agente Importado",
                message: `Agente ${result.data.action === "created" ? "importado" : "actualizado"} exitosamente`,
            });
            setShowImportModal(false);
        }
        catch (error) {
            addNotification({
                type: "error",
                title: "Error de Importación",
                message: "No se pudo importar el agente. Verifica que el ID sea correcto.",
            });
        }
    };
    // const handleDeleteAgent = async (agentId: string) => {
    //   if (window.confirm('¿Estás seguro de que quieres eliminar este agente?')) {
    //     try {
    //       await deleteAgentMutation.mutateAsync(agentId);
    //       addNotification({
    //         type: 'success',
    //         title: 'Agente Eliminado',
    //         message: 'El agente se ha eliminado exitosamente',
    //       });
    //     } catch (error) {
    //       addNotification({
    //         type: 'error',
    //         title: 'Error al eliminar agente',
    //         message: 'No se pudo eliminar el agente',
    //       });
    //     }
    //   }
    // };
    const getTypeColor = (type) => {
        return type === "inbound"
            ? "bg-blue-100 text-blue-800"
            : "bg-yellow-100 text-yellow-800";
    };
    const getTypeLabel = (type) => {
        return type === "inbound" ? "inbound" : "outbound";
    };
    // Mock data para agentes con fotos reales como en PRIX AI
    const mockAgents = [
        {
            id: "1",
            name: "Test Test",
            description: "Test Curso Ora",
            type: "inbound",
            voiceName: "Standard Female",
            isActive: true,
            createdAt: "2024-05-03",
            photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
            agentId: "agent-1",
        },
        {
            id: "2",
            name: "SOLAR - OUTBOUND",
            description: "Solar outbound agent",
            type: "outbound",
            voiceName: "Standard Male",
            isActive: true,
            createdAt: "2024-04-25",
            photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
            agentId: "agent-1",
        },
        {
            id: "3",
            name: "SOLAR - INBOUND",
            description: "Solar inbound agent",
            type: "inbound",
            voiceName: "Standard Female",
            isActive: true,
            createdAt: "2024-04-24",
            photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
            agentId: "agent-1",
        },
        {
            id: "4",
            name: "ORA - INBOUND DEMO",
            description: "ORA inbound demo agent",
            type: "inbound",
            voiceName: "Standard Female",
            isActive: true,
            createdAt: "2024-04-24",
            photo: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
            agentId: "agent-1",
        },
    ];
    if (isLoading) {
        return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex justify-between items-center", children: _jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Agents" }) }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [...Array(6)].map((_, i) => (_jsx("div", { className: "bg-white rounded-lg shadow p-6 animate-pulse", children: _jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "w-12 h-12 bg-gray-300 rounded-full" }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "h-4 bg-gray-300 rounded w-3/4 mb-2" }), _jsx("div", { className: "h-3 bg-gray-300 rounded w-1/2" })] })] }) }, i))) })] }));
    }
    if (error) {
        return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex justify-between items-center", children: _jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Agents" }) }), _jsx("div", { className: "bg-red-50 border border-red-200 rounded-md p-4", children: _jsxs("div", { className: "flex", children: [_jsx(ExclamationTriangleIcon, { className: "h-5 w-5 text-red-400" }), _jsxs("div", { className: "ml-3", children: [_jsx("h3", { className: "text-sm font-medium text-red-800", children: "Error al cargar agentes" }), _jsx("div", { className: "mt-2 text-sm text-red-700", children: "No se pudieron cargar los agentes. Por favor, intenta de nuevo." })] })] }) })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Agents" }), _jsxs("div", { className: "flex items-center mt-2 text-sm text-gray-500", children: [_jsx("svg", { className: "w-4 h-4 mr-1", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" }) }), "Home > Agents"] })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "relative", children: _jsx("input", { type: "text", placeholder: "Q Search Contact", className: "w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" }) }), _jsxs(Button, { variant: "secondary", onClick: handleSyncElevenLabs, disabled: syncElevenLabsMutation.isPending, children: [_jsx(ArrowPathIcon, { className: "h-5 w-5 mr-2" }), "Sync ElevenLabs"] }), _jsxs(Button, { variant: "primary", onClick: () => setShowImportModal(true), disabled: importElevenLabsMutation.isPending, children: [_jsx(PlusIcon, { className: "h-5 w-5 mr-2" }), "Import Agent"] }), _jsx("button", { className: "p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100", children: _jsx(Cog6ToothIcon, { className: "h-5 w-5" }) })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: (apiAgents || mockAgents).map((agent) => (_jsxs("div", { className: "bg-white rounded-lg shadow p-6 relative", children: [_jsx("div", { className: "absolute top-4 right-4", children: _jsx("button", { className: "p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100", children: _jsx(EllipsisVerticalIcon, { className: "h-5 w-5" }) }) }), _jsxs("div", { className: "flex items-center space-x-4 mb-4", children: [_jsx("img", { src: agent.photo, alt: agent.name, className: "w-16 h-16 rounded-full object-cover" }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: agent.name }), _jsx("p", { className: "text-sm text-gray-500", children: agent.description })] })] }), _jsx("div", { className: "mb-3", children: _jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(agent.type)}`, children: getTypeLabel(agent.type) }) }), _jsx("div", { className: "mb-4", children: _jsx("span", { className: "text-sm text-gray-500", children: agent.createdAt }) }), agent.type === "outbound" && agent.agentId && (_jsx("div", { className: "mb-4", children: _jsxs("div", { className: "text-sm text-gray-500", children: ["Agent ID (", agent.agentId.substring(0, 20), "...)"] }) })), _jsx("div", { className: "mt-4", children: agent.type === "inbound" ? (_jsx(Button, { variant: "secondary", size: "sm", className: "w-full", onClick: () => {
                                    /* Handle assign to phone number */
                                }, children: "Assign Agent To Phone Number" })) : (_jsx(Button, { variant: "primary", size: "sm", className: "w-full", onClick: () => {
                                    /* Handle make call */
                                }, children: "Make A Call" })) })] }, agent.id))) }), (apiAgents || mockAgents)?.length === 0 && (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "mx-auto h-12 w-12 text-gray-400", children: _jsx(Cog6ToothIcon, { className: "h-12 w-12" }) }), _jsx("h3", { className: "mt-2 text-sm font-medium text-gray-900", children: "No agents" }), _jsx("p", { className: "mt-1 text-sm text-gray-500", children: "Get started by creating a new agent." }), _jsx("div", { className: "mt-6", children: _jsxs(Button, { variant: "primary", onClick: () => setShowCreateModal(true), children: [_jsx(PlusIcon, { className: "h-5 w-5 mr-2" }), "New Agent"] }) })] })), _jsx(Modal, { isOpen: showCreateModal, onClose: () => setShowCreateModal(false), title: "Create New Agent", size: "lg", children: _jsx(AgentForm, { onSubmit: handleCreateAgent, onCancel: () => setShowCreateModal(false), isLoading: createAgentMutation.isPending }) }), _jsx(Modal, { isOpen: !!editingAgent, onClose: () => setEditingAgent(null), title: "Edit Agent", size: "lg", children: editingAgent && (_jsx(AgentForm, { agent: editingAgent, onSubmit: handleUpdateAgent, onCancel: () => setEditingAgent(null), isLoading: updateAgentMutation.isPending })) }), _jsx(Modal, { isOpen: showImportModal, onClose: () => setShowImportModal(false), title: "Import Agent", size: "md", children: _jsx(ImportAgentForm, { onSubmit: handleImportAgent, onCancel: () => setShowImportModal(false), isLoading: importElevenLabsMutation.isPending }) })] }));
};
const AgentForm = ({ agent, onSubmit, onCancel, isLoading, }) => {
    const [formData, setFormData] = useState({
        name: agent?.name || "",
        description: agent?.description || "",
        type: agent?.type || "inbound",
        voiceName: agent?.voiceName || null,
        preMadePrompt: agent?.preMadePrompt || "",
        maxTokens: agent?.maxTokens || 1000,
        temperature: agent?.temperature || 0.7,
        status: agent?.status || "inactive",
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            id: agent?.id,
        });
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Name" }), _jsx("input", { type: "text", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Description" }), _jsx("textarea", { value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }), rows: 3, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Type" }), _jsxs("select", { value: formData.type, onChange: (e) => setFormData({ ...formData, type: e.target.value }), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm", children: [_jsx("option", { value: "inbound", children: "Inbound" }), _jsx("option", { value: "outbound", children: "Outbound" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Voice" }), _jsxs("select", { value: formData.voiceName, onChange: (e) => setFormData({ ...formData, voiceName: e.target.value }), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm", children: [_jsx("option", { value: "echo", children: "Echo" }), _jsx("option", { value: "fable", children: "Fable" }), _jsx("option", { value: "onyx", children: "Onyx" }), _jsx("option", { value: "nova", children: "Nova" }), _jsx("option", { value: "shimmer", children: "Shimmer" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "System Prompt" }), _jsx("textarea", { value: formData.preMadePrompt, onChange: (e) => setFormData({ ...formData, preMadePrompt: e.target.value }), rows: 4, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm", placeholder: "Enter the system prompt for this agent..." })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Max Tokens" }), _jsx("input", { type: "number", value: formData.maxTokens, onChange: (e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) }), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm", min: "1", max: "4000" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Temperature" }), _jsx("input", { type: "number", step: "0.1", value: formData.temperature, onChange: (e) => setFormData({
                                    ...formData,
                                    temperature: parseFloat(e.target.value),
                                }), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm", min: "0", max: "2" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Status" }), _jsxs("select", { value: formData.status, onChange: (e) => setFormData({ ...formData, status: e.target.value }), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm", children: [_jsx("option", { value: "inactive", children: "Inactive" }), _jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "testing", children: "Testing" })] })] }), _jsxs("div", { className: "flex justify-end space-x-3 pt-4", children: [_jsx(Button, { type: "button", variant: "secondary", onClick: onCancel, children: "Cancel" }), _jsx(Button, { type: "submit", variant: "primary", disabled: isLoading, children: isLoading ? "Saving..." : agent ? "Update" : "Create" })] })] }));
};
const ImportAgentForm = ({ onSubmit, onCancel, isLoading, }) => {
    const [agentId, setAgentId] = useState("");
    const handleSubmit = (e) => {
        e.preventDefault();
        if (agentId.trim()) {
            onSubmit(agentId.trim());
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Paste the ID of the agent to import." }), _jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Enter Agent's ID" }), _jsx("input", { type: "text", value: agentId, onChange: (e) => setAgentId(e.target.value), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm", placeholder: "Enter ElevenLabs Agent ID", required: true })] }), _jsxs("div", { className: "flex justify-end space-x-3 pt-4", children: [_jsx(Button, { type: "button", variant: "secondary", onClick: onCancel, children: "Cancel" }), _jsx(Button, { type: "submit", variant: "primary", disabled: isLoading || !agentId.trim(), children: isLoading ? "Importing..." : "Import" })] })] }));
};
export default Agents;
