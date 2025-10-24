import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { useAuth } from './useAuth';

export interface ContactList {
  id: string;
  accountId: string;
  name: string;
  description: string;
  contactCount: number;
  createdAt: string;
  updatedAt: string;
  contacts?: Contact[];
}

export interface Contact {
  id: string;
  accountId: string;
  name: string;
  lastName: string | null;
  phone: string;
  email: string | null;
  company: string | null;
  position: string | null;
  status: string;
  source: string;
  tags: string[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export const useContactLists = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  return useQuery({
    queryKey: ['contactLists'],
    queryFn: async () => {
      const response = await apiClient.get<ContactList[]>('/contacts/lists');
      return response;
    },
    enabled: isAuthenticated && !isLoading, // Solo ejecutar si está autenticado y no cargando
    retry: (failureCount, error: any) => {
      // No reintentar si es error de autenticación
      if (error?.status === 401 || error?.code === 'NOT_AUTHENTICATED') {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useContactList = (listId: string) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  return useQuery({
    queryKey: ['contactList', listId],
    queryFn: async () => {
      const response = await apiClient.get<ContactList>(`/contacts/lists/${listId}`);
      return response;
    },
    enabled: isAuthenticated && !isLoading && !!listId,
  });
};

export const useContactsByList = (listId: string | null) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  return useQuery({
    queryKey: ['contacts', 'byList', listId],
    queryFn: async () => {
      if (!listId) return [];
      const response = await apiClient.get<Contact[]>(`/contacts/lists/${listId}/contacts`);
      return response;
    },
    enabled: isAuthenticated && !isLoading && !!listId,
  });
};

export const useCreateContactList = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      return apiClient.post<ContactList>('/contacts/lists', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactLists'] });
    },
  });
};

export const useDeleteContactList = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (listId: string) => {
      return apiClient.delete(`/contacts/lists/${listId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactLists'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
};
