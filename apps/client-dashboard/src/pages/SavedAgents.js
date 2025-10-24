import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { ArrowPathIcon, BoltIcon, ChevronDownIcon, ClipboardDocumentIcon, CurrencyDollarIcon, DocumentDuplicateIcon, EllipsisVerticalIcon, FolderIcon, LinkIcon, MagnifyingGlassIcon, PaperAirplaneIcon, PencilIcon, PhoneIcon, PhotoIcon, PlayIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AgentWidgetModal from "../components/modals/AgentWidgetModal";
import LaunchCallModal from "../components/modals/LaunchCallModal";
import { useAgentDiagnostics, useAgents, useDeleteAgent, useDuplicateAgent, useImportElevenLabsAgent, useSyncElevenLabsAgents, } from "../hooks/useAgents";
import { useCalculateLLMUsage, useElevenLabsOutboundCall, useGetAgentLink, useSimulateConversation, } from "../hooks/useElevenLabs";
import { useCreateFolder, useDeleteFolder, useFolders, useMoveAgentsToFolder, } from "../hooks/useFolders";
import { useAppStore } from "../store/appStore";
const SavedAgents = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [agentType, setAgentType] = useState("Agent Type");
    const [showAllFolders, setShowAllFolders] = useState(true);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showAgentTypeDropdown, setShowAgentTypeDropdown] = useState(false);
    const [showContextMenu, setShowContextMenu] = useState(null);
    const [importAgentId, setImportAgentId] = useState("");
    const [folderName, setFolderName] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showLaunchCallModal, setShowLaunchCallModal] = useState(false);
    const [selectedAgentId, setSelectedAgentId] = useState(null);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [agentIdForAvatar, setAgentIdForAvatar] = useState(null);
    const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);
    // Obtener agentes reales del backend
    const { data: agents = [], isLoading, error } = useAgents();
    const { data: folders = [], isLoading: foldersLoading } = useFolders();
    const deleteAgentMutation = useDeleteAgent();
    const duplicateAgentMutation = useDuplicateAgent();
    const syncElevenLabsMutation = useSyncElevenLabsAgents();
    const importElevenLabsMutation = useImportElevenLabsAgent();
    const { data: diagnostics, refetch: refetchDiagnostics } = useAgentDiagnostics();
    const addNotification = useAppStore((state) => state.addNotification);
    const makeOutboundCall = useElevenLabsOutboundCall();
    const getAgentLinkMutation = useGetAgentLink();
    const simulateConversationMutation = useSimulateConversation();
    const calculateLLMUsageMutation = useCalculateLLMUsage();
    // Hooks de carpetas
    const createFolderMutation = useCreateFolder();
    const deleteFolderMutation = useDeleteFolder();
    const moveAgentsMutation = useMoveAgentsToFolder();
    // Manejar errores
    React.useEffect(() => {
        if (error) {
            addNotification({
                type: "error",
                title: "Error al cargar agentes",
                message: "No se pudieron cargar los agentes guardados",
            });
        }
    }, [error, addNotification]);
    const agentTypeOptions = [
        "Any",
        "Inbound",
        "Outbound",
        "Text",
        "Email",
        "Chatbot",
    ];
    const contextMenuItems = [
        { label: "Edit", icon: PencilIcon },
        { label: "Delete", icon: TrashIcon },
        { label: "Duplicate", icon: DocumentDuplicateIcon },
        { label: "Quick Edit", icon: BoltIcon },
        { label: "Move to Folder", icon: FolderIcon },
        { label: "Edit Phone Number", icon: PhoneIcon },
        { label: "Training Mode", icon: BoltIcon },
        { label: "Copy Webhook", icon: ClipboardDocumentIcon },
        { label: "Upload Avatar", icon: PhotoIcon },
        { label: "Create Text Agent From Template", icon: PencilIcon },
        { label: "Create Email Agent From Template", icon: PaperAirplaneIcon },
    ];
    const getTypeColor = (type) => {
        switch (type) {
            case "inbound":
                return "bg-blue-100 text-blue-800";
            case "outbound":
                return "bg-yellow-100 text-yellow-800";
            case "text":
                return "bg-green-100 text-green-800";
            case "email":
                return "bg-purple-100 text-purple-800";
            case "chatbot":
                return "bg-pink-100 text-pink-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    const handleImportAgent = async () => {
        if (importAgentId.trim()) {
            try {
                await importElevenLabsMutation.mutateAsync(importAgentId.trim());
                addNotification({
                    type: "success",
                    title: "Agente Importado",
                    message: "El agente se ha importado exitosamente desde ElevenLabs",
                });
                setShowImportModal(false);
                setImportAgentId("");
            }
            catch (error) {
                addNotification({
                    type: "error",
                    title: "Error al Importar",
                    message: error.message || "No se pudo importar el agente",
                });
            }
        }
    };
    const handleCreateFolder = async () => {
        if (folderName.trim()) {
            try {
                await createFolderMutation.mutateAsync({
                    name: folderName.trim(),
                    description: "",
                    color: "#3B82F6",
                });
                addNotification({
                    type: "success",
                    title: "Carpeta Creada",
                    message: `La carpeta "${folderName}" se ha creado exitosamente`,
                });
                setShowCreateFolderModal(false);
                setFolderName("");
            }
            catch (error) {
                addNotification({
                    type: "error",
                    title: "Error al Crear Carpeta",
                    message: error.message || "No se pudo crear la carpeta",
                });
            }
        }
    };
    const handleSyncElevenLabs = async () => {
        try {
            const result = await syncElevenLabsMutation.mutateAsync();
            addNotification({
                type: "success",
                title: "Sincronización Completada",
                message: `Se sincronizaron ${result?.data?.created || 0} agentes nuevos y ${result?.data?.updated || 0} agentes actualizados`,
            });
        }
        catch (error) {
            addNotification({
                type: "error",
                title: "Error de Sincronización",
                message: error.message || "No se pudo sincronizar con ElevenLabs",
            });
        }
    };
    const handleDeleteFolder = async (folderId, folderName) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar la carpeta "${folderName}"?`)) {
            try {
                await deleteFolderMutation.mutateAsync(folderId);
                addNotification({
                    type: "success",
                    title: "Carpeta Eliminada",
                    message: `La carpeta "${folderName}" se ha eliminado exitosamente`,
                });
            }
            catch (error) {
                addNotification({
                    type: "error",
                    title: "Error al Eliminar Carpeta",
                    message: error.message || "No se pudo eliminar la carpeta",
                });
            }
        }
    };
    const handleMoveAgentToFolder = async (agentId, folderId, folderName) => {
        try {
            await moveAgentsMutation.mutateAsync({
                agentIds: [agentId],
                folderId,
            });
            const message = folderId
                ? `Agente movido a la carpeta "${folderName}"`
                : "Agente movido fuera de las carpetas";
            addNotification({
                type: "success",
                title: "Agente Movido",
                message,
            });
        }
        catch (error) {
            addNotification({
                type: "error",
                title: "Error al Mover Agente",
                message: error.message || "No se pudo mover el agente",
            });
        }
    };
    const handleEnterFolder = (folderId, folderName) => {
        setSelectedFolder(folderId);
        setShowAllFolders(false);
        addNotification({
            type: "info",
            title: "Entrando a Carpeta",
            message: `Viendo agentes en "${folderName}"`,
        });
    };
    const handleBackToFolders = () => {
        setSelectedFolder(null);
        setShowAllFolders(true);
        addNotification({
            type: "info",
            title: "Volviendo a Carpetas",
            message: "Viendo todas las carpetas",
        });
    };
    const handleEditAgent = (agentId) => {
        const agent = agents.find(a => a.id === agentId);
        if (agent) {
            if (agent.type === "outbound") {
                navigate(`/outbound-agent?edit=${agentId}`);
            }
            else {
                navigate(`/inbound-agent?edit=${agentId}`);
            }
        }
    };
    const handleDeleteAgent = async (agentId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este agente?')) {
            try {
                await deleteAgentMutation.mutateAsync(agentId);
                addNotification({
                    type: 'success',
                    title: 'Agente Eliminado',
                    message: 'El agente se ha eliminado exitosamente',
                });
                setShowContextMenu(null);
            }
            catch (error) {
                addNotification({
                    type: 'error',
                    title: 'Error al eliminar agente',
                    message: 'No se pudo eliminar el agente',
                });
            }
        }
    };
    const handleDuplicate = async (agentId) => {
        const agent = agents.find(a => a.id === agentId);
        const agentName = agent?.name || 'Unnamed Agent';
        const newName = prompt(`Enter a new name for the duplicated agent:`, `${agentName} (Copy)`);
        if (newName) {
            try {
                await duplicateAgentMutation.mutateAsync({ id: agentId, newName });
                addNotification({
                    type: "success",
                    title: "Agent Duplicated",
                    message: `Agent "${agentName}" has been successfully duplicated as "${newName}".`,
                });
            }
            catch (error) {
                addNotification({
                    type: "error",
                    title: "Duplication Failed",
                    message: error.message || "An unexpected error occurred while duplicating the agent.",
                });
            }
        }
    };
    const handleMakeCall = (agentId) => {
        // Abrir el modal de llamada con el agente seleccionado
        setSelectedAgentId(agentId);
        setShowLaunchCallModal(true);
    };
    const handleUploadAvatar = (agentId) => {
        setAgentIdForAvatar(agentId);
        setShowAvatarModal(true);
        setShowContextMenu(null);
    };
    const handleCopyAgentId = (agentId) => {
        navigator.clipboard.writeText(agentId);
        addNotification({
            type: 'success',
            title: 'ID Copiado',
            message: 'El ID del agente se ha copiado al portapapeles',
        });
    };
    const handleCopyAgentLink = async (agentId) => {
        try {
            const result = await getAgentLinkMutation.mutateAsync(agentId);
            const shareLink = `https://elevenlabs.io/convai/agents/${result.agent_id}?token=${result.token}`;
            await navigator.clipboard.writeText(shareLink);
            addNotification({
                type: 'success',
                title: 'Link Copiado',
                message: 'El link de compartir se ha copiado al portapapeles',
            });
            setShowContextMenu(null);
        }
        catch (error) {
            addNotification({
                type: 'error',
                title: 'Error al obtener link',
                message: error.response?.data?.message || 'No se pudo obtener el link de compartir',
            });
        }
    };
    const handleTestAgent = async (agentId) => {
        try {
            addNotification({
                type: 'info',
                title: 'Probando Agente',
                message: 'Simulando conversación...',
            });
            const result = await simulateConversationMutation.mutateAsync({
                agentId,
                data: {
                    simulation_specification: {
                        simulated_user_config: {}
                    }
                }
            });
            addNotification({
                type: 'success',
                title: 'Prueba Completada',
                message: `Conversación simulada: ${result.analysis.transcript_summary || 'Sin resumen'}`,
            });
            setShowContextMenu(null);
        }
        catch (error) {
            addNotification({
                type: 'error',
                title: 'Error al probar agente',
                message: error.response?.data?.message || 'No se pudo simular la conversación',
            });
        }
    };
    const handleViewCosts = async (agentId) => {
        try {
            // Verificar si el agente está sincronizado con ElevenLabs
            const agent = agents.find(a => a.id === agentId);
            if (!agent) {
                addNotification({
                    type: 'error',
                    title: 'Agente no encontrado',
                    message: 'No se pudo encontrar el agente',
                });
                return;
            }
            if (!agent.elevenLabsAgentId) {
                addNotification({
                    type: 'warning',
                    title: 'Agente no sincronizado',
                    message: 'Este agente no está sincronizado con ElevenLabs. Por favor, crea o sincroniza el agente primero.',
                });
                setShowContextMenu(null);
                return;
            }
            addNotification({
                type: 'info',
                title: 'Calculando Costos',
                message: 'Obteniendo información de costos estimados...',
            });
            const result = await calculateLLMUsageMutation.mutateAsync({
                agentId: agent.elevenLabsAgentId, // Usar el ID de ElevenLabs
                data: {}
            });
            // Formatear la información de costos
            const costsInfo = result.llm_prices.map(price => `${price.llm}: $${price.price_per_minute.toFixed(2)}/min`).join('\n');
            addNotification({
                type: 'success',
                title: 'Costos Estimados',
                message: `Precio por minuto:\n${costsInfo}`,
            });
            setShowContextMenu(null);
        }
        catch (error) {
            addNotification({
                type: 'error',
                title: 'Error al calcular costos',
                message: error.response?.data?.message || 'No se pudieron calcular los costos estimados',
            });
        }
    };
    // Filtrar agentes según búsqueda, tipo y carpetas
    const filteredAgents = agents.filter((agent) => {
        const matchesSearch = !searchQuery ||
            agent.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            agent.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = agentType === "Agent Type" || agentType === "Any" ||
            agent.type.toLowerCase() === agentType.toLowerCase();
        // Lógica de filtrado por carpeta:
        // - Si selectedFolder está definido, mostrar solo agentes de esa carpeta
        // - Si showAllFolders es true, mostrar todos los agentes
        // - Si es false y no hay selectedFolder, mostrar solo agentes sin carpeta
        let matchesFolderFilter = false;
        if (selectedFolder) {
            matchesFolderFilter = agent.folderId === selectedFolder;
        }
        else if (showAllFolders) {
            matchesFolderFilter = true;
        }
        else {
            matchesFolderFilter = !agent.folderId;
        }
        return matchesSearch && matchesType && matchesFolderFilter;
    });
    // Agrupar agentes por carpeta para mostrar organizados
    const agentsByFolder = folders.reduce((acc, folder) => {
        acc[folder.id] = {
            folder,
            agents: agents.filter((agent) => agent.folderId === folder.id)
        };
        return acc;
    }, {});
    // Mostrar todas las carpetas, incluso las vacías
    const allFolders = folders.map((folder) => ({
        folder,
        agents: agents.filter((agent) => agent.folderId === folder.id)
    }));
    // Agentes sin carpeta
    const agentsWithoutFolder = agents.filter((agent) => !agent.folderId);
    return (_jsxs("div", { className: "min-h-screen bg-gray-50 px-6 py-6", children: [_jsx("div", { className: "flex justify-between items-center mb-6", children: _jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Saved Agents" }) }), _jsx("div", { className: "bg-white rounded-lg border border-gray-200 p-3 sm:p-4 mb-4", children: _jsxs("div", { className: "flex flex-col gap-3 sm:gap-4", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-stretch sm:items-center gap-3", children: [_jsxs("div", { className: "relative w-full sm:w-80 lg:w-96", children: [_jsx(MagnifyingGlassIcon, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Agent Search", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base" })] }), _jsxs("div", { className: "relative w-full sm:w-auto sm:min-w-[180px]", children: [_jsxs("button", { onClick: () => setShowAgentTypeDropdown(!showAgentTypeDropdown), className: "w-full sm:w-auto sm:min-w-[180px] pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700 hover:bg-gray-50 transition-colors text-left flex items-center justify-between text-base", children: [_jsx("span", { className: "truncate", children: agentType }), _jsx(ChevronDownIcon, { className: "w-4 h-4 text-gray-400 flex-shrink-0 ml-2" })] }), showAgentTypeDropdown && (_jsx("div", { className: "absolute left-0 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20", children: [
                                                "Any",
                                                "Inbound",
                                                "Outbound",
                                                "Text",
                                                "Email",
                                                "Chatbot",
                                            ].map((type) => (_jsx("button", { onClick: () => {
                                                    setAgentType(type);
                                                    setShowAgentTypeDropdown(false);
                                                }, className: "w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg", children: type }, type))) }))] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:gap-3", children: [_jsxs("button", { onClick: handleSyncElevenLabs, disabled: syncElevenLabsMutation.isPending, className: "flex-1 sm:flex-none px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm lg:text-base whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2", children: [_jsx(ArrowPathIcon, { className: `w-4 h-4 ${syncElevenLabsMutation.isPending ? 'animate-spin' : ''}` }), syncElevenLabsMutation.isPending ? 'Sincronizando...' : 'Sync ElevenLabs'] }), _jsx("button", { onClick: () => setShowImportModal(true), className: "flex-1 sm:flex-none px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm lg:text-base whitespace-nowrap", children: "Import Agent" }), _jsx("button", { onClick: () => setShowCreateFolderModal(true), className: "flex-1 sm:flex-none px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm lg:text-base whitespace-nowrap", children: "Create New Folder" }), _jsxs("div", { className: "relative", children: [_jsx("button", { onClick: () => setShowDropdown(!showDropdown), className: "px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors", children: _jsx(EllipsisVerticalIcon, { className: "w-5 h-5 text-gray-600" }) }), showDropdown && (_jsxs("div", { className: "absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10", children: [_jsx("button", { onClick: () => {
                                                        refetchDiagnostics();
                                                        setShowDiagnosticsModal(true);
                                                        setShowDropdown(false);
                                                    }, className: "w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg", children: "\uD83D\uDD0D Diagn\u00F3sticos" }), _jsx("button", { className: "w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg", children: "Recently Deleted Agents" })] }))] })] })] }) }), _jsx("div", { className: "flex items-center mb-6", children: _jsxs("div", { className: "flex items-center justify-between w-full", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("button", { onClick: () => setShowAllFolders(!showAllFolders), className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showAllFolders ? "bg-blue-500" : "bg-gray-200"}`, children: _jsx("span", { className: `inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${showAllFolders ? "translate-x-6" : "translate-x-1"}` }) }), _jsx("span", { className: "ml-3 text-base text-gray-800", children: "Show agents in all folders" })] }), selectedFolder && (_jsxs("button", { onClick: handleBackToFolders, className: "flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }), _jsx("span", { children: "Volver a Carpetas" })] }))] }) }), isLoading && (_jsx("div", { className: "flex justify-center items-center py-12", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" }) })), !isLoading && filteredAgents.length === 0 && (_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-12 text-center", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No hay agentes guardados" }), _jsx("p", { className: "text-gray-600 mb-4", children: "Comienza creando tu primer agente de voz" }), _jsx("button", { onClick: () => navigate('/voice-agent'), className: "px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors", children: "Crear Agente" })] })), _jsx("div", { className: "space-y-6", children: showAllFolders && !selectedFolder ? (_jsxs(_Fragment, { children: [allFolders.map(({ folder, agents: folderAgents }) => (_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6 mb-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("svg", { className: "w-16 h-16 text-blue-500", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { d: "M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: folder.name }), _jsxs("span", { className: "text-sm text-gray-500", children: ["(", folderAgents.length, " agentes)"] })] })] }), _jsx("button", { onClick: () => handleDeleteFolder(folder.id, folder.name), className: "p-1 text-gray-400 hover:text-red-600", title: "Eliminar carpeta", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" }) }) })] }), folderAgents.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: folderAgents.map((agent) => (_jsx(AgentCard, { agent: agent, onEdit: handleEditAgent, onDelete: handleDeleteAgent, onDuplicate: handleDuplicate, onMoveToFolder: handleMoveAgentToFolder, folders: folders, onLaunchCall: handleMakeCall, onCopyId: handleCopyAgentId, onCopyLink: handleCopyAgentLink, onUploadAvatar: handleUploadAvatar, onCalculateCosts: handleViewCosts }, agent.id))) })) : (_jsx("p", { className: "text-gray-500 text-center py-4", children: "No hay agentes en esta carpeta" }))] }, folder.id))), agentsWithoutFolder.length > 0 && (_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: ["Agentes sin carpeta (", agentsWithoutFolder.length, ")"] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: agentsWithoutFolder.map((agent) => (_jsx(AgentCard, { agent: agent, onEdit: handleEditAgent, onDelete: handleDeleteAgent, onDuplicate: handleDuplicate, onMoveToFolder: handleMoveAgentToFolder, folders: folders, onLaunchCall: handleMakeCall, onCopyId: handleCopyAgentId, onCopyLink: handleCopyAgentLink, onUploadAvatar: handleUploadAvatar, onCalculateCosts: handleViewCosts }, agent.id))) })] }))] })) : selectedFolder ? (
                /* Mostrar agentes de la carpeta seleccionada */
                _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsxs("div", { className: "flex items-center space-x-4 mb-6", children: [_jsx("svg", { className: "w-16 h-16 text-blue-500", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { d: "M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: folders.find((f) => f.id === selectedFolder)?.name || 'Carpeta' }), _jsxs("span", { className: "text-sm text-gray-500", children: ["(", filteredAgents.length, " agentes)"] })] })] }), filteredAgents.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: filteredAgents.map((agent) => (_jsx(AgentCard, { agent: agent, onEdit: handleEditAgent, onDelete: handleDeleteAgent, onDuplicate: handleDuplicate, onMoveToFolder: handleMoveAgentToFolder, folders: folders, onLaunchCall: handleMakeCall, onCopyId: handleCopyAgentId, onCopyLink: handleCopyAgentLink, onUploadAvatar: handleUploadAvatar, onCalculateCosts: handleViewCosts }, agent.id))) })) : (_jsx("p", { className: "text-gray-500 text-center py-8", children: "No hay agentes en esta carpeta" }))] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6", children: allFolders.map(({ folder, agents: folderAgents }) => (_jsx("div", { className: "bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors flex-1", onClick: () => handleEnterFolder(folder.id, folder.name), children: [_jsx("svg", { className: "w-16 h-16 text-blue-500", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { d: "M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: folder.name }), _jsxs("span", { className: "text-sm text-gray-500", children: ["(", folderAgents.length, " agentes)"] })] })] }), _jsx("button", { onClick: () => handleDeleteFolder(folder.id, folder.name), className: "p-1 text-gray-400 hover:text-red-600", title: "Eliminar carpeta", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" }) }) })] }) }, folder.id))) }), agentsWithoutFolder.length > 0 && (_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: ["Agentes sin carpeta (", agentsWithoutFolder.length, ")"] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: agentsWithoutFolder.map((agent) => (_jsx(AgentCard, { agent: agent, onEdit: handleEditAgent, onDelete: handleDeleteAgent, onDuplicate: handleDuplicate, onMoveToFolder: handleMoveAgentToFolder, folders: folders, onLaunchCall: handleMakeCall, onCopyId: handleCopyAgentId, onCopyLink: handleCopyAgentLink, onUploadAvatar: handleUploadAvatar, onCalculateCosts: handleViewCosts }, agent.id))) })] }))] })) }), _jsx(AgentWidgetModal, { isOpen: showAvatarModal, onClose: () => {
                    setShowAvatarModal(false);
                    setAgentIdForAvatar(null);
                }, agentId: agentIdForAvatar || '', onAvatarUploaded: (avatarUrl) => {
                    console.log('Avatar uploaded:', avatarUrl);
                    setShowAvatarModal(false);
                    setAgentIdForAvatar(null);
                } }), _jsx(LaunchCallModal, { isOpen: showLaunchCallModal, onClose: () => {
                    setShowLaunchCallModal(false);
                    setSelectedAgentId(null);
                }, onLaunch: async (phoneNumber) => {
                    try {
                        if (!selectedAgentId)
                            return;
                        const response = await fetch('/api/agents/launch-call', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                agentId: selectedAgentId,
                                phoneNumber: phoneNumber,
                            }),
                        });
                        if (!response.ok) {
                            throw new Error('Error al realizar la llamada');
                        }
                        setShowLaunchCallModal(false);
                        setSelectedAgentId(null);
                    }
                    catch (error) {
                        console.error("Error al realizar la llamada:", error);
                        // Solo mostrar en consola, no en la interfaz
                        const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido al realizar la llamada";
                        console.log("🔧 Llamadas outbound no disponibles en desarrollo. Configura el webhook en producción para habilitar esta funcionalidad.");
                        // No mostrar notificación de error al usuario
                    }
                }, agentId: selectedAgentId || undefined }), showImportModal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg p-6 max-w-md w-full mx-4", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Import Agent" }), _jsx("button", { onClick: () => {
                                        setShowImportModal(false);
                                        setImportAgentId("");
                                    }, className: "text-gray-400 hover:text-gray-600", children: _jsx(XMarkIcon, { className: "w-6 h-6" }) })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Agent ID" }), _jsx("input", { type: "text", placeholder: "Enter agent ID", value: importAgentId, onChange: (e) => setImportAgentId(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx("button", { onClick: () => {
                                                setShowImportModal(false);
                                                setImportAgentId("");
                                            }, className: "px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors", children: "Cancel" }), _jsx("button", { onClick: handleImportAgent, disabled: !importAgentId.trim() || importElevenLabsMutation.isPending, className: "px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: importElevenLabsMutation.isPending ? 'Importing...' : 'Import' })] })] })] }) })), showCreateFolderModal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg p-6 max-w-md w-full mx-4", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Create New Folder" }), _jsx("button", { onClick: () => {
                                        setShowCreateFolderModal(false);
                                        setFolderName("");
                                    }, className: "text-gray-400 hover:text-gray-600", children: _jsx(XMarkIcon, { className: "w-6 h-6" }) })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Folder Name" }), _jsx("input", { type: "text", placeholder: "Enter folder name", value: folderName, onChange: (e) => setFolderName(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx("button", { onClick: () => {
                                                setShowCreateFolderModal(false);
                                                setFolderName("");
                                            }, className: "px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors", children: "Cancel" }), _jsx("button", { onClick: handleCreateFolder, disabled: !folderName.trim() || createFolderMutation.isPending, className: "px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: createFolderMutation.isPending ? 'Creating...' : 'Create' })] })] })] }) }))] }));
};
const AgentCard = ({ agent, onEdit, onDelete, onDuplicate, onMoveToFolder, folders, onLaunchCall, onCopyId, onCopyLink, onUploadAvatar, onCalculateCosts, }) => {
    const [showContextMenu, setShowContextMenu] = useState(null);
    const [showMoveToFolderModal, setShowMoveToFolderModal] = useState(false);
    const getTypeColor = (type) => {
        const colors = {
            'Voice': 'bg-blue-100 text-blue-800',
            'Text': 'bg-green-100 text-green-800',
            'Email': 'bg-purple-100 text-purple-800',
            'Chatbot': 'bg-orange-100 text-orange-800',
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };
    return (_jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6 relative inline-block", children: [_jsxs("div", { className: "absolute top-5 right-5 flex items-center space-x-2", children: [_jsx("button", { className: "p-1 text-gray-400 hover:text-gray-600", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" }) }) }), _jsx("button", { onClick: () => setShowContextMenu(showContextMenu === agent.id ? null : agent.id), className: "p-1 text-gray-400 hover:text-gray-600", children: _jsx(EllipsisVerticalIcon, { className: "w-4 h-4" }) }), showContextMenu === agent.id && (_jsxs("div", { className: "absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20", children: [_jsxs("button", { className: "w-full flex items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg", onClick: () => onEdit(agent.id), children: [_jsx(PencilIcon, { className: "w-4 h-4 mr-3" }), "Edit"] }), _jsxs("button", { className: "w-full flex items-center px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50", onClick: () => onDelete(agent.id), children: [_jsx(TrashIcon, { className: "w-4 h-4 mr-3" }), "Delete"] }), _jsxs("button", { className: "w-full flex items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50", onClick: () => {
                                    onDuplicate(agent.id);
                                    setShowContextMenu(null);
                                }, children: [_jsx(DocumentDuplicateIcon, { className: "w-4 h-4 mr-3" }), "Duplicate"] }), _jsxs("button", { className: "w-full flex items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50", onClick: () => {
                                    onCopyId(agent.id);
                                    setShowContextMenu(null);
                                }, children: [_jsx(ClipboardDocumentIcon, { className: "w-4 h-4 mr-3" }), "Copy ID"] }), _jsxs("button", { className: `w-full flex items-center px-4 py-2 text-left text-sm ${agent.elevenLabsAgentId
                                    ? 'text-gray-700 hover:bg-gray-50'
                                    : 'text-gray-400 cursor-not-allowed opacity-50'}`, onClick: () => {
                                    if (agent.elevenLabsAgentId) {
                                        onLaunchCall(agent.id);
                                    }
                                }, disabled: !agent.elevenLabsAgentId, title: !agent.elevenLabsAgentId ? 'Este agente no está sincronizado con ElevenLabs' : 'Probar el agente', children: [_jsx(PlayIcon, { className: "w-4 h-4 mr-3" }), "Test Agent"] }), _jsxs("button", { className: `w-full flex items-center px-4 py-2 text-left text-sm ${agent.elevenLabsAgentId
                                    ? 'text-gray-700 hover:bg-gray-50'
                                    : 'text-gray-400 cursor-not-allowed opacity-50'}`, onClick: () => {
                                    if (agent.elevenLabsAgentId) {
                                        onCopyLink(agent.id);
                                    }
                                }, disabled: !agent.elevenLabsAgentId, title: !agent.elevenLabsAgentId ? 'Este agente no está sincronizado con ElevenLabs' : 'Copiar link de compartir', children: [_jsx(LinkIcon, { className: "w-4 h-4 mr-3" }), "Copy Share Link"] }), _jsxs("button", { className: `w-full flex items-center px-4 py-2 text-left text-sm ${agent.elevenLabsAgentId
                                    ? 'text-gray-700 hover:bg-gray-50'
                                    : 'text-gray-400 cursor-not-allowed opacity-50'}`, onClick: () => {
                                    if (agent.elevenLabsAgentId) {
                                        onUploadAvatar(agent.id);
                                    }
                                }, disabled: !agent.elevenLabsAgentId, title: !agent.elevenLabsAgentId ? 'Este agente no está sincronizado con ElevenLabs' : 'Subir avatar del agente', children: [_jsx(PhotoIcon, { className: "w-4 h-4 mr-3" }), "Upload Avatar"] }), _jsxs("button", { className: `w-full flex items-center px-4 py-2 text-left text-sm ${agent.elevenLabsAgentId
                                    ? 'text-gray-700 hover:bg-gray-50'
                                    : 'text-gray-400 cursor-not-allowed opacity-50'}`, onClick: () => {
                                    if (agent.elevenLabsAgentId) {
                                        onCalculateCosts(agent.id);
                                    }
                                }, disabled: !agent.elevenLabsAgentId, title: !agent.elevenLabsAgentId ? 'Este agente no está sincronizado con ElevenLabs' : 'Ver costos estimados', children: [_jsx(CurrencyDollarIcon, { className: "w-4 h-4 mr-3" }), "View Costs"] }), _jsxs("button", { className: "w-full flex items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50", onClick: () => {
                                    setShowMoveToFolderModal(true);
                                    setShowContextMenu(null);
                                }, children: [_jsx(FolderIcon, { className: "w-4 h-4 mr-3" }), "Move to Folder"] })] }))] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 shadow-md" }) }), _jsxs("div", { className: "flex flex-col", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx("span", { className: `px-2.5 py-0.5 rounded text-xs font-medium ${getTypeColor(agent.type)}`, children: agent.type }), _jsx("span", { className: "text-sm text-gray-900", children: new Date(agent.createdAt).toLocaleDateString('en-US', {
                                            month: '2-digit',
                                            day: '2-digit',
                                            year: 'numeric',
                                        }) })] }), _jsxs("div", { className: "mb-2", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: agent.name || 'Unnamed Agent' }), agent.description && (_jsx("p", { className: "text-sm text-gray-600 mt-1", children: agent.description }))] }), _jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsxs("span", { className: "text-xs text-gray-500", children: ["Voice: ", agent.voiceName] }), _jsx("span", { className: "text-xs text-gray-400", children: "\u2022" }), _jsx("span", { className: `text-xs ${agent.status === 'active' ? 'text-green-600' : 'text-gray-400'}`, children: agent.status === 'active' ? 'Active' : 'Inactive' })] }), _jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsxs("span", { className: "text-sm text-gray-900", children: ["ID: ", agent.id.substring(0, 20), "..."] }), _jsx("button", { className: "text-blue-500 hover:text-blue-700", onClick: () => onCopyId(agent.id), children: _jsx(ClipboardDocumentIcon, { className: "w-4 h-4" }) })] }), _jsx("button", { className: `px-20 py-2.5 border-2 rounded-lg transition-colors font-medium text-sm ${agent.elevenLabsAgentId
                                    ? 'border-blue-500 text-blue-500 hover:bg-blue-50'
                                    : 'border-gray-300 text-gray-400 cursor-not-allowed opacity-50'}`, onClick: () => {
                                    if (agent.elevenLabsAgentId) {
                                        onLaunchCall(agent.id);
                                    }
                                }, disabled: !agent.elevenLabsAgentId, title: !agent.elevenLabsAgentId ? 'Este agente no está sincronizado con ElevenLabs' : 'Realizar una llamada con este agente', children: "Make A Call" })] })] }), showMoveToFolderModal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg p-6 max-w-md w-full mx-4", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Mover a Carpeta" }), _jsx("button", { onClick: () => setShowMoveToFolderModal(false), className: "text-gray-400 hover:text-gray-600", children: _jsx(XMarkIcon, { className: "w-6 h-6" }) })] }), _jsx("div", { className: "space-y-4", children: _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Seleccionar Carpeta" }), _jsxs("div", { className: "space-y-2", children: [agent.folderId && (_jsxs("button", { onClick: () => {
                                                    onMoveToFolder(agent.id, null, 'Sin carpeta');
                                                    setShowMoveToFolderModal(false);
                                                }, className: "w-full flex items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 border border-gray-200 rounded bg-gray-50", children: [_jsx("svg", { className: "w-4 h-4 inline mr-2 text-gray-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) }), "Quitar de Carpeta (Mover a Sin Carpeta)"] })), folders.map((folder) => (_jsxs("button", { onClick: () => {
                                                    onMoveToFolder(agent.id, folder.id, folder.name);
                                                    setShowMoveToFolderModal(false);
                                                }, className: "w-full flex items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 border border-gray-200 rounded", children: [_jsx(FolderIcon, { className: "w-4 h-4 inline mr-2" }), folder.name] }, folder.id)))] })] }) })] }) }))] }, agent.id));
};
export default SavedAgents;
