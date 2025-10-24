interface UseApiOptions {
    immediate?: boolean;
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
}
export declare function useApi<T = any>(endpoint: string, options?: UseApiOptions): {
    execute: (params?: any) => Promise<T>;
    mutate: (method: "POST" | "PUT" | "PATCH" | "DELETE", data?: any) => Promise<T>;
    refetch: (params?: any) => Promise<T>;
    data: T | null;
    loading: boolean;
    error: string | null;
};
export declare function useMutation<T = any>(endpoint: string): {
    mutate: (method: "POST" | "PUT" | "PATCH" | "DELETE", data?: any) => Promise<T>;
    data: T | null;
    loading: boolean;
    error: string | null;
};
export {};
