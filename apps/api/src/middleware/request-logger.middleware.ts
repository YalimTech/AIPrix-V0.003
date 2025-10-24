import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const { method, url, ip } = req;
    const userAgent = req.get('User-Agent') || '';

    // Solo loggear en desarrollo o para requests importantes
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const isImportantRequest =
      url.includes('/auth/') ||
      url.includes('/health') ||
      url.includes('/webhooks/');

    if (isDevelopment || isImportantRequest) {
      if (this.logger) {
        this.logger.log(`Incoming ${method} ${url} from ${ip} - ${userAgent}`);
      } else {
        // console.log(`Incoming ${method} ${url} from ${ip} - ${userAgent}`);
      }
    }

    // Interceptar el envío de respuesta para loggear el tiempo
    const originalSend = res.send;
    res.send = function (body?: any) {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;

      // Log de respuesta
      if (statusCode >= 400) {
        if (this.logger) {
          this.logger.error(
            `Response ${statusCode} for ${method} ${url} - ${duration}ms`,
          );
        } else {
          // console.error(
          //   `Response ${statusCode} for ${method} ${url} - ${duration}ms`,
          // );
        }
      } else {
        if (this.logger) {
          this.logger.log(
            `Response ${statusCode} for ${method} ${url} - ${duration}ms`,
          );
        } else {
          // console.log(
          //   `Response ${statusCode} for ${method} ${url} - ${duration}ms`,
          // );
        }
      }

      return originalSend.call(this, body);
    };

    // Manejar errores de conexión
    req.on('error', (error) => {
      const duration = Date.now() - startTime;
      // Solo loggear errores que no sean de request aborted
      if (
        !error.message?.includes('request aborted') &&
        (error as any).code !== 'ECONNRESET'
      ) {
        if (this.logger) {
          this.logger.error(
            `Request error for ${method} ${url} - ${duration}ms:`,
            error.message,
          );
        } else {
          // console.error('Request error for', method, url, '-', duration + 'ms:', error.message);
        }
      } else {
        if (this.logger) {
          this.logger.debug(
            `Request aborted/reset for ${method} ${url} - ${duration}ms`,
          );
        } else {
          // console.debug('Request aborted/reset for', method, url, '-', duration + 'ms');
        }
      }
    });

    req.on('close', () => {
      const duration = Date.now() - startTime;
      // Solo loggear como warning si no es un request abortado normal
      if (duration < 1000) {
        // Si se cerró muy rápido, probablemente fue abortado
        if (this.logger) {
          this.logger.debug(
            `Request closed quickly for ${method} ${url} - ${duration}ms`,
          );
        } else {
          // console.debug('Request closed quickly for', method, url, '-', duration + 'ms');
        }
      } else {
        if (this.logger) {
          this.logger.warn(
            `Request closed for ${method} ${url} - ${duration}ms`,
          );
        } else {
          // console.warn('Request closed for', method, url, '-', duration + 'ms');
        }
      }
    });

    next();
  }
}
