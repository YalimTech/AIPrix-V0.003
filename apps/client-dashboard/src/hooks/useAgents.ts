import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, endpoints } from "../lib/api";

export interface Agent {
  id: string;
  name: string;
  description?: string;
  type: "inbound" | "outbound";
  voiceName: string;
  preMadePrompt?: string;
  maxTokens: number;
  temperature: number;
  status: "active" | "inactive" | "testing";
  createdAt: string;
  updatedAt: string;
  photo?: string;
  agentId?: string;
  elevenLabsAgentId?: string; // ID del agente en ElevenLabs

  // ElevenLabs specific settings
  initialMessageDelay?: number;
  doubleCall?: boolean;
  vmDetection?: boolean;
  interruptSensitivity?: boolean;
  responseSpeed?: boolean;
  webhookUrl?: string;

  // Call Transfer settings
  callTransferType?: "prompt" | "keyword";
  callTransferPhoneNumber?: string;
  callTransferKeywords?: string[];
  callTransferBusinessHours?: boolean;

  // Calendar Booking
  calendarBookingEnabled?: boolean;
  calendarBookingProvider?: string;
  calendarBookingId?: string;
  calendarBookingTimezone?: string;
  language?: string;
}

export const useAgents = () => {
  return useQuery({
    queryKey: ["agents"],
    queryFn: () => apiClient.get<Agent[]>(endpoints.agents.list),
  });
};

export const useGetAgent = (id: string) => {
  return useQuery({
    queryKey: ["agent", id],
    queryFn: () => apiClient.get<Agent>(endpoints.agents.get(id)),
    enabled: !!id,
  });
};

export const useCreateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agent: Omit<Agent, "id" | "createdAt" | "updatedAt">) =>
      apiClient.post<Agent>(endpoints.agents.create, agent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
};

export const useSyncElevenLabsAgents = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.post(endpoints.agents.syncElevenLabs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
};

export const useImportElevenLabsAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agentId: string) => 
      apiClient.post(endpoints.agents.importElevenLabs, { agentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
};

export const useUpdateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...agent }: Partial<Agent> & { id: string }) =>
      apiClient.patch<Agent>(endpoints.agents.update(id), agent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
};

export const useDuplicateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newName }: { id: string; newName: string }) =>
      apiClient.post<{ agent: Agent }>(endpoints.agents.duplicate(id), {
        newName,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
};

export const useDeleteAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(endpoints.agents.delete(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
};

export const useAgentDiagnostics = () => {
  return useQuery({
    queryKey: ["agents", "diagnostics"],
    queryFn: () => apiClient.get(endpoints.agents.diagnostics),
  });
};
