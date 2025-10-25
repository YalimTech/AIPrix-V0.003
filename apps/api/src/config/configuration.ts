/**
 * Environment variable cleaning utility
 * @param value - Environment variable value
 * @returns Cleaned value or undefined
 */
function cleanEnvVar(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.replace(/"/g, '').trim();
}

/**
 * Application configuration factory
 * @returns Configuration object
 */
export default () => {
  return {
    port: getPort(),
    appUrl: getAppUrl(),
    database: getDatabaseConfig(),
    jwt: getJwtConfig(),
    twilio: getTwilioConfig(),
    email: getEmailConfig(),
    throttler: getThrottlerConfig(),
    admin: getAdminConfig(),
  };
};

/**
 * Gets application port
 * @returns Port number
 */
function getPort(): number {
  return (
    parseInt(process.env.API_PORT, 10) ||
    parseInt(process.env.PORT, 10) ||
    3004
  );
}

/**
 * Gets application URL
 * @returns Application URL
 */
function getAppUrl(): string {
  return process.env.APP_URL || 'https://agent.prixcenter.com';
}

/**
 * Gets database configuration
 * @returns Database configuration object
 */
function getDatabaseConfig() {
  return {
    url: process.env.DATABASE_URL,
    connectionTimeout: 10000,
    queryTimeout: 30000,
    poolSize: 10,
  };
}

/**
 * Gets JWT configuration
 * @returns JWT configuration object
 */
function getJwtConfig() {
  return {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    issuer: process.env.JWT_ISSUER || 'prixagent-saas',
    audience: process.env.JWT_AUDIENCE || 'prixagent-users',
  };
}

/**
 * Gets Twilio configuration
 * @returns Twilio configuration object
 */
function getTwilioConfig() {
  return {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  };
}

/**
 * Gets email configuration
 * @returns Email configuration object
 */
function getEmailConfig() {
  return {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM,
  };
}

/**
 * Gets throttler configuration
 * @returns Throttler configuration object
 */
function getThrottlerConfig() {
  return {
    ttl: parseInt(process.env.THROTTLER_TTL, 10) || 60,
    limit: parseInt(process.env.THROTTLER_LIMIT, 10) || 100,
  };
}

/**
 * Gets admin configuration
 * @returns Admin configuration object
 */
function getAdminConfig() {
  return {
    email: '',
    password: '',
    name: '',
    role: '',
    secretKey: '',
  };
}