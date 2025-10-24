import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { TenancyModule } from '../../tenancy/tenancy.module';
import { TwilioMarketplaceController } from './twilio-marketplace.controller';
import { TwilioMarketplaceService } from './twilio-marketplace.service';

@Module({
  imports: [PrismaModule, ConfigModule, TenancyModule],
  controllers: [TwilioMarketplaceController],
  providers: [TwilioMarketplaceService],
  exports: [TwilioMarketplaceService],
})
export class TwilioMarketplaceModule {}
