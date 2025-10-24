import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api";
// Hook para obtener conversaciones
export const useConversations = (filters = {}) => {
    return useQuery({
        queryKey: ["conversations", filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    params.append(key, value.toString());
                }
            });
            const response = await apiClient.get(`/conversations?${params.toString()}`);
            return response;
        },
        staleTime: 30000, // 30 segundos
        refetchOnWindowFocus: false,
    });
};
// Hook para obtener detalles de una conversación
export const useConversationDetails = (conversationId, enabled = true) => {
    return useQuery({
        queryKey: ["conversation-details", conversationId],
        queryFn: async () => {
            const response = await apiClient.get(`/conversations/${conversationId}`);
            return response;
        },
        enabled: enabled && !!conversationId,
        staleTime: 60000, // 1 minuto
    });
};
// Hook para obtener audio de una conversación
export const useConversationAudio = (conversationId, enabled = true) => {
    return useQuery({
        queryKey: ["conversation-audio", conversationId],
        queryFn: async () => {
            const response = await apiClient.get(`/conversations/${conversationId}/audio`);
            return response;
        },
        enabled: enabled && !!conversationId,
        staleTime: 300000, // 5 minutos
    });
};
// Hook para obtener analytics de conversaciones
export const useConversationAnalytics = () => {
    return useQuery({
        queryKey: ["conversation-analytics"],
        queryFn: async () => {
            const response = await apiClient.get("/conversations/analytics/summary");
            return response;
        },
        staleTime: 60000, // 1 minuto
        refetchInterval: 300000, // Refrescar cada 5 minutos
    });
};
// Hook para enviar feedback de una conversación
export const useConversationFeedback = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ conversationId, feedback, }) => {
            console.log(`👍 Enviando feedback "${feedback}" para conversación ${conversationId}`);
            const response = await apiClient.post(`/conversations/${conversationId}/feedback`, {
                feedback,
            });
            console.log(`✅ Feedback "${feedback}" enviado exitosamente para conversación ${conversationId}`);
            return response;
        },
        onSuccess: (data, variables) => {
            // Invalidar la consulta de detalles de la conversación para refrescar los datos
            queryClient.invalidateQueries({
                queryKey: ["conversation-details", variables.conversationId],
            });
            // Mostrar notificación de éxito
            console.log("✅ Feedback enviado correctamente:", data);
        },
        onError: (error) => {
            console.error("❌ Error enviando feedback:", error);
        },
    });
};
// Hook para eliminar una conversación
export const useDeleteConversation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (conversationId) => {
            const response = await apiClient.delete(`/conversations/${conversationId}`);
            return response;
        },
        onSuccess: (data, conversationId) => {
            // Invalidar la lista de conversaciones
            queryClient.invalidateQueries({
                queryKey: ["conversations"],
            });
            // Invalidar analytics
            queryClient.invalidateQueries({
                queryKey: ["conversation-analytics"],
            });
            console.log("Conversación eliminada correctamente:", data);
        },
        onError: (error) => {
            console.error("Error eliminando conversación:", error);
        },
    });
};
// Hook para descargar audio de una conversación
export const useDownloadConversationAudio = () => {
    return useMutation({
        mutationFn: async ({ conversationId, filename, }) => {
            const response = await apiClient.get(`/conversations/${conversationId}/audio`);
            if (response.audioUrl) {
                if (response.isStream) {
                    // Para streams, usar el endpoint de descarga dedicado con apiClient
                    console.log("🔄 Descargando audio usando endpoint de descarga...");
                    const downloadUrl = `/conversations/${conversationId}/audio/download`;
                    try {
                        // Usar apiClient para mantener la autenticación
                        const audioResponse = await apiClient.get(downloadUrl, {
                            headers: {
                                Accept: "audio/*",
                            },
                        });
                        console.log("📦 Audio response raw:", audioResponse);
                        console.log("📦 Audio response type:", typeof audioResponse);
                        console.log("📦 Audio response constructor:", audioResponse?.constructor?.name);
                        // Verificar que la respuesta sea un blob válido
                        if (!(audioResponse instanceof Blob)) {
                            console.error("❌ La respuesta no es un Blob válido:", audioResponse);
                            throw new Error("La respuesta del servidor no es un archivo válido");
                        }
                        console.log("📦 Audio blob info:", {
                            type: audioResponse.type,
                            size: audioResponse.size,
                        });
                        // Verificar que el blob tenga contenido válido
                        if (audioResponse.size === 0) {
                            throw new Error("El archivo de audio está vacío");
                        }
                        // Crear blob URL y descargar directamente
                        const blobUrl = URL.createObjectURL(audioResponse);
                        const link = document.createElement("a");
                        link.href = blobUrl;
                        link.download = filename || `conversation-${conversationId}.mp3`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        console.log("✅ Archivo descargado exitosamente");
                        // Limpiar blob URL después de un delay
                        setTimeout(() => {
                            URL.revokeObjectURL(blobUrl);
                        }, 1000);
                    }
                    catch (error) {
                        console.error("❌ Error descargando audio:", error);
                        throw error;
                    }
                }
                else {
                    // Para URLs directas, usar el enlace normal
                    const link = document.createElement("a");
                    link.href = response.audioUrl;
                    link.download = filename || `conversation-${conversationId}.mp3`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
                return { success: true, message: "Audio descargado correctamente" };
            }
            else {
                throw new Error("No se pudo obtener la URL del audio");
            }
        },
        onSuccess: (data) => {
            console.log("Audio descargado:", data);
        },
        onError: (error) => {
            console.error("Error descargando audio:", error);
        },
    });
};
