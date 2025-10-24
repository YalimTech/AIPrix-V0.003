import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, endpoints } from "../lib/api";
export const useCalls = (filters) => {
    return useQuery({
        queryKey: ['calls', filters],
        queryFn: () => apiClient.get(endpoints.calls.list),
    });
};
export const useCallLogs = () => {
    return useQuery({
        queryKey: ['calls', 'logs'],
        queryFn: () => apiClient.get(endpoints.calls.logs),
    });
};
export const useCreateCall = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (call) => apiClient.post(endpoints.calls.create, call),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['calls'] });
        },
    });
};
export const useUpdateCall = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...call }) => apiClient.put(endpoints.calls.update(id), call),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['calls'] });
        },
    });
};
export const useMakeCall = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ agentId, phoneNumber, accountId, }) => apiClient.post(endpoints.calls.create, {
            agentId,
            phoneNumber,
            accountId,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["calls"] });
        },
    });
};
