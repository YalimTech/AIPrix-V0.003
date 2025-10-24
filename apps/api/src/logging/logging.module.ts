import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggingService } from './logging.service';
import { LoggingInterceptor } from './logging.interceptor';
import { PrismaLoggingMiddleware } from './prisma-logging.middleware';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [LoggingService, LoggingInterceptor, PrismaLoggingMiddleware],
  exports: [LoggingService, LoggingInterceptor, PrismaLoggingMiddleware],
})
export class LoggingModule {}
