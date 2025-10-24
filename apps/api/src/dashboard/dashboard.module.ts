import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardIntegratedService } from './dashboard-integrated.service';
import { PrismaModule } from '../prisma/prisma.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { ConversationsModule } from '../conversations/conversations.module';

@Module({
  imports: [PrismaModule, IntegrationsModule, ConversationsModule],
  controllers: [DashboardController],
  providers: [DashboardService, DashboardIntegratedService],
  exports: [DashboardService, DashboardIntegratedService],
})
export class DashboardModule {}
