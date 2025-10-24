import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { WebSocketModule } from '../websocket/websocket.module';
import { DiagnosticController } from './diagnostic.controller';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  imports: [PrismaModule, ConfigModule, WebSocketModule],
  controllers: [HealthController, DiagnosticController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
