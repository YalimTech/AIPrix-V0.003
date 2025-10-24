// API configuration and utilities - Configuración dinámica basada en .env
// Usar las variables de entorno del .env para determinar la configuración
const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3004/api/v1"
    : import.meta.env.VITE_APP_URL
      ? `${import.meta.env.VITE_APP_URL}/api/v1`
      : `https://agent.prixcenter.com/api/v1`;

// Debug: Log the API configuration
console.log("🔧 Frontend API Configuration (from .env):");
console.log("  - MODE:", import.meta.env.MODE);
console.log("  - VITE_APP_URL:", import.meta.env.VITE_APP_URL);
console.log("  - VITE_API_PROTOCOL:", import.meta.env.VITE_API_PROTOCOL);
console.log("  - VITE_API_HOST:", import.meta.env.VITE_API_HOST);
console.log("  - VITE_API_PORT:", import.meta.env.VITE_API_PORT);
console.log("  - API_BASE_URL:", API_BASE_URL);

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos - timeout estándar
  headers: {
    "Content-Type": "application/json",
  },
};

// API endpoints
export const endpoints = {
  // Auth
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    profile: "/auth/profile",
  },

  // Agents
  agents: {
    list: "/agents",
    create: "/agents",
    get: (id: string) => `/agents/${id}`,
    update: (id: string) => `/agents/${id}`,
    delete: (id: string) => `/agents/${id}`,
    duplicate: (id: string) => `/agents/${id}/duplicate`,
    syncElevenLabs: "/agents/sync-elevenlabs",
    importElevenLabs: "/agents/import-elevenlabs",
    diagnostics: "/agents/diagnostics",
    assignFolder: (id: string) => `/agents/${id}/assign-folder`,
    moveToFolder: "/agents/move-to-folder",
  },

  // Folders
  folders: {
    list: "/folders",
    create: "/folders",
    get: (id: string) => `/folders/${id}`,
    update: (id: string) => `/folders/${id}`,
    delete: (id: string) => `/folders/${id}`,
    assignAgent: (agentId: string) => `/folders/assign-agent/${agentId}`,
    moveAgents: "/folders/move-agents",
    stats: "/folders/stats/overview",
  },

  // Campaigns
  campaigns: {
    list: "/campaigns",
    create: "/campaigns",
    update: (id: string) => `/campaigns/${id}`,
    delete: (id: string) => `/campaigns/${id}`,
    stats: "/campaigns/stats",
  },

  // Contacts
  contacts: {
    list: "/contacts",
    create: "/contacts",
    update: (id: string) => `/contacts/${id}`,
    delete: (id: string) => `/contacts/${id}`,
    import: "/contacts/import",
    export: "/contacts/export",
  },

  // Calls
  calls: {
    list: "/calls",
    create: "/calls/outbound",
    update: (id: string) => `/calls/${id}`,
    delete: (id: string) => `/calls/${id}`,
    logs: "/calls/logs",
    recordings: (id: string) => `/calls/${id}/recording`,
  },

  // Phone Numbers
  phoneNumbers: {
    list: "/phone-numbers",
    buy: "/phone-numbers/buy",
    available: "/phone-numbers/available",
    assign: (id: string) => `/phone-numbers/${id}/assign`,
    delete: (id: string) => `/phone-numbers/${id}`,
  },

  // Knowledge Base
  knowledge: {
    list: "/knowledge",
    create: "/knowledge",
    update: (id: string) => `/knowledge/${id}`,
    delete: (id: string) => `/knowledge/${id}`,
    search: "/knowledge/search",
  },

  // LLM
  llm: {
    generate: "/llm/generate",
    models: "/llm/models",
  },

  // Dashboard
  dashboard: {
    stats: "/dashboard/stats",
    recentActivity: "/dashboard/recent-activity",
    alerts: "/dashboard/alerts",
    integrationsStatus: "/dashboard/integrations/status",
  },

  // Billing
  billing: {
    balance: "/billing/balance",
    history: "/billing/history",
    paymentMethods: "/billing/payment-methods",
    addFunds: "/billing/add-funds",
    autoRefill: "/billing/auto-refill",
  },

  // Integrations
  integrations: {
    twilio: {
      config: "/phone-numbers/twilio-credentials",
      validate: "/integrations/twilio/validate",
    },
    elevenlabs: {
      voices: "/integrations/elevenlabs/voices",
      voiceClone: "/integrations/elevenlabs/voice-clone",
      agents: {
        list: "/integrations/elevenlabs/agents",
        create: "/integrations/elevenlabs/agents",
        get: (id: string) => `/integrations/elevenlabs/agents/${id}`,
        update: (id: string) => `/integrations/elevenlabs/agents/${id}`,
        delete: (id: string) => `/integrations/elevenlabs/agents/${id}`,
        sync: "/integrations/elevenlabs/agents/sync-with-database",
        getLink: (id: string) => `/integrations/elevenlabs/agents/${id}/link`,
        simulateConversation: (id: string) =>
          `/integrations/elevenlabs/agents/${id}/simulate-conversation`,
        simulateConversationStream: (id: string) =>
          `/integrations/elevenlabs/agents/${id}/simulate-conversation/stream`,
        calculateLLMUsage: (id: string) =>
          `/integrations/elevenlabs/agents/${id}/llm-usage/calculate`,
      },
      conversations: {
        start: "/integrations/elevenlabs/conversations",
        recent: "/integrations/elevenlabs/conversations/recent",
      },
      analytics: "/integrations/elevenlabs/analytics",
      usage: "/integrations/elevenlabs/usage",
      models: "/integrations/elevenlabs/models",
      health: "/integrations/elevenlabs/health",
    },
  },

  // Webhooks
  webhooks: {
    list: "/webhooks",
    create: "/webhooks",
    update: (id: string) => `/webhooks/${id}`,
    delete: (id: string) => `/webhooks/${id}`,
    test: (id: string) => `/webhooks/${id}/test`,
  },

  // Settings
  settings: {
    profile: "/settings/profile",
    notifications: "/settings/notifications",
    security: "/settings/security",
  },
};

interface ApiError {
  message: string;
  status: number;
  code?: string;
  endpoint?: string;
}

// API client class
export class ApiClient {
  private baseURL: string;
  private timeout: number;
  private headers: Record<string, string>;

  constructor(config = apiConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout;
    this.headers = { ...config.headers };
    if (import.meta.env.MODE === "development") {
      console.log("API Client initialized with baseURL:", this.baseURL);
    }
  }

  setAuthToken(token: string) {
    this.headers["Authorization"] = `Bearer ${token}`;
  }

  clearAuthToken() {
    delete this.headers["Authorization"];
  }

  setAccountId(accountId: string) {
    this.headers["X-Account-ID"] = accountId;
  }

  clearAccountId() {
    delete this.headers["X-Account-ID"];
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit & { timeout?: number } = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    // Aumentar timeout para login específicamente
    const timeout = endpoint.includes('/auth/login') ? 60000 : (options.timeout || this.timeout);

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers,
      },
    };

    // Add authentication token from localStorage if not already set
    if (
      !config.headers ||
      !(config.headers as Record<string, string>)["Authorization"]
    ) {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    // Add account ID from localStorage if not already set
    if (
      !config.headers ||
      !(config.headers as Record<string, string>)["X-Account-ID"]
    ) {
      const accountId = localStorage.getItem("accountId");
      if (accountId) {
        config.headers = {
          ...config.headers,
          "X-Account-ID": accountId,
        };
      } else {
        // Si no hay accountId, no hacer la llamada para endpoints que lo requieren
        const requiresAccountId =
          endpoint.includes("/contacts") ||
          endpoint.includes("/agents") ||
          endpoint.includes("/campaigns") ||
          endpoint.includes("/calls") ||
          endpoint.includes("/phone-numbers") ||
          endpoint.includes("/dashboard") ||
          endpoint.includes("/billing") ||
          endpoint.includes("/folders");

        if (requiresAccountId) {
          const apiError: ApiError = {
            message: "Usuario no autenticado. Por favor, inicia sesión.",
            status: 401,
            code: "NOT_AUTHENTICATED",
          };
          throw apiError;
        }
      }
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn(`⏰ Request timeout after ${timeout}ms for ${endpoint}`);
        controller.abort();
      }, timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
        // Asegurar que las requests no se cancelen prematuramente
        keepalive: true,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const apiError: ApiError = {
          message:
            errorData.message || `HTTP error! status: ${response.status}`,
          status: response.status,
          code: errorData.code,
          endpoint: endpoint, // Incluir el endpoint para mejor debugging
        };

        // Manejar errores 401 específicamente
        if (response.status === 401 || response.status === 403) {
          // Solo redirigir si el error de autenticación ocurre en endpoints críticos de sesión
          const isSessionEndpoint =
            endpoint.includes("/auth/profile") ||
            endpoint.includes("/auth/refresh");

          if (isSessionEndpoint) {
            // Limpiar tokens expirados
            localStorage.removeItem("auth_token");
            localStorage.removeItem("accountId");
            this.clearAuthToken();
            this.clearAccountId();

            // Redirigir al login si no estamos ya ahí usando React Router
            if (
              window.location.pathname !== "/" &&
              !window.location.pathname.includes("login")
            ) {
              // Usar React Router en lugar de recarga completa
              // window.location.href = "/";
              // La redirección se manejará por el ProtectedRoute
            }
          }
        }

        throw apiError;
      }

      // El frontend pasa una opción `responseType` para manejar tipos de datos no JSON.
      // Esto es similar a como funciona Axios.
      if ((options as any).responseType === "arraybuffer") {
        return (await response.arrayBuffer()) as T;
      }

      if ((options as any).responseType === "blob") {
        return (await response.blob()) as T;
      }

      // Manejar respuestas JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      } else {
        return {} as T;
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.error(`❌ Request timeout for ${endpoint} after ${timeout}ms`);
        throw new Error(`Request timeout after ${timeout}ms`);
      }

      // Manejar errores de conexión específicamente
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        console.warn("🔌 Backend no disponible - usando modo offline");
        // Lanzar un error específico para conexión
        const connectionError: ApiError = {
          message: "Servidor no disponible. Modo offline activado.",
          status: 0,
          code: "CONNECTION_ERROR",
        };
        throw connectionError;
      }

      console.error("API request failed:", error);
      throw error;
    }
  }

  async get<T>(
    endpoint: string,
    options?: RequestInit & { timeout?: number },
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", ...options });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit & { timeout?: number },
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit & { timeout?: number },
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit & { timeout?: number },
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async delete<T>(
    endpoint: string,
    options?: RequestInit & { timeout?: number },
  ): Promise<T> {
    const requestOptions: RequestInit = {
      method: "DELETE",
      ...options,
    };

    // Si hay un body, stringifylo y agregar Content-Type
    if (options?.body) {
      requestOptions.body =
        typeof options.body === "string"
          ? options.body
          : JSON.stringify(options.body);
      requestOptions.headers = {
        "Content-Type": "application/json",
        ...options?.headers,
      };
    }

    return this.request<T>(endpoint, requestOptions);
  }

  async upload<T>(
    endpoint: string,
    formData: FormData,
    options?: RequestInit,
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      method: "POST",
      body: formData,
      ...options,
    };

    // Add authentication token from localStorage if not already set
    if (
      !config.headers ||
      !(config.headers as Record<string, string>)["Authorization"]
    ) {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    // Add account ID from localStorage if not already set
    if (
      !config.headers ||
      !(config.headers as Record<string, string>)["X-Account-ID"]
    ) {
      const accountId = localStorage.getItem("accountId");
      if (accountId) {
        config.headers = {
          ...config.headers,
          "X-Account-ID": accountId,
        };
      } else {
        // Si no hay accountId, no hacer la llamada para endpoints que lo requieren
        const requiresAccountId =
          endpoint.includes("/contacts") ||
          endpoint.includes("/agents") ||
          endpoint.includes("/campaigns") ||
          endpoint.includes("/calls") ||
          endpoint.includes("/phone-numbers") ||
          endpoint.includes("/dashboard") ||
          endpoint.includes("/billing") ||
          endpoint.includes("/folders");

        if (requiresAccountId) {
          const apiError: ApiError = {
            message: "Usuario no autenticado. Por favor, inicia sesión.",
            status: 401,
            code: "NOT_AUTHENTICATED",
          };
          throw apiError;
        }
      }
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const apiError: ApiError = {
          message:
            errorData.message || `HTTP error! status: ${response.status}`,
          status: response.status,
          code: errorData.code,
          endpoint: endpoint, // Incluir el endpoint para mejor debugging
        };

        // Manejar errores 401 específicamente en uploads
        if (response.status === 401 || response.status === 403) {
          // Solo redirigir si el error de autenticación ocurre en endpoints críticos de sesión
          const isSessionEndpoint =
            endpoint.includes("/auth/profile") ||
            endpoint.includes("/auth/refresh");

          if (isSessionEndpoint) {
            // Limpiar tokens expirados
            localStorage.removeItem("auth_token");
            localStorage.removeItem("accountId");
            this.clearAuthToken();
            this.clearAccountId();

            // Redirigir al login si no estamos ya ahí usando React Router
            if (
              window.location.pathname !== "/" &&
              !window.location.pathname.includes("login")
            ) {
              // Usar React Router en lugar de recarga completa
              // window.location.href = "/";
              // La redirección se manejará por el ProtectedRoute
            }
          }
        }

        throw apiError;
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      } else {
        return {} as T;
      }
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
  }
}

// Default API client instance
export const apiClient = new ApiClient();
