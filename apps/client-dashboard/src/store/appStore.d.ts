interface AppState {
    sidebarOpen: boolean;
    theme: "light" | "dark";
    loading: boolean;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
        account: {
            id: string;
            name: string;
            slug: string;
        };
    } | null;
    currentPage: string;
    notifications: Array<{
        id: string;
        type: "success" | "error" | "warning" | "info";
        title: string;
        message: string;
        timestamp: number;
        read: boolean;
        actions?: Array<{
            label: string;
            action: () => void;
            variant: "primary" | "secondary";
        }>;
    }>;
    setSidebarOpen: (open: boolean) => void;
    setTheme: (theme: "light" | "dark") => void;
    setLoading: (loading: boolean) => void;
    setUser: (user: AppState["user"]) => void;
    setCurrentPage: (page: string) => void;
    addNotification: (notification: Omit<AppState["notifications"][0], "id" | "timestamp" | "read">) => void;
    removeNotification: (id: string) => void;
    markAsRead: (id: string) => void;
    clearNotifications: () => void;
}
export declare const useAppStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<AppState>, "setState" | "devtools"> & {
    setState(partial: AppState | Partial<AppState> | ((state: AppState) => AppState | Partial<AppState>), replace?: false | undefined, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): void;
    setState(state: AppState | ((state: AppState) => AppState), replace: true, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): void;
    devtools: {
        cleanup: () => void;
    };
}>;
export {};
