import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { useAuth } from './useAuth';
export const useContactLists = () => {
    const { isAuthenticated, isLoading } = useAuth();
    return useQuery({
        queryKey: ['contactLists'],
        queryFn: async () => {
            const response = await apiClient.get('/contacts/lists');
            return response;
        },
        enabled: isAuthenticated && !isLoading, // Solo ejecutar si está autenticado y no cargando
        retry: (failureCount, error) => {
            // No reintentar si es error de autenticación
            if (error?.status === 401 || error?.code === 'NOT_AUTHENTICATED') {
                return false;
            }
            return failureCount < 3;
        },
    });
};
export const useContactList = (listId) => {
    const { isAuthenticated, isLoading } = useAuth();
    return useQuery({
        queryKey: ['contactList', listId],
        queryFn: async () => {
            const response = await apiClient.get(`/contacts/lists/${listId}`);
            return response;
        },
        enabled: isAuthenticated && !isLoading && !!listId,
    });
};
export const useContactsByList = (listId) => {
    const { isAuthenticated, isLoading } = useAuth();
    return useQuery({
        queryKey: ['contacts', 'byList', listId],
        queryFn: async () => {
            if (!listId)
                return [];
            const response = await apiClient.get(`/contacts/lists/${listId}/contacts`);
            return response;
        },
        enabled: isAuthenticated && !isLoading && !!listId,
    });
};
export const useCreateContactList = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data) => {
            return apiClient.post('/contacts/lists', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contactLists'] });
        },
    });
};
export const useDeleteContactList = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (listId) => {
            return apiClient.delete(`/contacts/lists/${listId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contactLists'] });
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
        },
    });
};
