import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';
import { resolvePhoneCountry } from '../../common/utils/phone-country.util';
import { PrismaService } from '../../prisma/prisma.service';
import { ElevenLabsService } from '../elevenlabs/elevenlabs.service';

// Interfaces según documentación oficial Twilio 2025
interface TwilioCallMetrics {
  totalCalls: number;
  answeredCalls: number;
  missedCalls: number;
  totalMinutes: number;
  totalCost: number;
  averageDuration: number;
  successRate: number;
}

interface TwilioWebhookEvent {
  CallSid: string;
  CallStatus: string;
  Direction: string;
  From: string;
  To: string;
  Duration?: string;
  RecordingUrl?: string;
  TranscriptionText?: string;
  Timestamp: string;
}

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);
  private twilioClient: twilio.Twilio;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly elevenLabsService: ElevenLabsService,
  ) {}

  /**
   * Obtiene los precios de números telefónicos para un país específico desde la API de Twilio Pricing.
   * Documentación: https://www.twilio.com/docs/pricing/api
   */
  async getPhoneNumberPricingForCountry(
    accountId: string,
    countryCode: string,
  ): Promise<{ local: number; tollFree: number; mobile: number }> {
    try {
      const client = await this.getTwilioClient(accountId);

      const countryInfo = await client.pricing.v2
        .countries(countryCode.toUpperCase())
        .fetch();

      let localPrice = 0;
      let tollFreePrice = 0;
      let mobilePrice = 0;

      // CORREGIDO: Usar la propiedad correcta 'originatingCallPrices' según la v5 de la librería
      countryInfo.originatingCallPrices.forEach((priceInfo) => {
        if (priceInfo.numberType === 'local') {
          localPrice = priceInfo.basePrice || 0;
        } else if (priceInfo.numberType === 'toll-free') {
          tollFreePrice = priceInfo.basePrice || 0;
        } else if (priceInfo.numberType === 'mobile') {
          mobilePrice = priceInfo.basePrice || 0;
        }
      });

      this.logger.log(
        `Precios para ${countryCode}: Local=${localPrice}, Toll-Free=${tollFreePrice}, Mobile=${mobilePrice}`,
      );

      return {
        local: localPrice,
        tollFree: tollFreePrice,
        mobile: mobilePrice,
      };
    } catch (error) {
      this.logger.error(
        `Error obteniendo precios de Twilio para ${countryCode}: ${error.message}`,
      );
      // Fallback a precios por defecto si la API falla (ej. país sin precios definidos)
      return { local: 1.15, tollFree: 2.15, mobile: 1.15 };
    }
  }

  private getCountryName(countryCode: string): string {
    const countryNames: { [key: string]: string } = {
      // North America
      US: 'United States',
      CA: 'Canada',
      MX: 'Mexico',
      PR: 'Puerto Rico',
      PA: 'Panama',
      CR: 'Costa Rica',
      GT: 'Guatemala',
      HN: 'Honduras',
      NI: 'Nicaragua',
      SV: 'El Salvador',
      CU: 'Cuba',
      DO: 'Dominican Republic',
      JM: 'Jamaica',
      BS: 'Bahamas',
      BB: 'Barbados',
      TT: 'Trinidad and Tobago',
      GD: 'Grenada',
      VI: 'Virgin Islands (US)',
      AG: 'Antigua and Barbuda',
      LC: 'Saint Lucia',
      VC: 'Saint Vincent and the Grenadines',
      KN: 'Saint Kitts and Nevis',
      DM: 'Dominica',
      AI: 'Anguilla',

      // South America
      BR: 'Brazil',
      AR: 'Argentina',
      CL: 'Chile',
      CO: 'Colombia',
      PE: 'Peru',
      VE: 'Venezuela',
      EC: 'Ecuador',
      PY: 'Paraguay',
      UY: 'Uruguay',
      BO: 'Bolivia',
      GY: 'Guyana',
      SR: 'Suriname',
      GF: 'French Guiana',
      FK: 'Falkland Islands',

      // Europe
      GB: 'United Kingdom',
      DE: 'Germany',
      FR: 'France',
      ES: 'Spain',
      IT: 'Italy',
      NL: 'Netherlands',
      SE: 'Sweden',
      NO: 'Norway',
      DK: 'Denmark',
      FI: 'Finland',
      AT: 'Austria',
      BE: 'Belgium',
      CH: 'Switzerland',
      IE: 'Ireland',
      PT: 'Portugal',
      LU: 'Luxembourg',
      GR: 'Greece',
      PL: 'Poland',
      CZ: 'Czech Republic',
      HU: 'Hungary',
      RO: 'Romania',
      BG: 'Bulgaria',
      HR: 'Croatia',
      RS: 'Serbia',
      SK: 'Slovakia',
      SI: 'Slovenia',
      EE: 'Estonia',
      LV: 'Latvia',
      LT: 'Lithuania',
      IS: 'Iceland',
      MT: 'Malta',
      CY: 'Cyprus',
      AL: 'Albania',
      BA: 'Bosnia and Herzegovina',
      MK: 'North Macedonia',
      ME: 'Montenegro',
      XK: 'Kosovo',

      // Asia Pacific
      AU: 'Australia',
      NZ: 'New Zealand',
      SG: 'Singapore',
      MY: 'Malaysia',
      TH: 'Thailand',
      VN: 'Vietnam',
      PH: 'Philippines',
      ID: 'Indonesia',
      IN: 'India',
      PK: 'Pakistan',
      BD: 'Bangladesh',
      LK: 'Sri Lanka',
      JP: 'Japan',
      KR: 'South Korea',
      CN: 'China',
      TW: 'Taiwan',
      HK: 'Hong Kong',
      MO: 'Macau',
      FJ: 'Fiji',
      PG: 'Papua New Guinea',
      NC: 'New Caledonia',
      PF: 'French Polynesia',
      GU: 'Guam',
      AS: 'American Samoa',
      MP: 'Northern Mariana Islands',
      PW: 'Palau',
      FM: 'Micronesia',
      MH: 'Marshall Islands',
      SB: 'Solomon Islands',
      VU: 'Vanuatu',
      WS: 'Samoa',
      TO: 'Tonga',
      KI: 'Kiribati',
      TV: 'Tuvalu',
      NR: 'Nauru',

      // Middle East & Africa
      IL: 'Israel',
      AE: 'United Arab Emirates',
      SA: 'Saudi Arabia',
      KW: 'Kuwait',
      QA: 'Qatar',
      BH: 'Bahrain',
      OM: 'Oman',
      JO: 'Jordan',
      LB: 'Lebanon',
      TR: 'Turkey',
      ZA: 'South Africa',
      EG: 'Egypt',
      KE: 'Kenya',
      NG: 'Nigeria',
      GH: 'Ghana',
      TN: 'Tunisia',
      MA: 'Morocco',
      DZ: 'Algeria',
      ET: 'Ethiopia',
      UG: 'Uganda',
      TZ: 'Tanzania',
      ZM: 'Zambia',
      ZW: 'Zimbabwe',
      MZ: 'Mozambique',
      AO: 'Angola',
      MG: 'Madagascar',
      CM: 'Cameroon',
      CI: 'Ivory Coast',
      SN: 'Senegal',
      ML: 'Mali',
      BF: 'Burkina Faso',
      NE: 'Niger',
      TD: 'Chad',
      SD: 'Sudan',
      SS: 'South Sudan',
      ER: 'Eritrea',
      DJ: 'Djibouti',
      SO: 'Somalia',
      RW: 'Rwanda',
      BI: 'Burundi',
      MW: 'Malawi',
      BW: 'Botswana',
      NA: 'Namibia',
      LS: 'Lesotho',
      SZ: 'Eswatini',
      GA: 'Gabon',
      CG: 'Republic of the Congo',
      CD: 'Democratic Republic of the Congo',
      CF: 'Central African Republic',
      BJ: 'Benin',
      TG: 'Togo',
      GN: 'Guinea',
      GW: 'Guinea-Bissau',
      SL: 'Sierra Leone',
      LR: 'Liberia',
      MR: 'Mauritania',
      GM: 'Gambia',
      CV: 'Cape Verde',
      ST: 'São Tomé and Príncipe',
      GQ: 'Equatorial Guinea',
      KM: 'Comoros',
      SC: 'Seychelles',
      MU: 'Mauritius',
      RE: 'Réunion',
      YT: 'Mayotte',
      IR: 'Iran',
      IQ: 'Iraq',
      YE: 'Yemen',
      SY: 'Syria',
      PS: 'Palestine',
      AF: 'Afghanistan',
      KZ: 'Kazakhstan',
      UZ: 'Uzbekistan',
      TM: 'Turkmenistan',
      TJ: 'Tajikistan',
      KG: 'Kyrgyzstan',
      MN: 'Mongolia',
      GE: 'Georgia',
      AM: 'Armenia',
      AZ: 'Azerbaijan',
      RU: 'Russia',
      BY: 'Belarus',
      UA: 'Ukraine',
      MD: 'Moldova',
      KP: 'North Korea',
    };
    return countryNames[countryCode.toUpperCase()] || countryCode;
  }

  private async getTwilioClient(
    accountId: string,
  ): Promise<twilio.Twilio | null> {
    try {
      const config = await this.getTwilioConfig(accountId);

      if (!config) {
        console.log(`❌ No Twilio config found for account: ${accountId}`);
        return null;
      }

      console.log(`✅ Twilio config found for account: ${accountId}`);
      // Crear cliente por tenant según mejores prácticas de Twilio
      return twilio(config.accountSid, config.authToken, {
        // Configuración recomendada por Twilio para 2025
        region: 'us1', // Región principal de Twilio
        edge: 'sydney', // Edge más cercano para latencia optimizada
        logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'warn', // Logging condicional
        // Configuraciones adicionales para 2025
        autoRetry: true, // Reintentos automáticos
        maxRetries: 3, // Máximo de reintentos
        maxRetryDelay: 1000, // Delay máximo entre reintentos en ms
      });
    } catch (error) {
      console.error(
        `❌ Error creating Twilio client for account ${accountId}:`,
        error,
      );
      return null;
    }
  }

  async getTwilioConfig(accountId: string) {
    const config = await this.prisma.accountTwilioConfig.findUnique({
      where: { accountId },
    });

    if (!config) {
      // En lugar de lanzar excepción, retornar null para manejo elegante
      return null;
    }

    return {
      accountSid: config.accountSid,
      authToken: config.authToken,
      webhookUrl: config.webhookUrl,
    };
  }

  async updateTwilioConfig(accountId: string, config: any) {
    // Detectar si es una cuenta de prueba basado en las credenciales usando la API oficial
    const isTestAccount = await this.detectTestAccount(
      config.accountSid,
      config.authToken,
    );

    const result = await this.prisma.accountTwilioConfig.upsert({
      where: { accountId },
      update: {
        accountSid: config.accountSid,
        authToken: config.authToken,
        webhookUrl: config.webhookUrl,
        status: isTestAccount ? 'trial' : 'active',
      },
      create: {
        accountId,
        accountSid: config.accountSid,
        authToken: config.authToken,
        webhookUrl: config.webhookUrl,
        status: isTestAccount ? 'trial' : 'active',
      },
    });

    // Sincronizar números de Twilio después de configurar credenciales
    try {
      this.logger.log(
        `Sincronizando números de Twilio para cuenta ${accountId}`,
      );
      await this.syncTwilioPhoneNumbers(accountId);
    } catch (error) {
      this.logger.warn(
        `No se pudieron sincronizar números de Twilio: ${error.message}`,
      );
      // No fallar la configuración si la sincronización falla
    }

    return result;
  }

  /**
   * Sincroniza números de Twilio con la base de datos local
   */
  async syncTwilioPhoneNumbers(accountId: string) {
    try {
      this.logger.log(
        `Iniciando sincronización de números para cuenta ${accountId}`,
      );

      // Verificar configuración primero
      const config = await this.getTwilioConfig(accountId);
      if (!config) {
        this.logger.error(
          `No se encontró configuración de Twilio para cuenta ${accountId}`,
        );
        throw new BadRequestException(
          'Configuración de Twilio no encontrada. Por favor, configura tus credenciales de Twilio primero.',
        );
      }

      this.logger.log(
        `Configuración encontrada para cuenta ${accountId}: AccountSid=${config.accountSid ? 'CONFIGURADO' : 'NO CONFIGURADO'}, AuthToken=${config.authToken ? 'CONFIGURADO' : 'NO CONFIGURADO'}`,
      );

      // Obtener números de Twilio directamente (sin transformar)
      const client = await this.getTwilioClient(accountId);

      if (!client) {
        this.logger.error(
          `No se pudo crear el cliente de Twilio para la cuenta ${accountId}`,
        );
        throw new BadRequestException('Error creando cliente de Twilio');
      }

      this.logger.log(
        `Cliente de Twilio creado exitosamente para cuenta ${accountId}`,
      );

      const twilioNumbersRaw = await client.incomingPhoneNumbers.list();

      this.logger.log(
        `Obtenidos ${twilioNumbersRaw?.length || 0} números de Twilio para cuenta ${accountId}`,
      );

      if (twilioNumbersRaw?.length === 0) {
        this.logger.log(`No hay números en Twilio para la cuenta ${accountId}`);
        return {
          synced: 0,
          message: 'No hay números en Twilio para sincronizar',
        };
      }

      let syncedCount = 0;

      // Sincronizar cada número
      for (const twilioNumber of twilioNumbersRaw) {
        try {
          this.logger.log(
            `Procesando número: ${twilioNumber.phoneNumber} (SID: ${twilioNumber.sid})`,
          );

          // LOG DE DIAGNÓSTICO: Ver datos completos de Twilio
          this.logger.log(
            `[DIAGNÓSTICO] Datos completos del número de Twilio:`,
            {
              phoneNumber: twilioNumber.phoneNumber,
              sid: twilioNumber.sid,
              isoCountry: (twilioNumber as any).isoCountry,
              region: (twilioNumber as any).region,
              locality: (twilioNumber as any).locality,
              postalCode: (twilioNumber as any).postalCode,
              capabilities: twilioNumber.capabilities,
              fullData: JSON.stringify(twilioNumber, null, 2),
            },
          );

          // Verificar si el número ya existe
          const existingNumber = await this.prisma.phoneNumber.findFirst({
            where: {
              number: twilioNumber.phoneNumber,
              accountId,
            },
          });

          // Determinar el país usando la función de resolución
          const resolvedCountry = resolvePhoneCountry({
            isoCountry: (twilioNumber as any).isoCountry,
            phoneNumber: twilioNumber.phoneNumber,
          });

          this.logger.log(
            `[DIAGNÓSTICO] País resuelto para ${twilioNumber.phoneNumber}: ${resolvedCountry}`,
          );

          if (existingNumber) {
            // Actualizar número existente
            this.logger.log(
              `Actualizando número existente: ${twilioNumber.phoneNumber} (ID: ${existingNumber.id})`,
            );
            await this.prisma.phoneNumber.update({
              where: { id: existingNumber.id },
              data: {
                country: resolvedCountry,
                capabilities: Object.keys(twilioNumber.capabilities).filter(
                  (key) => (twilioNumber.capabilities as any)[key],
                ),
                status: 'active',
                twilioSid: twilioNumber.sid, // Guardar el SID en el campo dedicado
                config: {
                  friendlyName: twilioNumber.friendlyName,
                  capabilities: twilioNumber.capabilities,
                  lastSynced: new Date().toISOString(),
                  twilioSid: twilioNumber.sid,
                },
              },
            });
            this.logger.log(
              `✅ Actualizado número existente: ${twilioNumber.phoneNumber} -> País: ${resolvedCountry}, SID: ${twilioNumber.sid}`,
            );
          } else {
            // Crear nuevo número
            this.logger.log(
              `Creando nuevo número: ${twilioNumber.phoneNumber}`,
            );
            const newNumber = await this.prisma.phoneNumber.create({
              data: {
                accountId,
                number: twilioNumber.phoneNumber,
                country: resolvedCountry,
                capabilities: Object.keys(twilioNumber.capabilities).filter(
                  (key) => (twilioNumber.capabilities as any)[key],
                ),
                status: 'active',
                twilioSid: twilioNumber.sid, // Guardar el SID en el campo dedicado
                config: {
                  friendlyName: twilioNumber.friendlyName,
                  capabilities: twilioNumber.capabilities,
                  lastSynced: new Date().toISOString(),
                  twilioSid: twilioNumber.sid,
                },
              },
            });
            this.logger.log(
              `✅ Creado nuevo número: ${twilioNumber.phoneNumber} -> País: ${resolvedCountry}, SID: ${twilioNumber.sid}, ID: ${newNumber.id}`,
            );
          }
          syncedCount++;
        } catch (numberError) {
          this.logger.error(
            `Error sincronizando número ${twilioNumber.phoneNumber}:`,
            numberError,
          );
        }
      }

      this.logger.log(
        `✅ Sincronización completada: ${syncedCount}/${twilioNumbersRaw.length} números`,
      );

      // Verificar que los números se guardaron correctamente en la base de datos
      const savedNumbers = await this.prisma.phoneNumber.findMany({
        where: { accountId, status: { not: 'released' } },
        select: { id: true, number: true, country: true, status: true },
      });

      this.logger.log(
        `📊 Números guardados en BD para cuenta ${accountId}: ${savedNumbers.length}`,
      );

      return {
        synced: syncedCount,
        total: twilioNumbersRaw.length,
        message: `Sincronizados ${syncedCount} números de Twilio`,
      };
    } catch (error) {
      this.logger.error(
        `Error sincronizando números de Twilio para cuenta ${accountId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Detecta si las credenciales son de una cuenta de prueba de Twilio
   * Basado en la documentación oficial de Twilio usando account.type
   * https://www.twilio.com/docs/iam/test-credentials
   */
  private async detectTestAccount(
    accountSid: string,
    authToken: string,
  ): Promise<boolean> {
    try {
      // Crear cliente temporal para verificar el tipo de cuenta
      const tempClient = twilio(accountSid, authToken);

      // Obtener información de la cuenta según documentación oficial
      const account = await tempClient.api.accounts(accountSid).fetch();

      // Verificar el tipo de cuenta según documentación oficial
      // "Trial" = Cuenta de prueba, "Full" = Cuenta real
      const isTestAccount = account.type === 'Trial';

      this.logger.log(
        `Cuenta Twilio detectada: ${account.friendlyName} (${account.type})`,
      );

      return isTestAccount;
    } catch (error) {
      this.logger.warn(
        `No se pudo verificar el tipo de cuenta Twilio: ${error.message}`,
      );

      // Fallback: Si no se puede verificar, asumir cuenta real por seguridad
      return false;
    }
  }

  async removeExistingPhoneNumbers(accountId: string) {
    this.logger.log(
      `Removiendo números telefónicos existentes para cuenta ${accountId}`,
    );

    try {
      // Obtener todos los números telefónicos de la cuenta
      const existingNumbers = await this.prisma.phoneNumber.findMany({
        where: { accountId },
      });

      if (existingNumbers.length === 0) {
        this.logger.log(
          `No hay números telefónicos existentes para remover en cuenta ${accountId}`,
        );
        return { removed: 0, message: 'No hay números telefónicos existentes' };
      }

      // Remover números de la base de datos
      const deleteResult = await this.prisma.phoneNumber.deleteMany({
        where: { accountId },
      });

      this.logger.log(
        `Removidos ${deleteResult.count} números telefónicos de la cuenta ${accountId}`,
      );

      return {
        removed: deleteResult.count,
        message: `Se removieron ${deleteResult.count} números telefónicos existentes`,
      };
    } catch (error) {
      this.logger.error(
        `Error removiendo números telefónicos para cuenta ${accountId}:`,
        error,
      );
      throw new BadRequestException(
        'Error removiendo números telefónicos existentes',
      );
    }
  }

  async removeTwilioConfig(accountId: string) {
    this.logger.log(
      `Eliminando configuración de Twilio para cuenta ${accountId}`,
    );

    try {
      // Eliminar configuración de Twilio de la base de datos
      const deleteResult = await this.prisma.accountTwilioConfig.deleteMany({
        where: { accountId },
      });

      this.logger.log(
        `Configuración de Twilio eliminada para cuenta ${accountId}: ${deleteResult.count} registros eliminados`,
      );

      return {
        deleted: deleteResult.count,
        message: 'Configuración de Twilio eliminada exitosamente',
      };
    } catch (error) {
      this.logger.error(
        `Error eliminando configuración de Twilio para cuenta ${accountId}:`,
        error,
      );
      throw new BadRequestException('Error eliminando configuración de Twilio');
    }
  }

  async validateTwilioCredentials(accountSid: string, authToken: string) {
    try {
      const client = twilio(accountSid, authToken);
      const account = await client.api.accounts(accountSid).fetch();

      return {
        valid: true,
        account: {
          friendlyName: account.friendlyName,
          status: account.status,
          type: account.type,
        },
      };
    } catch (error) {
      // Manejo de errores según documentación oficial de Twilio
      if (error.code === 20003) {
        throw new BadRequestException(
          'Credenciales de Twilio inválidas: Account SID o Auth Token incorrectos',
        );
      } else if (error.code === 20404) {
        throw new BadRequestException('Account SID no encontrado');
      } else if (error.code === 20001) {
        throw new BadRequestException('Credenciales de Twilio no configuradas');
      } else {
        this.logger.error('Error validando credenciales de Twilio:', error);
        throw new BadRequestException(
          `Error validando credenciales: ${error.message}`,
        );
      }
    }
  }

  async makeCall(
    accountId: string,
    callData: {
      to: string;
      from: string;
      agentId: string;
      campaignId?: string;
      contactId?: string;
    },
  ) {
    // Validación de entrada según mejores prácticas
    if (!callData.to || !callData.from || !callData.agentId) {
      throw new BadRequestException(
        'Los campos to, from y agentId son requeridos',
      );
    }

    // Validación de formato de número telefónico
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(callData.to) || !phoneRegex.test(callData.from)) {
      throw new BadRequestException('Formato de número telefónico inválido');
    }

    try {
      const client = await this.getTwilioClient(accountId);
      const config = await this.getTwilioConfig(accountId);

      // Obtener configuración del agente
      const agent = await this.prisma.agent.findFirst({
        where: { id: callData.agentId, accountId },
      });

      if (!agent) {
        throw new BadRequestException('Agente no encontrado');
      }

      // Crear TwiML para la llamada
      const twiml = this.generateCallTwiML(agent, config.webhookUrl);

      // Realizar la llamada según documentación oficial Twilio 2024
      const call = await client.calls.create({
        to: callData.to,
        from: callData.from,
        twiml,
        record: true,
        recordingStatusCallback: `${config.webhookUrl}/webhooks/twilio/recording`,
        statusCallback: `${config.webhookUrl}/webhooks/twilio/status`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        // Opciones adicionales según documentación 2024
        timeout: 30, // Timeout de 30 segundos
        // recordFromAnswer: true, // No disponible en esta versión de Twilio
        recordingChannels: 'dual', // Grabar ambos canales
        recordingTrack: 'both_tracks', // Ambas pistas
        // Configuración de calidad
        machineDetection: 'Enable', // Detectar máquinas
        machineDetectionTimeout: 30, // Timeout para detección
        // Configuración de red
        sipAuthUsername: null, // Para llamadas SIP
        sipAuthPassword: null, // Para llamadas SIP
      });

      // Iniciar la conversación con ElevenLabs ANTES de registrar en la BD
      // para poder guardar el conversation_id
      let elevenLabsConversation;
      try {
        elevenLabsConversation = await this.elevenLabsService.makeOutboundCall(
          accountId,
          agent.elevenLabsAgentId,
          callData.from, // Este debería ser el ID del número de Twilio, no el número
          callData.to,
          { metadata: { twilio_call_sid: call.sid } },
        );
      } catch (elevenLabsError) {
        this.logger.error(
          'Error iniciando conversación en ElevenLabs, cancelando llamada de Twilio.',
          elevenLabsError,
        );
        await client.calls(call.sid).update({ status: 'canceled' });
        throw new BadRequestException(
          'Fallo al iniciar el agente de IA. La llamada ha sido cancelada.',
        );
      }

      // Registrar la llamada en la base de datos
      const callRecord = await this.prisma.call.create({
        data: {
          accountId,
          agentId: callData.agentId,
          campaignId: callData.campaignId,
          contactId: callData.contactId,
          phoneNumber: callData.to,
          direction: 'outbound',
          type: callData.campaignId ? 'campaign' : 'manual',
          status: 'initiated',
          elevenLabsConversationId: elevenLabsConversation?.conversation_id,
          notes: JSON.stringify({
            twilioCallSid: call.sid,
            from: callData.from,
            to: callData.to,
          }),
        },
      });

      this.logger.log(
        `Llamada iniciada: ${call.sid} - ${callData.from} -> ${callData.to}`,
      );

      return {
        callSid: call.sid,
        status: call.status,
        to: callData.to,
        from: callData.from,
        callId: callRecord.id,
      };
    } catch (error) {
      this.logger.error('Error realizando llamada:', error);
      throw new BadRequestException(
        `Error realizando llamada: ${error.message}`,
      );
    }
  }

  private generateCallTwiML(agent: any, webhookUrl: string): string {
    // TwiML optimizado para 2025 con integración OpenAI Realtime API
    // Según documentación oficial de Twilio 2025
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="${agent.voiceName || 'Polly.Lupe'}" language="es-ES">
        Hola, soy ${agent.name}. ${agent.preMadePrompt || '¿En qué puedo ayudarte hoy?'}
    </Say>
    <Gather input="speech" action="${webhookUrl}/webhooks/twilio/voice" 
            speechTimeout="3" timeout="10" numDigits="1"
            speechModel="experimental_conversations"
            enhanced="true"
            partialResultCallback="${webhookUrl}/webhooks/twilio/partial"
            partialResultCallbackMethod="POST">
        <Say voice="${agent.voiceName || 'Polly.Lupe'}" language="es-ES">
            Por favor, dime cómo puedo ayudarte.
        </Say>
    </Gather>
    <Say voice="${agent.voiceName || 'Polly.Lupe'}" language="es-ES">
        No pude escucharte bien. Por favor, inténtalo de nuevo más tarde.
    </Say>
    <Hangup/>
</Response>`;
  }

  async getPhoneNumbers(accountId: string) {
    try {
      const client = await this.getTwilioClient(accountId);
      const phoneNumbers = await client.incomingPhoneNumbers.list();

      return phoneNumbers.map((number) => ({
        sid: number.sid,
        phoneNumber: number.phoneNumber,
        friendlyName: number.friendlyName,
        capabilities: number.capabilities,
        status: number.status,
        isoCountry: (number as any).isoCountry, // Acceso dinámico a un campo que puede o no existir
        voiceUrl: number.voiceUrl,
        smsUrl: number.smsUrl,
        voiceMethod: number.voiceMethod,
        smsMethod: number.smsMethod,
        dateCreated: number.dateCreated,
        dateUpdated: number.dateUpdated,
      }));
    } catch (error) {
      this.logger.error('Error obteniendo números telefónicos:', error);
      throw new BadRequestException('Error obteniendo números telefónicos');
    }
  }

  async getPurchasedPhoneNumbers(accountId: string) {
    try {
      this.logger.log(
        `Obteniendo números comprados de Twilio para cuenta ${accountId}`,
      );

      const client = await this.getTwilioClient(accountId);
      this.logger.log(
        `Cliente Twilio creado exitosamente para cuenta ${accountId}`,
      );

      const phoneNumbers = await client.incomingPhoneNumbers.list();
      this.logger.log(
        `Obtenidos ${phoneNumbers.length} números de Twilio para cuenta ${accountId}`,
      );

      return phoneNumbers.map((number) => {
        const capabilitiesArray = number.capabilities
          ? Object.keys(number.capabilities).filter(
              (key) => (number.capabilities as any)[key],
            )
          : [];

        return {
          id: number.sid,
          number: number.phoneNumber,
          country: resolvePhoneCountry({
            isoCountry: (number as any).isoCountry,
            phoneNumber: number.phoneNumber,
          }),
          region: (number as any).region || 'N/A',
          capabilities: capabilitiesArray,
          status: number.status as 'active' | 'inactive' | 'pending',
          assignedAgentId: undefined, // Esta información no viene de Twilio directamente
          createdAt: number.dateCreated.toISOString(),
          updatedAt: number.dateUpdated.toISOString(),
        };
      });
    } catch (error) {
      this.logger.error(
        `Error obteniendo números comprados de Twilio para cuenta ${accountId}:`,
        {
          error: error.message,
          code: error.code,
          status: error.status,
          moreInfo: error.moreInfo,
        },
      );

      // Proporcionar mensajes de error más específicos
      if (error.code === 20003) {
        throw new BadRequestException(
          'Credenciales de Twilio inválidas. Por favor, verifica tu Account SID y Auth Token.',
        );
      } else if (error.code === 20404) {
        throw new BadRequestException(
          'Cuenta de Twilio no encontrada. Por favor, verifica tu Account SID.',
        );
      } else if (error.message?.includes('Test Account Credentials')) {
        throw new BadRequestException(
          'Las credenciales de prueba de Twilio no pueden acceder a números reales. Usa credenciales de producción.',
        );
      } else {
        throw new BadRequestException(
          `Error de Twilio: ${error.message || 'Error desconocido'}`,
        );
      }
    }
  }

  async purchasePhoneNumber(
    accountId: string,
    phoneNumber: string,
    areaCode?: string,
  ) {
    try {
      const client = await this.getTwilioClient(accountId);
      const config = await this.getTwilioConfig(accountId);

      if (!config) {
        throw new BadRequestException(
          'La configuración de Twilio no se encuentra para esta cuenta.',
        );
      }

      let voiceUrl = config.webhookUrl
        ? `${config.webhookUrl}/webhooks/twilio/voice`
        : null;
      let statusCallback = config.webhookUrl
        ? `${config.webhookUrl}/webhooks/twilio/status`
        : null;

      const isInvalidUrl = !voiceUrl || voiceUrl.includes('localhost');

      if (isInvalidUrl) {
        if (process.env.NODE_ENV === 'development') {
          this.logger.warn(
            'Webhook URL es localhost o no está configurada. Usando URL de demo de Twilio para la compra en entorno de desarrollo.',
          );
          voiceUrl = 'http://demo.twilio.com/docs/voice.xml';
          statusCallback = null; // No necesitamos status callback para la compra de prueba
        } else {
          // En producción, es un error si la URL no es válida.
          throw new BadRequestException(
            'La Webhook URL no está configurada o no es una URL pública válida. Por favor, actualiza tu configuración de Twilio.',
          );
        }
      }

      const purchasedNumber = await client.incomingPhoneNumbers.create({
        phoneNumber: phoneNumber || undefined,
        areaCode: areaCode || undefined,
        voiceUrl,
        voiceMethod: 'POST',
        statusCallback: statusCallback || undefined,
        statusCallbackMethod: 'POST',
      });

      // Guardar en la base de datos
      const phoneNumberRecord = await this.prisma.phoneNumber.create({
        data: {
          accountId,
          number: purchasedNumber.phoneNumber,
          country: resolvePhoneCountry({
            isoCountry: (purchasedNumber as any).isoCountry,
            phoneNumber: purchasedNumber.phoneNumber,
          }),
          type: 'local',
          capabilities: purchasedNumber.capabilities
            ? Object.keys(purchasedNumber.capabilities).filter(
                (key) => purchasedNumber.capabilities[key],
              )
            : [],
          provider: 'twilio',
          status: 'active',
          twilioSid: purchasedNumber.sid,
          config: {
            voiceUrl: purchasedNumber.voiceUrl,
            statusCallback: purchasedNumber.statusCallback,
          },
        },
      });

      this.logger.log(
        `Número telefónico comprado: ${purchasedNumber.phoneNumber}`,
      );

      // Registrar el número en ElevenLabs si está configurado
      try {
        this.logger.log(
          `Registrando número ${purchasedNumber.phoneNumber} en ElevenLabs...`,
        );

        const result = await this.elevenLabsService.registerPhoneNumber(
          accountId,
          purchasedNumber.phoneNumber,
          purchasedNumber.sid,
          config.authToken,
          purchasedNumber.friendlyName || purchasedNumber.phoneNumber,
        );

        // Actualizar el registro con el ID de ElevenLabs
        await this.prisma.phoneNumber.update({
          where: { id: phoneNumberRecord.id },
          data: {
            elevenLabsPhoneNumberId: result.phone_number_id,
          },
        });

        this.logger.log(
          `✅ Número ${purchasedNumber.phoneNumber} registrado exitosamente en ElevenLabs con ID: ${result.phone_number_id}`,
        );
      } catch (elevenLabsError) {
        this.logger.error(
          `Error registrando número ${purchasedNumber.phoneNumber} en ElevenLabs:`,
          elevenLabsError.message,
        );
        // No lanzar error aquí para no fallar la compra del número
        // El usuario puede sincronizar el número manualmente después
      }

      return {
        sid: purchasedNumber.sid,
        phoneNumber: purchasedNumber.phoneNumber,
        friendlyName: purchasedNumber.friendlyName,
        capabilities: purchasedNumber.capabilities,
      };
    } catch (error) {
      this.logger.error('Error comprando número telefónico:', error);
      throw new BadRequestException('Error comprando número telefónico');
    }
  }

  async handleWebhook(
    webhookData: any,
    type: 'voice' | 'status' | 'recording',
  ) {
    try {
      this.logger.log(`Webhook recibido - Tipo: ${type}`, webhookData);

      switch (type) {
        case 'voice':
          return this.handleVoiceWebhook(webhookData);
        case 'status':
          return this.handleStatusWebhook(webhookData);
        case 'recording':
          return this.handleRecordingWebhook(webhookData);
        default:
          throw new BadRequestException('Tipo de webhook no soportado');
      }
    } catch (error) {
      this.logger.error('Error procesando webhook:', error);
      throw new BadRequestException('Error procesando webhook');
    }
  }

  private async handleVoiceWebhook(webhookData: any) {
    // Procesar respuesta de voz del usuario
    const speechResult = webhookData.SpeechResult;
    const _callSid = webhookData.CallSid;

    // Aquí se integraría con el sistema de IA para generar respuesta
    // Por ahora, devolvemos un TwiML básico
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>
        Entendí que dijiste: ${speechResult}. Gracias por tu respuesta.
    </Say>
    <Hangup/>
</Response>`;
  }

  private async handleStatusWebhook(webhookData: any) {
    const callSid = webhookData.CallSid;
    const callStatus = webhookData.CallStatus;

    // Actualizar estado de la llamada en la base de datos
    await this.prisma.call.updateMany({
      where: {
        notes: {
          contains: callSid,
        },
      },
      data: {
        status: callStatus,
        ...(callStatus === 'completed' && {
          completedAt: new Date(),
          duration: parseInt(webhookData.CallDuration) || 0,
        }),
      },
    });

    this.logger.log(
      `Estado de llamada actualizado: ${callSid} - ${callStatus}`,
    );
  }

  private async handleRecordingWebhook(webhookData: any) {
    const callSid = webhookData.CallSid;
    const recordingUrl = webhookData.RecordingUrl;

    // Actualizar URL de grabación en la base de datos
    await this.prisma.call.updateMany({
      where: {
        notes: {
          contains: callSid,
        },
      },
      data: {
        recordingUrl,
      },
    });

    this.logger.log(`Grabación disponible: ${callSid} - ${recordingUrl}`);
  }

  // ===== MÉTODOS DE MÉTRICAS Y ANALÍTICAS (2025) =====

  /**
   * Obtener métricas de llamadas según documentación oficial Twilio 2025
   */
  async getCallMetrics(
    accountId: string,
    dateRange?: { from: Date; to: Date },
  ): Promise<TwilioCallMetrics> {
    try {
      const client = await this.getTwilioClient(accountId);

      // Construir filtros de fecha
      const filters: any = {};
      if (dateRange) {
        filters.startTimeAfter = dateRange.from;
        filters.startTimeBefore = dateRange.to;
      }

      // Obtener todas las llamadas con filtros
      const calls = await client.calls.list(filters);

      // Calcular métricas
      const totalCalls = calls.length;
      const answeredCalls = calls.filter(
        (call) => call.status === 'completed',
      ).length;
      const missedCalls = calls.filter(
        (call) => call.status === 'no-answer' || call.status === 'busy',
      ).length;

      const totalMinutes =
        calls
          .filter((call) => call.duration)
          .reduce((total, call) => total + (Number(call.duration) || 0), 0) /
        60;

      const totalCost = calls
        .filter((call) => call.price)
        .reduce((total, call) => total + parseFloat(call.price || '0'), 0);

      const averageDuration =
        totalCalls > 0
          ? calls.reduce(
              (total, call) => total + (Number(call.duration) || 0),
              0,
            ) /
            totalCalls /
            60
          : 0;

      const successRate =
        totalCalls > 0 ? (answeredCalls / totalCalls) * 100 : 0;

      this.logger.log(
        `Métricas calculadas para ${accountId}: ${totalCalls} llamadas, ${successRate.toFixed(2)}% éxito`,
      );

      return {
        totalCalls,
        answeredCalls,
        missedCalls,
        totalMinutes: Math.round(totalMinutes * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        averageDuration: Math.round(averageDuration * 100) / 100,
        successRate: Math.round(successRate * 100) / 100,
      };
    } catch (error) {
      this.logger.error('Error obteniendo métricas de Twilio:', error);
      throw new BadRequestException('Error obteniendo métricas de llamadas');
    }
  }

  /**
   * Obtener llamadas recientes según documentación oficial Twilio 2025
   */
  async getRecentCalls(accountId: string, limit: number = 10): Promise<any[]> {
    try {
      const client = await this.getTwilioClient(accountId);

      if (!client) {
        this.logger.warn(
          `No se pudo obtener el cliente de Twilio para la cuenta ${accountId}. Devolviendo array vacío.`,
        );
        return [];
      }

      const calls = await client.calls.list({
        limit,
      });

      return calls.map((call) => ({
        id: call.sid,
        from: call.from,
        to: call.to,
        status: call.status,
        direction: call.direction,
        duration: call.duration,
        startTime: call.startTime,
        endTime: call.endTime,
        price: call.price,
        priceUnit: call.priceUnit,
        recordingUrl: undefined, // Simplificado por ahora
      }));
    } catch (error) {
      this.logger.error(
        'Error obteniendo llamadas recientes de Twilio:',
        error,
      );
      // Devolver array vacío en lugar de lanzar excepción
      return [];
    }
  }

  /**
   * Obtener números de teléfono disponibles según documentación oficial Twilio 2025
   * https://www.twilio.com/docs/phone-numbers/api/available-phone-numbers
   */
  async getAvailablePhoneNumbers(
    accountId: string,
    countryCode: string = 'US',
    numberType: 'local' | 'tollFree' | 'mobile' = 'local',
    options: {
      areaCode?: string;
      search?: string;
      startsWith?: string;
      endsWith?: string;
      limit?: number;
      voiceEnabled?: boolean;
      smsEnabled?: boolean;
      mmsEnabled?: boolean;
      faxEnabled?: boolean;
      beta?: boolean;
    } = {},
  ): Promise<any[]> {
    try {
      console.log(
        `🔍 Getting available phone numbers for account: ${accountId}, country: ${countryCode}, type: ${numberType}`,
      );
      const client = await this.getTwilioClient(accountId);

      if (!client) {
        console.log(`❌ No Twilio client found for account: ${accountId}`);
        throw new BadRequestException(
          'TWILIO_CREDENTIALS_NOT_CONFIGURED: Por favor, configura tus credenciales de Twilio en la sección de Ajustes para poder buscar números disponibles.',
        );
      }
      const {
        areaCode,
        search,
        startsWith,
        endsWith,
        limit = 20,
        voiceEnabled,
        smsEnabled,
        mmsEnabled,
        faxEnabled,
        beta = false,
      } = options;

      // Obtener precios para el país ANTES de buscar números
      const pricing = await this.getPhoneNumberPricingForCountry(
        accountId,
        countryCode,
      );

      const searchParams: any = {
        limit: Math.min(limit || 20, 100),
      };

      // Añadir filtros solo si son 'true', para no enviar 'false' a la API
      if (voiceEnabled) searchParams.voiceEnabled = true;
      if (smsEnabled) searchParams.smsEnabled = true;
      if (mmsEnabled) searchParams.mmsEnabled = true;
      if (faxEnabled) searchParams.faxEnabled = true;
      if (beta) searchParams.beta = true;

      // Corregir uso de variable no definida
      if (areaCode && areaCode.trim() && ['US', 'CA'].includes(countryCode)) {
        searchParams.areaCode = areaCode.trim();
      }

      if (search && search.trim()) {
        const searchTerm = search.trim();
        const isStateOrProvince =
          /^[A-Za-z]{2}$/.test(searchTerm) &&
          ['US', 'CA'].includes(countryCode);

        if (/^\d{3}$/.test(searchTerm) && ['US', 'CA'].includes(countryCode)) {
          // Búsqueda por código de área (3 dígitos)
          searchParams.areaCode = searchTerm;
        } else if (isStateOrProvince) {
          // Búsqueda por código de estado (2 letras, ej: FL, CA, NY)
          searchParams.inRegion = searchTerm.toUpperCase();
        } else {
          // Búsqueda por ciudad con estado (ej: "Miami Florida", "Miami FL", "Miami, FL")
          // Extraer ciudad y estado si están presentes
          const cityStateMatch = searchTerm.match(
            /^([A-Za-z\s]+?)(?:\s*,\s*|\s+)(FL|Florida|CA|California|NY|New York|TX|Texas|IL|Illinois|GA|Georgia|OH|Ohio|NC|North Carolina|PA|Pennsylvania|MI|Michigan|NJ|New Jersey|WA|Washington|AZ|Arizona|MA|Massachusetts|TN|Tennessee|IN|Indiana|MO|Missouri|MD|Maryland|WI|Wisconsin|CO|Colorado|MN|Minnesota|SC|South Carolina|AL|Alabama|LA|Louisiana|KY|Kentucky|OR|Oregon|OK|Oklahoma|CT|Connecticut|UT|Utah|IA|Iowa|AR|Arkansas|NV|Nevada|MS|Mississippi|KS|Kansas|NM|New Mexico|NE|Nebraska|WV|West Virginia|ID|Idaho|HI|Hawaii|NH|New Hampshire|ME|Maine|MT|Montana|RI|Rhode Island|DE|Delaware|SD|South Dakota|ND|North Dakota|AK|Alaska|DC|District of Columbia|VT|Vermont|WY|Wyoming)$/i,
          );

          if (cityStateMatch) {
            // El usuario especificó ciudad y estado
            const city = cityStateMatch[1].trim();
            const state = cityStateMatch[2].trim();

            // Convertir nombre completo de estado a código de 2 letras si es necesario
            const stateCode = this.getStateCode(state);

            searchParams.inLocality = city;
            searchParams.inRegion = stateCode;

            this.logger.log(
              `Búsqueda por ciudad y estado: ${city}, ${stateCode}`,
            );
          } else if (/^[A-Za-z\s]+$/.test(searchTerm)) {
            // Solo ciudad sin estado especificado
            // Para ciudades conocidas, asumir el estado más común
            const cityStateMapping = this.getCityStateMapping(searchTerm);

            if (cityStateMapping) {
              searchParams.inLocality = cityStateMapping.city;
              searchParams.inRegion = cityStateMapping.state;
              this.logger.log(
                `Búsqueda por ciudad (asumiendo estado): ${cityStateMapping.city}, ${cityStateMapping.state}`,
              );
            } else {
              // Intentar buscar por estado directamente
              const stateMapping = this.getStateFromCityOrState(searchTerm);
              if (stateMapping) {
                searchParams.inRegion = stateMapping;
                this.logger.log(
                  `Búsqueda por ciudad/estado detectada: ${searchTerm} -> ${stateMapping}`,
                );
              } else {
                // Ciudad no reconocida, buscar solo por ciudad
                searchParams.inLocality = searchTerm;
                this.logger.log(`Búsqueda por ciudad: ${searchTerm}`);
              }
            }
          } else {
            // Búsqueda por número de teléfono (contiene)
            searchParams.contains = searchTerm;
          }
        }
      }

      let numbers;
      const availableNumbersApi = client.availablePhoneNumbers(countryCode);
      const isMobileSearch = numberType === 'mobile';

      // Para búsquedas 'mobile' en países como US, Twilio las gestiona bajo 'local'.
      // Por tanto, buscamos 'local' y luego filtramos por capacidades.
      const apiNumberType = isMobileSearch ? 'local' : numberType;

      switch (apiNumberType) {
        case 'tollFree':
          numbers = await availableNumbersApi.tollFree.list(searchParams);
          break;
        case 'local':
        default:
          numbers = await availableNumbersApi.local.list(searchParams);
          break;
      }

      // Si la intención era buscar un número móvil, filtramos los resultados locales
      // para incluir solo aquellos con capacidades de SMS o MMS.
      if (isMobileSearch) {
        numbers = numbers.filter(
          (number) => number.capabilities.SMS || number.capabilities.MMS,
        );
      }

      this.logger.log(
        `Encontrados ${numbers.length} números de tipo '${numberType}' para ${countryCode}`,
      );

      // Si no se encontraron números con los filtros específicos, intentar búsqueda por estado
      if (numbers.length === 0 && search && search.trim()) {
        const searchTerm = search.trim();

        // Verificar si la búsqueda fue por ciudad con estado
        const cityStateMapping = this.getCityStateMapping(searchTerm);

        if (cityStateMapping) {
          this.logger.log(
            `No se encontraron números en ${cityStateMapping.city}, ${cityStateMapping.state}. Intentando búsqueda por estado ${cityStateMapping.state}...`,
          );

          const stateSearchParams: any = {
            limit: Math.min(limit || 20, 100),
            inRegion: cityStateMapping.state,
          };

          // Añadir filtros de capacidades solo si son 'true'
          if (voiceEnabled) stateSearchParams.voiceEnabled = true;
          if (smsEnabled) stateSearchParams.smsEnabled = true;
          if (mmsEnabled) stateSearchParams.mmsEnabled = true;
          if (faxEnabled) stateSearchParams.faxEnabled = true;
          if (beta) stateSearchParams.beta = true;

          // Intentar búsqueda por estado
          switch (apiNumberType) {
            case 'tollFree':
              numbers =
                await availableNumbersApi.tollFree.list(stateSearchParams);
              break;
            case 'local':
            default:
              numbers = await availableNumbersApi.local.list(stateSearchParams);
              break;
          }

          // Si la intención era buscar un número móvil, filtrar los resultados locales
          if (isMobileSearch) {
            numbers = numbers.filter(
              (number) => number.capabilities.SMS || number.capabilities.MMS,
            );
          }

          this.logger.log(
            `Búsqueda por estado ${cityStateMapping.state} devolvió ${numbers.length} números`,
          );
        }
      }

      // NO hacer búsqueda general si no se encontraron números con filtros específicos
      // Esto asegura que los filtros del usuario se respeten
      if (numbers.length === 0 && (search || startsWith || endsWith)) {
        this.logger.log(
          `No se encontraron números con los filtros especificados. Respete los criterios de búsqueda del usuario.`,
        );
      }

      let mappedNumbers = numbers.map((number) => {
        let price = 0;
        switch (numberType) {
          case 'tollFree':
            price = pricing.tollFree;
            break;
          case 'mobile':
            price = pricing.mobile;
            break;
          default:
            price = pricing.local;
            break;
        }

        // Convertir capacidades a array de strings en minúsculas
        const capabilitiesArray = Object.keys(number.capabilities)
          .filter((key) => number.capabilities[key])
          .map((key) => key.toLowerCase());

        return {
          phoneNumber: number.phoneNumber,
          number: number.phoneNumber,
          friendlyName: number.friendlyName || number.phoneNumber,
          numberType,
          price,
          setupPrice: 0, // La API de precios no detalla esto, asumimos 0 por ahora
          country: countryCode,
          region: number.region || 'N/A',
          locality: number.locality || 'N/A',
          capabilities: capabilitiesArray,
          addressRequirements: number.addressRequirements || 'none',
          beta: number.beta || false,
        };
      });

      // Filtrar por startsWith si está especificado
      // Busca en la parte del prefijo local (después del código de área)
      // Ejemplo: +1-809-555-3030 → busca "555" (prefijo local)
      if (options.startsWith) {
        this.logger.log(`Filtrando por startsWith: "${options.startsWith}"`);
        const startsWithPattern = options.startsWith.replace(/\D/g, '');
        this.logger.log(
          `Patrón de búsqueda (solo números): "${startsWithPattern}"`,
        );
        mappedNumbers = mappedNumbers.filter((number) => {
          const phoneDigits = number.number.replace(/\D/g, '');

          // Para números de EEUU/Canadá (+1): formato 1XXXYYYZZZZ
          // Donde XXX = código de área (3 dígitos)
          // YYY = prefijo local (3 dígitos) - esto es lo que buscamos
          // ZZZZ = últimos 4 dígitos
          if (phoneDigits.startsWith('1') && phoneDigits.length === 11) {
            const localPrefix = phoneDigits.substring(4, 7);
            const matches = localPrefix.startsWith(startsWithPattern);
            if (matches) {
              this.logger.log(
                `Número ${number.number} coincide: prefijo local "${localPrefix}" inicia con "${startsWithPattern}"`,
              );
            }
            return matches;
          }

          return phoneDigits.includes(startsWithPattern);
        });
        this.logger.log(
          `Filtrado por startsWith "${options.startsWith}" (prefijo local): ${mappedNumbers.length} números encontrados`,
        );
      }

      // Filtrar por endsWith si está especificado
      if (options.endsWith) {
        this.logger.log(`Filtrando por endsWith: "${options.endsWith}"`);
        const endsWithPattern = options.endsWith.replace(/\D/g, '');
        this.logger.log(
          `Patrón de búsqueda (solo números): "${endsWithPattern}"`,
        );
        mappedNumbers = mappedNumbers.filter((number) => {
          const phoneDigits = number.number.replace(/\D/g, '');
          const matches = phoneDigits.endsWith(endsWithPattern);
          if (matches) {
            this.logger.log(
              `Número ${number.number} coincide: termina con "${endsWithPattern}"`,
            );
          }
          return matches;
        });
        this.logger.log(
          `Filtrado por endsWith "${options.endsWith}": ${mappedNumbers.length} números encontrados`,
        );
      }

      // NO hacer búsqueda general si no se encontraron números después de filtrar
      // Esto asegura que los filtros del usuario se respeten
      if (
        mappedNumbers.length === 0 &&
        (options.search || options.startsWith || options.endsWith)
      ) {
        this.logger.log(
          `No se encontraron números después de filtrar. Respete los criterios de búsqueda del usuario.`,
        );
      }

      return mappedNumbers;
    } catch (error) {
      this.logger.error(
        'Error obteniendo números disponibles de Twilio:',
        error,
      );
      if (error.message?.includes('Authentication Error')) {
        throw new BadRequestException(
          'Credenciales de Twilio no configuradas o inválidas.',
        );
      }
      if (error.message?.includes('not supported')) {
        throw new BadRequestException(
          `El país ${countryCode} no está soportado por Twilio.`,
        );
      }
      throw new BadRequestException(
        error.message || 'Error obteniendo números disponibles',
      );
    }
  }

  /**
   * Procesar webhook de Twilio según documentación oficial 2025
   */
  async processWebhook(
    webhookData: TwilioWebhookEvent,
    accountId: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `Procesando webhook de Twilio: ${webhookData.CallSid} - ${webhookData.CallStatus}`,
      );

      // Actualizar o crear registro de llamada en la base de datos
      // Nota: Como no hay externalId en el esquema, usamos el CallSid en notes
      // Capturar tanto From como To para tener ambos números de teléfono
      const twilioNotes = {
        twilioCallSid: webhookData.CallSid,
        from: webhookData.From,
        to: webhookData.To,
        direction: webhookData.Direction,
        callStatus: webhookData.CallStatus,
        recordingUrl: webhookData.RecordingUrl,
        transcriptionText: webhookData.TranscriptionText,
      };

      await this.prisma.call.create({
        data: {
          accountId,
          agentId: 'default-agent-id', // Necesario según el esquema
          phoneNumber: webhookData.To || webhookData.From, // Usar To para outbound, From para inbound
          direction: webhookData.Direction as 'inbound' | 'outbound',
          type: 'manual', // Campo requerido
          status: this.mapTwilioStatus(webhookData.CallStatus),
          duration: webhookData.Duration ? parseInt(webhookData.Duration) : 0,
          recordingUrl: webhookData.RecordingUrl,
          transcript: webhookData.TranscriptionText,
          notes: JSON.stringify(twilioNotes), // Almacenar todos los datos de Twilio
        },
      });

      this.logger.log(`Webhook procesado exitosamente: ${webhookData.CallSid}`);
    } catch (error) {
      this.logger.error('Error procesando webhook de Twilio:', error);
      throw new BadRequestException('Error procesando webhook');
    }
  }

  /**
   * Obtener países disponibles desde la API de Twilio
   * Según documentación oficial: https://www.twilio.com/docs/phone-numbers/api/available-phone-numbers
   */
  async getAvailableCountries(
    accountId: string,
  ): Promise<Array<{ code: string; name: string; supported: boolean }>> {
    try {
      console.log(`🔍 Getting Twilio client for account: ${accountId}`);
      const client = await this.getTwilioClient(accountId);

      if (!client) {
        console.log(`❌ No Twilio client found for account: ${accountId}`);
        throw new BadRequestException(
          'TWILIO_CREDENTIALS_NOT_CONFIGURED: Por favor, configura tus credenciales de Twilio en la sección de Ajustes para poder ver los países disponibles.',
        );
      }

      // Obtener países disponibles desde la API de Twilio
      console.log(
        `🔍 Fetching countries from Twilio API for account: ${accountId}`,
      );
      const response = await client.availablePhoneNumbers.list();

      // Mapear respuesta a formato estándar
      const countries = response.map((country) => ({
        code: country.countryCode,
        name: this.getCountryName(country.countryCode),
        supported: true,
        // Información adicional de Twilio
        subresourceUris: country.subresourceUris,
        uri: country.uri,
      }));

      console.log(
        `✅ Successfully fetched ${countries.length} countries from Twilio API`,
      );

      // Agregar países adicionales que pueden no estar en la lista de Twilio pero son compatibles para llamadas
      const additionalCountries = [
        { code: 'DO', name: 'Dominican Republic', supported: true },
        { code: 'JM', name: 'Jamaica', supported: true },
        { code: 'BS', name: 'Bahamas', supported: true },
        { code: 'BB', name: 'Barbados', supported: true },
        { code: 'TT', name: 'Trinidad and Tobago', supported: true },
        { code: 'AG', name: 'Antigua and Barbuda', supported: true },
        { code: 'LC', name: 'Saint Lucia', supported: true },
        {
          code: 'VC',
          name: 'Saint Vincent and the Grenadines',
          supported: true,
        },
        { code: 'KN', name: 'Saint Kitts and Nevis', supported: true },
        { code: 'DM', name: 'Dominica', supported: true },
        { code: 'GD', name: 'Grenada', supported: true },
      ];

      // Combinar países de Twilio con países adicionales, evitando duplicados
      const countryMap = new Map();

      // Agregar países de Twilio
      countries.forEach((country) => {
        countryMap.set(country.code, country);
      });

      // Agregar países adicionales si no existen ya
      additionalCountries.forEach((country) => {
        if (!countryMap.has(country.code)) {
          countryMap.set(country.code, country);
        }
      });

      const finalCountries = Array.from(countryMap.values());

      this.logger.log(
        `Países disponibles obtenidos de Twilio: ${countries.length} países`,
      );
      this.logger.log(
        `Países adicionales agregados: ${additionalCountries.length} países`,
      );
      this.logger.log(
        `Total de países disponibles: ${finalCountries.length} países`,
      );

      return finalCountries;
    } catch (error) {
      this.logger.error(
        'Error obteniendo países disponibles de Twilio:',
        error,
      );

      // Si es el error de credenciales no configuradas, re-lanzarlo
      if (error.message?.includes('TWILIO_CREDENTIALS_NOT_CONFIGURED')) {
        throw error;
      }

      // Si hay error de autenticación
      if (
        error.message?.includes('Authentication Error') ||
        error.message?.includes('Unauthorized')
      ) {
        throw new BadRequestException(
          'TWILIO_INVALID_CREDENTIALS: Las credenciales de Twilio configuradas son inválidas. Por favor, verifica tus credenciales en la sección de Ajustes.',
        );
      }

      // Si hay error de conexión
      if (
        error.message?.includes('ECONNREFUSED') ||
        error.message?.includes('timeout')
      ) {
        throw new BadRequestException(
          'TWILIO_CONNECTION_ERROR: No se pudo conectar con la API de Twilio. Verifica tu conexión a internet.',
        );
      }

      // Para cualquier otro error, lanzar el error original
      throw new BadRequestException(
        `TWILIO_ERROR: Error obteniendo países de Twilio: ${error.message}`,
      );
    }
  }

  /**
   * Mapear estado de Twilio a estado interno
   */
  private mapTwilioStatus(twilioStatus: string): string {
    const statusMap: { [key: string]: string } = {
      queued: 'pending',
      ringing: 'ringing',
      'in-progress': 'active',
      completed: 'completed',
      busy: 'busy',
      'no-answer': 'no-answer',
      failed: 'failed',
      canceled: 'cancelled',
    };

    return statusMap[twilioStatus] || 'unknown';
  }

  /**
   * Convierte el nombre completo de un estado a su código de 2 letras
   */
  private getStateCode(stateName: string): string {
    const stateMap: Record<string, string> = {
      Alabama: 'AL',
      Alaska: 'AK',
      Arizona: 'AZ',
      Arkansas: 'AR',
      California: 'CA',
      Colorado: 'CO',
      Connecticut: 'CT',
      Delaware: 'DE',
      Florida: 'FL',
      Georgia: 'GA',
      Hawaii: 'HI',
      Idaho: 'ID',
      Illinois: 'IL',
      Indiana: 'IN',
      Iowa: 'IA',
      Kansas: 'KS',
      Kentucky: 'KY',
      Louisiana: 'LA',
      Maine: 'ME',
      Maryland: 'MD',
      Massachusetts: 'MA',
      Michigan: 'MI',
      Minnesota: 'MN',
      Mississippi: 'MS',
      Missouri: 'MO',
      Montana: 'MT',
      Nebraska: 'NE',
      Nevada: 'NV',
      'New Hampshire': 'NH',
      'New Jersey': 'NJ',
      'New Mexico': 'NM',
      'New York': 'NY',
      'North Carolina': 'NC',
      'North Dakota': 'ND',
      Ohio: 'OH',
      Oklahoma: 'OK',
      Oregon: 'OR',
      Pennsylvania: 'PA',
      'Rhode Island': 'RI',
      'South Carolina': 'SC',
      'South Dakota': 'SD',
      Tennessee: 'TN',
      Texas: 'TX',
      Utah: 'UT',
      Vermont: 'VT',
      Virginia: 'VA',
      Washington: 'WA',
      'West Virginia': 'WV',
      Wisconsin: 'WI',
      Wyoming: 'WY',
      'District of Columbia': 'DC',
    };

    // Si ya es un código de 2 letras, devolverlo en mayúsculas
    if (stateName.length === 2) {
      return stateName.toUpperCase();
    }

    // Buscar en el mapa
    return stateMap[stateName] || stateName.toUpperCase();
  }

  /**
   * Mapea ciudades conocidas a sus estados más comunes
   * Para evitar confusión cuando hay varias ciudades con el mismo nombre
   */
  private getCityStateMapping(
    cityName: string,
  ): { city: string; state: string } | null {
    const cityMap: Record<string, { city: string; state: string }> = {
      miami: { city: 'Miami', state: 'FL' },
      'new york': { city: 'New York', state: 'NY' },
      'los angeles': { city: 'Los Angeles', state: 'CA' },
      chicago: { city: 'Chicago', state: 'IL' },
      houston: { city: 'Houston', state: 'TX' },
      philadelphia: { city: 'Philadelphia', state: 'PA' },
      phoenix: { city: 'Phoenix', state: 'AZ' },
      'san antonio': { city: 'San Antonio', state: 'TX' },
      'san diego': { city: 'San Diego', state: 'CA' },
      dallas: { city: 'Dallas', state: 'TX' },
      'san jose': { city: 'San Jose', state: 'CA' },
      austin: { city: 'Austin', state: 'TX' },
      jacksonville: { city: 'Jacksonville', state: 'FL' },
      'fort worth': { city: 'Fort Worth', state: 'TX' },
      columbus: { city: 'Columbus', state: 'OH' },
      charlotte: { city: 'Charlotte', state: 'NC' },
      'san francisco': { city: 'San Francisco', state: 'CA' },
      indianapolis: { city: 'Indianapolis', state: 'IN' },
      seattle: { city: 'Seattle', state: 'WA' },
      denver: { city: 'Denver', state: 'CO' },
      boston: { city: 'Boston', state: 'MA' },
      'el paso': { city: 'El Paso', state: 'TX' },
      detroit: { city: 'Detroit', state: 'MI' },
      nashville: { city: 'Nashville', state: 'TN' },
      portland: { city: 'Portland', state: 'OR' },
      memphis: { city: 'Memphis', state: 'TN' },
      'oklahoma city': { city: 'Oklahoma City', state: 'OK' },
      'las vegas': { city: 'Las Vegas', state: 'NV' },
      louisville: { city: 'Louisville', state: 'KY' },
      baltimore: { city: 'Baltimore', state: 'MD' },
      milwaukee: { city: 'Milwaukee', state: 'WI' },
      albuquerque: { city: 'Albuquerque', state: 'NM' },
      tucson: { city: 'Tucson', state: 'AZ' },
      fresno: { city: 'Fresno', state: 'CA' },
      sacramento: { city: 'Sacramento', state: 'CA' },
      'kansas city': { city: 'Kansas City', state: 'MO' },
      atlanta: { city: 'Atlanta', state: 'GA' },
      'long beach': { city: 'Long Beach', state: 'CA' },
      'colorado springs': { city: 'Colorado Springs', state: 'CO' },
      raleigh: { city: 'Raleigh', state: 'NC' },
      omaha: { city: 'Omaha', state: 'NE' },
      'miami beach': { city: 'Miami Beach', state: 'FL' },
      'virginia beach': { city: 'Virginia Beach', state: 'VA' },
      oakland: { city: 'Oakland', state: 'CA' },
      minneapolis: { city: 'Minneapolis', state: 'MN' },
      tulsa: { city: 'Tulsa', state: 'OK' },
      cleveland: { city: 'Cleveland', state: 'OH' },
      wichita: { city: 'Wichita', state: 'KS' },
      arlington: { city: 'Arlington', state: 'TX' },
    };

    const normalizedCity = cityName.trim().toLowerCase();
    return cityMap[normalizedCity] || null;
  }

  /**
   * Mapea ciudades y estados a códigos de estado
   * Para búsqueda directa por ciudad o estado
   */
  private getStateFromCityOrState(searchTerm: string): string | null {
    const normalizedSearch = searchTerm.toLowerCase().trim();

    // Mapeo de ciudades y estados a códigos de estado
    const mapping: Record<string, string> = {
      // Estados
      'new york': 'NY',
      'new jersey': 'NJ',
      california: 'CA',
      texas: 'TX',
      florida: 'FL',
      illinois: 'IL',
      pennsylvania: 'PA',
      ohio: 'OH',
      georgia: 'GA',
      'north carolina': 'NC',
      michigan: 'MI',
      virginia: 'VA',
      washington: 'WA',
      arizona: 'AZ',
      massachusetts: 'MA',
      tennessee: 'TN',
      indiana: 'IN',
      missouri: 'MO',
      maryland: 'MD',
      wisconsin: 'WI',
      colorado: 'CO',
      minnesota: 'MN',
      'south carolina': 'SC',
      alabama: 'AL',
      louisiana: 'LA',
      kentucky: 'KY',
      oregon: 'OR',
      oklahoma: 'OK',
      connecticut: 'CT',
      utah: 'UT',
      iowa: 'IA',
      nevada: 'NV',
      arkansas: 'AR',
      mississippi: 'MS',
      kansas: 'KS',
      'new mexico': 'NM',
      nebraska: 'NE',
      'west virginia': 'WV',
      idaho: 'ID',
      hawaii: 'HI',
      'new hampshire': 'NH',
      maine: 'ME',
      montana: 'MT',
      'rhode island': 'RI',
      delaware: 'DE',
      'south dakota': 'SD',
      'north dakota': 'ND',
      alaska: 'AK',
      vermont: 'VT',
      wyoming: 'WY',
      // Ciudades principales
      miami: 'FL',
      orlando: 'FL',
      tampa: 'FL',
      jacksonville: 'FL',
      atlanta: 'GA',
      chicago: 'IL',
      boston: 'MA',
      detroit: 'MI',
      minneapolis: 'MN',
      'new orleans': 'LA',
      'las vegas': 'NV',
      phoenix: 'AZ',
      denver: 'CO',
      seattle: 'WA',
      portland: 'OR',
      'san francisco': 'CA',
      'los angeles': 'CA',
      'san diego': 'CA',
      sacramento: 'CA',
      'san jose': 'CA',
      oakland: 'CA',
      fresno: 'CA',
      'long beach': 'CA',
      dallas: 'TX',
      houston: 'TX',
      'san antonio': 'TX',
      austin: 'TX',
      'fort worth': 'TX',
      'el paso': 'TX',
      arlington: 'TX',
      philadelphia: 'PA',
      pittsburgh: 'PA',
      baltimore: 'MD',
      charlotte: 'NC',
      raleigh: 'NC',
      nashville: 'TN',
      memphis: 'TN',
      milwaukee: 'WI',
      cincinnati: 'OH',
      cleveland: 'OH',
      columbus: 'OH',
      indianapolis: 'IN',
      'kansas city': 'MO',
      'st louis': 'MO',
      'oklahoma city': 'OK',
      tulsa: 'OK',
      omaha: 'NE',
      wichita: 'KS',
      albuquerque: 'NM',
      tucson: 'AZ',
      mesa: 'AZ',
      'colorado springs': 'CO',
      durham: 'NC',
      greensboro: 'NC',
      'winston salem': 'NC',
      'virginia beach': 'VA',
      norfolk: 'VA',
      richmond: 'VA',
      'newport news': 'VA',
      buffalo: 'NY',
      rochester: 'NY',
      syracuse: 'NY',
      albany: 'NY',
      newark: 'NJ',
      'jersey city': 'NJ',
      paterson: 'NJ',
      elizabeth: 'NJ',
      edison: 'NJ',
      woodbridge: 'NJ',
      lakewood: 'NJ',
      'toms river': 'NJ',
      hamilton: 'NJ',
      trenton: 'NJ',
      camden: 'NJ',
    };

    return mapping[normalizedSearch] || null;
  }

  async transferCall(callSid: string, toNumber: string): Promise<void> {
    this.logger.log(
      `Iniciando transferencia de llamada ${callSid} a ${toNumber}`,
    );

    try {
      // Necesitamos el accountId para obtener el cliente de Twilio correcto.
      // Esta es una limitación del diseño actual, idealmente el accountId vendría con el webhook.
      // Solución temporal: buscar la llamada en nuestra BD para obtener el accountId.
      const callRecord = await this.prisma.call.findFirst({
        where: { notes: { contains: callSid } },
        select: { accountId: true },
      });

      if (!callRecord) {
        throw new Error(
          'No se encontró el registro de la llamada en la base de datos.',
        );
      }

      const client = await this.getTwilioClient(callRecord.accountId);

      const twiml = `<Response><Say>Un momento por favor, te estoy transfiriendo.</Say><Dial>${toNumber}</Dial></Response>`;

      await client.calls(callSid).update({ twiml });

      this.logger.log(
        `Llamada ${callSid} transferida exitosamente a ${toNumber}`,
      );
    } catch (error) {
      this.logger.error(`Error al transferir la llamada ${callSid}:`, error);
      throw new BadRequestException('No se pudo transferir la llamada.');
    }
  }
}
