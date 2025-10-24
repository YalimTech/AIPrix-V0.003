import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api";

export interface CustomVoice {
  id: string;
  name: string;
  accountId: string;
  config: {
    type: string;
    voice_id: string;
    model_id?: string;
    stability?: number;
    similarity_boost?: number;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

// Hook para obtener todas las custom voices del usuario
export const useCustomVoices = () => {
  return useQuery({
    queryKey: ["customVoices"],
    queryFn: async () => {
      const response = await apiClient.get<CustomVoice[]>(
        "/integrations/elevenlabs/custom-voices",
      );
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para crear una custom voice
export const useCreateCustomVoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      config: {
        type: string;
        voice_id: string;
        model_id?: string;
        stability?: number;
        similarity_boost?: number;
        [key: string]: any;
      };
    }) =>
      apiClient.post<CustomVoice>(
        "/integrations/elevenlabs/custom-voices",
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customVoices"] });
    },
  });
};

// Hook para actualizar una custom voice
export const useUpdateCustomVoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...updateData
    }: {
      id: string;
      name?: string;
      config?: {
        type?: string;
        voice_id?: string;
        model_id?: string;
        stability?: number;
        similarity_boost?: number;
        [key: string]: any;
      };
    }) =>
      apiClient.patch<CustomVoice>(
        `/integrations/elevenlabs/custom-voices/${id}`,
        updateData,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customVoices"] });
    },
  });
};

// Hook para eliminar una custom voice
export const useDeleteCustomVoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/integrations/elevenlabs/custom-voices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customVoices"] });
    },
  });
};

// Hook para generar preview de una custom voice
export const useGenerateVoicePreview = () => {
  return useMutation({
    mutationFn: async (data: {
      voice_id: string;
      text?: string;
      model_id?: string;
      stability?: number;
      similarity_boost?: number;
    }) => {
      const response = await apiClient.post<{
        audio_url: string;
        audio_data?: string; // base64 encoded audio
      }>("/integrations/elevenlabs/custom-voices/preview", {
        voice_id: data.voice_id,
        text: data.text || "Hola, esta es una prueba de voz personalizada.",
        model_id: data.model_id || "eleven_flash_v2_5",
        stability: data.stability || 0.6,
        similarity_boost: data.similarity_boost || 0.5,
      });
      return response;
    },
  });
};
