import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BillingModule } from '../../billing/billing.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { ElevenLabsWebhookController } from './elevenlabs-webhook.controller';
import { ElevenLabsWebhookService } from './elevenlabs-webhook.service';
import { ElevenLabsController } from './elevenlabs.controller';
import { ElevenLabsService } from './elevenlabs.service';

@Module({
  imports: [ConfigModule, PrismaModule, BillingModule],
  controllers: [ElevenLabsController, ElevenLabsWebhookController],
  providers: [ElevenLabsService, ElevenLabsWebhookService],
  exports: [ElevenLabsService, ElevenLabsWebhookService],
})
export class ElevenLabsModule {}
