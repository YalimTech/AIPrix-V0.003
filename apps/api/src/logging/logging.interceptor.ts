import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LoggingService } from './logging.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(private readonly loggingService: LoggingService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const startTime = Date.now();

    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const requestId = this.generateRequestId();

    // Add request ID to request object for use in other parts of the application
    (request as any).requestId = requestId;

    // Extract user information if available
    const user = (request as any).user;
    const accountId = user?.accountId;

    const contextData = {
      requestId,
      accountId,
      userId: user?.sub,
      method,
      url,
      ip,
      userAgent,
    };

    this.loggingService.log(`Incoming ${method} ${url}`, contextData);

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;

        this.loggingService.logRequest(method, url, statusCode, duration, {
          ...contextData,
          duration,
          statusCode,
          responseSize: JSON.stringify(data).length,
        });

        // Log slow requests
        if (duration > 5000) {
          this.loggingService.warn(`Slow request detected: ${method} ${url}`, {
            ...contextData,
            duration,
            statusCode,
          });
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const statusCode = error.status || 500;

        this.loggingService.error(
          `Request failed: ${method} ${url}`,
          error.stack,
          {
            ...contextData,
            duration,
            statusCode,
            error: error.message,
          },
        );

        return throwError(() => error);
      }),
    );
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
