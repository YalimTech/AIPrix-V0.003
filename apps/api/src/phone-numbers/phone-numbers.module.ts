import { Module } from '@nestjs/common';
import { PhoneNumbersController } from './phone-numbers.controller';
import { PhoneNumbersService } from './phone-numbers.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TwilioModule } from '../integrations/twilio/twilio.module';

@Module({
  imports: [PrismaModule, TwilioModule],
  controllers: [PhoneNumbersController],
  providers: [PhoneNumbersService],
  exports: [PhoneNumbersService],
})
export class PhoneNumbersModule {}
