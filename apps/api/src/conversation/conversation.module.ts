import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IntegrationsModule } from '../integrations/integrations.module';
import { PrismaModule } from '../prisma/prisma.module';
import { WebSocketModule } from '../websocket/websocket.module';
import { ConversationOrchestratorService } from './conversation-orchestrator.service';

@Module({
  imports: [PrismaModule, IntegrationsModule, WebSocketModule, ConfigModule],
  providers: [ConversationOrchestratorService],
  exports: [ConversationOrchestratorService],
})
export class ConversationModule {}
