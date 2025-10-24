import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private _prisma: PrismaService) {}

  getHello(): string {
    return 'PrixAgent SaaS API - Agente de IA Conversacional Telefónico';
  }

  async getHealth() {
    try {
      await this._prisma.$queryRaw`SELECT 1`;
      return {
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'healthy',
        database: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
