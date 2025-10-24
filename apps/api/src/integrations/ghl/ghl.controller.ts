import {
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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GHLService } from './ghl.service';

@Controller('integrations/ghl')
@UseGuards(JwtAuthGuard)
export class GHLController {
  constructor(private readonly ghlService: GHLService) {}

  @Get('config')
  async getConfig(@Request() req) {
    return this.ghlService.getGHLConfig(req.user.accountId);
  }

  @Post('config')
  async updateConfig(@Request() req, @Body() config: any) {
    // console.log('Received GHL config update request:', {
    //   accountId: req.user.accountId,
    //   config,
    // });
    // Si el campo apiKey está vacío, eliminar credenciales existentes
    if (!config.apiKey || config.apiKey.trim() === '') {
      await this.ghlService.removeGHLConfig(req.user.accountId);
      return { message: 'Credenciales de GHL eliminadas exitosamente' };
    }

    return this.ghlService.updateGHLConfig(req.user.accountId, config);
  }

  @Delete('config')
  async deleteConfig(@Request() req) {
    return this.ghlService.removeGHLConfig(req.user.accountId);
  }

  @Get('calendars')
  async getCalendars(@Request() req) {
    return this.ghlService.getCalendars(req.user.accountId);
  }

  @Get('calendars/:calendarId/slots')
  async getAvailableSlots(
    @Request() req,
    @Param('calendarId') calendarId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.ghlService.getAvailableSlots(
      req.user.accountId,
      calendarId,
      startDate,
      endDate,
    );
  }

  @Post('appointments')
  async createAppointment(
    @Request() req,
    @Body()
    appointmentData: {
      calendarId: string;
      contactId: string;
      startTime: string;
      endTime: string;
      title: string;
      appointmentStatus: string;
    },
  ) {
    const { calendarId, ...data } = appointmentData;
    return this.ghlService.createAppointment(
      req.user.accountId,
      calendarId,
      data,
    );
  }

  @Post('contacts')
  async createContact(@Request() req, @Body() contactData: any) {
    return this.ghlService.createContact(req.user.accountId, contactData);
  }

  @Put('contacts/:id')
  async updateContact(
    @Request() req,
    @Param('id') id: string,
    @Body() contactData: any,
  ) {
    return this.ghlService.updateContact(req.user.accountId, id, contactData);
  }
}
