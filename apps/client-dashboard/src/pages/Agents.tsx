import {
    ArrowPathIcon,
    Cog6ToothIcon,
    EllipsisVerticalIcon,
    ExclamationTriangleIcon,
    PlusIcon,
} from "@heroicons/react/24/outline";
import React, { useState } from "react";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import {
    useAgents,
    useCreateAgent,
    useImportElevenLabsAgent,
    useSyncElevenLabsAgents,
    useUpdateAgent,
} from "../hooks/useAgents";
import { useAppStore } from "../store/appStore";

const Agents: React.FC = () => {
  // const [showAddPhoneModal, setShowAddPhoneModal] = useState(false);
  // const [showMakeCallModal, setShowMakeCallModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any>(null);
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

  const handleCreateAgent = async (agentData: any) => {
    try {
      await createAgentMutation.mutateAsync(agentData);
      addNotification({
        type: "success",
        title: "Agente Creado",
        message: "El agente se ha creado exitosamente",
      });
      setShowCreateModal(false);
    } catch (error) {
      addNotification({
        type: "error",
        title: "Error al crear agente",
        message: "No se pudo crear el agente",
      });
    }
  };

  const handleUpdateAgent = async (agentData: any) => {
    try {
      await updateAgentMutation.mutateAsync(agentData);
      addNotification({
        type: "success",
        title: "Agente Actualizado",
        message: "El agente se ha actualizado exitosamente",
      });
      setEditingAgent(null);
    } catch (error) {
      addNotification({
        type: "error",
        title: "Error al actualizar agente",
        message: "No se pudo actualizar el agente",
      });
    }
  };

  const handleSyncElevenLabs = async () => {
    try {
      const result = (await syncElevenLabsMutation.mutateAsync()) as any;
      addNotification({
        type: "success",
        title: "Sincronización Completada",
        message: `Se sincronizaron ${result.data.created} agentes nuevos y ${result.data.updated} agentes actualizados`,
      });
    } catch (error) {
      addNotification({
        type: "error",
        title: "Error de Sincronización",
        message: "No se pudieron sincronizar los agentes de ElevenLabs",
      });
    }
  };

  const handleImportAgent = async (agentId: string) => {
    try {
      const result = (await importElevenLabsMutation.mutateAsync(
        agentId,
      )) as any;
      addNotification({
        type: "success",
        title: "Agente Importado",
        message: `Agente ${result.data.action === "created" ? "importado" : "actualizado"} exitosamente`,
      });
      setShowImportModal(false);
    } catch (error) {
      addNotification({
        type: "error",
        title: "Error de Importación",
        message:
          "No se pudo importar el agente. Verifica que el ID sea correcto.",
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

  const getTypeColor = (type: string) => {
    return type === "inbound"
      ? "bg-blue-100 text-blue-800"
      : "bg-yellow-100 text-yellow-800";
  };

  const getTypeLabel = (type: string) => {
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
      photo:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
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
      photo:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
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
      photo:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
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
      photo:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      agentId: "agent-1",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Agents</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow p-6 animate-pulse"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Agents</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error al cargar agentes
              </h3>
              <div className="mt-2 text-sm text-red-700">
                No se pudieron cargar los agentes. Por favor, intenta de nuevo.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agents</h1>
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Home &gt; Agents
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Q Search Contact"
              className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button
            variant="secondary"
            onClick={handleSyncElevenLabs}
            disabled={syncElevenLabsMutation.isPending}
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Sync ElevenLabs
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowImportModal(true)}
            disabled={importElevenLabsMutation.isPending}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Import Agent
          </Button>
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <Cog6ToothIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(apiAgents || mockAgents).map((agent) => (
          <div
            key={agent.id}
            className="bg-white rounded-lg shadow p-6 relative"
          >
            {/* Three dots menu */}
            <div className="absolute top-4 right-4">
              <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <EllipsisVerticalIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Agent Photo and Info */}
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={agent.photo}
                alt={agent.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {agent.name}
                </h3>
                <p className="text-sm text-gray-500">{agent.description}</p>
              </div>
            </div>

            {/* Agent Type Tag */}
            <div className="mb-3">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(agent.type)}`}
              >
                {getTypeLabel(agent.type)}
              </span>
            </div>

            {/* Date */}
            <div className="mb-4">
              <span className="text-sm text-gray-500">{agent.createdAt}</span>
            </div>

            {/* Agent ID for outbound agents */}
            {agent.type === "outbound" && agent.agentId && (
              <div className="mb-4">
                <div className="text-sm text-gray-500">
                  Agent ID ({agent.agentId.substring(0, 20)}...)
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="mt-4">
              {agent.type === "inbound" ? (
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    /* Handle assign to phone number */
                  }}
                >
                  Assign Agent To Phone Number
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    /* Handle make call */
                  }}
                >
                  Make A Call
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {(apiAgents || mockAgents)?.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Cog6ToothIcon className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No agents</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new agent.
          </p>
          <div className="mt-6">
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <PlusIcon className="h-5 w-5 mr-2" />
              New Agent
            </Button>
          </div>
        </div>
      )}

      {/* Create Agent Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Agent"
        size="lg"
      >
        <AgentForm
          onSubmit={handleCreateAgent}
          onCancel={() => setShowCreateModal(false)}
          isLoading={createAgentMutation.isPending}
        />
      </Modal>

      {/* Edit Agent Modal */}
      <Modal
        isOpen={!!editingAgent}
        onClose={() => setEditingAgent(null)}
        title="Edit Agent"
        size="lg"
      >
        {editingAgent && (
          <AgentForm
            agent={editingAgent}
            onSubmit={handleUpdateAgent}
            onCancel={() => setEditingAgent(null)}
            isLoading={updateAgentMutation.isPending}
          />
        )}
      </Modal>

      {/* Import Agent Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Agent"
        size="md"
      >
        <ImportAgentForm
          onSubmit={handleImportAgent}
          onCancel={() => setShowImportModal(false)}
          isLoading={importElevenLabsMutation.isPending}
        />
      </Modal>
    </div>
  );
};

// Agent Form Component
interface AgentFormProps {
  agent?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const AgentForm: React.FC<AgentFormProps> = ({
  agent,
  onSubmit,
  onCancel,
  isLoading,
}) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: agent?.id,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="inbound">Inbound</option>
          <option value="outbound">Outbound</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Voice</label>
        <select
          value={formData.voiceName}
          onChange={(e) =>
            setFormData({ ...formData, voiceName: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="echo">Echo</option>
          <option value="fable">Fable</option>
          <option value="onyx">Onyx</option>
          <option value="nova">Nova</option>
          <option value="shimmer">Shimmer</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          System Prompt
        </label>
        <textarea
          value={formData.preMadePrompt}
          onChange={(e) =>
            setFormData({ ...formData, preMadePrompt: e.target.value })
          }
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Enter the system prompt for this agent..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Max Tokens
          </label>
          <input
            type="number"
            value={formData.maxTokens}
            onChange={(e) =>
              setFormData({ ...formData, maxTokens: parseInt(e.target.value) })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            min="1"
            max="4000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Temperature
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.temperature}
            onChange={(e) =>
              setFormData({
                ...formData,
                temperature: parseFloat(e.target.value),
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            min="0"
            max="2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="inactive">Inactive</option>
          <option value="active">Active</option>
          <option value="testing">Testing</option>
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? "Saving..." : agent ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
};

// Import Agent Form Component
interface ImportAgentFormProps {
  onSubmit: (agentId: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const ImportAgentForm: React.FC<ImportAgentFormProps> = ({
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [agentId, setAgentId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (agentId.trim()) {
      onSubmit(agentId.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm text-gray-600 mb-4">
          Paste the ID of the agent to import.
        </p>
        <label className="block text-sm font-medium text-gray-700">
          Enter Agent's ID
        </label>
        <input
          type="text"
          value={agentId}
          onChange={(e) => setAgentId(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Enter ElevenLabs Agent ID"
          required
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading || !agentId.trim()}
        >
          {isLoading ? "Importing..." : "Import"}
        </Button>
      </div>
    </form>
  );
};

export default Agents;
