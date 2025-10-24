import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TwilioService } from './twilio.service';

@Controller('integrations/twilio')
@UseGuards(JwtAuthGuard)
export class TwilioController {
  private readonly logger = new Logger(TwilioController.name);

  constructor(private readonly twilioService: TwilioService) {}

  @Get('config')
  async getConfig(@Request() req) {
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

  @Post('config')
  async updateConfig(@Request() req, @Body() config: any) {
    // Si los campos están vacíos, eliminar credenciales
    if (
      !config.accountSid ||
      !config.authToken ||
      config.accountSid.trim() === '' ||
      config.authToken.trim() === ''
    ) {
      await this.twilioService.removeTwilioConfig(req.user.accountId);
      return { message: 'Credenciales de Twilio eliminadas exitosamente' };
    }

    // Validar credenciales
    await this.twilioService.validateTwilioCredentials(
      config.accountSid,
      config.authToken,
    );

    // Actualizar configuración
    return this.twilioService.updateTwilioConfig(req.user.accountId, config);
  }

  @Delete('config')
  async deleteConfig(@Request() req) {
    return this.twilioService.removeTwilioConfig(req.user.accountId);
  }

  @Post('call')
  async makeCall(@Request() req, @Body() callData: any) {
    return this.twilioService.makeCall(req.user.accountId, callData);
  }

  @Get('phone-numbers')
  async getPhoneNumbers(@Request() req) {
    return this.twilioService.getPhoneNumbers(req.user.accountId);
  }

  @Post('phone-numbers/purchase')
  async purchasePhoneNumber(
    @Request() req,
    @Body() data: { phoneNumber?: string; areaCode?: string },
  ) {
    return this.twilioService.purchasePhoneNumber(
      req.user.accountId,
      data.phoneNumber,
      data.areaCode,
    );
  }

  @Post('sync-numbers')
  @ApiOperation({
    summary: 'Sincronizar números de Twilio',
    description:
      'Sincroniza manualmente los números de Twilio con la base de datos local',
  })
  @ApiResponse({ status: 200, description: 'Números sincronizados' })
  @ApiResponse({ status: 400, description: 'Error sincronizando números' })
  async syncNumbers(@Request() req) {
    const accountId = req.user.accountId;

    try {
      const result = await this.twilioService.syncTwilioPhoneNumbers(accountId);

      return {
        success: true,
        message: result.message,
        synced: result.synced,
        total: result.total || 0,
      };
    } catch (error) {
      this.logger.error('Error sincronizando números de Twilio:', error);
      throw new BadRequestException(
        error.message || 'Error sincronizando números de Twilio',
      );
    }
  }
}
