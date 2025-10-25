import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { URL, URLSearchParams } from 'url';
import { PrismaService } from '../../prisma/prisma.service';

// Interfaz basada en la documentación oficial de Twilio
interface TwilioAvailablePhoneNumber {
  friendly_name: string;
  phone_number: string;
  lata: string;
  locality: string;
  rate_center: string;
  latitude: string;
  longitude: string;
  region: string;
  postal_code: string;
  iso_country: string;
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
    fax: boolean;
  };
}

interface TwilioAvailablePhoneNumbersResponse {
  available_phone_numbers: {
    local: TwilioAvailablePhoneNumber[];
  };
  uri: string;
  first_page_uri: string;
  next_page_uri: string | null;
  page: number;
  page_size: number;
  previous_page_uri: string | null;
  end: number;
}

interface TwilioCountry {
  country_code: string;
  country: string;
  url: string;
  uri: string;
}

interface TwilioCountriesResponse {
  countries: TwilioCountry[];
}

interface TwilioPurchasedPhoneNumber {
  sid: string;
  account_sid: string;
  friendly_name: string;
  phone_number: string;
  voice_url: string;
  voice_method: string;
  voice_fallback_url: string;
  voice_fallback_method: string;
  voice_caller_id_lookup: boolean;
  date_created: string;
  date_updated: string;
  sms_url: string;
  sms_method: string;
  sms_fallback_url: string;
  sms_fallback_method: string;
  sms_status_callback: string;
  address_requirements: string;
  beta: boolean;
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
    fax: boolean;
  };
  status_callback: string;
  status_callback_method: string;
  api_version: string;
  voice_application_sid: string | null;
  sms_application_sid: string | null;
  trunk_sid: string | null;
  emergency_status: string;
  emergency_address_sid: string | null;
  address_sid: string | null;
  identity_sid: string | null;
  bundle_sid: string | null;
  uri: string;
  status: string;
}

@Injectable()
export class TwilioMarketplaceService {
  private readonly logger = new Logger(TwilioMarketplaceService.name);
  private readonly twilioApiUrl = 'https://api.twilio.com/2010-04-01';

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Obtiene la configuración de Twilio para una cuenta
   * Basado en la documentación oficial de Twilio
   */
  async getTwilioConfig(accountId: string) {
    // Si es el super administrador, usar credenciales del .env o buscar en la base de datos
    const adminEmail = '';
    if (accountId === adminEmail) {
      // Primero intentar obtener credenciales del .env
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;

      if (accountSid && authToken) {
        return {
          accountSid,
          authToken,
          webhookUrl: `${process.env.APP_URL || 'https://agent.prixcenter.com'}/api/v1/webhooks/voice`,
        };
      }

      // Si no hay credenciales en .env, buscar en la base de datos
      const config = await this.prisma.accountTwilioConfig.findUnique({
        where: { accountId },
      });

      if (config) {
        return {
          accountSid: config.accountSid,
          authToken: config.authToken,
          webhookUrl: config.webhookUrl,
        };
      }

      // Si no hay configuración, retornar null para manejo gracioso
      return null;
    }

    // Para usuarios normales, buscar en la base de datos
    const config = await this.prisma.accountTwilioConfig.findUnique({
      where: { accountId },
    });

    if (!config) {
      throw new BadRequestException('Configuración de Twilio no encontrada');
    }

    return {
      accountSid: config.accountSid,
      authToken: config.authToken,
      webhookUrl: config.webhookUrl,
    };
  }

  /**
   * Busca números telefónicos disponibles usando la API oficial de Twilio
   * Endpoint: GET /2010-04-01/Accounts/{AccountSid}/AvailablePhoneNumbers/{CountryCode}/Local.json
   * Documentación: https://www.twilio.com/docs/phone-numbers/api/available-phone-numbers
   */
  async searchAvailablePhoneNumbers(
    accountId: string,
    countryCode: string,
    options: {
      areaCode?: string;
      contains?: string;
      smsEnabled?: boolean;
      mmsEnabled?: boolean;
      voiceEnabled?: boolean;
      faxEnabled?: boolean;
      excludeAllAddressRequired?: boolean;
      excludeLocalAddressRequired?: boolean;
      excludeForeignAddressRequired?: boolean;
      beta?: boolean;
      nearNumber?: string;
      nearLatLong?: string;
      distance?: number;
      inPostalCode?: string;
      inRegion?: string;
      inRateCenter?: string;
      inLata?: string;
      inLocality?: string;
      pageSize?: number;
      page?: number;
    } = {},
  ): Promise<TwilioAvailablePhoneNumbersResponse> {
    try {
      const config = await this.getTwilioConfig(accountId);

      // Si no hay configuración de Twilio, retornar respuesta vacía
      if (!config) {
        this.logger.log(
          `No hay configuración de Twilio para la cuenta ${accountId}. Retornando búsqueda vacía.`,
        );
        return {
          available_phone_numbers: { local: [] },
          uri: '',
          first_page_uri: '',
          next_page_uri: null,
          page: 0,
          page_size: 0,
          previous_page_uri: null,
          end: 0,
        };
      }

      // Construir URL según documentación oficial de Twilio
      const url = new URL(
        `${this.twilioApiUrl}/Accounts/${config.accountSid}/AvailablePhoneNumbers/${countryCode}/Local.json`,
      );

      // Agregar parámetros de búsqueda según documentación
      if (options.areaCode) url.searchParams.set('AreaCode', options.areaCode);
      if (options.contains) url.searchParams.set('Contains', options.contains);
      if (options.smsEnabled !== undefined)
        url.searchParams.set('SmsEnabled', options.smsEnabled.toString());
      if (options.mmsEnabled !== undefined)
        url.searchParams.set('MmsEnabled', options.mmsEnabled.toString());
      if (options.voiceEnabled !== undefined)
        url.searchParams.set('VoiceEnabled', options.voiceEnabled.toString());
      if (options.faxEnabled !== undefined)
        url.searchParams.set('FaxEnabled', options.faxEnabled.toString());
      if (options.excludeAllAddressRequired !== undefined) {
        url.searchParams.set(
          'ExcludeAllAddressRequired',
          options.excludeAllAddressRequired.toString(),
        );
      }
      if (options.excludeLocalAddressRequired !== undefined) {
        url.searchParams.set(
          'ExcludeLocalAddressRequired',
          options.excludeLocalAddressRequired.toString(),
        );
      }
      if (options.excludeForeignAddressRequired !== undefined) {
        url.searchParams.set(
          'ExcludeForeignAddressRequired',
          options.excludeForeignAddressRequired.toString(),
        );
      }
      if (options.beta !== undefined)
        url.searchParams.set('Beta', options.beta.toString());
      if (options.nearNumber)
        url.searchParams.set('NearNumber', options.nearNumber);
      if (options.nearLatLong)
        url.searchParams.set('NearLatLong', options.nearLatLong);
      if (options.distance !== undefined)
        url.searchParams.set('Distance', options.distance.toString());
      if (options.inPostalCode)
        url.searchParams.set('InPostalCode', options.inPostalCode);
      if (options.inRegion) url.searchParams.set('InRegion', options.inRegion);
      if (options.inRateCenter)
        url.searchParams.set('InRateCenter', options.inRateCenter);
      if (options.inLata) url.searchParams.set('InLata', options.inLata);
      if (options.inLocality)
        url.searchParams.set('InLocality', options.inLocality);
      if (options.pageSize)
        url.searchParams.set('PageSize', options.pageSize.toString());
      if (options.page) url.searchParams.set('Page', options.page.toString());

      this.logger.log(
        `Buscando números disponibles en ${countryCode} con URL: ${url.toString()}`,
      );

      // Realizar petición a la API oficial de Twilio
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Authorization: `Basic ${Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Error de Twilio API: ${response.status} - ${errorText}`,
        );
        throw new BadRequestException(
          `Error de Twilio API: ${response.status} - ${errorText}`,
        );
      }

      const data = await response.json() as TwilioAvailablePhoneNumbersResponse;
      this.logger.log(
        `Encontrados ${data.available_phone_numbers.local.length} números disponibles`,
      );

      return data;
    } catch (error) {
      this.logger.error(`Error buscando números disponibles: ${error.message}`);
      throw new BadRequestException(
        `Error buscando números disponibles: ${error.message}`,
      );
    }
  }

  /**
   * Obtiene la lista de países disponibles
   * Endpoint: GET /2010-04-01/Accounts/{AccountSid}/AvailablePhoneNumbers.json
   */
  async getAvailableCountries(
    accountId: string,
  ): Promise<TwilioCountriesResponse> {
    try {
      const config = await this.getTwilioConfig(accountId);

      // Si no hay configuración de Twilio, retornar respuesta vacía
      if (!config) {
        this.logger.log(
          `No hay configuración de Twilio para la cuenta ${accountId}. Retornando países vacíos.`,
        );
        return {
          countries: [],
        };
      }

      const url = `${this.twilioApiUrl}/Accounts/${config.accountSid}/AvailablePhoneNumbers.json`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Error de Twilio API: ${response.status} - ${errorText}`,
        );
        throw new BadRequestException(
          `Error de Twilio API: ${response.status} - ${errorText}`,
        );
      }

      const data = await response.json() as TwilioCountriesResponse;
      this.logger.log(
        `Encontrados ${data.countries.length} países disponibles`,
      );

      return data;
    } catch (error) {
      this.logger.error(
        `Error obteniendo países disponibles: ${error.message}`,
      );
      throw new BadRequestException(
        `Error obteniendo países disponibles: ${error.message}`,
      );
    }
  }

  /**
   * Compra un número telefónico usando la API oficial de Twilio
   * Endpoint: POST /2010-04-01/Accounts/{AccountSid}/IncomingPhoneNumbers.json
   * Documentación: https://www.twilio.com/docs/phone-numbers/api/incoming-phone-numbers
   */
  async purchasePhoneNumber(
    accountId: string,
    phoneNumber: string,
    options: {
      friendlyName?: string;
      voiceUrl?: string;
      voiceMethod?: string;
      voiceFallbackUrl?: string;
      voiceFallbackMethod?: string;
      voiceStatusCallback?: string;
      voiceStatusCallbackMethod?: string;
      smsUrl?: string;
      smsMethod?: string;
      smsFallbackUrl?: string;
      smsFallbackMethod?: string;
      smsStatusCallback?: string;
      statusCallback?: string;
      statusCallbackMethod?: string;
      voiceReceiveMode?: 'voice' | 'fax';
      identitySid?: string;
      addressSid?: string;
      bundleSid?: string;
      emergencyStatus?: 'Active' | 'Inactive';
      emergencyAddressSid?: string;
      trunkSid?: string;
      voiceApplicationSid?: string;
      smsApplicationSid?: string;
    } = {},
  ): Promise<TwilioPurchasedPhoneNumber> {
    try {
      const config = await this.getTwilioConfig(accountId);

      // Si no hay configuración de Twilio, lanzar error específico
      if (!config) {
        throw new BadRequestException(
          'Para comprar números telefónicos, primero debe configurar sus credenciales de Twilio en la sección de integraciones.',
        );
      }

      const url = `${this.twilioApiUrl}/Accounts/${config.accountSid}/IncomingPhoneNumbers.json`;

      // Preparar datos según documentación oficial de Twilio
      const formData = new URLSearchParams();
      formData.append('PhoneNumber', phoneNumber);

      if (options.friendlyName)
        formData.append('FriendlyName', options.friendlyName);
      if (options.voiceUrl) formData.append('VoiceUrl', options.voiceUrl);
      if (options.voiceMethod)
        formData.append('VoiceMethod', options.voiceMethod);
      if (options.voiceFallbackUrl)
        formData.append('VoiceFallbackUrl', options.voiceFallbackUrl);
      if (options.voiceFallbackMethod)
        formData.append('VoiceFallbackMethod', options.voiceFallbackMethod);
      if (options.voiceStatusCallback)
        formData.append('VoiceStatusCallback', options.voiceStatusCallback);
      if (options.voiceStatusCallbackMethod)
        formData.append(
          'VoiceStatusCallbackMethod',
          options.voiceStatusCallbackMethod,
        );
      if (options.smsUrl) formData.append('SmsUrl', options.smsUrl);
      if (options.smsMethod) formData.append('SmsMethod', options.smsMethod);
      if (options.smsFallbackUrl)
        formData.append('SmsFallbackUrl', options.smsFallbackUrl);
      if (options.smsFallbackMethod)
        formData.append('SmsFallbackMethod', options.smsFallbackMethod);
      if (options.smsStatusCallback)
        formData.append('SmsStatusCallback', options.smsStatusCallback);
      if (options.statusCallback)
        formData.append('StatusCallback', options.statusCallback);
      if (options.statusCallbackMethod)
        formData.append('StatusCallbackMethod', options.statusCallbackMethod);
      if (options.voiceReceiveMode)
        formData.append('VoiceReceiveMode', options.voiceReceiveMode);
      if (options.identitySid)
        formData.append('IdentitySid', options.identitySid);
      if (options.addressSid) formData.append('AddressSid', options.addressSid);
      if (options.bundleSid) formData.append('BundleSid', options.bundleSid);
      if (options.emergencyStatus)
        formData.append('EmergencyStatus', options.emergencyStatus);
      if (options.emergencyAddressSid)
        formData.append('EmergencyAddressSid', options.emergencyAddressSid);
      if (options.trunkSid) formData.append('TrunkSid', options.trunkSid);
      if (options.voiceApplicationSid)
        formData.append('VoiceApplicationSid', options.voiceApplicationSid);
      if (options.smsApplicationSid)
        formData.append('SmsApplicationSid', options.smsApplicationSid);

      this.logger.log(
        `Comprando número ${phoneNumber} para cuenta ${accountId}`,
      );

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Error comprando número: ${response.status} - ${errorText}`,
        );
        throw new BadRequestException(
          `Error comprando número: ${response.status} - ${errorText}`,
        );
      }

      const data = await response.json() as TwilioPurchasedPhoneNumber;
      this.logger.log(
        `Número ${phoneNumber} comprado exitosamente con SID: ${data.sid}`,
      );

      // Guardar en la base de datos local
      await this.prisma.phoneNumber.create({
        data: {
          id: data.sid,
          accountId,
          number: data.phone_number,
          country: (data as any).iso_country || 'US',
          description: data.friendly_name,
          capabilities: Object.keys(
            (data.capabilities as any) || {
              voice: true,
              sms: true,
              mms: false,
              fax: false,
            },
          ),
          status: data.status,
          twilioSid: data.sid,
          createdAt: new Date(data.date_created),
          updatedAt: new Date(data.date_updated),
        },
      });

      return data;
    } catch (error) {
      this.logger.error(`Error comprando número: ${error.message}`);
      throw new BadRequestException(`Error comprando número: ${error.message}`);
    }
  }

  /**
   * Obtiene los números telefónicos comprados de una cuenta
   * Endpoint: GET /2010-04-01/Accounts/{AccountSid}/IncomingPhoneNumbers.json
   */
  async getPurchasedPhoneNumbers(
    accountId: string,
  ): Promise<TwilioPurchasedPhoneNumber[]> {
    try {
      // Verificar si es el super admin
      const adminEmail = '';
      if (accountId === adminEmail) {
        this.logger.log(
          `Super admin accediendo a números comprados. Retornando lista vacía ya que no tiene configuración de Twilio.`,
        );
        return [];
      }

      const config = await this.getTwilioConfig(accountId);

      // Si no hay configuración de Twilio, retornar array vacío
      if (!config) {
        this.logger.log(
          `No hay configuración de Twilio para la cuenta ${accountId}. Retornando lista vacía.`,
        );
        return [];
      }

      const url = `${this.twilioApiUrl}/Accounts/${config.accountSid}/IncomingPhoneNumbers.json`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Error obteniendo números comprados: ${response.status} - ${errorText}`,
        );
        throw new BadRequestException(
          `Error obteniendo números comprados: ${response.status} - ${errorText}`,
        );
      }

      const data = await response.json() as { incoming_phone_numbers?: TwilioPurchasedPhoneNumber[] };
      this.logger.log(
        `Encontrados ${data.incoming_phone_numbers?.length || 0} números comprados`,
      );

      return data.incoming_phone_numbers || [];
    } catch (error) {
      this.logger.error(`Error obteniendo números comprados: ${error.message}`);
      throw new BadRequestException(
        `Error obteniendo números comprados: ${error.message}`,
      );
    }
  }
}
