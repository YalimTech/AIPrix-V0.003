import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorHandlerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorHandlerInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    return next.handle().pipe(
      catchError((error: any) => {
        // Manejar errores de raw-body específicamente
        if (
          error.message?.includes('request aborted') ||
          error.message?.includes('aborted') ||
          error.stack?.includes('raw-body') ||
          (error.name === 'BadRequestError' &&
            error.message?.includes('aborted'))
        ) {
          this.logger.debug(
            `Request aborted for ${method} ${url}: ${error.message}`,
          );
          // Retornar una respuesta vacía en lugar de lanzar error
          return throwError(() => error);
        }

        // Log del error con contexto para otros errores
        this.logger.error(`Error in ${method} ${url}:`, error.stack);

        // Manejar errores específicos de requests abortados y raw-body
        if (
          error.name === 'AbortError' ||
          error.message?.includes('request aborted') ||
          error.message?.includes('aborted') ||
          error.code === 'ECONNRESET' ||
          error.code === 'EPIPE' ||
          error.message?.includes('socket hang up') ||
          error.message?.includes('raw-body') ||
          error.stack?.includes('raw-body')
        ) {
          this.logger.debug(
            `Request aborted/reset for ${method} ${url}: ${error.message}`,
          );
          // Para requests aborted, no lanzar error para evitar logs innecesarios
          // El cliente ya canceló la request
          return throwError(() => error);
        }

        if (error.name === 'TimeoutError') {
          this.logger.warn(`Timeout error for ${method} ${url}`);
          return throwError(
            () =>
              new HttpException(
                'La solicitud tardó demasiado tiempo en procesarse',
                HttpStatus.REQUEST_TIMEOUT,
              ),
          );
        }

        // Si es un HttpException, mantenerlo
        if (error instanceof HttpException) {
          return throwError(() => error);
        }

        // Para otros errores, crear un error con más información en desarrollo
        const errorMessage = process.env.NODE_ENV === 'production' 
          ? 'Error interno del servidor' 
          : `Error interno del servidor: ${error.message}`;
        
        this.logger.error(`Unhandled error in ${method} ${url}:`, {
          message: error.message,
          stack: error.stack,
          name: error.name,
          code: error.code
        });
        
        return throwError(
          () =>
            new HttpException(
              errorMessage,
              HttpStatus.INTERNAL_SERVER_ERROR,
            ),
        );
      }),
    );
  }
}
