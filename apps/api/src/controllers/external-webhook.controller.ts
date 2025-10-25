import {
  Body,
  Controller,
  Post,
  Put,
  Get,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ExternalWebhookService } from '../services/external-webhook.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccountGuard } from '../tenancy/account.guard';

@Controller('external-webhooks')
@UseGuards(JwtAuthGuard, AccountGuard)
export class ExternalWebhookController {
  constructor(
    private readonly externalWebhookService: ExternalWebhookService,
  ) {}

  /**
   * Configurar webhook externo para un agente
   */
  @Put('agent/:agentId')
  @HttpCode(HttpStatus.OK)
  async configureAgentWebhook(
    @Param('agentId') agentId: string,
    @Body() body: { webhookUrl: string },
    @Request() req,
  ) {
    try {
      const accountId = req.user.accountId;

      // Validar URL del webhook
      const isValid = await this.externalWebhookService.validateWebhookUrl(
        body.webhookUrl,
      );
      if (!isValid) {
        return {
          success: false,
          message: 'URL de webhook inválida. Debe ser una URL válida y usar HTTPS en producción.',
        };
      }

      // Actualizar webhook URL en la base de datos
      await this.externalWebhookService['prisma'].agent.update({
        where: {
          id: agentId,
          accountId: accountId,
        },
        data: {
          webhookUrl: body.webhookUrl,
        },
      });

      return {
        success: true,
        message: 'Webhook externo configurado exitosamente',
        data: {
          agentId,
          webhookUrl: body.webhookUrl,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Error configurando webhook: ${error.message}`,
      };
    }
  }

  /**
   * Probar webhook externo
   */
  @Post('test')
  @HttpCode(HttpStatus.OK)
  async testWebhook(
    @Body() body: { webhookUrl: string },
    @Request() req,
  ) {
    try {
      const result = await this.externalWebhookService.testWebhook(
        body.webhookUrl,
      );

      return {
        success: result.success,
        message: result.message,
        statusCode: result.statusCode,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error probando webhook: ${error.message}`,
      };
    }
  }

  /**
   * Obtener configuración de webhook de un agente
   */
  @Get('agent/:agentId')
  async getAgentWebhookConfig(
    @Param('agentId') agentId: string,
    @Request() req,
  ) {
    try {
      const accountId = req.user.accountId;

      const agent = await this.externalWebhookService['prisma'].agent.findFirst({
        where: {
          id: agentId,
          accountId: accountId,
        },
        select: {
          id: true,
          name: true,
          webhookUrl: true,
        },
      });

      if (!agent) {
        return {
          success: false,
          message: 'Agente no encontrado',
        };
      }

      return {
        success: true,
        data: {
          agentId: agent.id,
          agentName: agent.name,
          webhookUrl: agent.webhookUrl,
          hasWebhook: !!agent.webhookUrl,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Error obteniendo configuración: ${error.message}`,
      };
    }
  }

  /**
   * Eliminar webhook externo de un agente
   */
  @Put('agent/:agentId/remove')
  @HttpCode(HttpStatus.OK)
  async removeAgentWebhook(
    @Param('agentId') agentId: string,
    @Request() req,
  ) {
    try {
      const accountId = req.user.accountId;

      await this.externalWebhookService['prisma'].agent.update({
        where: {
          id: agentId,
          accountId: accountId,
        },
        data: {
          webhookUrl: null,
        },
      });

      return {
        success: true,
        message: 'Webhook externo eliminado exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        message: `Error eliminando webhook: ${error.message}`,
      };
    }
  }
}
