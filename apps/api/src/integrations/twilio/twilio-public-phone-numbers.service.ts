import { Injectable, Logger } from '@nestjs/common';
import twilio from 'twilio';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Servicio para obtener números de teléfono disponibles públicamente
 * según las mejores prácticas de Twilio para plataformas SaaS
 */
@Injectable()
export class TwilioPublicPhoneNumbersService {
  private readonly logger = new Logger(TwilioPublicPhoneNumbersService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene números de teléfono disponibles usando las credenciales de Twilio del cliente
   */
  async getPublicAvailablePhoneNumbers(
    accountId: string,
    countryCode: string,
    areaCode?: string,
    limit: number = 10,
  ): Promise<any[]> {
    try {
      // Obtener las credenciales de Twilio del cliente desde la base de datos
      const config = await this.prisma.accountTwilioConfig.findUnique({
        where: { accountId },
      });

      if (!config?.accountSid || !config.authToken) {
        this.logger.warn(
          `No Twilio credentials found for account ${accountId}. Please configure Twilio credentials in Settings.`,
        );
        return [];
      }

      this.logger.log(
        `Using client Twilio credentials to fetch REAL phone numbers for ${countryCode}`,
      );

      const client = twilio(config.accountSid, config.authToken);

      const params: any = {
        limit,
        voiceEnabled: true,
        smsEnabled: true,
      };

      if (areaCode) {
        params.areaCode = areaCode;
      }

      const phoneNumbers = await client
        .availablePhoneNumbers(countryCode)
        .local.list(params);

      this.logger.log(
        `Found ${phoneNumbers.length} REAL phone numbers for ${countryCode}`,
      );

      // Obtener precios del país desde la API de precios de Twilio
      let localPrice: number | null = null; // null si no se puede obtener el precio
      try {
        const pricing = await client.pricing.v2.countries(countryCode).fetch();

        // Buscar el precio de números locales (usar any para acceder a propiedades dinámicas)
        const pricingData = pricing as any;
        if (
          pricingData.phoneNumberPrices &&
          pricingData.phoneNumberPrices.length > 0
        ) {
          const localPricing = pricingData.phoneNumberPrices.find(
            (p: any) => p.numberType === 'local',
          );
          if (localPricing?.basePrice) {
            localPrice = parseFloat(localPricing.basePrice);
            this.logger.log(
              `Precio local para ${countryCode}: $${localPrice}/mes`,
            );
          }
        }
      } catch (error) {
        this.logger.warn(
          `Could not fetch pricing for ${countryCode}:`,
          error.message,
        );
        // No establecer precio por defecto - dejar como null
      }

      return phoneNumbers.map((number) => ({
        phoneNumber: number.phoneNumber,
        friendlyName: number.friendlyName,
        countryCode: (number as any).countryCode || 'US',
        region: number.locality || number.region || 'Unknown',
        capabilities: {
          voice: number.capabilities.voice || false,
          sms: number.capabilities.sms || false,
          mms: number.capabilities.mms || false,
          fax: number.capabilities.fax || false,
        },
        setupPrice: null, // No mostrar precio falso
        monthlyPrice: localPrice, // Precio real o null si no se pudo obtener
        isReal: true,
        requiresCredentials: false,
      }));
    } catch (error) {
      this.logger.error(
        `Error fetching real phone numbers from Twilio: ${error.message}`,
      );
      // Devolver array vacío en lugar de datos mock
      return [];
    }
  }

  /**
   * Obtiene países soportados (lista estática basada en documentación Twilio)
   */
  getSupportedCountries(): Array<{
    code: string;
    name: string;
    supported: boolean;
  }> {
    return [
      // Países con soporte completo
      { code: 'US', name: 'Estados Unidos', supported: true },
      { code: 'CA', name: 'Canadá', supported: true },
      { code: 'GB', name: 'Reino Unido', supported: true },
      { code: 'MX', name: 'México', supported: true },
      { code: 'ES', name: 'España', supported: true },
      { code: 'FR', name: 'Francia', supported: true },
      { code: 'DE', name: 'Alemania', supported: true },
      { code: 'IT', name: 'Italia', supported: true },
      { code: 'AU', name: 'Australia', supported: true },
      { code: 'BR', name: 'Brasil', supported: true },
      { code: 'AR', name: 'Argentina', supported: true },
      { code: 'CL', name: 'Chile', supported: true },
      { code: 'CO', name: 'Colombia', supported: true },
      { code: 'PE', name: 'Perú', supported: true },
      { code: 'DO', name: 'República Dominicana', supported: true },
      { code: 'PR', name: 'Puerto Rico', supported: true },
      { code: 'NL', name: 'Países Bajos', supported: true },
      { code: 'BE', name: 'Bélgica', supported: true },
      { code: 'CH', name: 'Suiza', supported: true },
      { code: 'AT', name: 'Austria', supported: true },
      { code: 'SE', name: 'Suecia', supported: true },
      { code: 'NO', name: 'Noruega', supported: true },
      { code: 'DK', name: 'Dinamarca', supported: true },
      { code: 'FI', name: 'Finlandia', supported: true },
      { code: 'IE', name: 'Irlanda', supported: true },
      { code: 'PT', name: 'Portugal', supported: true },
      { code: 'PL', name: 'Polonia', supported: true },
      { code: 'CZ', name: 'República Checa', supported: true },
      { code: 'HU', name: 'Hungría', supported: true },
      { code: 'GR', name: 'Grecia', supported: true },
      { code: 'TR', name: 'Turquía', supported: true },
      { code: 'RU', name: 'Rusia', supported: true },
      { code: 'JP', name: 'Japón', supported: true },
      { code: 'KR', name: 'Corea del Sur', supported: true },
      { code: 'SG', name: 'Singapur', supported: true },
      { code: 'HK', name: 'Hong Kong', supported: true },
      { code: 'TW', name: 'Taiwán', supported: true },
      { code: 'TH', name: 'Tailandia', supported: true },
      { code: 'MY', name: 'Malasia', supported: true },
      { code: 'ID', name: 'Indonesia', supported: true },
      { code: 'PH', name: 'Filipinas', supported: true },
      { code: 'VN', name: 'Vietnam', supported: true },
      { code: 'IN', name: 'India', supported: true },
      { code: 'ZA', name: 'Sudáfrica', supported: true },
      { code: 'EG', name: 'Egipto', supported: true },
      { code: 'NG', name: 'Nigeria', supported: true },
      { code: 'KE', name: 'Kenia', supported: true },
      { code: 'GH', name: 'Ghana', supported: true },
      { code: 'IL', name: 'Israel', supported: true },
      { code: 'AE', name: 'Emiratos Árabes Unidos', supported: true },
      { code: 'SA', name: 'Arabia Saudita', supported: true },
      { code: 'NZ', name: 'Nueva Zelanda', supported: true },
    ];
  }

  /**
   * Genera números mock mejorados que parecen más reales
   * pero claramente indican que son de ejemplo
   */
  private getEnhancedMockNumbers(
    countryCode: string,
    areaCode?: string,
    limit: number = 10,
  ): any[] {
    const mockNumbers: any[] = [];

    // Generar números más realistas basados en el país
    const countryPrefixes = {
      US: '+1',
      CA: '+1',
      GB: '+44',
      MX: '+52',
      ES: '+34',
      DO: '+1',
      BR: '+55',
      AR: '+54',
      CL: '+56',
      CO: '+57',
      PE: '+51',
    };

    const prefix = countryPrefixes[countryCode] || '+1';
    const regions = this.getRegionsForCountry(countryCode);

    for (let i = 0; i < Math.min(limit, 8); i++) {
      const region = regions[i % regions.length];
      const mockNumber = this.generateMockPhoneNumber(prefix, areaCode);

      mockNumbers.push({
        phoneNumber: mockNumber,
        friendlyName: `${region} - Available`,
        countryCode,
        region,
        capabilities: {
          voice: true,
          sms: true,
          mms: Math.random() > 0.5, // Algunos números tienen MMS
          fax: Math.random() > 0.7, // Algunos números tienen Fax
        },
        setupPrice: 1.0,
        monthlyPrice: 1.0,
        isReal: false,
        requiresCredentials: true,
        note: 'Sample number - Configure Twilio credentials to see real inventory',
      });
    }

    return mockNumbers;
  }

  private getRegionsForCountry(countryCode: string): string[] {
    const regions = {
      US: [
        'New York',
        'Los Angeles',
        'Chicago',
        'Houston',
        'Phoenix',
        'Philadelphia',
        'San Antonio',
        'San Diego',
      ],
      CA: [
        'Toronto',
        'Montreal',
        'Vancouver',
        'Calgary',
        'Edmonton',
        'Ottawa',
        'Winnipeg',
        'Quebec City',
      ],
      GB: [
        'London',
        'Manchester',
        'Birmingham',
        'Leeds',
        'Glasgow',
        'Edinburgh',
        'Liverpool',
        'Bristol',
      ],
      MX: [
        'Mexico City',
        'Guadalajara',
        'Monterrey',
        'Puebla',
        'Tijuana',
        'León',
        'Juárez',
        'Zapopan',
      ],
      ES: [
        'Madrid',
        'Barcelona',
        'Valencia',
        'Seville',
        'Zaragoza',
        'Málaga',
        'Murcia',
        'Palma',
      ],
      DO: [
        'Santo Domingo',
        'Santiago',
        'Puerto Plata',
        'La Romana',
        'San Pedro de Macorís',
        'Higüey',
        'San Cristóbal',
        'San Francisco de Macorís',
      ],
      BR: [
        'São Paulo',
        'Rio de Janeiro',
        'Brasília',
        'Salvador',
        'Fortaleza',
        'Belo Horizonte',
        'Manaus',
        'Curitiba',
      ],
      AR: [
        'Buenos Aires',
        'Córdoba',
        'Rosario',
        'Mendoza',
        'Tucumán',
        'La Plata',
        'Mar del Plata',
        'Salta',
      ],
      CL: [
        'Santiago',
        'Valparaíso',
        'Concepción',
        'La Serena',
        'Antofagasta',
        'Temuco',
        'Rancagua',
        'Talca',
      ],
      CO: [
        'Bogotá',
        'Medellín',
        'Cali',
        'Barranquilla',
        'Cartagena',
        'Cúcuta',
        'Bucaramanga',
        'Pereira',
      ],
      PE: [
        'Lima',
        'Arequipa',
        'Trujillo',
        'Chiclayo',
        'Piura',
        'Iquitos',
        'Cusco',
        'Chimbote',
      ],
    };

    return regions[countryCode] || ['Capital', 'Major City', 'Regional Center'];
  }

  private generateMockPhoneNumber(prefix: string, areaCode?: string): string {
    if (prefix === '+1') {
      // Formato US/CA/DO
      const mockAreaCode =
        areaCode ||
        ['212', '310', '312', '713', '602', '215', '210', '619'][
          Math.floor(Math.random() * 8)
        ];
      const exchange = String(Math.floor(Math.random() * 900) + 100);
      const number = String(Math.floor(Math.random() * 9000) + 1000);
      return `${prefix}${mockAreaCode}${exchange}${number}`;
    } else if (prefix === '+44') {
      // Formato UK
      const ukAreaCode =
        areaCode || ['20', '161', '113', '121'][Math.floor(Math.random() * 4)];
      const number = String(Math.floor(Math.random() * 10000000) + 1000000);
      return `${prefix}${ukAreaCode}${number}`;
    } else {
      // Formato genérico
      const number = String(Math.floor(Math.random() * 100000000) + 10000000);
      return `${prefix}${number}`;
    }
  }
}
