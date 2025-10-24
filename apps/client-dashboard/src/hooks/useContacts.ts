import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, endpoints } from '../lib/api';
import { useAuth } from './useAuth';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  contactListId: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ContactList {
  id: string;
  name: string;
  description?: string;
  contactCount: number;
  createdAt: string;
  updatedAt: string;
}

export const useContacts = (contactListId?: string) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  return useQuery({
    queryKey: ['contacts', contactListId],
    queryFn: () => apiClient.get<Contact[]>(endpoints.contacts.list),
    enabled: isAuthenticated && !isLoading,
  });
};

export const useContactLists = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  return useQuery({
    queryKey: ['contactLists'],
    queryFn: () => apiClient.get<ContactList[]>(endpoints.contacts.list),
    enabled: isAuthenticated && !isLoading,
  });
};

export const useCreateContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) =>
      apiClient.post<Contact>(endpoints.contacts.create, contact),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
};

export const useImportContacts = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { file: File; contactListId: string; columnMapping: Record<string, string> }) => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('contactListId', data.contactListId);
      formData.append('columnMapping', JSON.stringify(data.columnMapping));
      
      return apiClient.post(endpoints.contacts.import, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
};

export const useExportContacts = () => {
  return useMutation({
    mutationFn: (_contactListId?: string) =>
      apiClient.get(endpoints.contacts.export),
  });
};
