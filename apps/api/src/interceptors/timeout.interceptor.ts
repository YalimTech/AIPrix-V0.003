import {
    CallHandler,
    ExecutionContext,
    Injectable,
    Logger,
    NestInterceptor,
    RequestTimeoutException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TimeoutInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    // Excluir endpoints de debug y login del timeout
    if (url.includes('/auth/debug/') || url.includes('/auth/login')) {
      return next.handle();
    }

    // Verificar si el request ya fue abortado
    if (request.aborted) {
      this.logger.debug(`Request already aborted for ${method} ${url}`);
      return new Observable((subscriber) => {
        subscriber.complete();
      });
    }

    // Configurar timeout simplificado
    let timeoutMs = 30000; // 30 segundos por defecto

    // Timeouts específicos solo para endpoints críticos
    if (url.includes('/health')) {
      timeoutMs = 5000; // 5 segundos para health checks
    } else if (url.includes('/auth/login')) {
      timeoutMs = 30000; // 30 segundos para login (aumentado para producción)
    } else if (url.includes('/auth/')) {
      timeoutMs = 15000; // 15 segundos para otros endpoints de auth
    }

    this.logger.debug(`Setting timeout of ${timeoutMs}ms for ${method} ${url}`);

    return next.handle().pipe(
      timeout(timeoutMs),
      catchError((err) => {
        // Verificar si el request fue abortado
        if (request.aborted || err.message?.includes('aborted') || err.name === 'BadRequestError') {
          this.logger.debug(`Request aborted for ${method} ${url}`);
          return new Observable((subscriber) => {
            subscriber.complete();
          });
        }

        if (err instanceof TimeoutError) {
          this.logger.error(
            `Request timeout for ${method} ${url} after ${timeoutMs}ms`,
          );
          return throwError(
            () =>
              new RequestTimeoutException(
                'La solicitud tardó demasiado tiempo en procesarse',
              ),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}
