import {
    ArrowPathIcon,
    BoltIcon,
    ChevronDownIcon,
    ClipboardDocumentIcon,
    CurrencyDollarIcon,
    DocumentDuplicateIcon,
    EllipsisVerticalIcon,
    FolderIcon,
    LinkIcon,
    MagnifyingGlassIcon,
    PaperAirplaneIcon,
    PencilIcon,
    PhoneIcon,
    PhotoIcon,
    PlayIcon,
    TrashIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AgentWidgetModal from "../components/modals/AgentWidgetModal";
import LaunchCallModal from "../components/modals/LaunchCallModal";
import {
    useAgentDiagnostics,
    useAgents,
    useDeleteAgent,
    useDuplicateAgent,
    useImportElevenLabsAgent,
    useSyncElevenLabsAgents,
} from "../hooks/useAgents";
import {
    useCalculateLLMUsage,
    useElevenLabsOutboundCall,
    useGetAgentLink,
    useSimulateConversation,
} from "../hooks/useElevenLabs";
import {
    useCreateFolder,
    useDeleteFolder,
    useFolders,
    useMoveAgentsToFolder,
} from "../hooks/useFolders";
import { useAppStore } from "../store/appStore";

const SavedAgents: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [agentType, setAgentType] = useState("Agent Type");
  const [showAllFolders, setShowAllFolders] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAgentTypeDropdown, setShowAgentTypeDropdown] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState<string | null>(null);
  const [importAgentId, setImportAgentId] = useState("");
  const [folderName, setFolderName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showLaunchCallModal, setShowLaunchCallModal] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [agentIdForAvatar, setAgentIdForAvatar] = useState<string | null>(null);
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

  const getTypeColor = (type: string) => {
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
      } catch (error: any) {
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
      } catch (error: any) {
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
      const result = await syncElevenLabsMutation.mutateAsync() as any;
      addNotification({
        type: "success",
        title: "Sincronización Completada",
        message: `Se sincronizaron ${result?.data?.created || 0} agentes nuevos y ${result?.data?.updated || 0} agentes actualizados`,
      });
    } catch (error: any) {
      addNotification({
        type: "error",
        title: "Error de Sincronización",
        message: error.message || "No se pudo sincronizar con ElevenLabs",
      });
    }
  };

  const handleDeleteFolder = async (folderId: string, folderName: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la carpeta "${folderName}"?`)) {
      try {
        await deleteFolderMutation.mutateAsync(folderId);
        addNotification({
          type: "success",
          title: "Carpeta Eliminada",
          message: `La carpeta "${folderName}" se ha eliminado exitosamente`,
        });
      } catch (error: any) {
        addNotification({
          type: "error",
          title: "Error al Eliminar Carpeta",
          message: error.message || "No se pudo eliminar la carpeta",
        });
      }
    }
  };

  const handleMoveAgentToFolder = async (agentId: string, folderId: string | null, folderName?: string) => {
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
    } catch (error: any) {
      addNotification({
        type: "error",
        title: "Error al Mover Agente",
        message: error.message || "No se pudo mover el agente",
      });
    }
  };

  const handleEnterFolder = (folderId: string, folderName: string) => {
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

  const handleEditAgent = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (agent) {
      if (agent.type === "outbound") {
        navigate(`/outbound-agent?edit=${agentId}`);
      } else {
        navigate(`/inbound-agent?edit=${agentId}`);
      }
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este agente?')) {
      try {
        await deleteAgentMutation.mutateAsync(agentId);
        addNotification({
          type: 'success',
          title: 'Agente Eliminado',
          message: 'El agente se ha eliminado exitosamente',
        });
        setShowContextMenu(null);
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Error al eliminar agente',
          message: 'No se pudo eliminar el agente',
        });
      }
    }
  };

  const handleDuplicate = async (agentId: string) => {
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
      } catch (error: any) {
        addNotification({
          type: "error",
          title: "Duplication Failed",
          message: error.message || "An unexpected error occurred while duplicating the agent.",
        });
      }
    }
  };

  const handleMakeCall = (agentId: string) => {
    // Abrir el modal de llamada con el agente seleccionado
    setSelectedAgentId(agentId);
    setShowLaunchCallModal(true);
  };

  const handleUploadAvatar = (agentId: string) => {
    setAgentIdForAvatar(agentId);
    setShowAvatarModal(true);
    setShowContextMenu(null);
  };

  const handleCopyAgentId = (agentId: string) => {
    navigator.clipboard.writeText(agentId);
    addNotification({
      type: 'success',
      title: 'ID Copiado',
      message: 'El ID del agente se ha copiado al portapapeles',
    });
  };

  const handleCopyAgentLink = async (agentId: string) => {
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
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error al obtener link',
        message: error.response?.data?.message || 'No se pudo obtener el link de compartir',
      });
    }
  };

  const handleTestAgent = async (agentId: string) => {
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
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error al probar agente',
        message: error.response?.data?.message || 'No se pudo simular la conversación',
      });
    }
  };

  const handleViewCosts = async (agentId: string) => {
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
      const costsInfo = result.llm_prices.map(price => 
        `${price.llm}: $${price.price_per_minute.toFixed(2)}/min`
      ).join('\n');

      addNotification({
        type: 'success',
        title: 'Costos Estimados',
        message: `Precio por minuto:\n${costsInfo}`,
      });

      setShowContextMenu(null);
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error al calcular costos',
        message: error.response?.data?.message || 'No se pudieron calcular los costos estimados',
      });
    }
  };

  // Filtrar agentes según búsqueda, tipo y carpetas
  const filteredAgents = agents.filter((agent: any) => {
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
    } else if (showAllFolders) {
      matchesFolderFilter = true;
    } else {
      matchesFolderFilter = !agent.folderId;
    }
    
    return matchesSearch && matchesType && matchesFolderFilter;
  });

  // Agrupar agentes por carpeta para mostrar organizados
  const agentsByFolder = (folders as any[]).reduce((acc: any, folder: any) => {
    acc[folder.id] = {
      folder,
      agents: agents.filter((agent: any) => agent.folderId === folder.id)
    };
    return acc;
  }, {} as Record<string, { folder: any; agents: any[] }>);

  // Mostrar todas las carpetas, incluso las vacías
  const allFolders = (folders as any[]).map((folder: any) => ({
    folder,
    agents: agents.filter((agent: any) => agent.folderId === folder.id)
  }));

  // Agentes sin carpeta
  const agentsWithoutFolder = agents.filter((agent: any) => !agent.folderId);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Saved Agents</h1>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 mb-4">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* First Row - Search and Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Agent Search */}
            <div className="relative w-full sm:w-80 lg:w-96">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Agent Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
            </div>

            {/* Agent Type Dropdown */}
            <div className="relative w-full sm:w-auto sm:min-w-[180px]">
              <button
                onClick={() => setShowAgentTypeDropdown(!showAgentTypeDropdown)}
                className="w-full sm:w-auto sm:min-w-[180px] pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700 hover:bg-gray-50 transition-colors text-left flex items-center justify-between text-base"
              >
                <span className="truncate">{agentType}</span>
                <ChevronDownIcon className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
              </button>

              {/* Agent Type Dropdown Menu */}
              {showAgentTypeDropdown && (
                <div className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  {[
                    "Any",
                    "Inbound",
                    "Outbound",
                    "Text",
                    "Email",
                    "Chatbot",
                  ].map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setAgentType(type);
                        setShowAgentTypeDropdown(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:gap-3">
            <button
              onClick={handleSyncElevenLabs}
              disabled={syncElevenLabsMutation.isPending}
              className="flex-1 sm:flex-none px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm lg:text-base whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ArrowPathIcon className={`w-4 h-4 ${syncElevenLabsMutation.isPending ? 'animate-spin' : ''}`} />
              {syncElevenLabsMutation.isPending ? 'Sincronizando...' : 'Sync ElevenLabs'}
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="flex-1 sm:flex-none px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm lg:text-base whitespace-nowrap"
            >
              Import Agent
            </button>
            <button
              onClick={() => setShowCreateFolderModal(true)}
              className="flex-1 sm:flex-none px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm lg:text-base whitespace-nowrap"
            >
              Create New Folder
            </button>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <EllipsisVerticalIcon className="w-5 h-5 text-gray-600" />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button 
                    onClick={() => {
                      refetchDiagnostics();
                      setShowDiagnosticsModal(true);
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    🔍 Diagnósticos
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                    Recently Deleted Agents
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Switch */}
      <div className="flex items-center mb-6">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
        <button
          onClick={() => setShowAllFolders(!showAllFolders)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            showAllFolders ? "bg-blue-500" : "bg-gray-200"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
              showAllFolders ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className="ml-3 text-base text-gray-800">
          Show agents in all folders
        </span>
          </div>
          
          {/* Botón de navegación para volver a carpetas */}
          {selectedFolder && (
            <button
              onClick={handleBackToFolders}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Volver a Carpetas</span>
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredAgents.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay agentes guardados
          </h3>
          <p className="text-gray-600 mb-4">
            Comienza creando tu primer agente de voz
          </p>
          <button
            onClick={() => navigate('/voice-agent')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Crear Agente
          </button>
        </div>
      )}

      {/* Folders and Agent Cards */}
      <div className="space-y-6">
        {/* Mostrar carpetas si showAllFolders es true y no hay carpeta seleccionada */}
        {showAllFolders && !selectedFolder ? (
          <>
            {/* Carpetas abiertas con sus agentes cuando showAllFolders es true */}
            {allFolders.map(({ folder, agents: folderAgents }: any) => (
              <div key={folder.id} className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                {/* Header de la carpeta */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <svg 
                      className="w-16 h-16 text-blue-500" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                    <div>
                    <h3 className="text-lg font-semibold text-gray-900">{folder.name}</h3>
                    <span className="text-sm text-gray-500">({folderAgents.length} agentes)</span>
                  </div>
                  </div>
                    <button
                      onClick={() => handleDeleteFolder(folder.id, folder.name)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Eliminar carpeta"
                    >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                    </button>
                </div>
                
                {/* Agentes dentro de la carpeta */}
                {folderAgents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {folderAgents.map((agent: any) => (
                      <AgentCard 
                        key={agent.id} 
                        agent={agent} 
                        onEdit={handleEditAgent}
                        onDelete={handleDeleteAgent}
                        onDuplicate={handleDuplicate}
                        onMoveToFolder={handleMoveAgentToFolder}
                        folders={folders as any[]}
                        onLaunchCall={handleMakeCall}
                        onCopyId={handleCopyAgentId}
                        onCopyLink={handleCopyAgentLink}
                        onUploadAvatar={handleUploadAvatar}
                        onCalculateCosts={handleViewCosts}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No hay agentes en esta carpeta</p>
                )}
              </div>
            ))}
            
            {/* Agentes sin carpeta */}
            {agentsWithoutFolder.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Agentes sin carpeta ({agentsWithoutFolder.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {agentsWithoutFolder.map((agent: any) => (
                    <AgentCard 
                      key={agent.id} 
                      agent={agent} 
                      onEdit={handleEditAgent}
                      onDelete={handleDeleteAgent}
                      onDuplicate={handleDuplicate}
                      onMoveToFolder={handleMoveAgentToFolder}
                      folders={folders as any[]}
                      onLaunchCall={handleMakeCall}
                      onCopyId={handleCopyAgentId}
                      onCopyLink={handleCopyAgentLink}
                      onUploadAvatar={handleUploadAvatar}
                      onCalculateCosts={handleViewCosts}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : selectedFolder ? (
          /* Mostrar agentes de la carpeta seleccionada */
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-4 mb-6">
              <svg 
                className="w-16 h-16 text-blue-500" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {(folders as any[]).find((f: any) => f.id === selectedFolder)?.name || 'Carpeta'}
                </h3>
                <span className="text-sm text-gray-500">
                  ({filteredAgents.length} agentes)
                </span>
              </div>
            </div>
            
            {filteredAgents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAgents.map((agent: any) => (
                  <AgentCard 
                    key={agent.id} 
                    agent={agent} 
                    onEdit={handleEditAgent}
                    onDelete={handleDeleteAgent}
                    onDuplicate={handleDuplicate}
                    onMoveToFolder={handleMoveAgentToFolder}
                    folders={folders as any[]}
                    onLaunchCall={handleMakeCall}
                    onCopyId={handleCopyAgentId}
                    onCopyLink={handleCopyAgentLink}
                    onUploadAvatar={handleUploadAvatar}
                    onCalculateCosts={handleViewCosts}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No hay agentes en esta carpeta</p>
            )}
          </div>
        ) : (
          <>
            {/* Carpetas cerradas (solo iconos) cuando showAllFolders es false */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {allFolders.map(({ folder, agents: folderAgents }: any) => (
                <div key={folder.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors flex-1"
                      onClick={() => handleEnterFolder(folder.id, folder.name)}
                    >
                      <svg 
                        className="w-16 h-16 text-blue-500" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                      </svg>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{folder.name}</h3>
                        <span className="text-sm text-gray-500">({folderAgents.length} agentes)</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteFolder(folder.id, folder.name)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Eliminar carpeta"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Agentes sin carpeta */}
            {agentsWithoutFolder.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Agentes sin carpeta ({agentsWithoutFolder.length})
                </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {agentsWithoutFolder.map((agent: any) => (
              <AgentCard 
                key={agent.id} 
                agent={agent} 
                onEdit={handleEditAgent}
                onDelete={handleDeleteAgent}
                      onDuplicate={handleDuplicate}
                onMoveToFolder={handleMoveAgentToFolder}
                      folders={folders as any[]}
                      onLaunchCall={handleMakeCall}
                onCopyId={handleCopyAgentId}
                onCopyLink={handleCopyAgentLink}
                onUploadAvatar={handleUploadAvatar}
                      onCalculateCosts={handleViewCosts}
              />
            ))}
                </div>
          </div>
            )}
          </>
        )}
      </div>

      {/* Launch Call Modal */}
      <AgentWidgetModal
        isOpen={showAvatarModal}
        onClose={() => {
          setShowAvatarModal(false);
          setAgentIdForAvatar(null);
        }}
        agentId={agentIdForAvatar || ''}
        onAvatarUploaded={(avatarUrl) => {
          console.log('Avatar uploaded:', avatarUrl);
          setShowAvatarModal(false);
          setAgentIdForAvatar(null);
        }}
      />

      {/* Launch Call Modal */}
      <LaunchCallModal
        isOpen={showLaunchCallModal}
        onClose={() => {
          setShowLaunchCallModal(false);
          setSelectedAgentId(null);
        }}
        onLaunch={async (phoneNumber: string) => {
          try {
            if (!selectedAgentId) return;
            
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
          } catch (error: any) {
            console.error("Error al realizar la llamada:", error);
            
            // Solo mostrar en consola, no en la interfaz
            const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido al realizar la llamada";
            console.log("🔧 Llamadas outbound no disponibles en desarrollo. Configura el webhook en producción para habilitar esta funcionalidad.");
            
            // No mostrar notificación de error al usuario
          }
        }}
        agentId={selectedAgentId || undefined}
      />

      {/* Import Agent Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Import Agent</h2>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportAgentId("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agent ID
                </label>
                <input
                  type="text"
                  placeholder="Enter agent ID"
                  value={importAgentId}
                  onChange={(e) => setImportAgentId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportAgentId("");
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportAgent}
                  disabled={!importAgentId.trim() || importElevenLabsMutation.isPending}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importElevenLabsMutation.isPending ? 'Importing...' : 'Import'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create New Folder</h2>
              <button
                onClick={() => {
                  setShowCreateFolderModal(false);
                  setFolderName("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Folder Name
                </label>
                <input
                  type="text"
                  placeholder="Enter folder name"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCreateFolderModal(false);
                    setFolderName("");
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  disabled={!folderName.trim() || createFolderMutation.isPending}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createFolderMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente AgentCard reutilizable
interface AgentCardProps {
  agent: any;
  onEdit: (agentId: string) => void;
  onDelete: (agentId: string) => void;
  onDuplicate: (agentId: string) => void;
  onMoveToFolder: (agentId: string, folderId: string | null, folderName?: string) => void;
  folders: any[];
  onLaunchCall: (agentId: string) => void;
  onCopyId: (agentId: string) => void;
  onCopyLink: (agentId: string) => void;
  onUploadAvatar: (agentId: string) => void;
  onCalculateCosts: (agentId: string) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  onEdit,
  onDelete,
  onDuplicate,
  onMoveToFolder,
  folders,
  onLaunchCall,
  onCopyId,
  onCopyLink,
  onUploadAvatar,
  onCalculateCosts,
}) => {
  const [showContextMenu, setShowContextMenu] = useState<string | null>(null);
  const [showMoveToFolderModal, setShowMoveToFolderModal] = useState(false);

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Voice': 'bg-blue-100 text-blue-800',
      'Text': 'bg-green-100 text-green-800',
      'Email': 'bg-purple-100 text-purple-800',
      'Chatbot': 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
          <div
            key={agent.id}
            className="bg-white rounded-lg border border-gray-200 p-6 relative inline-block"
          >
            {/* Action Icons */}
            <div className="absolute top-5 right-5 flex items-center space-x-2">
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </button>
              <button
                onClick={() =>
                  setShowContextMenu(
                    showContextMenu === agent.id ? null : agent.id,
                  )
                }
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <EllipsisVerticalIcon className="w-4 h-4" />
              </button>

              {/* Context Menu */}
              {showContextMenu === agent.id && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  <button
                    className="w-full flex items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
              onClick={() => onEdit(agent.id)}
                  >
                    <PencilIcon className="w-4 h-4 mr-3" />
                    Edit
                  </button>
                  <button
                    className="w-full flex items-center px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
              onClick={() => onDelete(agent.id)}
                  >
                    <TrashIcon className="w-4 h-4 mr-3" />
                    Delete
                  </button>
                  <button
                    className="w-full flex items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                onDuplicate(agent.id);
                      setShowContextMenu(null);
                    }}
                  >
                    <DocumentDuplicateIcon className="w-4 h-4 mr-3" />
                    Duplicate
                  </button>
                  <button
                    className="w-full flex items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                onCopyId(agent.id);
                      setShowContextMenu(null);
                    }}
                  >
                    <ClipboardDocumentIcon className="w-4 h-4 mr-3" />
                    Copy ID
                  </button>
                  <button
                    className={`w-full flex items-center px-4 py-2 text-left text-sm ${
                      agent.elevenLabsAgentId 
                        ? 'text-gray-700 hover:bg-gray-50' 
                        : 'text-gray-400 cursor-not-allowed opacity-50'
                    }`}
                    onClick={() => {
                      if (agent.elevenLabsAgentId) {
                  onLaunchCall(agent.id);
                      }
                    }}
                    disabled={!agent.elevenLabsAgentId}
                    title={!agent.elevenLabsAgentId ? 'Este agente no está sincronizado con ElevenLabs' : 'Probar el agente'}
                  >
                    <PlayIcon className="w-4 h-4 mr-3" />
                    Test Agent
                  </button>
                  <button
                    className={`w-full flex items-center px-4 py-2 text-left text-sm ${
                      agent.elevenLabsAgentId 
                        ? 'text-gray-700 hover:bg-gray-50' 
                        : 'text-gray-400 cursor-not-allowed opacity-50'
                    }`}
                    onClick={() => {
                      if (agent.elevenLabsAgentId) {
                  onCopyLink(agent.id);
                      }
                    }}
                    disabled={!agent.elevenLabsAgentId}
                    title={!agent.elevenLabsAgentId ? 'Este agente no está sincronizado con ElevenLabs' : 'Copiar link de compartir'}
                  >
                    <LinkIcon className="w-4 h-4 mr-3" />
                    Copy Share Link
                  </button>
                  <button
                    className={`w-full flex items-center px-4 py-2 text-left text-sm ${
                      agent.elevenLabsAgentId 
                        ? 'text-gray-700 hover:bg-gray-50' 
                        : 'text-gray-400 cursor-not-allowed opacity-50'
                    }`}
                    onClick={() => {
                      if (agent.elevenLabsAgentId) {
                  onUploadAvatar(agent.id);
                      }
                    }}
                    disabled={!agent.elevenLabsAgentId}
                    title={!agent.elevenLabsAgentId ? 'Este agente no está sincronizado con ElevenLabs' : 'Subir avatar del agente'}
                  >
                    <PhotoIcon className="w-4 h-4 mr-3" />
                    Upload Avatar
                  </button>
                  <button
                    className={`w-full flex items-center px-4 py-2 text-left text-sm ${
                      agent.elevenLabsAgentId 
                        ? 'text-gray-700 hover:bg-gray-50' 
                        : 'text-gray-400 cursor-not-allowed opacity-50'
                    }`}
                    onClick={() => {
                      if (agent.elevenLabsAgentId) {
                  onCalculateCosts(agent.id);
                      }
                    }}
                    disabled={!agent.elevenLabsAgentId}
                    title={!agent.elevenLabsAgentId ? 'Este agente no está sincronizado con ElevenLabs' : 'Ver costos estimados'}
                  >
                    <CurrencyDollarIcon className="w-4 h-4 mr-3" />
                    View Costs
                  </button>
            <button
              className="w-full flex items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => {
                setShowMoveToFolderModal(true);
                setShowContextMenu(null);
              }}
            >
              <FolderIcon className="w-4 h-4 mr-3" />
              Move to Folder
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 shadow-md"></div>
              </div>

              {/* Agent Details */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-medium ${getTypeColor(agent.type)}`}>
                    {agent.type}
                  </span>
                  <span className="text-sm text-gray-900">
                    {new Date(agent.createdAt).toLocaleDateString('en-US', {
                      month: '2-digit',
                      day: '2-digit',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {agent.name || 'Unnamed Agent'}
                  </h3>
                  {agent.description && (
                    <p className="text-sm text-gray-600 mt-1">{agent.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs text-gray-500">
                    Voice: {agent.voiceName}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className={`text-xs ${agent.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                    {agent.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-gray-900">
                    ID: {agent.id.substring(0, 20)}...
                  </span>
                  <button 
                    className="text-blue-500 hover:text-blue-700"
              onClick={() => onCopyId(agent.id)}
                  >
                    <ClipboardDocumentIcon className="w-4 h-4" />
                  </button>
                </div>

                <button 
                  className={`px-20 py-2.5 border-2 rounded-lg transition-colors font-medium text-sm ${
                    agent.elevenLabsAgentId
                      ? 'border-blue-500 text-blue-500 hover:bg-blue-50'
                      : 'border-gray-300 text-gray-400 cursor-not-allowed opacity-50'
                  }`}
                  onClick={() => {
                    if (agent.elevenLabsAgentId) {
                onLaunchCall(agent.id);
                    }
                  }}
                  disabled={!agent.elevenLabsAgentId}
                  title={!agent.elevenLabsAgentId ? 'Este agente no está sincronizado con ElevenLabs' : 'Realizar una llamada con este agente'}
                >
                  Make A Call
                </button>
              </div>
      </div>

      {/* Move to Folder Modal */}
      {showMoveToFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Mover a Carpeta</h2>
              <button
                onClick={() => setShowMoveToFolderModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
                    <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Carpeta
                </label>
                  <div className="space-y-2">
                    {/* Solo mostrar "Quitar de Carpeta" si el agente está en una carpeta */}
                    {agent.folderId && (
                          <button
                            onClick={() => {
                          onMoveToFolder(agent.id, null, 'Sin carpeta');
                          setShowMoveToFolderModal(false);
                        }}
                        className="w-full flex items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 border border-gray-200 rounded bg-gray-50"
                      >
                        <svg className="w-4 h-4 inline mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
                        Quitar de Carpeta (Mover a Sin Carpeta)
        </button>
                    )}
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => {
                      onMoveToFolder(agent.id, folder.id, folder.name);
                        setShowMoveToFolderModal(false);
                    }}
                      className="w-full flex items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 border border-gray-200 rounded"
                  >
                    <FolderIcon className="w-4 h-4 inline mr-2" />
                    {folder.name}
                  </button>
                ))}
          </div>
      </div>
        </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedAgents;
