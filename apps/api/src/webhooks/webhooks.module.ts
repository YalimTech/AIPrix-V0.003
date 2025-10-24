import { Module } from '@nestjs/common';
import { ConversationModule } from '../conversation/conversation.module';
import { ElevenLabsModule } from '../integrations/elevenlabs/elevenlabs.module';
import { TwilioModule } from '../integrations/twilio/twilio.module';
import { PrismaModule } from '../prisma/prisma.module';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';

@Module({
  imports: [TwilioModule, ElevenLabsModule, PrismaModule, ConversationModule],
  controllers: [WebhooksController],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
