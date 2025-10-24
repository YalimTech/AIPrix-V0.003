import { Module } from '@nestjs/common';
import { AdminCredentialsController } from './admin-credentials.controller';
import { AdminClientsController } from './admin-clients.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [AdminCredentialsController, AdminClientsController],
})
export class AdminModule {}
