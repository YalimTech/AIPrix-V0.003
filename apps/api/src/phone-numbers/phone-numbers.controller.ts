import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TwilioService } from '../integrations/twilio/twilio.service';
import { PhoneNumbersService } from './phone-numbers.service';

@Controller('phone-numbers')
@UseGuards(JwtAuthGuard)
export class PhoneNumbersController {
  constructor(
    private readonly phoneNumbersService: PhoneNumbersService,
    private readonly twilioService: TwilioService,
  ) {}

  @Get()
  async findAll(@Request() req) {
    return this.phoneNumbersService.findAll(req.user.accountId);
  }

  @Get('purchased')
  async getPurchased(@Request() req) {
    return this.phoneNumbersService.findAll(req.user.accountId);
  }

  @Get('countries')
  async getAvailableCountries(@Request() req) {
    try {
      return await this.phoneNumbersService.getAvailableCountries(
        req.user.accountId,
      );
    } catch (error) {
      console.error('Error getting countries:', error);
      throw error;
    }
  }

  @Get('countries/:countryCode')
  async getCountryInfo(
    @Param('countryCode') countryCode: string,
    @Request() req,
  ) {
    return this.phoneNumbersService.getCountryInfo(
      req.user.accountId,
      countryCode,
    );
  }

  @Get('pricing/:countryCode')
  async getCountryPricing(
    @Param('countryCode') countryCode: string,
    @Request() req,
  ) {
    return this.phoneNumbersService.getCountryPricing(
      req.user.accountId,
      countryCode,
    );
  }

  @Get('available')
  async findAvailable(
    @Request() req,
    @Query('country') country: string = 'US',
    @Query('numberType') numberType: 'local' | 'tollFree' = 'local',
    @Query('search') search?: string,
    @Query('startsWith') startsWith?: string,
    @Query('endsWith') endsWith?: string,
    @Query('limit') limit?: string,
    @Query('voiceEnabled') voiceEnabled?: string,
    @Query('smsEnabled') smsEnabled?: string,
    @Query('mmsEnabled') mmsEnabled?: string,
    @Query('faxEnabled') faxEnabled?: string,
    @Query('beta') beta?: string,
  ) {
    try {
      console.log('🔍 Parámetros recibidos en el controlador:');
      console.log('  - search:', search);
      console.log('  - startsWith:', startsWith);
      console.log('  - endsWith:', endsWith);
      console.log('  - country:', country);
      console.log('  - numberType:', numberType);

      const options = {
        search: search || undefined,
        startsWith: startsWith || undefined,
        endsWith: endsWith || undefined,
        limit: limit ? parseInt(limit, 10) : 20,
        voiceEnabled: voiceEnabled === 'true',
        smsEnabled: smsEnabled === 'true',
        mmsEnabled: mmsEnabled === 'true',
        faxEnabled: faxEnabled === 'true',
        beta: beta === 'true',
      };

      console.log('📦 Opciones construidas:', options);

      return await this.phoneNumbersService.findAvailable(
        req.user.accountId,
        country,
        numberType,
        options,
      );
    } catch (error) {
      console.error('Error getting available numbers:', error);
      throw error;
    }
  }

  @Post('buy')
  async buy(@Body() body: { number: string; country: string }, @Request() req) {
    if (!body.number || !body.country) {
      throw new BadRequestException('El número y el país son requeridos.');
    }
    return this.phoneNumbersService.buy(
      req.user.accountId,
      body.number,
      body.country,
    );
  }

  @Post(':id/release')
  async releasePhoneNumber(
    @Param('id') id: string,
    @Body() body: { confirmationText: string },
    @Request() req,
  ) {
    return this.phoneNumbersService.releasePhoneNumber(
      req.user.accountId,
      id,
      body.confirmationText,
    );
  }

  // Endpoint alias para credenciales de Twilio - más intuitivo para el frontend
  @Get('twilio-credentials')
  async getTwilioCredentials(@Request() req) {
    const config = await this.twilioService.getTwilioConfig(req.user.accountId);
    // Si no hay configuración, devolver un objeto vacío en lugar de null
    if (!config) {
      return {
        accountSid: null,
        authToken: null,
        webhookUrl: null,
        accountId: req.user.accountId,
        hasCredentials: false,
      };
    }
    return {
      accountSid: config.accountSid,
      authToken: config.authToken,
      webhookUrl: config.webhookUrl,
      accountId: req.user.accountId,
      hasCredentials: true,
    };
  }

  @Put('twilio-credentials')
  async updateTwilioCredentials(
    @Body()
    body: { accountSid: string; authToken: string; webhookUrl?: string },
    @Request() req,
  ) {
    console.log('🔧 PUT /api/v1/phone-numbers/twilio-credentials llamado');
    console.log('📋 Datos recibidos:', {
      accountSid: body.accountSid ? 'Presente' : 'Ausente',
      authToken: body.authToken ? 'Presente' : 'Ausente',
      webhookUrl: body.webhookUrl || 'No proporcionado',
      accountId: req.user.accountId,
    });

    if (!body.accountSid || !body.authToken) {
      console.log('❌ Validación fallida: Account SID o Auth Token faltante');
      throw new BadRequestException('Account SID y Auth Token son requeridos');
    }

    try {
      console.log('🔍 Validando credenciales con Twilio...');
      // Validar credenciales
      const validationResult =
        await this.twilioService.validateTwilioCredentials(
          body.accountSid,
          body.authToken,
        );
      console.log('✅ Credenciales validadas exitosamente:', validationResult);

      console.log('💾 Guardando configuración en la base de datos...');
      // Actualizar configuración usando el servicio de Twilio
      const result = await this.twilioService.updateTwilioConfig(
        req.user.accountId,
        {
          accountSid: body.accountSid,
          authToken: body.authToken,
          webhookUrl: body.webhookUrl,
        },
      );

      console.log('✅ Configuración guardada exitosamente en BD:', {
        accountId: req.user.accountId,
        accountSid: result.accountSid,
        status: result.status,
      });

      return result;
    } catch (error) {
      console.error('❌ Error en updateTwilioCredentials:', error);
      throw error;
    }
  }

  @Delete('twilio-credentials')
  async deleteTwilioCredentials(@Request() req) {
    // Eliminar configuración de Twilio y números existentes
    await this.twilioService.removeExistingPhoneNumbers(req.user.accountId);
    await this.twilioService.removeTwilioConfig(req.user.accountId);
    return {
      message:
        'Credenciales de Twilio y números telefónicos eliminados exitosamente',
    };
  }
}
