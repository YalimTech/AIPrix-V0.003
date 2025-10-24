import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Logger,
  Post,
} from '@nestjs/common';
import { ElevenLabsWebhookService } from './elevenlabs-webhook.service';

@Controller('webhooks/elevenlabs')
export class ElevenLabsWebhookController {
  private readonly logger = new Logger(ElevenLabsWebhookController.name);

  constructor(
    private readonly elevenLabsWebhookService: ElevenLabsWebhookService,
  ) {}

  @Post('conversation-initiation')
  async handleConversationInitiation(
    @Body() webhookData: any,
    @Headers() _headers: any,
  ) {
    try {
      this.logger.log(
        `🎯 Recibido webhook de iniciación de conversación de ElevenLabs:`,
        JSON.stringify(webhookData, null, 2),
      );

      // Validar que tenemos los datos necesarios
      const { caller_id, agent_id, called_number, call_sid } = webhookData;

      if (!caller_id || !agent_id || !called_number || !call_sid) {
        this.logger.error('❌ Webhook de ElevenLabs incompleto:', webhookData);
        throw new BadRequestException('Datos de webhook incompletos');
      }

      // Procesar el webhook y obtener datos de personalización
      const response =
        await this.elevenLabsWebhookService.processConversationInitiation({
          caller_id,
          agent_id,
          called_number,
          call_sid,
        });

      this.logger.log(
        `✅ Webhook procesado exitosamente para CallSid: ${call_sid}`,
      );

      return response;
    } catch (error) {
      this.logger.error('❌ Error procesando webhook de ElevenLabs:', error);
      throw new BadRequestException('Error procesando webhook');
    }
  }
}
