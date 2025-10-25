import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { TwilioInboundService } from '../services/twilio-inbound.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccountGuard } from '../tenancy/account.guard';

@Controller('twilio-inbound')
@UseGuards(JwtAuthGuard, AccountGuard)
export class TwilioInboundController {
  private readonly logger = new Logger(TwilioInboundController.name);

  constructor(
    private readonly twilioInboundService: TwilioInboundService,
  ) {}

  /**
   * Configurar un número de teléfono para recibir llamadas inbound
   */
  @Post('configure/:agentId')
  @HttpCode(HttpStatus.OK)
  async configureInboundPhoneNumber(
    @Param('agentId') agentId: string,
    @Body() body: { phoneNumber: string },
    @Request() req,
  ) {
    const accountId = req.user.accountId;
    return await this.twilioInboundService.configureInboundPhoneNumber(
      accountId,
      agentId,
      body.phoneNumber,
    );
  }

  /**
   * Obtener configuración de inbound calls para un agente
   */
  @Get('configuration/:agentId')
  @HttpCode(HttpStatus.OK)
  async getInboundConfiguration(
    @Param('agentId') agentId: string,
    @Request() req,
  ) {
    const accountId = req.user.accountId;
    return await this.twilioInboundService.getInboundConfiguration(
      accountId,
      agentId,
    );
  }

  /**
   * Desactivar llamadas inbound para un agente
   */
  @Post('disable/:agentId')
  @HttpCode(HttpStatus.OK)
  async disableInboundCalls(
    @Param('agentId') agentId: string,
    @Request() req,
  ) {
    const accountId = req.user.accountId;
    return await this.twilioInboundService.disableInboundCalls(
      accountId,
      agentId,
    );
  }
}

/**
 * Controlador para webhooks de Twilio (sin autenticación JWT)
 * Este controlador maneja las llamadas entrantes de Twilio
 */
@Controller('webhooks/twilio')
export class TwilioWebhookController {
  private readonly logger = new Logger(TwilioWebhookController.name);

  constructor(
    private readonly twilioInboundService: TwilioInboundService,
  ) {}

  /**
   * Webhook para llamadas entrantes de Twilio
   * Este endpoint es llamado por Twilio cuando se recibe una llamada
   */
  @Post('inbound')
  @HttpCode(HttpStatus.OK)
  async handleInboundCall(@Body() body: any) {
    this.logger.log('📞 Llamada entrante recibida de Twilio:', body);

    try {
      // Extraer información de la llamada
      const {
        CallSid,
        From,
        To,
        CallStatus,
        Direction,
      } = body;

      // Buscar el agente asociado al número de teléfono
      const agent = await this.twilioInboundService.getAgentByPhoneNumber(To);

      if (!agent) {
        this.logger.warn(`⚠️ No se encontró agente para el número ${To}`);
        return {
          success: false,
          message: 'Agente no encontrado para este número',
        };
      }

      // Verificar que el agente está activo
      if (agent.status !== 'active') {
        this.logger.warn(`⚠️ Agente ${agent.id} no está activo`);
        return {
          success: false,
          message: 'Agente no está activo',
        };
      }

      // Procesar la llamada con ElevenLabs
      const conversationResult = await this.twilioInboundService.processInboundCall({
        callSid: CallSid,
        from: From,
        to: To,
        agentId: agent.id,
        agentName: agent.name,
        openingMessage: agent.openingMessage,
        systemPrompt: agent.systemPrompt,
        voiceName: agent.voiceName,
      });

      this.logger.log(`✅ Llamada inbound procesada: ${CallSid}`);

      return {
        success: true,
        conversationId: conversationResult.conversationId,
        message: 'Llamada inbound procesada exitosamente',
      };
    } catch (error) {
      this.logger.error(`❌ Error procesando llamada inbound: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Webhook para eventos de llamada de Twilio
   */
  @Post('status')
  @HttpCode(HttpStatus.OK)
  async handleCallStatus(@Body() body: any) {
    this.logger.log('📊 Estado de llamada actualizado:', body);

    try {
      const {
        CallSid,
        CallStatus,
        CallDuration,
        RecordingUrl,
      } = body;

      // Actualizar el estado de la llamada en la base de datos
      await this.twilioInboundService.updateCallStatus({
        callSid: CallSid,
        status: CallStatus,
        duration: CallDuration,
        recordingUrl: RecordingUrl,
      });

      return {
        success: true,
        message: 'Estado de llamada actualizado',
      };
    } catch (error) {
      this.logger.error(`❌ Error actualizando estado de llamada: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
