import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private configService: ConfigService) {
    // Obtener URL de base de datos PostgreSQL del .env de la raíz del proyecto
    const dbUrl =
      configService.get<string>('database.url') || process.env.DATABASE_URL;

    // console.log(`🔍 PostgreSQL Database configuration from .env root:`, {
    //   configured: !!dbUrl,
    //   url: dbUrl ? `${dbUrl.substring(0, 30)}...` : 'Not configured',
    //   isProduction: process.env.NODE_ENV === 'production',
    // });

    super({
      // Configuración optimizada para producción
      log:
        process.env.NODE_ENV === 'production'
          ? [
              { level: 'error', emit: 'stdout' },
              { level: 'warn', emit: 'stdout' },
            ]
          : [
              { level: 'query', emit: 'event' },
              { level: 'error', emit: 'stdout' },
              { level: 'info', emit: 'stdout' },
              { level: 'warn', emit: 'stdout' },
            ],
      errorFormat: 'pretty',
      // Configuraciones de conexión optimizadas para producción
      datasources: {
        db: {
          url: dbUrl,
        },
      },
      // Configuraciones adicionales para estabilidad en producción
      transactionOptions: {
        maxWait: 10000, // 10 segundos máximo de espera
        timeout: 30000, // 30 segundos timeout para transacciones
      },
    });

    // Logging para debug de configuración de base de datos (después de super())
    this.logger.log(
      `🔍 Database URL source: ${configService.get<string>('database.url') ? 'ConfigService' : 'process.env'}`,
    );
    this.logger.log(`🔍 Database URL configured: ${dbUrl ? 'Yes' : 'No'}`);

    // Configurar logging de queries en desarrollo
    if (process.env.NODE_ENV === 'development') {
      this.$on('query', (e) => {
        this.logger.debug(`Query: ${e.query}`);
        this.logger.debug(`Params: ${e.params}`);
        this.logger.debug(`Duration: ${e.duration}ms`);
      });
    }
  }

  async onModuleInit() {
    try {
      // Conectar a la base de datos PostgreSQL
      await this.$connect();
      this.logger.log('✅ Prisma conectado a PostgreSQL');

      // Verificar conexión con una consulta simple
      try {
        await this.$queryRaw`SELECT 1 as test`;
        this.logger.log('✅ Verificación de conexión PostgreSQL exitosa');
      } catch (verifyError) {
        this.logger.warn(
          '⚠️ Verificación de conexión PostgreSQL falló:',
          verifyError.message,
        );
      }
    } catch (error) {
      this.logger.error('❌ Error conectando a PostgreSQL:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('✅ Prisma desconectado de la base de datos');
    } catch (error) {
      this.logger.error('❌ Error desconectando de la base de datos:', error);
    }
  }

  // Método para verificar la salud de la conexión
  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Health check falló:', error);
      return false;
    }
  }
}
