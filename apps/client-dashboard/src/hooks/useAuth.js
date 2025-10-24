import { useEffect, useRef, useState } from "react";
import { apiClient, endpoints } from "../lib/api";
// Variable global para evitar múltiples verificaciones simultáneas
let authCheckInProgress = false;
// Estado global simple para evitar problemas con Zustand
let globalUser = null;
let globalListeners = [];
let globalIsAuthenticated = false;
const notifyListeners = () => {
    globalListeners.forEach((listener) => listener());
};
// Función para restaurar el estado desde localStorage
const restoreAuthState = () => {
    const token = localStorage.getItem("auth_token");
    const accountId = localStorage.getItem("accountId");
    const userData = localStorage.getItem("user_data");
    if (token && accountId && userData) {
        try {
            const user = JSON.parse(userData);
            globalUser = user;
            globalIsAuthenticated = true;
            return true;
        }
        catch (error) {
            console.error("Error parsing user data:", error);
            localStorage.removeItem("user_data");
        }
    }
    return false;
};
// Restaurar estado al cargar el módulo
restoreAuthState();
export const useAuth = () => {
    const [user, setUserState] = useState(globalUser);
    const [isLoading, setIsLoading] = useState(!globalIsAuthenticated);
    const [isLoginInProgress, setIsLoginInProgress] = useState(false);
    const hasCheckedAuth = useRef(false);
    const isInitialized = useRef(false);
    const isAuthenticated = !!user;
    // Suscribirse a cambios globales
    useEffect(() => {
        const listener = () => {
            setUserState(globalUser);
        };
        globalListeners.push(listener);
        return () => {
            globalListeners = globalListeners.filter((l) => l !== listener);
        };
    }, []);
    const setUser = (newUser) => {
        globalUser = newUser;
        globalIsAuthenticated = !!newUser;
        setUserState(newUser);
        // Guardar datos del usuario en localStorage
        if (newUser) {
            localStorage.setItem("user_data", JSON.stringify(newUser));
        }
        else {
            localStorage.removeItem("user_data");
        }
        notifyListeners();
    };
    const addNotification = (notification) => {
        console.log("Notification:", notification);
        // Implementar sistema de notificaciones simple si es necesario
    };
    useEffect(() => {
        // Evitar múltiples verificaciones simultáneas
        if (hasCheckedAuth.current ||
            authCheckInProgress ||
            isInitialized.current) {
            setIsLoading(false);
            return;
        }
        // Si ya tenemos un usuario autenticado, no verificar nuevamente
        if (globalUser && globalIsAuthenticated) {
            setIsLoading(false);
            isInitialized.current = true;
            return;
        }
        // Marcar como inicializado para evitar ejecuciones futuras
        isInitialized.current = true;
        const checkAuth = async () => {
            if (import.meta.env.MODE === "development") {
                console.log("🚀 Iniciando verificación de autenticación...");
            }
            authCheckInProgress = true;
            hasCheckedAuth.current = true;
            try {
                const token = localStorage.getItem("auth_token");
                const accountId = localStorage.getItem("accountId");
                if (import.meta.env.MODE === "development") {
                    console.log("📋 Credenciales encontradas:", {
                        hasToken: !!token,
                        hasAccountId: !!accountId,
                        tokenPreview: token ? token.substring(0, 20) + "..." : "null",
                    });
                }
                if (token && accountId) {
                    // Configurar el cliente API con token y accountId
                    apiClient.setAuthToken(token);
                    apiClient.setAccountId(accountId);
                    if (import.meta.env.MODE === "development") {
                        console.log("🔐 Configurando cliente API con credenciales...");
                    }
                    // Si ya tenemos datos del usuario en localStorage, usarlos primero
                    const userData = localStorage.getItem("user_data");
                    if (userData) {
                        try {
                            const user = JSON.parse(userData);
                            if (import.meta.env.MODE === "development") {
                                console.log("📋 Usando datos de usuario del localStorage:", user);
                            }
                            setUser(user);
                        }
                        catch (error) {
                            console.error("Error parsing user data:", error);
                        }
                    }
                    // Verificar el perfil del usuario en segundo plano (solo si no tenemos datos del usuario)
                    if (!userData) {
                        try {
                            if (import.meta.env.MODE === "development") {
                                console.log("📡 Verificando perfil en segundo plano...");
                            }
                            // Configurar el token en el cliente API antes de hacer la petición
                            apiClient.setAuthToken(token);
                            apiClient.setAccountId(accountId);
                            const response = await apiClient.get(endpoints.auth.profile);
                            if (import.meta.env.MODE === "development") {
                                console.log("✅ Perfil verificado exitosamente:", response.user);
                            }
                            setUser(response.user);
                        }
                        catch (error) {
                            if (import.meta.env.MODE === "development") {
                                console.log("⚠️ Error verificando perfil, pero manteniendo sesión local");
                            }
                            // No limpiar credenciales en caso de error de verificación
                            // Solo mantener la sesión local
                        }
                    }
                    else {
                        if (import.meta.env.MODE === "development") {
                            console.log("📋 Usando datos de usuario del localStorage, saltando verificación de perfil");
                        }
                    }
                }
                else {
                    if (import.meta.env.MODE === "development") {
                        console.log("🧹 Limpiando credenciales faltantes...");
                    }
                    // Limpiar datos si no hay token o accountId
                    localStorage.removeItem("auth_token");
                    localStorage.removeItem("accountId");
                    localStorage.removeItem("user_data");
                    apiClient.clearAuthToken();
                    apiClient.clearAccountId();
                    setUser(null);
                }
            }
            catch (error) {
                console.error("❌ Auth check failed:", error);
                // Solo limpiar si es un error de autenticación (401, 403), no errores de red
                if (error && typeof error === "object" && "status" in error) {
                    const status = error.status;
                    if (status === 401 || status === 403) {
                        // Verificar si el error es específicamente del endpoint de perfil
                        const isProfileEndpoint = error.endpoint?.includes("/auth/profile");
                        if (isProfileEndpoint) {
                            console.log("🧹 Error de autenticación en perfil - limpiando credenciales");
                            localStorage.removeItem("auth_token");
                            localStorage.removeItem("accountId");
                            localStorage.removeItem("user_data");
                            apiClient.clearAuthToken();
                            apiClient.clearAccountId();
                            setUser(null);
                        }
                        else {
                            console.log("⚠️ Error 401/403 en endpoint no crítico - manteniendo credenciales temporalmente");
                            // No limpiar credenciales para errores en endpoints no críticos
                            // Esto evita redirecciones innecesarias
                        }
                    }
                    else {
                        console.log("🌐 Error de red - manteniendo credenciales");
                        // Mantener las credenciales si es un error de red
                    }
                }
                else {
                    console.log("🌐 Error de red o desconocido - manteniendo credenciales");
                    // Mantener las credenciales para errores de red
                }
            }
            finally {
                if (import.meta.env.MODE === "development") {
                    console.log("🏁 Verificación de autenticación completada");
                }
                setIsLoading(false);
                authCheckInProgress = false;
            }
        };
        checkAuth();
    }, []); // Solo ejecutar una vez al montar el componente
    const login = async (email, password) => {
        if (import.meta.env.MODE === "development") {
            console.log("🔐 Iniciando proceso de login para:", email);
        }
        // Prevenir múltiples intentos de login simultáneos
        if (isLoginInProgress) {
            if (import.meta.env.MODE === "development") {
                console.log("⏭️ Login already in progress, skipping...");
            }
            return;
        }
        try {
            if (import.meta.env.MODE === "development") {
                console.log("🚀 Configurando estado de login...");
            }
            setIsLoginInProgress(true);
            setIsLoading(true);
            // Limpiar tokens existentes antes del login
            if (import.meta.env.MODE === "development") {
                console.log("🧹 Limpiando tokens existentes...");
            }
            localStorage.removeItem("auth_token");
            localStorage.removeItem("accountId");
            localStorage.removeItem("user_data");
            apiClient.clearAuthToken();
            apiClient.clearAccountId();
            if (import.meta.env.MODE === "development") {
                console.log("📡 Enviando solicitud de login...");
            }
            const response = await apiClient.post(endpoints.auth.login, { email, password }, { timeout: 30000 }); // 30 segundos para login
            if (import.meta.env.MODE === "development") {
                console.log("✅ Login response recibida:", {
                    hasAccessToken: !!response.access_token,
                    hasUser: !!response.user,
                    userEmail: response.user?.email,
                });
            }
            // Guardar token y accountId en localStorage
            if (import.meta.env.MODE === "development") {
                console.log("💾 Guardando credenciales en localStorage...");
            }
            localStorage.setItem("auth_token", response.access_token);
            localStorage.setItem("accountId", response.user.account.id);
            // Configurar el cliente API
            if (import.meta.env.MODE === "development") {
                console.log("⚙️ Configurando cliente API...");
            }
            apiClient.setAuthToken(response.access_token);
            apiClient.setAccountId(response.user.account.id);
            // Establecer usuario en el estado global
            if (import.meta.env.MODE === "development") {
                console.log("👤 Estableciendo usuario en estado global...");
            }
            setUser(response.user);
            if (import.meta.env.MODE === "development") {
                console.log("🎉 Login completado exitosamente");
                console.log("🔍 Estado de autenticación:", {
                    isAuthenticated: !!response.user,
                    userRole: response.user.role,
                    accountId: response.user.account.id,
                });
            }
            addNotification({
                type: "success",
                title: "Login Exitoso",
                message: `Bienvenido, ${response.user.firstName} ${response.user.lastName}`,
            });
        }
        catch (error) {
            console.error("❌ Login failed:", error);
            addNotification({
                type: "error",
                title: "Error de Login",
                message: error.message || "Credenciales inválidas",
            });
            throw error;
        }
        finally {
            if (import.meta.env.MODE === "development") {
                console.log("🏁 Finalizando proceso de login");
            }
            setIsLoading(false);
            setIsLoginInProgress(false);
        }
    };
    const logout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("accountId");
        localStorage.removeItem("user_data");
        apiClient.clearAuthToken();
        apiClient.clearAccountId();
        globalUser = null;
        globalIsAuthenticated = false;
        notifyListeners();
        // addNotification({ // Re-implement if needed
        //   type: "info",
        //   title: "Sesión Cerrada",
        //   message: "Has cerrado sesión exitosamente",
        // });
    };
    const refreshToken = async () => {
        try {
            const response = await apiClient.post(endpoints.auth.refresh);
            localStorage.setItem("auth_token", response.access_token);
            localStorage.setItem("accountId", response.user.account.id);
            apiClient.setAuthToken(response.access_token);
            apiClient.setAccountId(response.user.account.id);
            globalUser = response.user;
            notifyListeners();
        }
        catch (error) {
            console.error("Token refresh failed:", error);
            logout();
        }
    };
    return {
        user,
        isLoading,
        isLoginInProgress,
        isAuthenticated,
        login,
        logout,
        refreshToken,
    };
};
