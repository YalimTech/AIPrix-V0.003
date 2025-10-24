import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { URLSearchParams } from 'url';

@Injectable()
export class TwilioSignatureValidationService {
  private readonly logger = new Logger(TwilioSignatureValidationService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Valida la firma de Twilio en las solicitudes entrantes
   * Según documentación oficial: https://www.twilio.com/docs/usage/webhooks/webhooks-security
   */
  validateTwilioSignature(
    signature: string,
    url: string,
    params: Record<string, any>,
    authToken: string,
  ): boolean {
    try {
      // Crear el string de firma esperado
      const expectedSignature = this.createTwilioSignature(
        url,
        params,
        authToken,
      );

      // Comparar firmas usando comparación segura
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'base64'),
        Buffer.from(expectedSignature, 'base64'),
      );
    } catch (error) {
      this.logger.error('Error validating Twilio signature:', error);
      return false;
    }
  }

  /**
   * Crear la firma esperada de Twilio
   */
  private createTwilioSignature(
    url: string,
    params: Record<string, any>,
    authToken: string,
  ): string {
    // Ordenar parámetros alfabéticamente
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}${params[key]}`)
      .join('');

    // Crear string para firmar
    const stringToSign = url + sortedParams;

    // Crear HMAC SHA1
    const hmac = crypto.createHmac('sha1', authToken);
    hmac.update(stringToSign, 'utf8');

    return hmac.digest('base64');
  }

  /**
   * Valida webhook de Twilio con headers y body
   */
  validateWebhookSignature(
    signature: string,
    url: string,
    body: string,
    authToken: string,
  ): boolean {
    try {
      // Parsear el body como parámetros
      const params = new URLSearchParams(body);
      const paramsObj: Record<string, any> = {};

      params.forEach((value, key) => {
        paramsObj[key] = value;
      });

      return this.validateTwilioSignature(signature, url, paramsObj, authToken);
    } catch (error) {
      this.logger.error('Error validating webhook signature:', error);
      return false;
    }
  }

  /**
   * Middleware helper para validar firmas en controladores
   */
  validateRequestSignature(req: any, authToken: string): boolean {
    const signature = req.headers['x-twilio-signature'];
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const body = req.body;

    if (!signature) {
      this.logger.warn('Missing X-Twilio-Signature header');
      return false;
    }

    return this.validateWebhookSignature(
      signature,
      url,
      JSON.stringify(body),
      authToken,
    );
  }
}
