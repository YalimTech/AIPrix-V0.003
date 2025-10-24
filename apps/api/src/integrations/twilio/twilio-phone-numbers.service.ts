import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import twilio from 'twilio';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * TwilioPhoneNumbersService
 *
 * Servicio para manejar números de teléfono de Twilio según la documentación oficial.
 *
 * CARACTERÍSTICAS PRINCIPALES:
 * - Soporte completo para cuentas de prueba (Trial accounts)
 * - Implementación de números mágicos oficiales de Twilio
 * - Manejo robusto de errores según códigos de error oficiales
 * - Fallback automático a datos simulados cuando es necesario
 *
 * DOCUMENTACIÓN OFICIAL DE TWILIO:
 * - Test Credentials: https://www.twilio.com/docs/iam/test-credentials
 * - Magic Numbers: https://www.twilio.com/docs/iam/test-credentials#test-phone-numbers
 * - Trial Account Limitations: https://www.twilio.com/docs/usage/billing-and-usage/trial-accounts
 */

export interface TwilioPhoneNumber {
  phoneNumber: string;
  friendlyName?: string;
  countryCode: string;
  region: string;
  numberType?: 'local' | 'tollFree' | 'mobile';
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
    fax?: boolean;
  };
  setupPrice: number;
  monthlyPrice: number;
  isMagicNumber?: boolean;
  magicNumberType?:
    | 'success'
    | 'unavailable'
    | 'invalid'
    | 'sms_incompatible'
    | 'sms_queue_full'
    | 'cannot_route'
    | 'no_international_permissions'
    | 'blocked_number'
    | 'cannot_receive_sms';
}

@Injectable()
export class TwilioPhoneNumbersService {
  private readonly logger = new Logger(TwilioPhoneNumbersService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene las credenciales de Twilio para una cuenta específica
   */
  private async getTwilioCredentials(
    accountId: string,
  ): Promise<{ accountSid: string; authToken: string } | null> {
    try {
      const config = await this.prisma.accountTwilioConfig.findUnique({
        where: { accountId },
      });

      if (!config) {
        this.logger.warn(
          `No Twilio credentials found for account: ${accountId}`,
        );
        return null;
      }

      return {
        accountSid: config.accountSid,
        authToken: config.authToken,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching Twilio credentials for account ${accountId}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Crea un cliente de Twilio para una cuenta específica
   */
  private async createTwilioClient(
    accountId: string,
  ): Promise<twilio.Twilio | null> {
    const credentials = await this.getTwilioCredentials(accountId);

    if (!credentials) {
      return null;
    }

    try {
      return twilio(credentials.accountSid, credentials.authToken);
    } catch (error) {
      this.logger.error(
        `Error creating Twilio client for account ${accountId}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Detecta si una cuenta de Twilio es una cuenta de prueba
   * Basado en la documentación oficial de Twilio
   *
   * IMPORTANTE: No hacemos llamadas a la API real para detectar cuentas de prueba
   * porque eso podría causar errores. Usamos solo el status en la base de datos.
   */
  async isTestAccount(accountId: string): Promise<boolean> {
    try {
      const config = await this.prisma.accountTwilioConfig.findUnique({
        where: { accountId },
      });

      if (!config) {
        return false;
      }

      // Verificar si el status es 'trial' - esto se establece cuando se configuran
      // las credenciales de prueba según la documentación oficial de Twilio
      if (config.status === 'trial') {
        return true;
      }

      // Si no está marcado como 'trial', es una cuenta real
      return false;
    } catch (error) {
      this.logger.error(
        `Error detectando cuenta de prueba para ${accountId}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Retorna SOLO los números mágicos oficiales de Twilio para testing de COMPRA de números
   * Según documentación oficial: https://www.twilio.com/docs/iam/test-credentials
   *
   * ⚠️ IMPORTANTE: Solo hay 3 magic numbers oficiales para COMPRA:
   * - +15005550006: Compra exitosa
   * - +15005550000: Error "No disponible" (21422)
   * - +15005550001: Error "No válido" (21421)
   *
   * Los otros números mágicos (+15005550002-+15005550009) son para testing de SMS/Llamadas,
   * NO para compra de números.
   */
  private getTwilioMagicNumbers(): TwilioPhoneNumber[] {
    return [
      {
        phoneNumber: '+15005550006', // Número mágico oficial: "Este número es válido y está disponible" (Sin error)
        friendlyName: 'Magic Number - Valid & Available (Purchase Success)',
        countryCode: 'US',
        region: 'Test - Success',
        capabilities: {
          voice: true,
          sms: true,
          mms: true,
          fax: false,
        },
        setupPrice: 0.0,
        monthlyPrice: 0.0, // Los números mágicos no tienen costo real
        isMagicNumber: true,
        magicNumberType: 'success',
      },
      {
        phoneNumber: '+15005550000', // Número mágico oficial: "Este número de teléfono no está disponible" (Error 21422)
        friendlyName: 'Magic Number - Not Available (Purchase Error)',
        countryCode: 'US',
        region: 'Test - Error',
        capabilities: {
          voice: true,
          sms: false,
          mms: true,
          fax: false,
        },
        setupPrice: 0.0,
        monthlyPrice: 0.0, // Los números mágicos no tienen costo real
        isMagicNumber: true,
        magicNumberType: 'unavailable',
      },
      {
        phoneNumber: '+15005550001', // Número mágico oficial: "Este número de teléfono no es válido" (Error 21421)
        friendlyName: 'Magic Number - Invalid Number (Purchase Error)',
        countryCode: 'US',
        region: 'Test - Error',
        capabilities: {
          voice: true,
          sms: true,
          mms: true,
          fax: false,
        },
        setupPrice: 0.0,
        monthlyPrice: 0.0, // Los números mágicos no tienen costo real
        isMagicNumber: true,
        magicNumberType: 'invalid',
      },
    ];
  }

  /**
   * Obtiene números de teléfono disponibles desde Twilio para una cuenta específica
   * Implementación según la documentación oficial de Twilio:
   * - Local: https://www.twilio.com/docs/phone-numbers/api/availablephonenumberlocal-resource
   * - TollFree: https://www.twilio.com/docs/phone-numbers/api/availablephonenumbertollfree-resource
   * - Mobile: https://www.twilio.com/docs/phone-numbers/api/availablephonenumbermobile-resource
   */
  async getAvailablePhoneNumbers(
    accountId: string,
    countryCode: string,
    numberType: 'local' | 'tollFree' | 'mobile' = 'local',
    areaCode?: string,
    limit: number = 10,
    filters?: {
      voiceEnabled?: boolean;
      smsEnabled?: boolean;
      mmsEnabled?: boolean;
      faxEnabled?: boolean;
      contains?: string;
      startsWith?: string;
      endsWith?: string;
      excludeAllAddressRequired?: boolean;
      excludeLocalAddressRequired?: boolean;
      excludeForeignAddressRequired?: boolean;
      beta?: boolean;
      // Filtros geográficos avanzados
      nearNumber?: string;
      nearLatLong?: string; // formato: "lat,long"
      distance?: number;
      inPostalCode?: string;
      inRegion?: string;
      inRateCenter?: string;
      inLata?: string;
      inLocality?: string;
    },
  ): Promise<TwilioPhoneNumber[]> {
    const client = await this.createTwilioClient(accountId);

    if (!client) {
      this.logger.warn(
        `Twilio client not available for account ${accountId}. Returning official Twilio magic numbers.`,
      );

      // Filtrar números que ya están comprados (no liberados) en nuestra BD
      const purchasedNumbers = await this.prisma.phoneNumber.findMany({
        where: {
          accountId,
          status: { not: 'released' }, // Excluir números liberados
        },
        select: { number: true },
      });

      const purchasedNumbersSet = new Set(
        purchasedNumbers.map((p) => p.number),
      );
      const magicNumbers = this.getTwilioMagicNumbers();
      const availableMagicNumbers = magicNumbers.filter(
        (magic) => !purchasedNumbersSet.has(magic.phoneNumber),
      );

      return availableMagicNumbers.slice(0, limit);
    }

    // Verificar si es una cuenta de prueba
    const isTestAccount = await this.isTestAccount(accountId);
    if (isTestAccount) {
      this.logger.log(
        `Account ${accountId} is a Twilio test account. Using official Twilio magic numbers only.`,
      );

      // Solo usar números mágicos oficiales de Twilio para pruebas reales
      const magicNumbers = this.getTwilioMagicNumbers();

      // Filtrar números que ya están comprados (no liberados) en nuestra BD
      const purchasedNumbers = await this.prisma.phoneNumber.findMany({
        where: {
          accountId,
          status: { not: 'released' }, // Excluir números liberados
        },
        select: { number: true },
      });

      const purchasedNumbersSet = new Set(
        purchasedNumbers.map((p) => p.number),
      );
      const availableMagicNumbers = magicNumbers.filter(
        (magic) => !purchasedNumbersSet.has(magic.phoneNumber),
      );

      this.logger.log(
        `Magic numbers disponibles: ${availableMagicNumbers.length}/${magicNumbers.length} (${purchasedNumbersSet.size} ya comprados)`,
      );

      return availableMagicNumbers.slice(0, limit);
    }

    try {
      this.logger.log(
        `Fetching available phone numbers for account ${accountId}, country: ${countryCode}`,
      );

      // Parámetros según documentación oficial de Twilio
      const params: any = {
        limit: Math.min(limit, 1000), // Máximo permitido por Twilio
      };

      // Parámetros opcionales según documentación
      if (areaCode) {
        params.areaCode = areaCode;
      }

      if (filters?.voiceEnabled !== undefined) {
        params.voiceEnabled = filters.voiceEnabled;
      }

      if (filters?.smsEnabled !== undefined) {
        params.smsEnabled = filters.smsEnabled;
      }

      if (filters?.mmsEnabled !== undefined) {
        params.mmsEnabled = filters.mmsEnabled;
      }

      if (filters?.faxEnabled !== undefined) {
        params.faxEnabled = filters.faxEnabled;
      }

      if (filters?.contains) {
        // El parámetro 'contains' busca por patrón de números (ej: "212")
        // Si el usuario está buscando por ciudad/estado, usar los parámetros geográficos
        const searchTerm = filters.contains.toLowerCase().trim();

        // Mapeo de nombres de ciudades/estados comunes a códigos de región de Twilio
        const regionMap: { [key: string]: string } = {
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

        // Verificar si el término de búsqueda es un nombre de estado
        if (regionMap[searchTerm]) {
          // Es un nombre de estado, usar inRegion
          params.inRegion = regionMap[searchTerm];
          this.logger.log(
            `Búsqueda por estado detectada: ${searchTerm} -> ${regionMap[searchTerm]}`,
          );
        } else {
          // Es un patrón de números o nombre de ciudad, usar contains
          params.contains = filters.contains;
          this.logger.log(
            `Búsqueda por patrón de números: ${filters.contains}`,
          );
        }
      }

      if (filters?.excludeAllAddressRequired !== undefined) {
        params.excludeAllAddressRequired = filters.excludeAllAddressRequired;
      }

      if (filters?.excludeLocalAddressRequired !== undefined) {
        params.excludeLocalAddressRequired =
          filters.excludeLocalAddressRequired;
      }

      if (filters?.excludeForeignAddressRequired !== undefined) {
        params.excludeForeignAddressRequired =
          filters.excludeForeignAddressRequired;
      }

      if (filters?.beta !== undefined) {
        params.beta = filters.beta;
      }

      // Filtros geográficos avanzados según documentación oficial
      if (filters?.nearNumber) {
        params.nearNumber = filters.nearNumber;
      }
      if (filters?.nearLatLong) {
        params.nearLatLong = filters.nearLatLong;
      }
      if (filters?.distance) {
        params.distance = Math.min(filters.distance, 500); // Máximo 500 millas según documentación
      }
      if (filters?.inPostalCode) {
        params.inPostalCode = filters.inPostalCode;
      }
      if (filters?.inRegion) {
        params.inRegion = filters.inRegion;
      }
      if (filters?.inRateCenter) {
        params.inRateCenter = filters.inRateCenter;
      }
      if (filters?.inLata) {
        params.inLata = filters.inLata;
      }
      if (filters?.inLocality) {
        params.inLocality = filters.inLocality;
      }

      // Llamada a la API oficial de Twilio según documentación
      // Seleccionar el subrecurso correcto según el tipo de número
      let phoneNumbersResource;
      switch (numberType) {
        case 'tollFree':
          phoneNumbersResource =
            client.availablePhoneNumbers(countryCode).tollFree;
          break;
        case 'mobile':
          phoneNumbersResource =
            client.availablePhoneNumbers(countryCode).mobile;
          break;
        case 'local':
        default:
          phoneNumbersResource =
            client.availablePhoneNumbers(countryCode).local;
          break;
      }

      const phoneNumbers = await phoneNumbersResource.list(params);

      this.logger.log(
        `Found ${phoneNumbers.length} available phone numbers for account ${accountId}`,
      );

      // Mapear respuesta según la estructura oficial de Twilio
      let mappedNumbers = phoneNumbers.map((number) => {
        // Convertir capacidades de objeto a array de strings
        const capabilitiesArray: string[] = [];
        if (number.capabilities.voice) capabilitiesArray.push('voice');
        if (number.capabilities.sms) capabilitiesArray.push('sms');
        if (number.capabilities.mms) capabilitiesArray.push('mms');
        if (number.capabilities.fax) capabilitiesArray.push('fax');

        return {
          phoneNumber: number.phoneNumber,
          friendlyName:
            number.friendlyName ||
            `(${number.phoneNumber.substring(2, 5)}) ${number.phoneNumber.substring(5, 8)}-${number.phoneNumber.substring(8)}`,
          countryCode,
          region: number.locality || number.region || 'Unknown',
          numberType,
          capabilities: capabilitiesArray,
          // Precios reales de Twilio (con centavos)
          setupPrice: parseFloat(number.setupCost) || 0.0,
          monthlyPrice: parseFloat(number.price) || 0.0,
          // Marcar como número real (no mágico)
          isMagicNumber: false,
        };
      });

      // Filtrar por startsWith si está especificado
      // Busca en la parte del prefijo local (después del código de área)
      // Ejemplo: +1-809-555-3030 → busca "555" (prefijo local)
      if (filters?.startsWith) {
        this.logger.log(`Filtrando por startsWith: "${filters.startsWith}"`);
        const startsWithPattern = filters.startsWith.replace(/\D/g, ''); // Solo números
        this.logger.log(
          `Patrón de búsqueda (solo números): "${startsWithPattern}"`,
        );
        mappedNumbers = mappedNumbers.filter((number) => {
          // Extraer solo los dígitos del número
          const phoneDigits = number.phoneNumber.replace(/\D/g, '');

          // Para números de EEUU/Canadá (+1): formato 1XXXYYYZZZZ
          // Donde XXX = código de área (3 dígitos)
          // YYY = prefijo local (3 dígitos) - esto es lo que buscamos
          // ZZZZ = últimos 4 dígitos
          if (phoneDigits.startsWith('1') && phoneDigits.length === 11) {
            // Extraer el prefijo local (dígitos 5-7)
            const localPrefix = phoneDigits.substring(4, 7);
            const matches = localPrefix.startsWith(startsWithPattern);
            if (matches) {
              this.logger.log(
                `Número ${number.phoneNumber} coincide: prefijo local "${localPrefix}" inicia con "${startsWithPattern}"`,
              );
            }
            return matches;
          }

          // Para otros países, buscar en toda la parte del número después del código de país
          // Por ahora, usamos una búsqueda más genérica
          return phoneDigits.includes(startsWithPattern);
        });
        this.logger.log(
          `Filtrado por startsWith "${filters.startsWith}" (prefijo local): ${mappedNumbers.length} números encontrados`,
        );
      }

      // Filtrar por endsWith si está especificado
      // Busca en los últimos dígitos del número
      if (filters?.endsWith) {
        this.logger.log(`Filtrando por endsWith: "${filters.endsWith}"`);
        const endsWithPattern = filters.endsWith.replace(/\D/g, ''); // Solo números
        this.logger.log(
          `Patrón de búsqueda (solo números): "${endsWithPattern}"`,
        );
        mappedNumbers = mappedNumbers.filter((number) => {
          const phoneDigits = number.phoneNumber.replace(/\D/g, ''); // Solo números
          const matches = phoneDigits.endsWith(endsWithPattern);
          if (matches) {
            this.logger.log(
              `Número ${number.phoneNumber} coincide: termina con "${endsWithPattern}"`,
            );
          }
          return matches;
        });
        this.logger.log(
          `Filtrado por endsWith "${filters.endsWith}": ${mappedNumbers.length} números encontrados`,
        );
      }

      return mappedNumbers;
    } catch (error) {
      this.logger.error(
        `Error fetching phone numbers from Twilio for account ${accountId}:`,
        error,
      );

      // Manejo específico de errores según documentación oficial de Twilio
      if (
        error.message &&
        (error.message.includes('Test Account Credentials') ||
          error.message.includes(
            'Resource not accessible with Test Account Credentials',
          ) ||
          error.message.includes('Trial account') ||
          error.code === 20003) // Authentication Error
      ) {
        this.logger.log(
          `Account ${accountId} appears to be a test account based on error. Using official Twilio magic numbers only.`,
        );

        // Solo usar números mágicos oficiales de Twilio para pruebas reales
        const magicNumbers = this.getTwilioMagicNumbers();

        // Filtrar números que ya están comprados (no liberados) en nuestra BD
        const purchasedNumbers = await this.prisma.phoneNumber.findMany({
          where: {
            accountId,
            status: { not: 'released' }, // Excluir números liberados
          },
          select: { number: true },
        });

        const purchasedNumbersSet = new Set(
          purchasedNumbers.map((p) => p.number),
        );
        const availableMagicNumbers = magicNumbers.filter(
          (magic) => !purchasedNumbersSet.has(magic.phoneNumber),
        );

        return availableMagicNumbers.slice(0, limit);
      }

      // Fallback to magic numbers in case of other errors
      this.logger.warn(
        `Falling back to official Twilio magic numbers for account ${accountId} due to Twilio API error`,
      );

      // Filtrar números que ya están comprados (no liberados) en nuestra BD
      const purchasedNumbers = await this.prisma.phoneNumber.findMany({
        where: {
          accountId,
          status: { not: 'released' }, // Excluir números liberados
        },
        select: { number: true },
      });

      const purchasedNumbersSet = new Set(
        purchasedNumbers.map((p) => p.number),
      );
      const magicNumbers = this.getTwilioMagicNumbers();
      const availableMagicNumbers = magicNumbers.filter(
        (magic) => !purchasedNumbersSet.has(magic.phoneNumber),
      );

      return availableMagicNumbers.slice(0, limit);
    }
  }

  /**
   * Compra un número de teléfono desde Twilio para una cuenta específica
   * Implementación según la documentación oficial de Twilio:
   * https://www.twilio.com/docs/phone-numbers/api/incomingphonenumber-resource
   */
  async purchasePhoneNumber(
    accountId: string,
    phoneNumber: string,
    countryCode: string,
    options?: {
      friendlyName?: string;
      voiceUrl?: string;
      smsUrl?: string;
      voiceMethod?: 'GET' | 'POST';
      smsMethod?: 'GET' | 'POST';
      voiceFallbackUrl?: string;
      smsFallbackUrl?: string;
      statusCallback?: string;
      statusCallbackMethod?: 'GET' | 'POST';
      voiceCallerIdLookup?: boolean;
      emergencyStatus?: 'Active' | 'Inactive';
    },
  ): Promise<any> {
    const client = await this.createTwilioClient(accountId);

    if (!client) {
      throw new NotFoundException(
        'Twilio credentials not configured for this account',
      );
    }

    // Verificar si es una cuenta de prueba
    const isTestAccount = await this.isTestAccount(accountId);
    if (isTestAccount) {
      this.logger.log(
        `Account ${accountId} is a Twilio test account. Simulating phone number purchase.`,
      );

      // Verificar si es un número mágico de Twilio
      const magicNumbers = this.getTwilioMagicNumbers();
      const magicNumber = magicNumbers.find(
        (magic) => magic.phoneNumber === phoneNumber,
      );

      // Simular diferentes respuestas según el número mágico
      let mockPurchase: any;

      if (magicNumber) {
        this.logger.log(
          `Processing Magic Number ${phoneNumber} with type: ${magicNumber.magicNumberType}`,
        );

        // Simular respuesta según el tipo de número mágico
        if (magicNumber.magicNumberType === 'unavailable') {
          this.logger.log(
            `Magic Number ${phoneNumber} is designed to fail with unavailable error`,
          );
          throw new InternalServerErrorException(
            'This phone number is not available (Error 21422)',
          );
        } else if (magicNumber.magicNumberType === 'invalid') {
          this.logger.log(
            `Magic Number ${phoneNumber} is designed to fail with invalid error`,
          );
          throw new InternalServerErrorException(
            'This phone number is not valid (Error 21421)',
          );
        }

        // Para números mágicos válidos, simular compra exitosa
        this.logger.log(
          `Magic Number ${phoneNumber} is designed for successful purchase`,
        );
        mockPurchase = {
          sid: `PN${Math.random().toString(36).substring(2, 15)}`,
          phoneNumber,
          friendlyName: magicNumber.friendlyName,
          countryCode,
          capabilities: magicNumber.capabilities,
          status: 'in-use', // Según documentación oficial
          dateCreated: new Date(),
          dateUpdated: new Date(),
          isMagicNumber: true,
          isTestAccount: true,
        };

        this.logger.log(
          `Successfully created mock purchase for Magic Number ${phoneNumber}:`,
          mockPurchase,
        );
      } else {
        // Para números normales en modo prueba
        mockPurchase = {
          sid: `PN${Math.random().toString(36).substring(2, 15)}`,
          phoneNumber,
          friendlyName: options?.friendlyName || `Test Number - ${phoneNumber}`,
          countryCode,
          capabilities: {
            voice: true,
            sms: true,
            mms: true,
            fax: false,
          },
          status: 'in-use',
          dateCreated: new Date(),
          dateUpdated: new Date(),
          isMagicNumber: false,
          isTestAccount: true,
        };
      }

      this.logger.log(
        `Simulated purchase of phone number: ${phoneNumber} for test account ${accountId}`,
      );
      return mockPurchase;
    }

    try {
      this.logger.log(
        `Purchasing phone number: ${phoneNumber} for account ${accountId}, country: ${countryCode}`,
      );

      // Parámetros de compra según documentación oficial de Twilio
      const purchaseParams: any = {
        phoneNumber,
      };

      // Parámetros opcionales según documentación
      if (options?.friendlyName) {
        purchaseParams.friendlyName = options.friendlyName;
      }

      if (options?.voiceUrl) {
        purchaseParams.voiceUrl = options.voiceUrl;
        purchaseParams.voiceMethod = options.voiceMethod || 'POST';
      }

      if (options?.smsUrl) {
        purchaseParams.smsUrl = options.smsUrl;
        purchaseParams.smsMethod = options.smsMethod || 'POST';
      }

      if (options?.voiceFallbackUrl) {
        purchaseParams.voiceFallbackUrl = options.voiceFallbackUrl;
        purchaseParams.voiceFallbackMethod = 'POST';
      }

      if (options?.smsFallbackUrl) {
        purchaseParams.smsFallbackUrl = options.smsFallbackUrl;
        purchaseParams.smsFallbackMethod = 'POST';
      }

      if (options?.statusCallback) {
        purchaseParams.statusCallback = options.statusCallback;
        purchaseParams.statusCallbackMethod =
          options.statusCallbackMethod || 'POST';
      }

      if (options?.voiceCallerIdLookup !== undefined) {
        purchaseParams.voiceCallerIdLookup = options.voiceCallerIdLookup;
      }

      if (options?.emergencyStatus) {
        purchaseParams.emergencyStatus = options.emergencyStatus;
      }

      // Llamada a la API oficial de Twilio según documentación
      const incomingPhoneNumber =
        await client.incomingPhoneNumbers.create(purchaseParams);

      this.logger.log(
        `Successfully purchased phone number: ${phoneNumber} for account ${accountId}`,
      );

      // Retornar respuesta según estructura oficial de Twilio
      return {
        sid: incomingPhoneNumber.sid,
        phoneNumber: incomingPhoneNumber.phoneNumber,
        friendlyName: incomingPhoneNumber.friendlyName,
        countryCode,
        capabilities: incomingPhoneNumber.capabilities,
        status: incomingPhoneNumber.status || 'in-use',
        dateCreated: incomingPhoneNumber.dateCreated,
        dateUpdated: incomingPhoneNumber.dateUpdated,
        accountSid: incomingPhoneNumber.accountSid,
        apiVersion: incomingPhoneNumber.apiVersion,
        voiceUrl: incomingPhoneNumber.voiceUrl,
        smsUrl: incomingPhoneNumber.smsUrl,
        voiceMethod: incomingPhoneNumber.voiceMethod,
        smsMethod: incomingPhoneNumber.smsMethod,
        voiceFallbackUrl: incomingPhoneNumber.voiceFallbackUrl,
        smsFallbackUrl: incomingPhoneNumber.smsFallbackUrl,
        voiceCallerIdLookup: incomingPhoneNumber.voiceCallerIdLookup,
        emergencyStatus: incomingPhoneNumber.emergencyStatus,
        isMagicNumber: false,
        isTestAccount: false,
      };
    } catch (error) {
      this.logger.error(
        `Error purchasing phone number from Twilio for account ${accountId}:`,
        error,
      );

      // Manejo específico de errores según documentación oficial de Twilio
      if (
        error.message &&
        (error.message.includes('Test Account Credentials') ||
          error.message.includes(
            'Resource not accessible with Test Account Credentials',
          ) ||
          error.message.includes('Trial account') ||
          error.code === 20003) // Authentication Error
      ) {
        this.logger.log(
          `Account ${accountId} appears to be a test account based on error. Simulating purchase.`,
        );

        // Verificar si es un número mágico de Twilio
        const magicNumbers = this.getTwilioMagicNumbers();
        const magicNumber = magicNumbers.find(
          (magic) => magic.phoneNumber === phoneNumber,
        );

        const mockPurchase = {
          sid: `PN${Math.random().toString(36).substring(2, 15)}`,
          phoneNumber,
          friendlyName:
            magicNumber?.friendlyName || `Test Number - ${phoneNumber}`,
          countryCode,
          capabilities: magicNumber?.capabilities || {
            voice: true,
            sms: true,
            mms: true,
            fax: false,
          },
          status: 'in-use',
          dateCreated: new Date(),
          dateUpdated: new Date(),
          isMagicNumber: !!magicNumber,
          isTestAccount: true,
        };

        return mockPurchase;
      }

      throw new InternalServerErrorException(
        `Failed to purchase phone number: ${error.message}`,
      );
    }
  }

  /**
   * Obtiene los países disponibles desde la API real de Twilio
   * Implementación según documentación oficial:
   * https://www.twilio.com/docs/phone-numbers/api/availablephonenumber-resource
   */
  async getAvailableCountries(accountId: string): Promise<
    Array<{
      code: string;
      name: string;
      supported: boolean;
      beta?: boolean;
      subresourceUris?: any;
    }>
  > {
    const client = await this.createTwilioClient(accountId);

    if (!client) {
      this.logger.warn(
        `Twilio client not available for account ${accountId}. Returning fallback countries.`,
      );
      return this.getSupportedCountries();
    }

    // Verificar si es una cuenta de prueba
    const isTestAccount = await this.isTestAccount(accountId);
    if (isTestAccount) {
      this.logger.log(
        `Account ${accountId} is a Twilio test account. Using fallback countries.`,
      );
      return this.getSupportedCountries();
    }

    try {
      this.logger.log(
        `Fetching available countries from Twilio for account ${accountId}`,
      );

      // Llamada a la API oficial de Twilio según documentación
      const countries = await client.availablePhoneNumbers.list({
        limit: 1000, // Máximo permitido por Twilio
      });

      this.logger.log(
        `Found ${countries.length} available countries for account ${accountId}`,
      );

      // Mapear respuesta según la estructura oficial de Twilio
      return countries.map((country) => ({
        code: country.countryCode,
        name: country.country,
        supported: true,
        beta: country.beta || false,
        subresourceUris: country.subresourceUris,
      }));
    } catch (error) {
      this.logger.error(
        `Error fetching countries from Twilio for account ${accountId}:`,
        error,
      );

      // Manejo específico de errores según documentación oficial de Twilio
      if (
        error.message &&
        (error.message.includes('Test Account Credentials') ||
          error.message.includes(
            'Resource not accessible with Test Account Credentials',
          ) ||
          error.message.includes('Trial account') ||
          error.code === 20003) // Authentication Error
      ) {
        this.logger.log(
          `Account ${accountId} appears to be a test account based on error. Using fallback countries.`,
        );
        return this.getSupportedCountries();
      }

      // Fallback to static list in case of other errors
      this.logger.warn(
        `Falling back to static countries list for account ${accountId} due to Twilio API error`,
      );
      return this.getSupportedCountries();
    }
  }

  /**
   * Obtiene los tipos de números disponibles para un país específico
   * Implementación según documentación oficial:
   * https://www.twilio.com/docs/phone-numbers/api/availablephonenumber-resource
   */
  async getCountryInfo(
    accountId: string,
    countryCode: string,
  ): Promise<{
    countryCode: string;
    country: string;
    beta: boolean;
    subresourceUris: any;
  } | null> {
    const client = await this.createTwilioClient(accountId);

    if (!client) {
      this.logger.warn(
        `Twilio client not available for account ${accountId}. Cannot fetch country info.`,
      );
      return null;
    }

    // Verificar si es una cuenta de prueba
    const isTestAccount = await this.isTestAccount(accountId);
    if (isTestAccount) {
      this.logger.log(
        `Account ${accountId} is a Twilio test account. Using fallback country info.`,
      );
      return {
        countryCode,
        country: this.getCountryName(countryCode),
        beta: false,
        subresourceUris: {
          local: `/2010-04-01/Accounts/ACaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/AvailablePhoneNumbers/${countryCode}/Local.json`,
        },
      };
    }

    try {
      this.logger.log(
        `Fetching country info for ${countryCode} from Twilio for account ${accountId}`,
      );

      // Llamada a la API oficial de Twilio según documentación
      const countryInfo = await client
        .availablePhoneNumbers(countryCode)
        .fetch();

      this.logger.log(
        `Found country info for ${countryCode}: ${countryInfo.country}`,
      );

      return {
        countryCode: countryInfo.countryCode,
        country: countryInfo.country,
        beta: countryInfo.beta || false,
        subresourceUris: countryInfo.subresourceUris,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching country info for ${countryCode} from Twilio for account ${accountId}:`,
        error,
      );

      // Manejo específico de errores según documentación oficial de Twilio
      if (
        error.message &&
        (error.message.includes('Test Account Credentials') ||
          error.message.includes(
            'Resource not accessible with Test Account Credentials',
          ) ||
          error.message.includes('Trial account') ||
          error.code === 20003) // Authentication Error
      ) {
        this.logger.log(
          `Account ${accountId} appears to be a test account based on error. Using fallback country info.`,
        );
        return {
          countryCode,
          country: this.getCountryName(countryCode),
          beta: false,
          subresourceUris: {
            local: `/2010-04-01/Accounts/ACaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/AvailablePhoneNumbers/${countryCode}/Local.json`,
          },
        };
      }

      return null;
    }
  }

  /**
   * Verifica si una cuenta tiene credenciales de Twilio configuradas
   */
  async hasTwilioCredentials(accountId: string): Promise<boolean> {
    const config = await this.prisma.accountTwilioConfig.findUnique({
      where: { accountId },
    });

    return !!config;
  }

  /**
   * Obtiene la configuración de Twilio para una cuenta
   */
  async getTwilioConfig(accountId: string) {
    const config = await this.prisma.accountTwilioConfig.findUnique({
      where: { accountId },
      select: {
        accountSid: true,
        webhookUrl: true,
        createdAt: true,
        updatedAt: true,
        // No exponemos el authToken por seguridad
      },
    });

    return config;
  }

  /**
   * Actualiza la configuración de Twilio para una cuenta
   */
  async updateTwilioConfig(
    accountId: string,
    accountSid: string,
    authToken: string,
    webhookUrl?: string,
  ) {
    try {
      const config = await this.prisma.accountTwilioConfig.upsert({
        where: { accountId },
        update: {
          accountSid,
          authToken,
          webhookUrl,
          updatedAt: new Date(),
        },
        create: {
          accountId,
          accountSid,
          authToken,
          webhookUrl,
        },
      });

      this.logger.log(`Twilio configuration updated for account ${accountId}`);
      return config;
    } catch (error) {
      this.logger.error(
        `Error updating Twilio configuration for account ${accountId}:`,
        error,
      );
      throw new InternalServerErrorException(
        'Failed to update Twilio configuration',
      );
    }
  }

  /**
   * Elimina la configuración de Twilio para una cuenta
   */
  async deleteTwilioConfig(accountId: string) {
    try {
      await this.prisma.accountTwilioConfig.delete({
        where: { accountId },
      });

      this.logger.log(`Twilio configuration deleted for account ${accountId}`);
      return { success: true };
    } catch (error) {
      this.logger.error(
        `Error deleting Twilio configuration for account ${accountId}:`,
        error,
      );
      throw new InternalServerErrorException(
        'Failed to delete Twilio configuration',
      );
    }
  }

  private getSupportedCountries(): Array<{
    code: string;
    name: string;
    supported: boolean;
  }> {
    return [
      { code: 'US', name: 'United States', supported: true },
      { code: 'CA', name: 'Canada', supported: true },
      { code: 'GB', name: 'United Kingdom', supported: true },
      { code: 'MX', name: 'Mexico', supported: true },
      { code: 'ES', name: 'Spain', supported: true },
      { code: 'DO', name: 'Dominican Republic', supported: true },
      { code: 'AR', name: 'Argentina', supported: false },
      { code: 'BR', name: 'Brazil', supported: false },
      { code: 'CL', name: 'Chile', supported: false },
      { code: 'CO', name: 'Colombia', supported: false },
      { code: 'PE', name: 'Peru', supported: false },
    ];
  }

  private getCountryName(countryCode: string): string {
    const countries = this.getSupportedCountries();
    const country = countries.find((c) => c.code === countryCode);
    return country ? country.name : countryCode;
  }

  private getMockPhoneNumbers(
    countryCode: string,
    areaCode?: string,
    limit: number = 10,
  ): TwilioPhoneNumber[] {
    // Return mock data with realistic pricing including cents
    const mockNumbers: TwilioPhoneNumber[] = [];

    // Precios simulados realistas basados en precios típicos de Twilio
    // Estos son precios aproximados para desarrollo/testing
    const realisticPrices = [
      { setup: 0.0, monthly: 1.25 }, // Precio típico para números locales US
      { setup: 0.0, monthly: 2.5 }, // Precio típico para números con SMS
      { setup: 0.0, monthly: 1.75 }, // Precio típico para números premium
      { setup: 0.0, monthly: 3.0 }, // Precio típico para números con MMS
      { setup: 0.0, monthly: 2.25 }, // Precio típico para números con capacidades completas
    ];

    for (let i = 0; i < Math.min(limit, 5); i++) {
      const price = realisticPrices[i % realisticPrices.length];

      mockNumbers.push({
        phoneNumber: `+${countryCode === 'DO' ? '1809' : '1555'}-${String(100 + i).padStart(3, '0')}-${String(1000 + i).padStart(4, '0')}`,
        friendlyName: `Mock Number ${i + 1} - NOT REAL`,
        countryCode,
        region: areaCode ? `Area ${areaCode}` : 'Mock Region',
        capabilities: {
          voice: true,
          sms: true,
          mms: false,
        },
        setupPrice: price.setup,
        monthlyPrice: price.monthly,
      });
    }

    return mockNumbers;
  }

  /**
   * Libera (elimina) un número de teléfono de Twilio
   * Implementación según documentación oficial de Twilio:
   * DELETE /2010-04-01/Accounts/{AccountSid}/IncomingPhoneNumbers/{Sid}.json
   *
   * @param accountId - ID de la cuenta en nuestra base de datos
   * @param twilioSid - SID del número en Twilio (ej: PN1234567890abcdef)
   * @returns Promise<boolean> - true si se liberó exitosamente
   */
  async releasePhoneNumber(
    accountId: string,
    twilioSid: string,
  ): Promise<boolean> {
    const client = await this.createTwilioClient(accountId);

    if (!client) {
      throw new NotFoundException(
        'Twilio credentials not configured for this account',
      );
    }

    // Verificar si es una cuenta de prueba
    const isTestAccount = await this.isTestAccount(accountId);
    if (isTestAccount) {
      this.logger.log(
        `Account ${accountId} is a Twilio test account. Simulating phone number release for SID: ${twilioSid}`,
      );
      // Para cuentas de prueba, solo simular la liberación
      // No hay necesidad de hacer nada en Twilio porque es un número mágico simulado
      return true;
    }

    try {
      this.logger.log(
        `Releasing phone number with SID: ${twilioSid} for account ${accountId}`,
      );

      // Llamada a la API oficial de Twilio para eliminar el número
      // Esto libera el número de tu cuenta y deja de cobrarte la tarifa mensual
      await client.incomingPhoneNumbers(twilioSid).remove();

      this.logger.log(
        `Successfully released phone number SID: ${twilioSid} for account ${accountId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(`Error releasing phone number ${twilioSid}:`, error);
      throw new BadRequestException(
        `Error liberando número en Twilio: ${error.message}`,
      );
    }
  }
}
