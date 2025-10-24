import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, endpoints } from '../lib/api';
import { useAuth } from './useAuth';
export const useContacts = (contactListId) => {
    const { isAuthenticated, isLoading } = useAuth();
    return useQuery({
        queryKey: ['contacts', contactListId],
        queryFn: () => apiClient.get(endpoints.contacts.list),
        enabled: isAuthenticated && !isLoading,
    });
};
export const useContactLists = () => {
    const { isAuthenticated, isLoading } = useAuth();
    return useQuery({
        queryKey: ['contactLists'],
        queryFn: () => apiClient.get(endpoints.contacts.list),
        enabled: isAuthenticated && !isLoading,
    });
};
export const useCreateContact = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (contact) => apiClient.post(endpoints.contacts.create, contact),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
        },
    });
};
export const useImportContacts = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => {
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
        mutationFn: (_contactListId) => apiClient.get(endpoints.contacts.export),
    });
};
