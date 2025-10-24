import { Module, forwardRef } from '@nestjs/common';
import { AgentsModule } from '../agents/agents.module';
import { ElevenLabsService } from '../integrations/elevenlabs/elevenlabs.service';
import { PrismaService } from '../prisma/prisma.service';
import { BillingController } from './billing.controller';
import { ElevenLabsUsageTrackingService } from './elevenlabs-usage-tracking.service';

@Module({
  imports: [forwardRef(() => AgentsModule)],
  controllers: [BillingController],
  providers: [ElevenLabsService, ElevenLabsUsageTrackingService, PrismaService],
  exports: [ElevenLabsService, ElevenLabsUsageTrackingService, PrismaService],
})
export class BillingModule {}
