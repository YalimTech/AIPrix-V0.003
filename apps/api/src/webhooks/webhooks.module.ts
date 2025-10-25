import { Module } from '@nestjs/common';
import { ConversationModule } from '../conversation/conversation.module';
import { ElevenLabsModule } from '../integrations/elevenlabs/elevenlabs.module';
import { TwilioService } from '../integrations/twilio/twilio.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ExternalWebhookService } from '../services/external-webhook.service';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';

@Module({
  imports: [ElevenLabsModule, PrismaModule, ConversationModule],
  controllers: [WebhooksController],
  providers: [WebhooksService, ExternalWebhookService, TwilioService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
