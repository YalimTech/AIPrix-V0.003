import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, endpoints } from "../lib/api";
// Hook para obtener todos los agentes de ElevenLabs
export const useElevenLabsAgents = () => {
    return useQuery({
        queryKey: ["elevenlabs", "agents"],
        queryFn: () => apiClient.get(endpoints.integrations.elevenlabs.agents.list),
    });
};
// Hook para obtener un agente específico de ElevenLabs
export const useElevenLabsAgent = (agentId) => {
    return useQuery({
        queryKey: ["elevenlabs", "agents", agentId],
        queryFn: () => {
            if (!agentId)
                throw new Error("Agent ID is required");
            return apiClient.get(endpoints.integrations.elevenlabs.agents.get(agentId));
        },
        enabled: !!agentId,
    });
};
// Hook para crear un agente en ElevenLabs
export const useCreateElevenLabsAgent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (agentData) => apiClient.post(endpoints.integrations.elevenlabs.agents.create, {
            name: agentData.name,
            systemPrompt: agentData.systemPrompt,
            firstMessage: agentData.firstMessage,
            language: agentData.language || 'es',
            temperature: agentData.temperature || 0.7,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["elevenlabs", "agents"] });
        },
    });
};
// Hook para actualizar un agente de ElevenLabs
export const useUpdateElevenLabsAgent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...updateData }) => apiClient.patch(endpoints.integrations.elevenlabs.agents.update(id), updateData),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["elevenlabs", "agents"] });
            queryClient.invalidateQueries({
                queryKey: ["elevenlabs", "agents", variables.id],
            });
        },
    });
};
// Hook para eliminar un agente de ElevenLabs
export const useDeleteElevenLabsAgent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (agentId) => apiClient.delete(endpoints.integrations.elevenlabs.agents.delete(agentId)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["elevenlabs", "agents"] });
        },
    });
};
// Hook para sincronizar agente de ElevenLabs con base de datos local
export const useSyncElevenLabsAgent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => apiClient.post(endpoints.integrations.elevenlabs.agents.sync, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["elevenlabs", "agents"] });
            queryClient.invalidateQueries({ queryKey: ["agents"] });
        },
    });
};
// Hook para obtener voces de ElevenLabs
export const useElevenLabsVoices = (language) => {
    return useQuery({
        queryKey: ["elevenlabs", "voices", language], // Incluir language en el cache key
        queryFn: async () => {
            try {
                const url = endpoints.integrations.elevenlabs.voices;
                const response = await apiClient.get(url);
                console.log(`✅ Voces obtenidas: ${response.length} voces disponibles`);
                // Filtrar voces según el idioma seleccionado
                if (language && language !== "all") {
                    const filteredVoices = response.filter((voice) => {
                        const supportedLanguages = voice.languageCapabilities?.supported || [];
                        const nativeLanguages = voice.languageCapabilities?.native || [];
                        const isMultilingual = voice.languageCapabilities?.multilingual || false;
                        // Si es "multilingual", mostrar solo voces que hablan múltiples idiomas
                        if (language.toLowerCase() === "multilingual") {
                            return isMultilingual;
                        }
                        // Para otros idiomas, verificar tanto en supported como en native
                        const targetLanguage = language.toLowerCase();
                        const isSupported = supportedLanguages.some(lang => lang.toLowerCase() === targetLanguage ||
                            lang.toLowerCase().includes(targetLanguage) ||
                            targetLanguage.includes(lang.toLowerCase()));
                        const isNative = nativeLanguages.some(lang => lang.toLowerCase() === targetLanguage ||
                            lang.toLowerCase().includes(targetLanguage) ||
                            targetLanguage.includes(lang.toLowerCase()));
                        return isSupported || isNative || isMultilingual;
                    });
                    console.log(`🌍 Filtradas ${filteredVoices.length} voces para idioma: ${language}`);
                    if (filteredVoices.length > 0) {
                        return filteredVoices;
                    }
                    // Fallback: Si no se encuentra ninguna voz, devolver todas con advertencia
                    console.warn(`⚠️ No se encontraron voces para ${language}, mostrando todas las voces`);
                    return response;
                }
                // Si no se especifica idioma o es "all", mostrar todas las voces
                console.log(`🌍 Mostrando todas las ${response.length} voces`);
                return response;
            }
            catch (error) {
                console.error(`❌ Error obteniendo voces:`, error);
                // Si hay error de autenticación, significa que la API key no está configurada correctamente
                if (error?.status === 401 || error?.message?.includes("unauthorized")) {
                    console.error("❌ ElevenLabs API key no configurada correctamente. No se cargarán voces.");
                    throw new Error("ElevenLabs API key no configurada correctamente. Las voces no están disponibles.");
                }
                // Para otros errores, también lanzar error
                console.error("❌ Error conectando con ElevenLabs API:", error?.message);
                throw new Error(`Error conectando con ElevenLabs API: ${error?.message || 'Error desconocido'}`);
            }
        },
        retry: 0, // No reintentar si falla
        staleTime: 5 * 60 * 1000, // 5 minutos
        gcTime: 10 * 60 * 1000, // 10 minutos
    });
};
// Funciones helper para manejar las capacidades de idioma
const isNativeForLanguage = (voice, targetLang) => {
    if (!voice.languageCapabilities) {
        return false;
    }
    return voice.languageCapabilities.native.some((lang) => lang.toLowerCase() === targetLang.toLowerCase());
};
const canSpeakLanguage = (voice, targetLang) => {
    console.log(`🔍 Verificando si ${voice.name} puede hablar ${targetLang}:`);
    if (!voice.languageCapabilities) {
        console.log(`❌ No hay languageCapabilities para ${voice.name}`);
        // FALLBACK: Si no hay capacidades, asumir que todas las voces pueden hablar cualquier idioma
        // porque ElevenLabs usa el modelo multilenguaje por defecto
        console.log(`✅ Fallback: Asumiendo que ${voice.name} puede hablar ${targetLang} (modelo multilenguaje)`);
        return true;
    }
    const canSpeak = voice.languageCapabilities.multilingual ||
        voice.languageCapabilities.native.some((lang) => lang.toLowerCase() === targetLang.toLowerCase());
    console.log(`🎯 ${voice.name} puede hablar ${targetLang}: ${canSpeak}`);
    console.log(`   - multilingual: ${voice.languageCapabilities.multilingual}`);
    console.log(`   - native languages: ${voice.languageCapabilities.native.join(", ")}`);
    return canSpeak;
};
// Hook para obtener modelos de ElevenLabs
export const useElevenLabsModels = () => {
    return useQuery({
        queryKey: ["elevenlabs", "models"],
        queryFn: () => apiClient.get(endpoints.integrations.elevenlabs.models),
    });
};
// Hook para iniciar una conversación con un agente
export const useStartConversation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => apiClient.post(endpoints.integrations.elevenlabs.conversations.start, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["elevenlabs", "conversations"],
            });
        },
    });
};
// Hook para obtener conversaciones recientes
export const useRecentConversations = (limit = 10) => {
    return useQuery({
        queryKey: ["elevenlabs", "conversations", "recent", limit],
        queryFn: () => apiClient.get(`${endpoints.integrations.elevenlabs.conversations.recent}?limit=${limit}`),
    });
};
// Hook para obtener analíticas
export const useElevenLabsAnalytics = (agentId, dateRange) => {
    const queryParams = new URLSearchParams();
    if (agentId)
        queryParams.append("agentId", agentId);
    if (dateRange) {
        queryParams.append("from", dateRange.from);
        queryParams.append("to", dateRange.to);
    }
    return useQuery({
        queryKey: ["elevenlabs", "analytics", agentId, dateRange],
        queryFn: () => {
            const url = queryParams.toString()
                ? `${endpoints.integrations.elevenlabs.analytics}?${queryParams.toString()}`
                : endpoints.integrations.elevenlabs.analytics;
            return apiClient.get(url);
        },
    });
};
// Hook para obtener uso de ElevenLabs por cliente
export const useElevenLabsUsage = (accountId, period) => {
    return useQuery({
        queryKey: ["elevenlabs", "usage", accountId, period],
        queryFn: () => {
            const url = period
                ? `${endpoints.integrations.elevenlabs.usage}?accountId=${accountId}&period=${period}`
                : `${endpoints.integrations.elevenlabs.usage}?accountId=${accountId}`;
            return apiClient.get(url);
        },
        enabled: !!accountId,
    });
};
// Hook para health check de ElevenLabs
export const useElevenLabsHealth = () => {
    return useQuery({
        queryKey: ["elevenlabs", "health"],
        queryFn: () => apiClient.get(endpoints.integrations.elevenlabs.health),
        refetchInterval: 60000, // Refetch cada minuto
    });
};
// Hook para hacer llamadas outbound usando ElevenLabs + Twilio
export const useElevenLabsOutboundCall = () => {
    return useMutation({
        mutationFn: async (data) => {
            console.log(`📞 Iniciando llamada outbound: Agente ${data.agentId} -> ${data.toNumber}`);
            const response = await apiClient.post("/integrations/elevenlabs/twilio/outbound-call", data);
            console.log(`✅ Llamada outbound iniciada exitosamente:`, response);
            // Si el backend indica que la operación no fue exitosa, lanzar un error
            // para que react-query lo trate como un `onError`.
            if (!response.success) {
                throw new Error(response.message || "The call could not be initiated.");
            }
            return response;
        },
        onSuccess: (data) => {
            console.log("✅ Llamada outbound exitosa:", data);
        },
        onError: (error) => {
            console.error("❌ Error haciendo llamada outbound:", error);
            console.log("🔧 Llamadas outbound no disponibles en desarrollo. Configura el webhook en producción para habilitar esta funcionalidad.");
            // No mostrar notificación de error al usuario
        },
    });
};
// Hook para crear tests de agentes
export const useCreateAgentTest = () => {
    return useMutation({
        mutationFn: async (testData) => {
            const response = await apiClient.post("/integrations/elevenlabs/testing/create-test", testData);
            return response;
        },
        onSuccess: (data) => {
            console.log("Test de agente creado exitosamente:", data);
        },
        onError: (error) => {
            console.error("Error creando test de agente:", error);
        },
    });
};
// Hook para ejecutar tests en agentes
export const useRunAgentTests = () => {
    return useMutation({
        mutationFn: async (data) => {
            const response = await apiClient.post(`/integrations/elevenlabs/testing/run-tests/${data.agentId}`, {
                tests: data.tests,
                agent_config_override: data.agent_config_override,
            });
            return response;
        },
        onSuccess: (data) => {
            console.log("Tests ejecutados exitosamente:", data);
        },
        onError: (error) => {
            console.error("Error ejecutando tests en agente:", error);
        },
    });
};
// Hook para obtener el link de compartir de un agente
// Hook para obtener URL firmada para un agente
export const useGetAgentSignedUrl = () => {
    return useMutation({
        mutationFn: ({ agentId, includeConversationId = false, }) => {
            const params = new URLSearchParams();
            if (includeConversationId) {
                params.append('include_conversation_id', 'true');
            }
            return apiClient.get(`${endpoints.integrations.elevenlabs.agents.get(agentId)}/signed-url${params.toString() ? `?${params.toString()}` : ''}`);
        },
    });
};
// Hook para obtener token WebRTC para un agente
export const useGetAgentWebRTCToken = () => {
    return useMutation({
        mutationFn: ({ agentId, participantName, }) => {
            const params = new URLSearchParams();
            if (participantName) {
                params.append('participant_name', participantName);
            }
            return apiClient.get(`${endpoints.integrations.elevenlabs.agents.get(agentId)}/webrtc-token${params.toString() ? `?${params.toString()}` : ''}`);
        },
    });
};
// Hook legacy para compatibilidad (mantener por si se usa en algún lugar)
export const useGetAgentLink = () => {
    return useMutation({
        mutationFn: (agentId) => apiClient.get(endpoints.integrations.elevenlabs.agents.getLink(agentId)),
    });
};
// Hook para obtener configuración del widget de un agente
export const useGetAgentWidget = () => {
    return useMutation({
        mutationFn: ({ agentId, conversationSignature, }) => {
            const params = new URLSearchParams();
            if (conversationSignature) {
                params.append('conversation_signature', conversationSignature);
            }
            return apiClient.get(`${endpoints.integrations.elevenlabs.agents.get(agentId)}/widget${params.toString() ? `?${params.toString()}` : ''}`);
        },
    });
};
// Hook para subir avatar del widget de un agente
export const useUploadAgentAvatar = () => {
    return useMutation({
        mutationFn: ({ agentId, avatarFile, }) => {
            const formData = new FormData();
            formData.append('avatar_file', avatarFile);
            return apiClient.upload(`${endpoints.integrations.elevenlabs.agents.get(agentId)}/avatar`, formData);
        },
    });
};
// Hook para simular una conversación con un agente
export const useSimulateConversation = () => {
    return useMutation({
        mutationFn: ({ agentId, data, }) => apiClient.post(endpoints.integrations.elevenlabs.agents.simulateConversation(agentId), data),
    });
};
// Hook para calcular el uso esperado de LLM de un agente
export const useCalculateLLMUsage = () => {
    return useMutation({
        mutationFn: ({ agentId, data, }) => apiClient.post(endpoints.integrations.elevenlabs.agents.calculateLLMUsage(agentId), data),
    });
};
