import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/api';
export function useApi(endpoint, options = {}) {
    const [state, setState] = useState({
        data: null,
        loading: false,
        error: null,
    });
    const { immediate = false, onSuccess, onError } = options;
    const execute = useCallback(async (params) => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const response = await apiClient.get(endpoint, params);
            setState({ data: response, loading: false, error: null });
            onSuccess?.(response);
            return response;
        }
        catch (error) {
            const errorMessage = error.message || 'Error en la petición';
            setState({ data: null, loading: false, error: errorMessage });
            onError?.(error);
            throw error;
        }
    }, [endpoint, onSuccess, onError]);
    const mutate = useCallback(async (method, data) => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            let response;
            switch (method) {
                case 'POST':
                    response = await apiClient.post(endpoint, data);
                    break;
                case 'PUT':
                    response = await apiClient.put(endpoint, data);
                    break;
                case 'PATCH':
                    response = await apiClient.patch(endpoint, data);
                    break;
                case 'DELETE':
                    response = await apiClient.delete(endpoint);
                    break;
                default:
                    throw new Error(`Método HTTP no soportado: ${method}`);
            }
            setState({ data: response, loading: false, error: null });
            onSuccess?.(response);
            return response;
        }
        catch (error) {
            const errorMessage = error.message || 'Error en la petición';
            setState({ data: null, loading: false, error: errorMessage });
            onError?.(error);
            throw error;
        }
    }, [endpoint, onSuccess, onError]);
    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [immediate, execute]);
    return {
        ...state,
        execute,
        mutate,
        refetch: execute,
    };
}
// Hook específico para mutaciones
export function useMutation(endpoint) {
    const [state, setState] = useState({
        data: null,
        loading: false,
        error: null,
    });
    const mutate = useCallback(async (method, data) => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            let response;
            switch (method) {
                case 'POST':
                    response = await apiClient.post(endpoint, data);
                    break;
                case 'PUT':
                    response = await apiClient.put(endpoint, data);
                    break;
                case 'PATCH':
                    response = await apiClient.patch(endpoint, data);
                    break;
                case 'DELETE':
                    response = await apiClient.delete(endpoint);
                    break;
                default:
                    throw new Error(`Método HTTP no soportado: ${method}`);
            }
            setState({ data: response, loading: false, error: null });
            return response;
        }
        catch (error) {
            const errorMessage = error.message || 'Error en la petición';
            setState({ data: null, loading: false, error: errorMessage });
            throw error;
        }
    }, [endpoint]);
    return {
        ...state,
        mutate,
    };
}
