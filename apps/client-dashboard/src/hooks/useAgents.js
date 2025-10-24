import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, endpoints } from "../lib/api";
export const useAgents = () => {
    return useQuery({
        queryKey: ["agents"],
        queryFn: () => apiClient.get(endpoints.agents.list),
    });
};
export const useGetAgent = (id) => {
    return useQuery({
        queryKey: ["agent", id],
        queryFn: () => apiClient.get(endpoints.agents.get(id)),
        enabled: !!id,
    });
};
export const useCreateAgent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (agent) => apiClient.post(endpoints.agents.create, agent),
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
        mutationFn: (agentId) => apiClient.post(endpoints.agents.importElevenLabs, { agentId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["agents"] });
        },
    });
};
export const useUpdateAgent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...agent }) => apiClient.patch(endpoints.agents.update(id), agent),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["agents"] });
        },
    });
};
export const useDuplicateAgent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, newName }) => apiClient.post(endpoints.agents.duplicate(id), {
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
        mutationFn: (id) => apiClient.delete(endpoints.agents.delete(id)),
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
