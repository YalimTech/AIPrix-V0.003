import { Module } from '@nestjs/common';
import { TwilioPhoneNumbersService } from './twilio-phone-numbers.service';
import { TwilioMarketplaceService } from './twilio-marketplace.service';
import { TwilioMarketplaceController } from './twilio-marketplace.controller';
import { TwilioPublicPhoneNumbersService } from './twilio-public-phone-numbers.service';
import { TwilioSubaccountsService } from './twilio-subaccounts.service';
import { TwilioSignatureValidationService } from './twilio-signature-validation.service';
import { TwilioWebhooksController } from './twilio-webhooks.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [TwilioWebhooksController, TwilioMarketplaceController],
  providers: [
    TwilioPhoneNumbersService,
    TwilioMarketplaceService,
    TwilioPublicPhoneNumbersService,
    TwilioSubaccountsService,
    TwilioSignatureValidationService,
  ],
  exports: [
    TwilioPhoneNumbersService,
    TwilioMarketplaceService,
    TwilioPublicPhoneNumbersService,
    TwilioSubaccountsService,
    TwilioSignatureValidationService,
  ],
})
export class TwilioPhoneNumbersModule {}
