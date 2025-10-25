import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ElevenLabsService } from '../integrations/elevenlabs/elevenlabs.service';
import { ElevenLabsUsageTrackingService } from '../billing/elevenlabs-usage-tracking.service';
import { TwilioService } from '../integrations/twilio/twilio.service';
import { GHLService } from '../integrations/ghl/ghl.service';
import { PrismaModule } from '../prisma/prisma.module';
import { WebSocketModule } from '../websocket/websocket.module';
import { ConversationOrchestratorService } from './conversation-orchestrator.service';

@Module({
  imports: [PrismaModule, WebSocketModule, ConfigModule],
  providers: [ConversationOrchestratorService, ElevenLabsService, ElevenLabsUsageTrackingService, TwilioService, GHLService],
  exports: [ConversationOrchestratorService],
})
export class ConversationModule {}
