import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, endpoints } from '../lib/api';

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  agentId: string;
  contactListId: string;
  budget: number;
  spent: number;
  isActive: boolean;
  contacts: number;
  contactsCalled: number;
  answers: number;
  noAnswers: number;
  transfers: number;
  appointments: number;
  createdAt: string;
  updatedAt: string;
}

export const useCampaigns = () => {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: () => apiClient.get<Campaign[]>(endpoints.campaigns.list),
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
    mutationFn: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'spent' | 'contacts' | 'contactsCalled' | 'answers' | 'noAnswers' | 'transfers' | 'appointments'>) =>
      apiClient.post<Campaign>(endpoints.campaigns.create, campaign),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...campaign }: Partial<Campaign> & { id: string }) =>
      apiClient.put<Campaign>(endpoints.campaigns.update(id), campaign),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(endpoints.campaigns.delete(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};
