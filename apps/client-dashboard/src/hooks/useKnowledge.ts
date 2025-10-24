import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, endpoints } from '../lib/api';

export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  type: 'document' | 'faq' | 'script' | 'policy';
  category?: string;
  tags: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export const useKnowledge = () => {
  return useQuery({
    queryKey: ['knowledge'],
    queryFn: () => apiClient.get<KnowledgeEntry[]>(endpoints.knowledge.list),
  });
};

export const useKnowledgeSearch = (query: string) => {
  return useQuery({
    queryKey: ['knowledge', 'search', query],
    queryFn: () => apiClient.post<KnowledgeEntry[]>(endpoints.knowledge.search, { query }),
    enabled: !!query && query.length > 2,
  });
};

export const useCreateKnowledge = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (knowledge: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt'>) =>
      apiClient.post<KnowledgeEntry>(endpoints.knowledge.create, knowledge),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
    },
  });
};

export const useUpdateKnowledge = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...knowledge }: Partial<KnowledgeEntry> & { id: string }) =>
      apiClient.put<KnowledgeEntry>(endpoints.knowledge.update(id), knowledge),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
    },
  });
};

export const useDeleteKnowledge = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(endpoints.knowledge.delete(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
    },
  });
};
