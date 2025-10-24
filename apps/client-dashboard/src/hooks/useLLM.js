import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient, endpoints } from '../lib/api';
export const useLLMModels = () => {
    return useQuery({
        queryKey: ['llm', 'models'],
        queryFn: () => apiClient.get(endpoints.llm.models),
    });
};
export const useGenerateText = () => {
    return useMutation({
        mutationFn: (request) => apiClient.post(endpoints.llm.generate, request),
    });
};
export const useGenerateLLMText = () => {
    return useMutation({
        mutationFn: (request) => apiClient.post(endpoints.llm.generate, request),
    });
};
