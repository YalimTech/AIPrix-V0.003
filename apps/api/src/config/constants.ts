/**
 * Constantes centralizadas del sistema
 * Siguiendo mejores prácticas de 2025
 */

// Configuraciones de API
export const API_CONFIG = {
  VERSION: 'v1',
  PREFIX: 'api/v1',
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
} as const;

// Configuraciones de Rate Limiting
export const RATE_LIMIT_CONFIG = {
  TTL: 60000, // 60 segundos
  LIMIT: 100, // 100 requests por minuto
  SKIP_PATHS: ['/health', '/api/v1/health'],
} as const;

// Configuraciones de WebSocket
export const WEBSOCKET_CONFIG = {
  NAMESPACE: '/ws',
  PING_TIMEOUT: 60000,
  PING_INTERVAL: 25000,
  MAX_CONNECTIONS: 1000,
} as const;

// Configuraciones de CORS
export const CORS_CONFIG = {
  ORIGINS: [
    process.env.APP_URL ||
      `${process.env.API_PROTOCOL || 'http'}://${process.env.API_HOST || 'localhost'}:${process.env.PORT || '3000'}`,
    `${process.env.API_PROTOCOL || 'http'}://${process.env.API_HOST || 'localhost'}:${process.env.CLIENT_PORT || '3001'}`,
    `${process.env.API_PROTOCOL || 'http'}://${process.env.API_HOST || 'localhost'}:${process.env.ADMIN_PORT || '3002'}`,
    `${process.env.API_PROTOCOL || 'http'}://${process.env.API_HOST || 'localhost'}:${process.env.AGENCY_PORT || '3003'}`,
    `${process.env.API_PROTOCOL || 'http'}://${process.env.API_HOST || 'localhost'}:${process.env.API_PORT || '3004'}`,
    'https://agent.prixcenter.com',
    'https://admin.prixcenter.com',
  ],
  METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  ALLOWED_HEADERS: ['Content-Type', 'Authorization', 'Accept', 'X-Account-ID'],
  CREDENTIALS: true,
} as const;

// Configuraciones de Base de Datos
export const DATABASE_CONFIG = {
  CONNECTION_TIMEOUT: 10000,
  QUERY_TIMEOUT: 30000,
  MAX_CONNECTIONS: 20,
  MIN_CONNECTIONS: 5,
} as const;

// Configuraciones de Logging
export const LOGGING_CONFIG = {
  LEVELS: ['error', 'warn', 'log', 'debug', 'verbose'],
  MAX_FILE_SIZE: '10MB',
  MAX_FILES: 5,
  DATE_PATTERN: 'YYYY-MM-DD',
} as const;

// Configuraciones de ElevenLabs
export const ELEVENLABS_CONFIG = {
  API_BASE_URL: 'https://api.elevenlabs.io/v1',
  TIMEOUT: 60000,
  MAX_RETRIES: 5,
  // DEFAULT_VOICE eliminado - las voces deben ser seleccionadas dinámicamente por el usuario
  DEFAULT_MODEL: 'eleven_multilingual_v2',
} as const;

// Configuraciones de Twilio
export const TWILIO_CONFIG = {
  API_BASE_URL: 'https://api.twilio.com/2010-04-01',
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  WEBHOOK_TIMEOUT: 10000,
} as const;

// Configuraciones de Billing
export const BILLING_CONFIG = {
  CURRENCY: 'USD',
  DECIMAL_PLACES: 2,
  AUTO_REFILL_THRESHOLD: 10.0,
  DEFAULT_CREDIT_LIMIT: 1000.0,
  COST_PER_MINUTE: 0.08,
} as const;

// Configuraciones de Cache
export const CACHE_CONFIG = {
  TTL: 300, // 5 minutos
  MAX_ITEMS: 1000,
  CHECK_PERIOD: 120, // 2 minutos
} as const;

// Configuraciones de Validación
export const VALIDATION_CONFIG = {
  WHITELIST: true,
  FORBID_NON_WHITELISTED: true,
  TRANSFORM: true,
  DISABLE_ERROR_MESSAGES: false,
} as const;

// Estados de la aplicación
export const APP_STATES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
  ERROR: 'error',
} as const;

// Tipos de eventos
export const EVENT_TYPES = {
  CALL_STARTED: 'call.started',
  CALL_ENDED: 'call.ended',
  CALL_FAILED: 'call.failed',
  AGENT_UPDATED: 'agent.updated',
  CAMPAIGN_UPDATED: 'campaign.updated',
  BILLING_UPDATED: 'billing.updated',
  SYSTEM_ALERT: 'system.alert',
} as const;

// Códigos de error personalizados
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

// Mensajes de error estándar
export const ERROR_MESSAGES = {
  [ERROR_CODES.VALIDATION_ERROR]: 'Error de validación en los datos enviados',
  [ERROR_CODES.AUTHENTICATION_ERROR]: 'Error de autenticación',
  [ERROR_CODES.AUTHORIZATION_ERROR]:
    'No tienes permisos para realizar esta acción',
  [ERROR_CODES.NOT_FOUND]: 'Recurso no encontrado',
  [ERROR_CODES.CONFLICT]: 'Conflicto con el estado actual del recurso',
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Límite de requests excedido',
  [ERROR_CODES.EXTERNAL_SERVICE_ERROR]: 'Error en servicio externo',
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: 'Error interno del servidor',
} as const;
