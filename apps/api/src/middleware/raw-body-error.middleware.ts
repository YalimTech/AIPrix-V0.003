import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RawBodyErrorMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RawBodyErrorMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    // Mark that this middleware was applied
    (req as any).__rawBodyErrorApplied = true;
    
    // Manejar errores de raw-body específicamente
    req.on('error', (error) => {
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

      // Para otros errores, loggear como error
      this.logger.error(`Request error for ${req.method} ${req.url}:`, error);
    });

    // Manejar cierre de requests
    req.on('close', () => {
      // Solo loggear si no es un request abortado normal
      if (!req.destroyed) {
        this.logger.debug(`Request closed for ${req.method} ${req.url}`);
      }
    });

    next();
  }
}
