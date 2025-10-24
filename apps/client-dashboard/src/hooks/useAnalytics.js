import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
export const useAnalytics = (filters = {}) => {
    return useQuery({
        queryKey: ['analytics', filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.agentId)
                params.append('agentId', filters.agentId);
            if (filters.callType)
                params.append('callType', filters.callType);
            if (filters.dateFrom)
                params.append('dateFrom', filters.dateFrom);
            if (filters.dateTo)
                params.append('dateTo', filters.dateTo);
            if (filters.type)
                params.append('type', filters.type);
            if (filters.phoneNumber)
                params.append('phoneNumber', filters.phoneNumber);
            const response = await apiClient.get(`/dashboard/analytics?${params.toString()}`);
            return response;
        },
        staleTime: 1000 * 60 * 5, // 5 minutos
        refetchOnWindowFocus: false,
        retry: 1,
    });
};
export const useAgents = () => {
    return useQuery({
        queryKey: ['agents'],
        queryFn: async () => {
            const response = await apiClient.get('/agents');
            return response;
        },
        staleTime: 1000 * 60 * 10, // 10 minutos
        refetchOnWindowFocus: false,
    });
};
export const usePhoneNumbers = () => {
    return useQuery({
        queryKey: ['phoneNumbers'],
        queryFn: async () => {
            const response = await apiClient.get('/phone-numbers');
            return response;
        },
        staleTime: 1000 * 60 * 10, // 10 minutos
        refetchOnWindowFocus: false,
    });
};
