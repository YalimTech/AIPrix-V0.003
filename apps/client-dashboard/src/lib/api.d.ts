export declare const apiConfig: {
    baseURL: string;
    timeout: number;
    headers: {
        "Content-Type": string;
    };
};
export declare const endpoints: {
    auth: {
        login: string;
        logout: string;
        refresh: string;
        profile: string;
    };
    agents: {
        list: string;
        create: string;
        get: (id: string) => string;
        update: (id: string) => string;
        delete: (id: string) => string;
        duplicate: (id: string) => string;
        syncElevenLabs: string;
        importElevenLabs: string;
        diagnostics: string;
        assignFolder: (id: string) => string;
        moveToFolder: string;
    };
    folders: {
        list: string;
        create: string;
        get: (id: string) => string;
        update: (id: string) => string;
        delete: (id: string) => string;
        assignAgent: (agentId: string) => string;
        moveAgents: string;
        stats: string;
    };
    campaigns: {
        list: string;
        create: string;
        update: (id: string) => string;
        delete: (id: string) => string;
        stats: string;
    };
    contacts: {
        list: string;
        create: string;
        update: (id: string) => string;
        delete: (id: string) => string;
        import: string;
        export: string;
    };
    calls: {
        list: string;
        create: string;
        update: (id: string) => string;
        delete: (id: string) => string;
        logs: string;
        recordings: (id: string) => string;
    };
    phoneNumbers: {
        list: string;
        buy: string;
        available: string;
        assign: (id: string) => string;
        delete: (id: string) => string;
    };
    knowledge: {
        list: string;
        create: string;
        update: (id: string) => string;
        delete: (id: string) => string;
        search: string;
    };
    llm: {
        generate: string;
        models: string;
    };
    dashboard: {
        stats: string;
        recentActivity: string;
        alerts: string;
        integrationsStatus: string;
    };
    billing: {
        balance: string;
        history: string;
        paymentMethods: string;
        addFunds: string;
        autoRefill: string;
    };
    integrations: {
        twilio: {
            config: string;
            validate: string;
        };
        elevenlabs: {
            voices: string;
            voiceClone: string;
            agents: {
                list: string;
                create: string;
                get: (id: string) => string;
                update: (id: string) => string;
                delete: (id: string) => string;
                sync: string;
                getLink: (id: string) => string;
                simulateConversation: (id: string) => string;
                simulateConversationStream: (id: string) => string;
                calculateLLMUsage: (id: string) => string;
            };
            conversations: {
                start: string;
                recent: string;
            };
            analytics: string;
            usage: string;
            models: string;
            health: string;
        };
    };
    webhooks: {
        list: string;
        create: string;
        update: (id: string) => string;
        delete: (id: string) => string;
        test: (id: string) => string;
    };
    settings: {
        profile: string;
        notifications: string;
        security: string;
    };
};
export declare class ApiClient {
    private baseURL;
    private timeout;
    private headers;
    constructor(config?: {
        baseURL: string;
        timeout: number;
        headers: {
            "Content-Type": string;
        };
    });
    setAuthToken(token: string): void;
    clearAuthToken(): void;
    setAccountId(accountId: string): void;
    clearAccountId(): void;
    private request;
    get<T>(endpoint: string, options?: RequestInit & {
        timeout?: number;
    }): Promise<T>;
    post<T>(endpoint: string, data?: any, options?: RequestInit & {
        timeout?: number;
    }): Promise<T>;
    put<T>(endpoint: string, data?: any, options?: RequestInit & {
        timeout?: number;
    }): Promise<T>;
    patch<T>(endpoint: string, data?: any, options?: RequestInit & {
        timeout?: number;
    }): Promise<T>;
    delete<T>(endpoint: string, options?: RequestInit & {
        timeout?: number;
    }): Promise<T>;
    upload<T>(endpoint: string, formData: FormData, options?: RequestInit): Promise<T>;
}
export declare const apiClient: ApiClient;
