import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import { TwilioMarketplaceService } from './twilio-marketplace.service';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AccountGuard } from '../../tenancy/account.guard';

@ApiTags('Twilio Marketplace')
@ApiBearerAuth()
@Controller('marketplace')
@UseGuards(JwtAuthGuard, AccountGuard)
export class TwilioMarketplaceController {
  private readonly logger = new Logger(TwilioMarketplaceController.name);

  constructor(
    private readonly twilioMarketplaceService: TwilioMarketplaceService,
  ) {}

  /**
   * Busca números telefónicos disponibles usando la API oficial de Twilio
   * Basado en: https://www.twilio.com/docs/phone-numbers/api/available-phone-numbers
   */
  @Get('available')
  @ApiOperation({
    summary: 'Buscar números telefónicos disponibles',
    description:
      'Busca números telefónicos disponibles usando la API oficial de Twilio',
  })
  @ApiResponse({ status: 200, description: 'Números disponibles encontrados' })
  @ApiResponse({ status: 400, description: 'Error en la búsqueda' })
  async searchAvailablePhoneNumbers(
    @Req() req,
    @Query('country') country: string = 'DO',
    @Query('areaCode') areaCode?: string,
    @Query('contains') contains?: string,
    @Query('smsEnabled') smsEnabled?: boolean,
    @Query('mmsEnabled') mmsEnabled?: boolean,
    @Query('voiceEnabled') voiceEnabled?: boolean,
    @Query('faxEnabled') faxEnabled?: boolean,
    @Query('excludeAllAddressRequired') excludeAllAddressRequired?: boolean,
    @Query('excludeLocalAddressRequired') excludeLocalAddressRequired?: boolean,
    @Query('excludeForeignAddressRequired')
    excludeForeignAddressRequired?: boolean,
    @Query('beta') beta?: boolean,
    @Query('nearNumber') nearNumber?: string,
    @Query('nearLatLong') nearLatLong?: string,
    @Query('distance') distance?: number,
    @Query('inPostalCode') inPostalCode?: string,
    @Query('inRegion') inRegion?: string,
    @Query('inRateCenter') inRateCenter?: string,
    @Query('inLata') inLata?: string,
    @Query('inLocality') inLocality?: string,
    @Query('pageSize') pageSize?: number,
    @Query('page') page?: number,
  ): Promise<any> {
    this.logger.log(
      `Buscando números disponibles en ${country} para cuenta ${req.user.accountId}`,
    );

    const accountId = req.user.accountId;

    const options = {
      areaCode,
      contains,
      smsEnabled,
      mmsEnabled,
      voiceEnabled,
      faxEnabled,
      excludeAllAddressRequired,
      excludeLocalAddressRequired,
      excludeForeignAddressRequired,
      beta,
      nearNumber,
      nearLatLong,
      distance,
      inPostalCode,
      inRegion,
      inRateCenter,
      inLata,
      inLocality,
      pageSize,
      page,
    };

    // Filtrar opciones undefined
    const filteredOptions = Object.fromEntries(
      Object.entries(options).filter(([_, value]) => value !== undefined),
    );

    return await this.twilioMarketplaceService.searchAvailablePhoneNumbers(
      accountId,
      country,
      filteredOptions,
    );
  }

  /**
   * Obtiene la lista de países disponibles
   */
  @Get('countries')
  @ApiOperation({
    summary: 'Obtener países disponibles',
    description:
      'Obtiene la lista de países donde se pueden comprar números telefónicos',
  })
  @ApiResponse({ status: 200, description: 'Lista de países obtenida' })
  @ApiResponse({ status: 400, description: 'Error obteniendo países' })
  async getAvailableCountries(@Req() req): Promise<any> {
    this.logger.log(
      `Obteniendo países disponibles para cuenta ${req.user.accountId}`,
    );

    const accountId = req.user.accountId;
    return await this.twilioMarketplaceService.getAvailableCountries(accountId);
  }

  /**
   * Obtiene los números telefónicos comprados
   */
  @Get('purchased')
  @ApiOperation({
    summary: 'Obtener números comprados',
    description:
      'Obtiene la lista de números telefónicos comprados desde Twilio',
  })
  @ApiResponse({ status: 200, description: 'Números comprados obtenidos' })
  @ApiResponse({
    status: 400,
    description: 'Error obteniendo números comprados',
  })
  async getPurchasedPhoneNumbers(@Req() req): Promise<any> {
    this.logger.log(
      `Obteniendo números comprados para cuenta ${req.user.accountId}`,
    );

    const accountId = req.user.accountId;
    return await this.twilioMarketplaceService.getPurchasedPhoneNumbers(
      accountId,
    );
  }

  /**
   * Compra un número telefónico usando la API oficial de Twilio
   * Basado en: https://www.twilio.com/docs/phone-numbers/api/incoming-phone-numbers
   */
  @Post('purchase')
  @ApiOperation({
    summary: 'Comprar número telefónico',
    description: 'Compra un número telefónico usando la API oficial de Twilio',
  })
  @ApiResponse({ status: 201, description: 'Número comprado exitosamente' })
  @ApiResponse({ status: 400, description: 'Error comprando número' })
  async purchasePhoneNumber(
    @Req() req,
    @Body()
    body: {
      phoneNumber: string;
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
    },
  ): Promise<any> {
    this.logger.log(
      `Comprando número ${body.phoneNumber} para cuenta ${req.user.accountId}`,
    );

    const accountId = req.user.accountId;

    const options = {
      friendlyName: body.friendlyName,
      voiceUrl: body.voiceUrl,
      voiceMethod: body.voiceMethod,
      voiceFallbackUrl: body.voiceFallbackUrl,
      voiceFallbackMethod: body.voiceFallbackMethod,
      voiceStatusCallback: body.voiceStatusCallback,
      voiceStatusCallbackMethod: body.voiceStatusCallbackMethod,
      smsUrl: body.smsUrl,
      smsMethod: body.smsMethod,
      smsFallbackUrl: body.smsFallbackUrl,
      smsFallbackMethod: body.smsFallbackMethod,
      smsStatusCallback: body.smsStatusCallback,
      statusCallback: body.statusCallback,
      statusCallbackMethod: body.statusCallbackMethod,
      voiceReceiveMode: body.voiceReceiveMode,
      identitySid: body.identitySid,
      addressSid: body.addressSid,
      bundleSid: body.bundleSid,
      emergencyStatus: body.emergencyStatus,
      emergencyAddressSid: body.emergencyAddressSid,
      trunkSid: body.trunkSid,
      voiceApplicationSid: body.voiceApplicationSid,
      smsApplicationSid: body.smsApplicationSid,
    };

    // Filtrar opciones undefined
    const filteredOptions = Object.fromEntries(
      Object.entries(options).filter(([_, value]) => value !== undefined),
    );

    return await this.twilioMarketplaceService.purchasePhoneNumber(
      accountId,
      body.phoneNumber,
      filteredOptions,
    );
  }
}
