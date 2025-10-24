import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';

@Catch()
export class RawBodyExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RawBodyExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const { method, url } = request;

    // Manejar requests abortados (cliente cerró conexión antes de completar)
    if (
      exception.name === 'BadRequestError' &&
      (exception.message?.includes('aborted') || exception.message?.includes('request aborted'))
    ) {
      // No loggear como error, es normal que los clientes cancelen requests
      this.logger.debug(
        `Request aborted for ${method} ${url} - client disconnected`,
      );
      return; // No enviar respuesta si el cliente ya cerró la conexión
    }

    // Manejar errores de raw-body específicos
    if (
      exception.name === 'BadRequestError' &&
      exception.stack?.includes('raw-body')
    ) {
      this.logger.debug(
        `Raw body error for ${method} ${url}: ${exception.message}`,
      );
      return;
    }

    // Para otros errores, manejar normalmente
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }

    this.logger.error(`Error in ${method} ${url}:`, exception.stack);

    if (!response.headersSent) {
      response.status(status).json({
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
        path: url,
      });
    }
  }
}
