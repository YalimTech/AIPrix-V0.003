import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WebhookConfigService {
  private readonly logger = new Logger(WebhookConfigService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Obtiene la URL del webhook basada en NODE_ENV
   */
  async getWebhookUrl(_accountId: string): Promise<string> {
    const nodeEnv = this.configService.get<string>('NODE_ENV');

    this.logger.log(`🔧 Configurando webhook para entorno: ${nodeEnv}`);

    if (nodeEnv === 'development') {
      // En desarrollo, usar configuración dinámica
      const port = this.configService.get<string>('API_PORT') || '3004';
      const host = this.configService.get<string>('API_HOST') || 'localhost';
      const protocol = this.configService.get<string>('API_PROTOCOL') || 'http';
      return `${protocol}://${host}:${port}/api/v1/webhooks/twilio`;
    } else if (nodeEnv === 'production') {
      // En producción, usar APP_URL
      const appUrl = this.configService.get<string>('APP_URL');
      if (!appUrl) {
        this.logger.warn('⚠️  APP_URL no configurado en .env para producción');
        this.logger.warn('💡 Agrega APP_URL=https://tu-dominio.com a tu .env');
        throw new Error('APP_URL no configurado para producción');
      }
      return `${appUrl}/api/v1/webhooks/twilio`;
    } else {
      throw new Error(
        `NODE_ENV no válido: ${nodeEnv}. Debe ser 'development' o 'production'`,
      );
    }
  }

  /**
   * Actualiza automáticamente el webhook URL en la base de datos
   */
  async updateWebhookUrl(accountId: string): Promise<void> {
    try {
      const webhookUrl = await this.getWebhookUrl(accountId);

      this.logger.log(`🔄 Actualizando webhook URL a: ${webhookUrl}`);

      await this.prisma.accountTwilioConfig.updateMany({
        where: { accountId },
        data: { webhookUrl },
      });

      this.logger.log(`✅ Webhook URL actualizada exitosamente`);
    } catch (error) {
      this.logger.error(`❌ Error actualizando webhook URL:`, error);
      throw error;
    }
  }

  /**
   * Verifica si el webhook URL está configurado correctamente
   */
  async verifyWebhookConfig(accountId: string): Promise<{
    isConfigured: boolean;
    webhookUrl?: string;
    environment: string;
    needsUpdate: boolean;
  }> {
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    const currentConfig = await this.prisma.accountTwilioConfig.findFirst({
      where: { accountId },
    });

    const expectedUrl = await this.getWebhookUrl(accountId).catch(() => null);
    const currentUrl = currentConfig?.webhookUrl;

    return {
      isConfigured: !!currentUrl,
      webhookUrl: currentUrl,
      environment: nodeEnv,
      needsUpdate: expectedUrl !== currentUrl,
    };
  }
}
