// Configuración optimizada para producción
export const productionConfig = {
  // Configuraciones de timeout optimizadas - alineadas con el proxy
  timeouts: {
    login: 120000, // 120 segundos para login (alineado con el proxy)
    api: 45000, // 45 segundos para API calls
    database: 10000, // 10 segundos para queries de DB
    health: 10000, // 10 segundos para health checks
  },

  // Configuraciones de CORS para producción
  cors: {
    origin: true, // Permitir cualquier origin en producción
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Account-ID',
      'X-Tenant-ID',
      'X-Forwarded-For',
      'X-Forwarded-Proto',
      'X-Real-IP',
    ],
    optionsSuccessStatus: 200,
    preflightContinue: false,
    maxAge: 86400, // 24 horas de cache
  },

  // Configuraciones de base de datos optimizadas
  database: {
    connectionTimeout: 10000,
    queryTimeout: 30000,
    poolSize: 10,
    maxConnections: 20,
    idleTimeout: 30000,
  },

  // Configuraciones de logging
  logging: {
    level: 'warn', // Solo warnings y errores en producción
    enableQueryLogging: false,
    enableRequestLogging: false,
  },

  // Configuraciones de rate limiting
  rateLimit: {
    ttl: 60000, // 1 minuto
    limit: 100, // 100 requests por minuto
    skipSuccessfulRequests: true,
  },
};
