import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, endpoints } from '../lib/api';
export const useCampaigns = () => {
    return useQuery({
        queryKey: ['campaigns'],
        queryFn: () => apiClient.get(endpoints.campaigns.list),
    });
};
export const useCampaignStats = () => {
    return useQuery({
        queryKey: ['campaigns', 'stats'],
        queryFn: () => apiClient.get(endpoints.campaigns.stats),
    });
};
export const useCreateCampaign = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (campaign) => apiClient.post(endpoints.campaigns.create, campaign),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
        },
    });
};
export const useUpdateCampaign = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...campaign }) => apiClient.put(endpoints.campaigns.update(id), campaign),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
        },
    });
};
export const useDeleteCampaign = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => apiClient.delete(endpoints.campaigns.delete(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
        },
    });
};
