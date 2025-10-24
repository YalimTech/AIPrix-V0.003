import { Injectable } from '@nestjs/common';
import { LoggingService } from './logging.service';

@Injectable()
export class PrismaLoggingMiddleware {
  constructor(private readonly loggingService: LoggingService) {}

  create(): any {
    return async (params, next) => {
      const startTime = Date.now();

      try {
        const result = await next(params);
        const duration = Date.now() - startTime;

        // Log successful queries
        this.loggingService.logDatabaseQuery(
          this.formatQuery(params),
          duration,
          {
            operation: params.action,
            model: params.model,
            duration,
          },
        );

        // Log slow queries
        if (duration > 1000) {
          this.loggingService.warn('Slow database query detected', {
            operation: params.action,
            model: params.model,
            duration,
            query: this.formatQuery(params),
          });
        }

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;

        this.loggingService.error('Database query failed', error.stack, {
          operation: params.action,
          model: params.model,
          duration,
          query: this.formatQuery(params),
          error: error.message,
        });

        throw error;
      }
    };
  }

  private formatQuery(params: any): string {
    const { model, action, args } = params;

    let query = `${action} ${model}`;

    if (args) {
      if (args.where) {
        query += ` WHERE ${JSON.stringify(args.where)}`;
      }
      if (args.data) {
        query += ` DATA ${JSON.stringify(args.data)}`;
      }
      if (args.select) {
        query += ` SELECT ${JSON.stringify(args.select)}`;
      }
      if (args.include) {
        query += ` INCLUDE ${JSON.stringify(args.include)}`;
      }
    }

    return query;
  }
}
