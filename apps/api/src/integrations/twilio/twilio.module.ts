import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { ElevenLabsModule } from '../elevenlabs/elevenlabs.module';
import { WebhooksModule } from '../../webhooks/webhooks.module';
import { TwilioPhoneNumbersService } from './twilio-phone-numbers.service';
import { TwilioPricingService } from './twilio-pricing.service';
import { TwilioSignatureValidationService } from './twilio-signature-validation.service';
import { TwilioWebhooksController } from './twilio-webhooks.controller';
import { TwilioController } from './twilio.controller';
import { TwilioService } from './twilio.service';

@Module({
  imports: [ConfigModule, PrismaModule, ElevenLabsModule, WebhooksModule],
  providers: [
    TwilioService,
    TwilioSignatureValidationService,
    TwilioPhoneNumbersService,
    TwilioPricingService,
  ],
  controllers: [TwilioController, TwilioWebhooksController],
  exports: [
    TwilioService,
    TwilioSignatureValidationService,
    TwilioPhoneNumbersService,
    TwilioPricingService,
  ],
})
export class TwilioModule {}
