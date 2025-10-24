import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class TimeoutMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TimeoutMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    // Configurar timeout para requests - timeout reducido
    const timeout = 30000; // 30 segundos - timeout reducido

    // Configurar timeout
    const timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        this.logger.warn(`Request timeout for ${req.method} ${req.url}`);
        res.status(408).json({
          error: 'Request Timeout',
          message: 'La solicitud tardó demasiado tiempo en procesarse',
          statusCode: 408,
        });
      }
    }, timeout);

    // Limpiar timeout cuando la respuesta se envía
    res.on('finish', () => {
      clearTimeout(timeoutId);
    });

    res.on('close', () => {
      clearTimeout(timeoutId);
    });

    // Limpiar timeout cuando la conexión se cierra
    req.on('close', () => {
      clearTimeout(timeoutId);
      this.logger.debug(`Request closed for ${req.method} ${req.url}`);
    });

    // Limpiar timeout cuando hay error
    req.on('error', (error) => {
      clearTimeout(timeoutId);
      // Ignorar completamente requests abortados - no son errores reales
      if (
        error.message?.includes('request aborted') ||
        error.message?.includes('aborted') ||
        (error as any).code === 'ECONNRESET' ||
        (error as any).code === 'EPIPE' ||
        error.message?.includes('socket hang up')
      ) {
        // No hacer nada - el cliente canceló la request
        return;
      }
      
      // Solo loggear errores reales
      this.logger.error(`Request error for ${req.method} ${req.url}:`, error);
    });

    // Manejar desconexiones del cliente
    req.on('close', () => {
      clearTimeout(timeoutId);
      // Solo loggear si no es un request abortado normal
      if (!req.destroyed) {
        this.logger.debug(
          `Request closed by client for ${req.method} ${req.url}`,
        );
      }
    });

    next();
  }
}
