/**
 * Constantes centralizadas del frontend
 * Siguiendo mejores prácticas de React 2025
 */
export declare const API_CONFIG: {
    readonly BASE_URL: string;
    readonly TIMEOUT: 120000;
    readonly RETRY_ATTEMPTS: 3;
    readonly RETRY_DELAY: 1000;
};
export declare const WEBSOCKET_CONFIG: {
    readonly URL: string;
    readonly RECONNECT_INTERVAL: 5000;
    readonly MAX_RECONNECT_ATTEMPTS: 10;
    readonly HEARTBEAT_INTERVAL: 30000;
};
export declare const CACHE_CONFIG: {
    readonly STALE_TIME: number;
    readonly CACHE_TIME: number;
    readonly REFETCH_INTERVAL: number;
};
export declare const UI_CONFIG: {
    readonly ANIMATION_DURATION: 300;
    readonly DEBOUNCE_DELAY: 500;
    readonly TOAST_DURATION: 5000;
    readonly MODAL_ANIMATION: "fade";
};
export declare const BILLING_CONFIG: {
    readonly CURRENCY: "USD";
    readonly DECIMAL_PLACES: 2;
    readonly LOW_BALANCE_THRESHOLD: 10;
    readonly CRITICAL_BALANCE_THRESHOLD: 5;
    readonly COST_PER_MINUTE: 0.08;
};
export declare const COMPONENT_STATES: {
    readonly LOADING: "loading";
    readonly SUCCESS: "success";
    readonly ERROR: "error";
    readonly IDLE: "idle";
};
export declare const NOTIFICATION_TYPES: {
    readonly SUCCESS: "success";
    readonly ERROR: "error";
    readonly WARNING: "warning";
    readonly INFO: "info";
};
export declare const VALIDATION_CONFIG: {
    readonly PHONE_REGEX: RegExp;
    readonly EMAIL_REGEX: RegExp;
    readonly MIN_PASSWORD_LENGTH: 8;
    readonly MAX_NAME_LENGTH: 100;
    readonly MAX_DESCRIPTION_LENGTH: 500;
};
export declare const PAGINATION_CONFIG: {
    readonly DEFAULT_PAGE_SIZE: 20;
    readonly PAGE_SIZE_OPTIONS: readonly [10, 20, 50, 100];
    readonly MAX_PAGE_SIZE: 100;
};
export declare const FILE_CONFIG: {
    readonly MAX_SIZE: number;
    readonly ALLOWED_TYPES: readonly ["image/jpeg", "image/png", "image/gif", "application/pdf"];
    readonly ALLOWED_EXTENSIONS: readonly [".jpg", ".jpeg", ".png", ".gif", ".pdf"];
};
export declare const TIME_CONFIG: {
    readonly REFRESH_INTERVALS: {
        readonly BALANCE: number;
        readonly CALLS: number;
        readonly AGENTS: number;
        readonly CAMPAIGNS: number;
    };
    readonly DEBOUNCE_DELAYS: {
        readonly SEARCH: 300;
        readonly INPUT: 500;
        readonly BUTTON: 1000;
    };
};
export declare const COLOR_CONFIG: {
    readonly STATUS: {
        readonly SUCCESS: "#10B981";
        readonly ERROR: "#EF4444";
        readonly WARNING: "#F59E0B";
        readonly INFO: "#3B82F6";
    };
    readonly BALANCE: {
        readonly CRITICAL: "#EF4444";
        readonly LOW: "#F59E0B";
        readonly MODERATE: "#3B82F6";
        readonly GOOD: "#10B981";
    };
};
export declare const BREAKPOINTS: {
    readonly SM: "640px";
    readonly MD: "768px";
    readonly LG: "1024px";
    readonly XL: "1280px";
    readonly "2XL": "1536px";
};
export declare const ROUTES: {
    readonly DASHBOARD: "/dashboard";
    readonly AGENTS: "/agents";
    readonly CAMPAIGNS: "/campaigns";
    readonly CALLS: "/calls";
    readonly CONTACTS: "/contacts";
    readonly BILLING: "/billing";
    readonly SETTINGS: "/settings";
    readonly PROFILE: "/profile";
};
export declare const STORAGE_KEYS: {
    readonly AUTH_TOKEN: "auth_token";
    readonly USER_PREFERENCES: "user_preferences";
    readonly THEME: "theme";
    readonly LANGUAGE: "language";
    readonly SIDEBAR_STATE: "sidebar_state";
};
export declare const MONITORING_CONFIG: {
    readonly ERROR_REPORTING: true;
    readonly PERFORMANCE_TRACKING: true;
    readonly USER_ANALYTICS: true;
    readonly DEBUG_MODE: boolean;
};
