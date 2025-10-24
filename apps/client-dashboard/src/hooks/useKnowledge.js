import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, endpoints } from '../lib/api';
export const useKnowledge = () => {
    return useQuery({
        queryKey: ['knowledge'],
        queryFn: () => apiClient.get(endpoints.knowledge.list),
    });
};
export const useKnowledgeSearch = (query) => {
    return useQuery({
        queryKey: ['knowledge', 'search', query],
        queryFn: () => apiClient.post(endpoints.knowledge.search, { query }),
        enabled: !!query && query.length > 2,
    });
};
export const useCreateKnowledge = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (knowledge) => apiClient.post(endpoints.knowledge.create, knowledge),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['knowledge'] });
        },
    });
};
export const useUpdateKnowledge = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...knowledge }) => apiClient.put(endpoints.knowledge.update(id), knowledge),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['knowledge'] });
        },
    });
};
export const useDeleteKnowledge = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => apiClient.delete(endpoints.knowledge.delete(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['knowledge'] });
        },
    });
};
