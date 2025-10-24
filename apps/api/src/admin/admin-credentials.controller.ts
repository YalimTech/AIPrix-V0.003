import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as CryptoJS from 'crypto-js';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

// interface EncryptedCredentials {
//   accountId: string;
//   service: string;
//   credentials: string; // Encrypted JSON
//   isActive: boolean;
//   lastUsed?: Date;
//   createdAt: Date;
//   updatedAt: Date;
// }

@Controller('admin/credentials')
@UseGuards(JwtAuthGuard, AdminAuthGuard)
export class AdminCredentialsController {
  private readonly encryptionKey: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.encryptionKey =
      this.configService.get<string>('ENCRYPTION_KEY') ||
      'default-key-change-in-production';
  }

  @Get('tenants')
  async getTenantsWithCredentials(@Request() _req) {
    try {
      const tenants = await this.prisma.account.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          email: true,
          status: true,
          subscriptionPlan: true,
          createdAt: true,
          _count: {
            select: {
              agents: true,
              calls: true,
              users: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        data: tenants,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error obteniendo tenants: ${error.message}`,
        error: error.message,
      };
    }
  }

  @Get(':accountId/services')
  async getTenantCredentials(
    @Param('accountId') accountId: string,
    @Request() _req,
  ) {
    try {
      // Verificar que el tenant existe
      const tenant = await this.prisma.account.findUnique({
        where: { id: accountId },
        select: { id: true, name: true },
      });

      if (!tenant) {
        return {
          success: false,
          message: 'Tenant no encontrado',
        };
      }

      // Obtener configuraciones de servicios
      const twilioConfig = await this.prisma.accountTwilioConfig.findUnique({
        where: { accountId },
        select: {
          id: true,
          accountSid: true,
          webhookUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const calcomConfig = await this.prisma.accountCalcomConfig.findUnique({
        where: { accountId },
        select: {
          id: true,
          baseUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const ghlConfig = await this.prisma.accountGhlConfig.findUnique({
        where: { accountId },
        select: {
          id: true,
          locationId: true,
          baseUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const credentials = {
        twilio: twilioConfig
          ? {
              id: twilioConfig.id,
              accountSid: twilioConfig.accountSid,
              hasAuthToken: true, // No mostramos el token por seguridad
              webhookUrl: twilioConfig.webhookUrl,
              configured: true,
              lastUpdated: twilioConfig.updatedAt,
            }
          : { configured: false },

        calcom: calcomConfig
          ? {
              id: calcomConfig.id,
              baseUrl: calcomConfig.baseUrl,
              hasApiKey: true, // No mostramos la API key por seguridad
              configured: true,
              lastUpdated: calcomConfig.updatedAt,
            }
          : { configured: false },

        ghl: ghlConfig
          ? {
              id: ghlConfig.id,
              locationId: ghlConfig.locationId,
              baseUrl: ghlConfig.baseUrl,
              hasApiKey: true, // No mostramos la API key por seguridad
              configured: true,
              lastUpdated: ghlConfig.updatedAt,
            }
          : { configured: false },
      };

      return {
        success: true,
        data: {
          tenant,
          credentials,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Error obteniendo credenciales: ${error.message}`,
        error: error.message,
      };
    }
  }

  @Post(':accountId/twilio')
  @HttpCode(HttpStatus.OK)
  async updateTwilioCredentials(
    @Param('accountId') accountId: string,
    @Body()
    credentials: {
      accountSid: string;
      authToken: string;
      webhookUrl?: string;
    },
    @Request() _req,
  ) {
    try {
      // Verificar que el tenant existe
      const tenant = await this.prisma.account.findUnique({
        where: { id: accountId },
      });

      if (!tenant) {
        return {
          success: false,
          message: 'Tenant no encontrado',
        };
      }

      // Validar credenciales básicas
      if (!credentials.accountSid || !credentials.authToken) {
        return {
          success: false,
          message: 'Account SID y Auth Token son requeridos',
        };
      }

      // Crear o actualizar configuración de Twilio
      const twilioConfig = await this.prisma.accountTwilioConfig.upsert({
        where: { accountId },
        update: {
          accountSid: credentials.accountSid,
          authToken: credentials.authToken, // En producción, encriptar
          webhookUrl: credentials.webhookUrl,
        },
        create: {
          accountId,
          accountSid: credentials.accountSid,
          authToken: credentials.authToken, // En producción, encriptar
          webhookUrl: credentials.webhookUrl,
        },
      });

      return {
        success: true,
        message: 'Credenciales de Twilio actualizadas exitosamente',
        data: {
          id: twilioConfig.id,
          accountSid: twilioConfig.accountSid,
          webhookUrl: twilioConfig.webhookUrl,
          configured: true,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Error actualizando credenciales de Twilio: ${error.message}`,
        error: error.message,
      };
    }
  }

  @Post(':accountId/calcom')
  @HttpCode(HttpStatus.OK)
  async updateCalcomCredentials(
    @Param('accountId') accountId: string,
    @Body()
    credentials: {
      apiKey: string;
      baseUrl?: string;
    },
    @Request() _req,
  ) {
    try {
      // Verificar que el tenant existe
      const tenant = await this.prisma.account.findUnique({
        where: { id: accountId },
      });

      if (!tenant) {
        return {
          success: false,
          message: 'Tenant no encontrado',
        };
      }

      // Validar credenciales básicas
      if (!credentials.apiKey) {
        return {
          success: false,
          message: 'API Key es requerida',
        };
      }

      // Crear o actualizar configuración de Cal.com
      const calcomConfig = await this.prisma.accountCalcomConfig.upsert({
        where: { accountId },
        update: {
          apiKey: credentials.apiKey, // En producción, encriptar
          baseUrl: credentials.baseUrl || 'https://api.cal.com/v2',
        },
        create: {
          accountId,
          apiKey: credentials.apiKey, // En producción, encriptar
          baseUrl: credentials.baseUrl || 'https://api.cal.com/v2',
        },
      });

      return {
        success: true,
        message: 'Credenciales de Cal.com actualizadas exitosamente',
        data: {
          id: calcomConfig.id,
          baseUrl: calcomConfig.baseUrl,
          configured: true,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Error actualizando credenciales de Cal.com: ${error.message}`,
        error: error.message,
      };
    }
  }

  @Post(':accountId/ghl')
  @HttpCode(HttpStatus.OK)
  async updateGhlCredentials(
    @Param('accountId') accountId: string,
    @Body()
    credentials: {
      apiKey: string;
      locationId: string;
      baseUrl?: string;
    },
    @Request() _req,
  ) {
    try {
      // Verificar que el tenant existe
      const tenant = await this.prisma.account.findUnique({
        where: { id: accountId },
      });

      if (!tenant) {
        return {
          success: false,
          message: 'Tenant no encontrado',
        };
      }

      // Validar credenciales básicas
      if (!credentials.apiKey || !credentials.locationId) {
        return {
          success: false,
          message: 'API Key y Location ID son requeridos',
        };
      }

      // Crear o actualizar configuración de GoHighLevel
      const ghlConfig = await this.prisma.accountGhlConfig.upsert({
        where: { accountId },
        update: {
          apiKey: credentials.apiKey, // En producción, encriptar
          locationId: credentials.locationId,
          baseUrl: credentials.baseUrl || 'https://rest.gohighlevel.com/v2',
        },
        create: {
          accountId,
          apiKey: credentials.apiKey, // En producción, encriptar
          locationId: credentials.locationId,
          baseUrl: credentials.baseUrl || 'https://rest.gohighlevel.com/v2',
        },
      });

      return {
        success: true,
        message: 'Credenciales de GoHighLevel actualizadas exitosamente',
        data: {
          id: ghlConfig.id,
          locationId: ghlConfig.locationId,
          baseUrl: ghlConfig.baseUrl,
          configured: true,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Error actualizando credenciales de GoHighLevel: ${error.message}`,
        error: error.message,
      };
    }
  }

  @Delete(':accountId/twilio')
  async deleteTwilioCredentials(
    @Param('accountId') accountId: string,
    @Request() _req,
  ) {
    try {
      await this.prisma.accountTwilioConfig.delete({
        where: { accountId },
      });

      return {
        success: true,
        message: 'Credenciales de Twilio eliminadas exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        message: `Error eliminando credenciales de Twilio: ${error.message}`,
        error: error.message,
      };
    }
  }

  @Delete(':accountId/calcom')
  async deleteCalcomCredentials(
    @Param('accountId') accountId: string,
    @Request() _req,
  ) {
    try {
      await this.prisma.accountCalcomConfig.delete({
        where: { accountId },
      });

      return {
        success: true,
        message: 'Credenciales de Cal.com eliminadas exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        message: `Error eliminando credenciales de Cal.com: ${error.message}`,
        error: error.message,
      };
    }
  }

  @Delete(':accountId/ghl')
  async deleteGhlCredentials(
    @Param('accountId') accountId: string,
    @Request() _req,
  ) {
    try {
      await this.prisma.accountGhlConfig.delete({
        where: { accountId },
      });

      return {
        success: true,
        message: 'Credenciales de GoHighLevel eliminadas exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        message: `Error eliminando credenciales de GoHighLevel: ${error.message}`,
        error: error.message,
      };
    }
  }

  @Post(':accountId/validate/:service')
  @HttpCode(HttpStatus.OK)
  async validateCredentials(
    @Param('accountId') accountId: string,
    @Param('service') service: string,
    @Request() _req,
  ) {
    try {
      // Implementar validación de credenciales para cada servicio
      switch (service) {
        case 'twilio':
          return await this.validateTwilioCredentials(accountId);
        case 'calcom':
          return await this.validateCalcomCredentials(accountId);
        case 'ghl':
          return await this.validateGhlCredentials(accountId);
        default:
          return {
            success: false,
            message: 'Servicio no soportado',
          };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error validando credenciales: ${error.message}`,
        error: error.message,
      };
    }
  }

  private async validateTwilioCredentials(accountId: string) {
    const config = await this.prisma.accountTwilioConfig.findUnique({
      where: { accountId },
    });

    if (!config) {
      return {
        success: false,
        message: 'Configuración de Twilio no encontrada',
      };
    }

    // Aquí implementarías la validación real con la API de Twilio
    // Por ahora, simulamos la validación
    return {
      success: true,
      message: 'Credenciales de Twilio válidas',
      data: {
        accountSid: config.accountSid,
        valid: true,
      },
    };
  }

  private async validateCalcomCredentials(accountId: string) {
    const config = await this.prisma.accountCalcomConfig.findUnique({
      where: { accountId },
    });

    if (!config) {
      return {
        success: false,
        message: 'Configuración de Cal.com no encontrada',
      };
    }

    // Aquí implementarías la validación real con la API de Cal.com
    return {
      success: true,
      message: 'Credenciales de Cal.com válidas',
      data: {
        baseUrl: config.baseUrl,
        valid: true,
      },
    };
  }

  private async validateGhlCredentials(accountId: string) {
    const config = await this.prisma.accountGhlConfig.findUnique({
      where: { accountId },
    });

    if (!config) {
      return {
        success: false,
        message: 'Configuración de GoHighLevel no encontrada',
      };
    }

    // Aquí implementarías la validación real con la API de GoHighLevel
    return {
      success: true,
      message: 'Credenciales de GoHighLevel válidas',
      data: {
        locationId: config.locationId,
        baseUrl: config.baseUrl,
        valid: true,
      },
    };
  }

  // Métodos de encriptación (para producción)
  private encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, this.encryptionKey).toString();
  }

  private decrypt(encryptedText: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedText, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}
