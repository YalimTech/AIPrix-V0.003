import { Injectable, Logger } from '@nestjs/common';
import twilio from 'twilio';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Servicio para gestionar los precios de números de teléfono de Twilio
 * Documentación oficial: https://www.twilio.com/docs/phone-numbers/api/pricing
 *
 * Base URL: https://pricing.twilio.com/v1
 */

export interface PhoneNumberPrice {
  numberType: 'local' | 'mobile' | 'national' | 'toll free';
  basePrice: string; // Precio de venta al público
  currentPrice: string; // Precio actual (con descuentos aplicados)
}

export interface CountryPricing {
  country: string;
  isoCountry: string;
  phoneNumberPrices: PhoneNumberPrice[];
  priceUnit: string; // USD, EUR, etc.
  url: string;
}

@Injectable()
export class TwilioPricingService {
  private readonly logger = new Logger(TwilioPricingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un cliente de Twilio para una cuenta específica
   */
  private async createTwilioClient(accountId: string): Promise<any | null> {
    try {
      const config = await this.prisma.accountTwilioConfig.findUnique({
        where: { accountId },
      });

      if (!config?.accountSid || !config.authToken) {
        this.logger.warn(
          `No Twilio credentials found for account ${accountId}`,
        );
        return null;
      }

      return twilio(config.accountSid, config.authToken);
    } catch (error) {
      this.logger.error(
        `Error creating Twilio client for account ${accountId}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Obtiene los precios de números de teléfono para un país específico
   * Implementación según documentación oficial:
   * https://www.twilio.com/docs/phone-numbers/api/pricing-phone-numbers
   */
  async getCountryPricing(
    accountId: string,
    countryCode: string,
  ): Promise<CountryPricing | null> {
    // Verificar si es una cuenta de prueba
    const isTestAccount = await this.isTestAccount(accountId);

    if (isTestAccount) {
      this.logger.log(
        `Test account detected for ${accountId}. Using mock pricing for ${countryCode}.`,
      );
      return this.getMockPricing(countryCode);
    }

    const client = await this.createTwilioClient(accountId);

    if (!client) {
      this.logger.warn(
        `Twilio client not available for account ${accountId}. Cannot fetch pricing.`,
      );
      return this.getMockPricing(countryCode);
    }

    try {
      this.logger.log(
        `Fetching pricing for country ${countryCode} for account ${accountId}`,
      );

      // Llamada a la API de Precios de Twilio
      const pricing = await client.pricing.v1.phoneNumbers
        .countries(countryCode)
        .fetch();

      this.logger.log(
        `Successfully fetched pricing for ${countryCode}: ${JSON.stringify(pricing)}`,
      );

      return {
        country: pricing.country,
        isoCountry: pricing.isoCountry,
        phoneNumberPrices: pricing.phoneNumberPrices.map((price: any) => ({
          numberType: this.normalizeNumberType(price.numberType),
          basePrice: price.basePrice,
          currentPrice: price.currentPrice,
        })),
        priceUnit: pricing.priceUnit,
        url: pricing.url,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching pricing for country ${countryCode}:`,
        error,
      );

      // Si hay error, devolver precios mock
      return this.getMockPricing(countryCode);
    }
  }

  /**
   * Obtiene la lista de todos los países donde Twilio soporta números de teléfono
   */
  async getAllCountriesPricing(accountId: string): Promise<
    Array<{
      country: string;
      isoCountry: string;
      url: string;
    }>
  > {
    const client = await this.createTwilioClient(accountId);

    if (!client) {
      this.logger.warn(
        `Twilio client not available for account ${accountId}. Returning mock countries.`,
      );
      return this.getMockCountries();
    }

    try {
      this.logger.log(
        `Fetching all countries pricing for account ${accountId}`,
      );

      const countries = await client.pricing.v1.phoneNumbers.countries.list({
        limit: 1000,
      });

      return countries.map((country: any) => ({
        country: country.country,
        isoCountry: country.isoCountry,
        url: country.url,
      }));
    } catch (error) {
      this.logger.error(`Error fetching countries pricing:`, error);
      return this.getMockCountries();
    }
  }

  /**
   * Obtiene el precio específico para un tipo de número en un país
   */
  async getPriceForNumberType(
    accountId: string,
    countryCode: string,
    numberType: 'local' | 'tollFree' | 'mobile',
  ): Promise<{
    basePrice: string;
    currentPrice: string;
    priceUnit: string;
  } | null> {
    const countryPricing = await this.getCountryPricing(accountId, countryCode);

    if (!countryPricing) {
      return null;
    }

    // Normalizar el tipo de número para la búsqueda
    const normalizedType = this.normalizeNumberType(numberType);

    // Buscar el precio para el tipo de número específico
    const priceInfo = countryPricing.phoneNumberPrices.find(
      (price) => price.numberType === normalizedType,
    );

    if (!priceInfo) {
      this.logger.warn(
        `No pricing found for ${normalizedType} in ${countryCode}`,
      );
      return null;
    }

    return {
      basePrice: priceInfo.basePrice,
      currentPrice: priceInfo.currentPrice,
      priceUnit: countryPricing.priceUnit,
    };
  }

  /**
   * Detecta si una cuenta es de prueba basándose en el status almacenado
   */
  private async isTestAccount(accountId: string): Promise<boolean> {
    try {
      const config = await this.prisma.accountTwilioConfig.findUnique({
        where: { accountId },
        select: { status: true },
      });

      return config?.status === 'trial';
    } catch (error) {
      this.logger.error(
        `Error checking test account status for ${accountId}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Normaliza los tipos de números entre nuestra nomenclatura y la de Twilio
   */
  private normalizeNumberType(
    type: string,
  ): 'local' | 'mobile' | 'national' | 'toll free' {
    const normalized = type.toLowerCase().trim();

    if (normalized === 'tollfree' || normalized === 'toll_free') {
      return 'toll free';
    }

    return normalized as 'local' | 'mobile' | 'national' | 'toll free';
  }

  /**
   * Precios mock para desarrollo/testing - Basados en precios reales de Twilio
   */
  private getMockPricing(countryCode: string): CountryPricing {
    const mockPrices: Record<string, CountryPricing> = {
      US: {
        country: 'United States',
        isoCountry: 'US',
        phoneNumberPrices: [
          {
            numberType: 'local',
            basePrice: '1.15',
            currentPrice: '1.15',
          },
          {
            numberType: 'toll free',
            basePrice: '2.00',
            currentPrice: '2.00',
          },
          {
            numberType: 'mobile',
            basePrice: '1.15',
            currentPrice: '1.15',
          },
        ],
        priceUnit: 'USD',
        url: `https://pricing.twilio.com/v1/PhoneNumbers/Countries/${countryCode}`,
      },
      CA: {
        country: 'Canada',
        isoCountry: 'CA',
        phoneNumberPrices: [
          {
            numberType: 'local',
            basePrice: '1.50',
            currentPrice: '1.50',
          },
          {
            numberType: 'toll free',
            basePrice: '2.00',
            currentPrice: '2.00',
          },
          {
            numberType: 'mobile',
            basePrice: '1.50',
            currentPrice: '1.50',
          },
        ],
        priceUnit: 'USD',
        url: `https://pricing.twilio.com/v1/PhoneNumbers/Countries/${countryCode}`,
      },
      MX: {
        country: 'Mexico',
        isoCountry: 'MX',
        phoneNumberPrices: [
          {
            numberType: 'local',
            basePrice: '3.00',
            currentPrice: '3.00',
          },
          {
            numberType: 'mobile',
            basePrice: '3.00',
            currentPrice: '3.00',
          },
        ],
        priceUnit: 'USD',
        url: `https://pricing.twilio.com/v1/PhoneNumbers/Countries/${countryCode}`,
      },
      GB: {
        country: 'United Kingdom',
        isoCountry: 'GB',
        phoneNumberPrices: [
          {
            numberType: 'local',
            basePrice: '1.20',
            currentPrice: '1.20',
          },
          {
            numberType: 'mobile',
            basePrice: '1.20',
            currentPrice: '1.20',
          },
          {
            numberType: 'toll free',
            basePrice: '2.00',
            currentPrice: '2.00',
          },
        ],
        priceUnit: 'USD',
        url: `https://pricing.twilio.com/v1/PhoneNumbers/Countries/${countryCode}`,
      },
      BR: {
        country: 'Brazil',
        isoCountry: 'BR',
        phoneNumberPrices: [
          {
            numberType: 'local',
            basePrice: '3.50',
            currentPrice: '3.50',
          },
          {
            numberType: 'mobile',
            basePrice: '3.50',
            currentPrice: '3.50',
          },
        ],
        priceUnit: 'USD',
        url: `https://pricing.twilio.com/v1/PhoneNumbers/Countries/${countryCode}`,
      },
    };

    return (
      mockPrices[countryCode] || {
        country: countryCode,
        isoCountry: countryCode,
        phoneNumberPrices: [
          {
            numberType: 'local',
            basePrice: '1.00',
            currentPrice: '1.00',
          },
        ],
        priceUnit: 'USD',
        url: `https://pricing.twilio.com/v1/PhoneNumbers/Countries/${countryCode}`,
      }
    );
  }

  /**
   * Lista mock de países para desarrollo/testing
   */
  private getMockCountries(): Array<{
    country: string;
    isoCountry: string;
    url: string;
  }> {
    return [
      {
        country: 'United States',
        isoCountry: 'US',
        url: 'https://pricing.twilio.com/v1/PhoneNumbers/Countries/US',
      },
      {
        country: 'Canada',
        isoCountry: 'CA',
        url: 'https://pricing.twilio.com/v1/PhoneNumbers/Countries/CA',
      },
      {
        country: 'United Kingdom',
        isoCountry: 'GB',
        url: 'https://pricing.twilio.com/v1/PhoneNumbers/Countries/GB',
      },
      {
        country: 'Mexico',
        isoCountry: 'MX',
        url: 'https://pricing.twilio.com/v1/PhoneNumbers/Countries/MX',
      },
    ];
  }
}
