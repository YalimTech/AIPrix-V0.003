/**
 * Constantes centralizadas del frontend
 * Siguiendo mejores prácticas de React 2025
 */
// Configuraciones de API
export const API_CONFIG = {
    BASE_URL: process.env.REACT_APP_API_URL ||
        `${process.env.VITE_APP_URL || `${process.env.VITE_API_PROTOCOL || "http"}://${process.env.VITE_API_HOST || "localhost"}:${process.env.VITE_API_PORT || "3004"}`}/api/v1`,
    TIMEOUT: 120000, // 120 segundos para producción
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
};
// Configuraciones de WebSocket
export const WEBSOCKET_CONFIG = {
    URL: process.env.REACT_APP_WS_URL ||
        `${process.env.VITE_WS_PROTOCOL || "ws"}://${process.env.VITE_WS_HOST || "localhost"}:${process.env.VITE_WS_PORT || "3004"}/ws`,
    RECONNECT_INTERVAL: 5000,
    MAX_RECONNECT_ATTEMPTS: 10,
    HEARTBEAT_INTERVAL: 30000,
};
// Configuraciones de Cache
export const CACHE_CONFIG = {
    STALE_TIME: 5 * 60 * 1000, // 5 minutos
    CACHE_TIME: 10 * 60 * 1000, // 10 minutos
    REFETCH_INTERVAL: 30 * 1000, // 30 segundos
};
// Configuraciones de UI
export const UI_CONFIG = {
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 500,
    TOAST_DURATION: 5000,
    MODAL_ANIMATION: "fade",
};
// Configuraciones de Billing
export const BILLING_CONFIG = {
    CURRENCY: "USD",
    DECIMAL_PLACES: 2,
    LOW_BALANCE_THRESHOLD: 10.0,
    CRITICAL_BALANCE_THRESHOLD: 5.0,
    COST_PER_MINUTE: 0.08,
};
// Estados de componentes
export const COMPONENT_STATES = {
    LOADING: "loading",
    SUCCESS: "success",
    ERROR: "error",
    IDLE: "idle",
};
// Tipos de notificaciones
export const NOTIFICATION_TYPES = {
    SUCCESS: "success",
    ERROR: "error",
    WARNING: "warning",
    INFO: "info",
};
// Configuraciones de validación
export const VALIDATION_CONFIG = {
    PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MIN_PASSWORD_LENGTH: 8,
    MAX_NAME_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 500,
};
// Configuraciones de paginación
export const PAGINATION_CONFIG = {
    DEFAULT_PAGE_SIZE: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
    MAX_PAGE_SIZE: 100,
};
// Configuraciones de archivos
export const FILE_CONFIG = {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ["image/jpeg", "image/png", "image/gif", "application/pdf"],
    ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".gif", ".pdf"],
};
// Configuraciones de tiempo
export const TIME_CONFIG = {
    REFRESH_INTERVALS: {
        BALANCE: 30 * 1000, // 30 segundos
        CALLS: 10 * 1000, // 10 segundos
        AGENTS: 15 * 1000, // 15 segundos
        CAMPAIGNS: 60 * 1000, // 1 minuto
    },
    DEBOUNCE_DELAYS: {
        SEARCH: 300,
        INPUT: 500,
        BUTTON: 1000,
    },
};
// Configuraciones de colores
export const COLOR_CONFIG = {
    STATUS: {
        SUCCESS: "#10B981",
        ERROR: "#EF4444",
        WARNING: "#F59E0B",
        INFO: "#3B82F6",
    },
    BALANCE: {
        CRITICAL: "#EF4444",
        LOW: "#F59E0B",
        MODERATE: "#3B82F6",
        GOOD: "#10B981",
    },
};
// Configuraciones de breakpoints
export const BREAKPOINTS = {
    SM: "640px",
    MD: "768px",
    LG: "1024px",
    XL: "1280px",
    "2XL": "1536px",
};
// Configuraciones de rutas
export const ROUTES = {
    DASHBOARD: "/dashboard",
    AGENTS: "/agents",
    CAMPAIGNS: "/campaigns",
    CALLS: "/calls",
    CONTACTS: "/contacts",
    BILLING: "/billing",
    SETTINGS: "/settings",
    PROFILE: "/profile",
};
// Configuraciones de localStorage
export const STORAGE_KEYS = {
    AUTH_TOKEN: "auth_token",
    USER_PREFERENCES: "user_preferences",
    THEME: "theme",
    LANGUAGE: "language",
    SIDEBAR_STATE: "sidebar_state",
};
// Configuraciones de monitoreo
export const MONITORING_CONFIG = {
    ERROR_REPORTING: true,
    PERFORMANCE_TRACKING: true,
    USER_ANALYTICS: true,
    DEBUG_MODE: process.env.NODE_ENV === "development",
};
