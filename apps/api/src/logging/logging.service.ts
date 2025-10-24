import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';

export interface LogContext {
  accountId?: string;
  userId?: string;
  requestId?: string;
  operation?: string;
  duration?: number;
  [key: string]: any;
}

@Injectable()
export class LoggingService implements LoggerService {
  private readonly logger: winston.Logger;
  private readonly isDevelopment: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isDevelopment = this.configService.get('NODE_ENV') === 'development';

    this.logger = winston.createLogger({
      level: this.configService.get('LOG_LEVEL', 'info'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf(
          ({ timestamp, level, message, context, ...meta }) => {
            const logEntry = {
              timestamp,
              level,
              message,
              ...(context && { context }),
              ...meta,
            };

            if (this.isDevelopment) {
              return JSON.stringify(logEntry, null, 2);
            }

            return JSON.stringify(logEntry);
          },
        ),
      ),
      defaultMeta: {
        service: 'prixagent-api',
        version: '1.0.0',
      },
      transports: this.createTransports(),
    });
  }

  private createTransports(): winston.transport[] {
    const transports: winston.transport[] = [];

    // Console transport for development
    if (this.isDevelopment) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
      );
    }

    // File transports for production
    if (!this.isDevelopment) {
      // Error logs
      transports.push(
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 10 * 1024 * 1024, // 10MB
          maxFiles: 5,
        }),
      );

      // Combined logs
      transports.push(
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 10 * 1024 * 1024, // 10MB
          maxFiles: 5,
        }),
      );

      // Audit logs
      transports.push(
        new winston.transports.File({
          filename: 'logs/audit.log',
          level: 'info',
          maxsize: 10 * 1024 * 1024, // 10MB
          maxFiles: 10,
        }),
      );
    }

    return transports;
  }

  log(message: string, context?: string | LogContext) {
    this.logger.info(message, this.formatContext(context));
  }

  error(message: string, trace?: string, context?: string | LogContext) {
    this.logger.error(message, {
      ...this.formatContext(context),
      stack: trace,
    });
  }

  warn(message: string, context?: string | LogContext) {
    this.logger.warn(message, this.formatContext(context));
  }

  debug(message: string, context?: string | LogContext) {
    this.logger.debug(message, this.formatContext(context));
  }

  verbose(message: string, context?: string | LogContext) {
    this.logger.verbose(message, this.formatContext(context));
  }

  // =====================================================
  // CUSTOM LOGGING METHODS
  // =====================================================

  logRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context?: LogContext,
  ) {
    this.logger.info('HTTP Request', {
      ...this.formatContext(context),
      method,
      url,
      statusCode,
      duration,
      type: 'http_request',
    });
  }

  logDatabaseQuery(query: string, duration: number, context?: LogContext) {
    this.logger.debug('Database Query', {
      ...this.formatContext(context),
      query: query.substring(0, 200), // Truncate long queries
      duration,
      type: 'database_query',
    });
  }

  logCallEvent(event: string, callId: string, context?: LogContext) {
    this.logger.info('Call Event', {
      ...this.formatContext(context),
      event,
      callId,
      type: 'call_event',
    });
  }

  logCampaignEvent(event: string, campaignId: string, context?: LogContext) {
    this.logger.info('Campaign Event', {
      ...this.formatContext(context),
      event,
      campaignId,
      type: 'campaign_event',
    });
  }

  logAgentEvent(event: string, agentId: string, context?: LogContext) {
    this.logger.info('Agent Event', {
      ...this.formatContext(context),
      event,
      agentId,
      type: 'agent_event',
    });
  }

  logWebSocketEvent(event: string, clientId: string, context?: LogContext) {
    this.logger.debug('WebSocket Event', {
      ...this.formatContext(context),
      event,
      clientId,
      type: 'websocket_event',
    });
  }

  logExternalServiceCall(
    service: string,
    endpoint: string,
    statusCode: number,
    duration: number,
    context?: LogContext,
  ) {
    this.logger.info('External Service Call', {
      ...this.formatContext(context),
      service,
      endpoint,
      statusCode,
      duration,
      type: 'external_service',
    });
  }

  logSecurityEvent(event: string, details: any, context?: LogContext) {
    this.logger.warn('Security Event', {
      ...this.formatContext(context),
      event,
      details,
      type: 'security_event',
    });
  }

  logPerformanceMetric(
    metric: string,
    value: number,
    unit: string,
    context?: LogContext,
  ) {
    this.logger.info('Performance Metric', {
      ...this.formatContext(context),
      metric,
      value,
      unit,
      type: 'performance_metric',
    });
  }

  logBusinessEvent(event: string, details: any, context?: LogContext) {
    this.logger.info('Business Event', {
      ...this.formatContext(context),
      event,
      details,
      type: 'business_event',
    });
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  private formatContext(context?: string | LogContext): any {
    if (!context) return {};

    if (typeof context === 'string') {
      return { context };
    }

    return context;
  }

  // Create a child logger with additional context
  child(context: LogContext): LoggingService {
    const childLogger = new LoggingService(this.configService);
    (childLogger as any).logger = this.logger.child(context);
    return childLogger;
  }

  // Get current log level
  getLogLevel(): string {
    return this.logger.level;
  }

  // Set log level
  setLogLevel(level: string) {
    this.logger.level = level;
  }

  // Flush all logs
  async flush(): Promise<void> {
    return new Promise((resolve) => {
      this.logger.end(() => resolve());
    });
  }
}
