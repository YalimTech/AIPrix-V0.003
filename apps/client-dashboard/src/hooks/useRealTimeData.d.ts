interface RealTimeDataConfig {
    queryKey: string[];
    endpoint: string;
    interval?: number;
    enabled?: boolean;
    onDataUpdate?: (data: any) => void;
    onError?: (error: Error) => void;
}
export declare const useRealTimeData: (config: RealTimeDataConfig) => {
    data: unknown;
    isLoading: boolean;
    error: Error | null;
    status: {
        isPolling: boolean;
        lastUpdate: Date | null;
        error: Error | null;
        retryCount: number;
        isOnline: boolean;
        isVisible: boolean;
    };
    refresh: () => void;
    startPolling: () => void;
    stopPolling: () => void;
    subscribe: (event: string, _callback: (data: any) => void) => void;
    unsubscribe: (event: string) => void;
};
export declare const useRealTimeStats: (endpoint: string, enabled?: boolean) => {
    data: unknown;
    isLoading: boolean;
    error: Error | null;
    status: {
        isPolling: boolean;
        lastUpdate: Date | null;
        error: Error | null;
        retryCount: number;
        isOnline: boolean;
        isVisible: boolean;
    };
    refresh: () => void;
    startPolling: () => void;
    stopPolling: () => void;
    subscribe: (event: string, _callback: (data: any) => void) => void;
    unsubscribe: (event: string) => void;
};
export declare const useRealTimeCalls: (enabled?: boolean) => {
    data: unknown;
    isLoading: boolean;
    error: Error | null;
    status: {
        isPolling: boolean;
        lastUpdate: Date | null;
        error: Error | null;
        retryCount: number;
        isOnline: boolean;
        isVisible: boolean;
    };
    refresh: () => void;
    startPolling: () => void;
    stopPolling: () => void;
    subscribe: (event: string, _callback: (data: any) => void) => void;
    unsubscribe: (event: string) => void;
};
export declare const useRealTimeCampaigns: (enabled?: boolean) => {
    data: unknown;
    isLoading: boolean;
    error: Error | null;
    status: {
        isPolling: boolean;
        lastUpdate: Date | null;
        error: Error | null;
        retryCount: number;
        isOnline: boolean;
        isVisible: boolean;
    };
    refresh: () => void;
    startPolling: () => void;
    stopPolling: () => void;
    subscribe: (event: string, _callback: (data: any) => void) => void;
    unsubscribe: (event: string) => void;
};
export declare const useRealTimeAgents: (enabled?: boolean) => {
    data: unknown;
    isLoading: boolean;
    error: Error | null;
    status: {
        isPolling: boolean;
        lastUpdate: Date | null;
        error: Error | null;
        retryCount: number;
        isOnline: boolean;
        isVisible: boolean;
    };
    refresh: () => void;
    startPolling: () => void;
    stopPolling: () => void;
    subscribe: (event: string, _callback: (data: any) => void) => void;
    unsubscribe: (event: string) => void;
};
export declare const useRealTimeBalance: (enabled?: boolean) => {
    data: unknown;
    isLoading: boolean;
    error: Error | null;
    status: {
        isPolling: boolean;
        lastUpdate: Date | null;
        error: Error | null;
        retryCount: number;
        isOnline: boolean;
        isVisible: boolean;
    };
    refresh: () => void;
    startPolling: () => void;
    stopPolling: () => void;
    subscribe: (event: string, _callback: (data: any) => void) => void;
    unsubscribe: (event: string) => void;
};
export {};
