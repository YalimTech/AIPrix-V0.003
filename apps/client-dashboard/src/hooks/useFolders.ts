import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, endpoints } from '../lib/api';

export interface Folder {
  id: string;
  name: string;
  description?: string;
  color?: string;
  accountId: string;
  createdAt: string;
  updatedAt: string;
  agents?: Agent[];
  _count?: {
    agents: number;
  };
}

export interface Agent {
  id: string;
  name: string;
  description?: string;
  status: string;
  type: string;
  voiceName: string;
  language?: string;
  temperature?: number;
  createdAt: string;
  elevenLabsAgentId?: string;
  folderId?: string;
  folder?: {
    id: string;
    name: string;
    color?: string;
  };
}

export interface CreateFolderDto {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateFolderDto {
  name?: string;
  description?: string;
  color?: string;
}

export interface MoveAgentsDto {
  agentIds: string[];
  folderId: string | null;
}

// Hook para obtener todas las carpetas
export const useFolders = () => {
  return useQuery({
    queryKey: ['folders'],
    queryFn: () => apiClient.get(endpoints.folders.list),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para obtener una carpeta específica
export const useFolder = (id: string) => {
  return useQuery({
    queryKey: ['folders', id],
    queryFn: () => apiClient.get(endpoints.folders.get(id)),
    enabled: !!id,
  });
};

// Hook para crear una carpeta
export const useCreateFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFolderDto) =>
      apiClient.post(endpoints.folders.create, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
};

// Hook para actualizar una carpeta
export const useUpdateFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFolderDto }) =>
      apiClient.patch(endpoints.folders.update(id), data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['folders', id] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
};

// Hook para eliminar una carpeta
export const useDeleteFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(endpoints.folders.delete(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
};

// Hook para asignar un agente a una carpeta
export const useAssignAgentToFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ agentId, folderId }: { agentId: string; folderId: string | null }) =>
      apiClient.patch(endpoints.folders.assignAgent(agentId), { folderId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });
};

// Hook para mover múltiples agentes a una carpeta
export const useMoveAgentsToFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MoveAgentsDto) =>
      apiClient.patch(endpoints.folders.moveAgents, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });
};

// Hook para obtener estadísticas de carpetas
export const useFolderStats = () => {
  return useQuery({
    queryKey: ['folders', 'stats'],
    queryFn: () => apiClient.get(endpoints.folders.stats),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Hook para asignar agente a carpeta usando el endpoint de agents
export const useAssignAgentToFolderViaAgents = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ agentId, folderId }: { agentId: string; folderId: string | null }) =>
      apiClient.patch(endpoints.agents.assignFolder(agentId), { folderId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });
};

// Hook para mover múltiples agentes usando el endpoint de agents
export const useMoveAgentsToFolderViaAgents = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MoveAgentsDto) =>
      apiClient.patch(endpoints.agents.moveToFolder, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });
};
