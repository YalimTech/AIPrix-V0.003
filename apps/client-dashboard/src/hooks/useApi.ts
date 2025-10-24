import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useApi<T = any>(
  endpoint: string,
  options: UseApiOptions = {}
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const { immediate = false, onSuccess, onError } = options;

  const execute = useCallback(async (params?: any) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiClient.get<T>(endpoint, params);
      setState({ data: response, loading: false, error: null });
      onSuccess?.(response);
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Error en la petición';
      setState({ data: null, loading: false, error: errorMessage });
      onError?.(error);
      throw error;
    }
  }, [endpoint, onSuccess, onError]);

  const mutate = useCallback(async (method: 'POST' | 'PUT' | 'PATCH' | 'DELETE', data?: any) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      let response;
      switch (method) {
        case 'POST':
          response = await apiClient.post<T>(endpoint, data);
          break;
        case 'PUT':
          response = await apiClient.put<T>(endpoint, data);
          break;
        case 'PATCH':
          response = await apiClient.patch<T>(endpoint, data);
          break;
        case 'DELETE':
          response = await apiClient.delete<T>(endpoint);
          break;
        default:
          throw new Error(`Método HTTP no soportado: ${method}`);
      }
      
      setState({ data: response, loading: false, error: null });
      onSuccess?.(response);
      return response;
    } catch (error: any) {
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
export function useMutation<T = any>(endpoint: string) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(async (method: 'POST' | 'PUT' | 'PATCH' | 'DELETE', data?: any) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      let response;
      switch (method) {
        case 'POST':
          response = await apiClient.post<T>(endpoint, data);
          break;
        case 'PUT':
          response = await apiClient.put<T>(endpoint, data);
          break;
        case 'PATCH':
          response = await apiClient.patch<T>(endpoint, data);
          break;
        case 'DELETE':
          response = await apiClient.delete<T>(endpoint);
          break;
        default:
          throw new Error(`Método HTTP no soportado: ${method}`);
      }
      
      setState({ data: response, loading: false, error: null });
      return response;
    } catch (error: any) {
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
