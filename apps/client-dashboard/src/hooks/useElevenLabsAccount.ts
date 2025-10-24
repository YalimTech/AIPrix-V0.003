import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

// Interfaz para la información del usuario de ElevenLabs (basado en su API)
export interface ElevenLabsUserInfo {
  subscription: {
    character_count: number;
    character_limit: number;
    status: string;
    tier: string;
  };
  // Se pueden añadir más campos si son necesarios
}

// Hook para obtener la información de la cuenta de ElevenLabs del usuario
export const useElevenLabsAccount = () => {
  const { 
    data: accountInfo, 
    isLoading: isLoadingAccount, 
    error: accountError,
    refetch: refetchAccountInfo,
  } = useQuery({
    queryKey: ['elevenlabs', 'accountInfo'],
    queryFn: async () => {
      try {
        // Llama al nuevo endpoint del backend
        const response = await apiClient.get<ElevenLabsUserInfo>('/integrations/elevenlabs/user-info');
        return response;
      } catch (error) {
        console.error("Error fetching ElevenLabs user info:", error);
        // Devuelve null o un objeto de error para que la UI pueda manejarlo
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // Considerar datos frescos por 5 minutos
    gcTime: 1000 * 60 * 10, // Mantener en caché por 10 minutos
    retry: 1, // Reintentar solo una vez si falla
  });

  return {
    accountInfo,
    isLoadingAccount,
    accountError,
    refetchAccountInfo,
  };
};
