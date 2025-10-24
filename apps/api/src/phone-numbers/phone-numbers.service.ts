import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { TwilioService } from '../integrations/twilio/twilio.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PhoneNumbersService {
  private readonly logger = new Logger(PhoneNumbersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly twilioService: TwilioService,
  ) {}

  async findAll(accountId: string) {
    // La lógica de sincronización y obtención de números ahora reside en TwilioService
    // para mantener la responsabilidad única.
    return this.twilioService.getPurchasedPhoneNumbers(accountId);
  }

  async findAvailable(
    accountId: string,
    country: string,
    numberType: 'local' | 'tollFree' | 'mobile',
    options: any,
  ) {
    try {
      console.log(
        `🔍 Finding available numbers for account: ${accountId}, country: ${country}, type: ${numberType}`,
      );
      const result = await this.twilioService.getAvailablePhoneNumbers(
        accountId,
        country,
        numberType,
        options,
      );
      console.log(
        `✅ Available numbers retrieved successfully:`,
        result?.length || 0,
        'numbers',
      );
      return result;
    } catch (error) {
      console.error('❌ Error getting available numbers:', error);
      throw error;
    }
  }

  async buy(accountId: string, number: string, _country: string) {
    // Pasa directamente la compra al servicio de Twilio
    // El método purchasePhoneNumber ya guarda el número en la base de datos
    const purchasedNumber = await this.twilioService.purchasePhoneNumber(
      accountId,
      number,
      undefined, // areaCode - no se usa cuando se proporciona el número completo
    );

    // El número ya fue guardado en la base de datos por purchasePhoneNumber
    // Solo retornamos la información del número comprado
    return {
      id: purchasedNumber.sid,
      number: purchasedNumber.phoneNumber,
      friendlyName: purchasedNumber.friendlyName,
      capabilities: purchasedNumber.capabilities,
      status: 'active',
    };
  }

  async getAvailableCountries(accountId: string) {
    try {
      console.log(`🔍 Getting available countries for account: ${accountId}`);
      const result = await this.twilioService.getAvailableCountries(accountId);
      console.log(
        `✅ Countries retrieved successfully:`,
        result?.length || 0,
        'countries',
      );
      return result;
    } catch (error) {
      console.error('❌ Error getting available countries:', error);
      throw error;
    }
  }

  async getCountryPricing(accountId: string, countryCode: string) {
    return this.twilioService.getPhoneNumberPricingForCountry(
      accountId,
      countryCode,
    );
  }

  async getCountryInfo(accountId: string, countryCode: string) {
    // Obtener información del país desde Twilio
    const pricing = await this.twilioService.getPhoneNumberPricingForCountry(
      accountId,
      countryCode,
    );

    // Obtener países disponibles para verificar si el país está disponible
    const countries = await this.twilioService.getAvailableCountries(accountId);
    const country = countries.find((c) => c.code === countryCode.toUpperCase());

    return {
      country: countryCode.toUpperCase(),
      name: country?.name || countryCode,
      available: !!country,
      pricing: pricing || null,
    };
  }

  async releasePhoneNumber(
    accountId: string,
    phoneNumberId: string,
    confirmationText: string,
  ) {
    if (confirmationText !== 'RELEASE') {
      throw new BadRequestException(
        'Debe escribir exactamente "RELEASE" para confirmar.',
      );
    }
    const phoneNumber = await this.prisma.phoneNumber.findFirst({
      where: { id: phoneNumberId, accountId },
    });
    if (!phoneNumber) {
      throw new NotFoundException('Número de teléfono no encontrado.');
    }
    if (phoneNumber.twilioSid) {
      // await this.twilioService.releasePhoneNumber(accountId, phoneNumber.twilioSid);
    }
    // Marcar como liberado en lugar de borrar
    return this.prisma.phoneNumber.update({
      where: { id: phoneNumberId },
      data: { status: 'released' },
    });
  }
}
