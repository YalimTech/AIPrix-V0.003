import {
    Body,
    Controller,
    Headers,
    HttpCode,
    HttpStatus,
    Logger,
    Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { setImmediate } from 'timers';
import { TwilioSignatureValidationService } from './twilio-signature-validation.service';
import { WebhooksService } from '../../webhooks/webhooks.service';

@Controller('webhooks')
export class TwilioWebhooksController {
  private readonly logger = new Logger(TwilioWebhooksController.name);

  constructor(
    private readonly signatureValidation: TwilioSignatureValidationService,
    private readonly configService: ConfigService,
    private readonly webhooksService: WebhooksService,
  ) {}

  /**
   * Webhook para eventos de voz
   * Según documentación oficial de Twilio y requisitos de ElevenLabs
   */
  @Post('voice')
  @HttpCode(HttpStatus.OK)
  async handleVoiceWebhook(@Body() body: any, @Headers() headers: any) {
    try {
      this.logger.log('Received voice webhook:', { body, headers });

      // Validar firma de Twilio (requisito de seguridad)
      const authToken = this.configService.get<string>(
        'TWILIO_MASTER_AUTH_TOKEN',
      );
      if (
        authToken &&
        !this.signatureValidation.validateRequestSignature(
          { headers, body },
          authToken,
        )
      ) {
        this.logger.warn('Invalid Twilio signature for voice webhook');
        // Aún así devolver 200 para evitar que ElevenLabs deshabilite el webhook
        return {
          message: 'Webhook received but signature validation failed',
          timestamp: new Date().toISOString(),
        };
      }

      // Procesar evento de voz
      const { CallSid, CallStatus, From, To } = body;

      this.logger.log(
        `Voice webhook - CallSid: ${CallSid}, Status: ${CallStatus}, From: ${From}, To: ${To}`,
      );

      // Responder rápidamente con HTTP 200 (requisito de ElevenLabs)
      const response = {
        message: 'Voice webhook processed successfully',
        callSid: CallSid,
        status: CallStatus,
        timestamp: new Date().toISOString(),
      };

      // Procesar en background para no bloquear la respuesta
      setImmediate(async () => {
        try {
          // Procesar webhook de voz usando el servicio de webhooks
          const twiMLResponse = await this.webhooksService.processTwilioVoiceWebhook(body);
          
          // Si hay una respuesta TwiML, la devolvemos
          if (twiMLResponse) {
            this.logger.log('TwiML response generated for inbound call');
          }
        } catch (error) {
          this.logger.error('Error processing voice webhook:', error);
        }
      });

      return response;
    } catch (error) {
      this.logger.error('Error processing voice webhook:', error);
      // Aún así devolver 200 para evitar que ElevenLabs deshabilite el webhook
      return {
        message: 'Webhook received but processing failed',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  /**
   * Procesar datos del webhook en background
   * Según documentación de ElevenLabs
   */
  private async processWebhookData(body: any) {
    try {
      this.logger.log('Processing webhook data in background:', body);

      // Aquí puedes implementar lógica específica para manejar eventos de voz
      // Por ejemplo: actualizar estado de llamada en base de datos, enviar notificaciones, etc.

      const { CallSid, CallStatus, _From, _To } = body;

      // Lógica de procesamiento específica según el estado de la llamada
      switch (CallStatus) {
        case 'ringing':
          this.logger.log(`Call ${CallSid} is ringing`);
          break;
        case 'answered':
          this.logger.log(`Call ${CallSid} was answered`);
          break;
        case 'completed':
          this.logger.log(`Call ${CallSid} completed`);
          break;
        default:
          this.logger.log(`Call ${CallSid} status: ${CallStatus}`);
      }
    } catch (error) {
      this.logger.error('Error processing webhook data:', error);
    }
  }

  /**
   * Webhook para eventos de SMS
   * Según documentación oficial de Twilio
   */
  @Post('sms')
  @HttpCode(HttpStatus.OK)
  async handleSmsWebhook(@Body() body: any, @Headers() headers: any) {
    this.logger.log('Received SMS webhook:', { body, headers });

    // Validar firma de Twilio
    const authToken = this.configService.get<string>(
      'TWILIO_MASTER_AUTH_TOKEN',
    );
    if (
      authToken &&
      !this.signatureValidation.validateRequestSignature(
        { headers, body },
        authToken,
      )
    ) {
      this.logger.warn('Invalid Twilio signature for SMS webhook');
      throw new Error('Invalid signature');
    }

    // Procesar evento de SMS
    const { MessageSid, MessageStatus, From, To, _Body } = body;

    this.logger.log(
      `SMS webhook - MessageSid: ${MessageSid}, Status: ${MessageStatus}, From: ${From}, To: ${To}`,
    );

    // Aquí puedes implementar lógica específica para manejar eventos de SMS
    // Por ejemplo: guardar mensajes en base de datos, procesar respuestas, etc.

    return {
      message: 'SMS webhook processed successfully',
      messageSid: MessageSid,
      status: MessageStatus,
    };
  }

  /**
   * Webhook para eventos de números telefónicos
   * Según documentación oficial de Twilio
   */
  @Post('phone-numbers')
  @HttpCode(HttpStatus.OK)
  async handlePhoneNumberWebhook(@Body() body: any, @Headers() headers: any) {
    this.logger.log('Received phone number webhook:', { body, headers });

    // Validar firma de Twilio
    const authToken = this.configService.get<string>(
      'TWILIO_MASTER_AUTH_TOKEN',
    );
    if (
      authToken &&
      !this.signatureValidation.validateRequestSignature(
        { headers, body },
        authToken,
      )
    ) {
      this.logger.warn('Invalid Twilio signature for phone number webhook');
      throw new Error('Invalid signature');
    }

    // Procesar evento de número telefónico
    const { PhoneNumberSid, PhoneNumber, Status } = body;

    this.logger.log(
      `Phone number webhook - SID: ${PhoneNumberSid}, Number: ${PhoneNumber}, Status: ${Status}`,
    );

    // Aquí puedes implementar lógica para manejar cambios en números telefónicos
    // Por ejemplo: actualizar estado en base de datos, notificar al cliente, etc.

    return {
      message: 'Phone number webhook processed successfully',
      phoneNumberSid: PhoneNumberSid,
      status: Status,
    };
  }
}
