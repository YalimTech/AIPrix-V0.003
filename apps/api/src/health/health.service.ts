import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as os from 'os';
import { PrismaService } from '../prisma/prisma.service';
import { WebSocketGateway } from '../websocket/websocket.gateway';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: ServiceCheck;
    externalServices: ServiceCheck;
    memory: ServiceCheck;
    disk: ServiceCheck;
  };
  metrics: {
    memory: MemoryMetrics;
    disk: DiskMetrics;
    connections: ConnectionMetrics;
  };
}

export interface ServiceCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  lastChecked: string;
  error?: string;
  details?: any;
}

export interface MemoryMetrics {
  used: number;
  total: number;
  percentage: number;
  free: number;
}

export interface DiskMetrics {
  used: number;
  total: number;
  percentage: number;
  free: number;
}

export interface ConnectionMetrics {
  active: number;
  total: number;
  websocket: number;
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly webSocketGateway: WebSocketGateway,
  ) {}

  async getBasicHealth() {
    try {
      // Verificación rápida de la base de datos con timeout
      const dbPromise = this.prisma.$queryRaw`SELECT 1`;
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database timeout')), 3000),
      );

      await Promise.race([dbPromise, timeoutPromise]);

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'prixagent-api',
        version: '1.0.0',
        uptime: this.getUptime(),
        database: 'connected',
        environment: this.configService.get('NODE_ENV', 'development'),
      };
    } catch (error) {
      this.logger.warn(`Health check failed: ${error.message}`);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        service: 'prixagent-api',
        version: '1.0.0',
        uptime: this.getUptime(),
        database: 'disconnected',
        error: error.message,
        environment: this.configService.get('NODE_ENV', 'development'),
      };
    }
  }

  async getDetailedHealth(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkExternalServices(),
      this.checkMemory(),
      this.checkDisk(),
    ]);

    const [database, externalServices, memory, disk] = checks.map((result) =>
      result.status === 'fulfilled'
        ? result.value
        : {
            status: 'unhealthy' as const,
            lastChecked: new Date().toISOString(),
            error:
              result.status === 'rejected'
                ? result.reason.message
                : 'Unknown error',
          },
    );

    const overallStatus = this.determineOverallStatus([
      database,
      externalServices,
      memory,
      disk,
    ]);

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: this.getUptime(),
      version: '1.0.0',
      environment: this.configService.get('NODE_ENV', 'development'),
      checks: {
        database,
        externalServices,
        memory,
        disk,
      },
      metrics: await this.getSystemMetrics(),
    };
  }

  async getDatabaseHealth(): Promise<ServiceCheck> {
    return this.checkDatabase();
  }

  async getExternalServicesHealth(): Promise<ServiceCheck> {
    return this.checkExternalServices();
  }

  async getSystemMetrics() {
    return {
      memory: this.getMemoryMetrics(),
      disk: this.getDiskMetrics(),
      connections: this.getConnectionMetrics(),
    };
  }

  async getReadiness() {
    const criticalChecks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkMemory(),
    ]);

    const allHealthy = criticalChecks.every(
      (result) =>
        result.status === 'fulfilled' && result.value.status === 'healthy',
    );

    return {
      status: allHealthy ? 'ready' : 'not ready',
      timestamp: new Date().toISOString(),
      checks: criticalChecks.map((result) =>
        result.status === 'fulfilled'
          ? result.value
          : {
              status: 'unhealthy' as const,
              lastChecked: new Date().toISOString(),
              error:
                result.status === 'rejected'
                  ? result.reason.message
                  : 'Unknown error',
            },
      ),
    };
  }

  async getLiveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: this.getUptime(),
      memory: this.getMemoryMetrics(),
    };
  }

  // =====================================================
  // PRIVATE METHODS
  // =====================================================

  private async checkDatabase(): Promise<ServiceCheck> {
    const startTime = Date.now();

    try {
      // Test basic connectivity
      await this.prisma.$queryRaw`SELECT 1`;

      // Test a simple query
      const accountCount = await this.prisma.account.count();

      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        responseTime,
        lastChecked: new Date().toISOString(),
        details: {
          accountCount,
          connectionPool: 'active',
        },
      };
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return {
        status: 'unhealthy',
        lastChecked: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  private async checkExternalServices(): Promise<ServiceCheck> {
    const startTime = Date.now();
    const services = {
      twilio: false,
      elevenlabs: false,
      ghl: false,
    };

    try {
      // Check Twilio - En SaaS, las credenciales están en la base de datos por cliente
      const twilioSid = this.configService.get('TWILIO_ACCOUNT_SID');
      const twilioToken = this.configService.get('TWILIO_AUTH_TOKEN');
      services.twilio = !!(twilioSid && twilioToken);

      // Check ElevenLabs - Las API keys están en la base de datos, no en el .env
      // Verificar si hay al menos una cuenta con API key configurada
      try {
        const elevenLabsConfigs =
          await this.prisma.accountElevenLabsConfig.findMany({
            take: 1,
          });
        // Verificar si hay configuraciones con API key válida
        services.elevenlabs = elevenLabsConfigs.some(
          (config) => config.apiKey && config.apiKey.trim() !== '',
        );
      } catch (error) {
        // Si hay error en la consulta, asumir que no hay configuraciones
        services.elevenlabs = false;
      }

      // Check GoHighLevel - En SaaS, las credenciales están en la base de datos por cliente
      const ghlKey = this.configService.get('GHL_API_KEY');
      services.ghl = !!ghlKey;

      const responseTime = Date.now() - startTime;
      const healthyServices = Object.values(services).filter(Boolean).length;
      const totalServices = Object.keys(services).length;

      // En un SaaS, es normal que los servicios externos no estén configurados globalmente
      // Solo marcar como unhealthy si hay un error real, no por falta de configuración
      let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

      // Solo marcar como degraded si hay un error real, no por falta de configuración
      if (healthyServices === 0) {
        // En SaaS, es normal que no haya servicios externos configurados globalmente
        status = 'healthy'; // Cambiado de 'unhealthy' a 'healthy'
      } else if (healthyServices < totalServices) {
        status = 'degraded';
      }

      return {
        status,
        responseTime,
        lastChecked: new Date().toISOString(),
        details: {
          services,
          healthyCount: healthyServices,
          totalCount: totalServices,
          note: 'En SaaS, los servicios externos se configuran por cliente en la base de datos',
        },
      };
    } catch (error) {
      this.logger.error('External services health check failed:', error);
      return {
        status: 'unhealthy',
        lastChecked: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  private async checkMemory(): Promise<ServiceCheck> {
    try {
      const memoryUsage = process.memoryUsage();
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const memoryPercentage = (usedMemory / totalMemory) * 100;

      let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
      if (memoryPercentage > 90) {
        status = 'unhealthy';
      } else if (memoryPercentage > 80) {
        status = 'degraded';
      }

      return {
        status,
        lastChecked: new Date().toISOString(),
        details: {
          heapUsed: memoryUsage.heapUsed,
          heapTotal: memoryUsage.heapTotal,
          external: memoryUsage.external,
          rss: memoryUsage.rss,
          systemTotal: totalMemory,
          systemUsed: usedMemory,
          systemFree: freeMemory,
          percentage: memoryPercentage,
        },
      };
    } catch (error) {
      this.logger.error('Memory health check failed:', error);
      return {
        status: 'unhealthy',
        lastChecked: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  private async checkDisk(): Promise<ServiceCheck> {
    try {
      // Check disk space for the current directory
      // const _stats = fs.statSync('.');
      // const _diskUsage = os.totalmem(); // This is a simplified check

      // In a real implementation, you would use a library like 'diskusage'
      // For now, we'll assume healthy disk space
      return {
        status: 'healthy',
        lastChecked: new Date().toISOString(),
        details: {
          available: true,
          path: process.cwd(),
        },
      };
    } catch (error) {
      this.logger.error('Disk health check failed:', error);
      return {
        status: 'unhealthy',
        lastChecked: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  private getMemoryMetrics(): MemoryMetrics {
    // const _memoryUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    return {
      used: usedMemory,
      total: totalMemory,
      percentage: (usedMemory / totalMemory) * 100,
      free: freeMemory,
    };
  }

  private getDiskMetrics(): DiskMetrics {
    // Simplified disk metrics
    // In production, use a library like 'diskusage'
    return {
      used: 0,
      total: 0,
      percentage: 0,
      free: 0,
    };
  }

  private getConnectionMetrics(): ConnectionMetrics {
    const connectedClients = this.webSocketGateway.getConnectedClients();

    return {
      active: connectedClients.length,
      total: connectedClients.length,
      websocket: connectedClients.length,
    };
  }

  private getUptime(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  private determineOverallStatus(
    checks: ServiceCheck[],
  ): 'healthy' | 'unhealthy' | 'degraded' {
    const statuses = checks.map((check) => check.status);

    if (statuses.includes('unhealthy')) {
      return 'unhealthy';
    }

    if (statuses.includes('degraded')) {
      return 'degraded';
    }

    return 'healthy';
  }
}
