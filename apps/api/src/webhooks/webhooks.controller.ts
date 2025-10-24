import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Request,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('twilio/voice')
  @HttpCode(HttpStatus.OK)
  async handleTwilioVoice(@Body() webhookData: any, @Res() res: Response) {
    const twiml =
      await this.webhooksService.processTwilioVoiceWebhook(webhookData);
    res.set('Content-Type', 'text/xml');
    res.send(twiml);
  }

  @Post('elevenlabs/tool-call')
  @HttpCode(HttpStatus.OK)
  async handleElevenLabsToolCall(@Body() webhookData: any) {
    // La lógica ahora es manejada por el orquestador a través del servicio de webhooks.
    // Devolvemos la respuesta que el orquestador genere.
    const result =
      await this.webhooksService.processElevenLabsToolCall(webhookData);
    return result;
  }

  @Post('elevenlabs/agent/:agentId/tools')
  @HttpCode(HttpStatus.OK)
  async handleElevenLabsAgentTools(
    @Param('agentId') agentId: string,
    @Body() body: any,
  ) {
    // Webhook específico para herramientas de un agente
    // console.log(`Tool call para agente ${agentId}:`, body);
    return this.webhooksService.processElevenLabsToolCall({
      ...body,
      agent_id: agentId,
    });
  }

  @Post('twilio/status')
  @HttpCode(HttpStatus.OK)
  async handleTwilioStatus(@Body() webhookData: any) {
    await this.webhooksService.processTwilioStatusWebhook(webhookData);
    return { success: true };
  }

  @Post('twilio/recording')
  @HttpCode(HttpStatus.OK)
  async handleTwilioRecording(@Body() webhookData: any) {
    await this.webhooksService.processTwilioRecordingWebhook(webhookData);
    return { success: true };
  }

  @Post('custom/:accountId/:eventType')
  @HttpCode(HttpStatus.OK)
  async handleCustomWebhook(
    @Param('accountId') accountId: string,
    @Param('eventType') eventType: string,
    @Body() webhookData: any,
  ) {
    await this.webhooksService.processCustomWebhook(
      webhookData,
      accountId,
      eventType,
    );
    return { success: true };
  }

  @Post('elevenlabs')
  @HttpCode(HttpStatus.OK)
  async handleElevenLabsWebhook(@Body() webhookData: any) {
    await this.webhooksService.processElevenLabsWebhook(webhookData);
    return { success: true };
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  async testWebhook(@Body() _webhookData: any, @Query('type') _type: string) {
    // console.log('Webhook de prueba recibido:', { type, data: webhookData });
    return {
      success: true,
      message: 'Webhook de prueba procesado correctamente',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('sync-conversations/:agentId')
  @HttpCode(HttpStatus.OK)
  async syncConversations(@Param('agentId') agentId: string, @Request() req) {
    const result = await this.webhooksService.syncConversationsFromElevenLabs(
      req.user.accountId,
      agentId,
    );
    return result;
  }
}
