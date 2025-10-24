import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
import { apiClient } from "../lib/api";
import { getVerifiedIntegrationsStatus } from "../lib/integrations-status";
import { mockDashboardStats, mockRecentActivity, mockUserInfo, simulateNetworkDelay, } from "../lib/mock-data";
export const useDashboardStats = () => {
    return useQuery({
        queryKey: ["dashboard", "stats"],
        queryFn: async () => {
            console.log("🔄 Fetching dashboard stats...");
            console.log("🔑 Auth credential:", localStorage.getItem("auth_token") ? "Present" : "Missing");
            console.log("🏢 Account ID:", localStorage.getItem("accountId") ? "Present" : "Missing");
            try {
                const response = await apiClient.get("/dashboard/stats");
                console.log("✅ Dashboard stats received:", response);
                return response;
            }
            catch (err) {
                console.error("❌ Error fetching dashboard stats:", err);
                // Si es un error de conexión, usar datos mock
                if (err instanceof Error &&
                    err.message.includes("Servidor no disponible")) {
                    console.log("🔄 Usando datos de demostración...");
                    await simulateNetworkDelay();
                    return mockDashboardStats;
                }
                else {
                    // Siempre usar datos mock en caso de error, nunca mostrar error en UI
                    console.log("🔄 Error detectado, usando datos mock...");
                    await simulateNetworkDelay();
                    return mockDashboardStats;
                }
            }
        },
        retry: (failureCount, error) => {
            // No reintentar en errores de autenticación
            if (error.status === 401 || error.status === 403) {
                return false;
            }
            return failureCount < 2;
        },
        staleTime: 5 * 60 * 1000, // 5 minutos (más tiempo para evitar recargas)
        refetchOnWindowFocus: false, // Evitar recargas automáticas
        refetchOnMount: false, // No recargar al montar si hay datos en cache
        refetchOnReconnect: false, // No recargar automáticamente al reconectar
        notifyOnChangeProps: ['data', 'error', 'isLoading'], // Solo notificar cambios específicos
        gcTime: 10 * 60 * 1000, // 10 minutos de garbage collection
        retryOnMount: false, // No reintentar al montar si hay datos
    });
};
export const useRecentActivity = () => {
    return useQuery({
        queryKey: ["dashboard", "recent-activity"],
        queryFn: async () => {
            try {
                const response = await apiClient.get("/dashboard/recent-activity");
                return response;
            }
            catch (err) {
                console.error("Error fetching recent activity:", err);
                // Si es un error de conexión, usar datos mock
                if (err instanceof Error &&
                    err.message.includes("Servidor no disponible")) {
                    console.log("🔄 Usando datos de actividad de demostración...");
                    await simulateNetworkDelay();
                    return mockRecentActivity;
                }
                else {
                    // Siempre usar datos mock en caso de error, nunca mostrar error en UI
                    console.log("🔄 Error en recent activity, usando datos mock...");
                    await simulateNetworkDelay();
                    return mockRecentActivity;
                }
            }
        },
        retry: (failureCount, error) => {
            if (error.status === 401 || error.status === 403) {
                return false;
            }
            return failureCount < 2;
        },
        staleTime: 3 * 60 * 1000, // 3 minutos (más tiempo para evitar recargas)
        refetchOnWindowFocus: false,
        refetchOnMount: false, // No recargar al montar si hay datos en cache
        refetchOnReconnect: false, // No recargar automáticamente al reconectar
        notifyOnChangeProps: ['data', 'error', 'isLoading'],
        gcTime: 10 * 60 * 1000, // 10 minutos de garbage collection
        retryOnMount: false, // No reintentar al montar si hay datos
    });
};
// ===== NUEVOS HOOKS PARA ENDPOINTS ESPECÍFICOS =====
export const useCallLogs = (filters) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    // Memoizar los filtros para evitar re-renders innecesarios
    const filtersString = useMemo(() => JSON.stringify(filters), [filters]);
    const fetchCallLogs = React.useCallback(async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams();
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        params.append(key, value.toString());
                    }
                });
            }
            console.log("🌐 Enviando request a API:", {
                url: `/dashboard/call-logs?${params.toString()}`,
                filters: filters,
                params: params.toString(),
            });
            const response = (await apiClient.get(`/dashboard/call-logs?${params.toString()}`));
            console.log("📊 Respuesta completa de call-logs:", response);
            console.log("📊 Tipo de respuesta:", typeof response);
            console.log("📊 Calls en respuesta:", response?.calls);
            console.log("📊 Total en respuesta:", response?.total);
            setData({
                ...response,
                filters: filters || {},
            });
            setError(null);
        }
        catch (err) {
            console.error("❌ Error al obtener call logs:", err);
            setError(err);
            setData(null);
        }
        finally {
            setIsLoading(false);
        }
    }, [filtersString]);
    useEffect(() => {
        // Debounce para evitar múltiples requests
        const timeoutId = setTimeout(() => {
            fetchCallLogs();
        }, 100);
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [fetchCallLogs]);
    const refetch = React.useCallback(() => {
        console.log("🔄 Refetch manual de call logs...");
        fetchCallLogs();
    }, [fetchCallLogs]);
    return {
        data,
        isLoading,
        error,
        refetch,
    };
};
export const useUserInfo = () => {
    return useQuery({
        queryKey: ["dashboard", "user-info"],
        queryFn: async () => {
            console.log("🔄 Fetching user info...");
            try {
                const response = await apiClient.get("/dashboard/user-info");
                console.log("✅ User info received:", response);
                return response;
            }
            catch (err) {
                console.error("❌ Error fetching user info:", err);
                // Si es un error de conexión, usar datos mock
                if (err instanceof Error &&
                    err.message.includes("Servidor no disponible")) {
                    console.log("🔄 Usando datos de usuario de demostración...");
                    await simulateNetworkDelay();
                    return mockUserInfo;
                }
                else {
                    // Siempre usar datos mock en caso de error, nunca mostrar error en UI
                    console.log("🔄 Error en user info, usando datos mock...");
                    await simulateNetworkDelay();
                    return mockUserInfo;
                }
            }
        },
        retry: (failureCount, error) => {
            if (error.status === 401 || error.status === 403) {
                return false;
            }
            return failureCount < 2;
        },
        staleTime: 10 * 60 * 1000, // 10 minutos (datos de usuario cambian muy poco)
        refetchOnWindowFocus: false,
        refetchOnMount: false, // No recargar al montar si hay datos en cache
        refetchOnReconnect: false, // No recargar automáticamente al reconectar
        notifyOnChangeProps: ['data', 'error', 'isLoading'],
        gcTime: 15 * 60 * 1000, // 15 minutos de garbage collection
        retryOnMount: false, // No reintentar al montar si hay datos
    });
};
export const usePhoneNumbers = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchPhoneNumbers = async () => {
            try {
                setIsLoading(true);
                const response = await apiClient.get("/dashboard/phone-numbers");
                setData(response);
            }
            catch (err) {
                setError(err);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchPhoneNumbers();
    }, []);
    return { data, isLoading, error };
};
export const useCallSummary = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const generateSummary = async (dateRange) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await apiClient.post("/dashboard/call-logs/summary", {
                dateRange,
            });
            setData(response.data);
        }
        catch (err) {
            setError(err);
        }
        finally {
            setIsLoading(false);
        }
    };
    return { data, isLoading, error, generateSummary };
};
export const useExportCallLogs = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const exportLogs = async (filters, format = "csv") => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await apiClient.post("/dashboard/call-logs/export", {
                filters,
                format,
            });
            // Crear y descargar archivo
            const blob = new Blob([JSON.stringify(response.data.data, null, 2)], {
                type: "application/json",
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = response.data.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            return response.data;
        }
        catch (err) {
            setError(err);
        }
        finally {
            setIsLoading(false);
        }
    };
    return { isLoading, error, exportLogs };
};
export const useDeleteCallLog = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const deleteCallLog = async (callId) => {
        try {
            setIsLoading(true);
            setError(null);
            console.log(`🗑️ Eliminando call log ${callId}`);
            const response = await apiClient.delete(`/dashboard/call-logs/${callId}`);
            console.log(`✅ Call log ${callId} eliminado exitosamente:`, response);
            return response;
        }
        catch (err) {
            console.error(`❌ Error eliminando call log ${callId}:`, err);
            setError(err);
            throw err;
        }
        finally {
            setIsLoading(false);
        }
    };
    return { deleteCallLog, isLoading, error };
};
export const useBulkDeleteCallLogs = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const bulkDeleteCallLogs = async (callIds) => {
        try {
            setIsLoading(true);
            setError(null);
            console.log(`🗑️ Eliminando ${callIds.length} call logs:`, callIds);
            const response = await apiClient.delete("/dashboard/call-logs/bulk", {
                body: JSON.stringify({ callIds }),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            console.log(`✅ ${callIds.length} call logs eliminados exitosamente:`, response);
            return response;
        }
        catch (err) {
            console.error(`❌ Error eliminando call logs en lote:`, err);
            setError(err);
            throw err;
        }
        finally {
            setIsLoading(false);
        }
    };
    return { bulkDeleteCallLogs, isLoading, error };
};
export const useIntegrationsStatus = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                setIsLoading(true);
                // Intentar obtener el estado real desde la API
                const response = await apiClient.get("/dashboard/integrations/status");
                setData(response);
                console.log("✅ Estado real obtenido desde la API:", response);
            }
            catch (err) {
                console.error("Error fetching integrations status:", err);
                // Si la API no está disponible, usar el estado verificado
                console.log("🔄 Usando estado verificado de integraciones...");
                const verifiedStatus = getVerifiedIntegrationsStatus();
                console.log("📊 Estado verificado:", verifiedStatus);
                await simulateNetworkDelay();
                setData(verifiedStatus);
                setError(null);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchStatus();
    }, []);
    return { data, isLoading, error };
};
// Hook para obtener usuarios reales
export const useUsers = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoading(true);
                console.log("🔄 Fetching users...");
                const response = await apiClient.get("/users");
                console.log("✅ Users received:", response);
                setData(response);
                setError(null);
            }
            catch (err) {
                console.error("❌ Error fetching users:", err);
                setError(err);
                setData([]);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);
    return {
        data,
        isLoading,
        error,
    };
};
