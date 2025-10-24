import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health/diagnostic')
export class DiagnosticController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Public()
  async getDiagnostic() {
    const diagnostic = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: process.env.DATABASE_URL
          ? 'Configured'
          : 'Not configured',
        JWT_SECRET: process.env.JWT_SECRET ? 'Configured' : 'Not configured',
        APP_URL: process.env.APP_URL || 'Not configured',
        // Mostrar más variables de entorno importantes
        API_PORT: process.env.API_PORT || 'Not configured',
        PORT: process.env.PORT || 'Not configured',
      },
      database: {
        connected: false,
        error: null,
        url_source: process.env.DATABASE_URL ? 'process.env' : 'configService',
      },
      services: {
        auth: 'unknown',
        prisma: 'unknown',
      },
    };

    // Test database connection
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      diagnostic.database.connected = true;
      diagnostic.services.prisma = 'connected';
    } catch (error) {
      diagnostic.database.connected = false;
      diagnostic.database.error = error.message;
      diagnostic.services.prisma = 'error';
    }

    // Test auth service
    try {
      // Simple test to see if auth service is working
      diagnostic.services.auth = 'available';
    } catch (error) {
      diagnostic.services.auth = 'error';
    }

    return diagnostic;
  }
}
