import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExportImportService, ExportOptions } from './export-import.service';

@Controller('export-import')
@UseGuards(JwtAuthGuard)
export class ExportImportController {
  constructor(private readonly exportImportService: ExportImportService) {}

  // =====================================================
  // EXPORT ENDPOINTS
  // =====================================================

  @Get('contacts/export')
  async exportContacts(
    @Request() req,
    @Res() res: Response,
    @Query('format') format: 'csv' | 'xlsx' | 'json' = 'csv',
    @Query('includeHeaders') includeHeaders: string = 'true',
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('status') status?: string,
    @Query('source') source?: string,
  ) {
    try {
      const options: ExportOptions = {
        format,
        includeHeaders: includeHeaders === 'true',
        filters: {},
      };

      // Aplicar filtros de fecha
      if (dateFrom || dateTo) {
        options.dateRange = {
          from: dateFrom ? new Date(dateFrom) : new Date('1900-01-01'),
          to: dateTo ? new Date(dateTo) : new Date(),
        };
      }

      // Aplicar filtros adicionales
      if (status) options.filters.status = status;
      if (source) options.filters.source = source;

      const fileBuffer = await this.exportImportService.exportContacts(
        req.user.accountId,
        options,
      );

      const filename = `contactos_${new Date().toISOString().split('T')[0]}.${format}`;

      res.set({
        'Content-Type': this.getContentType(format),
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.length.toString(),
      });

      res.send(fileBuffer);
    } catch (_error) {
      throw new BadRequestException('Error al exportar contactos');
    }
  }

  @Get('calls/export')
  async exportCalls(
    @Request() req,
    @Res() res: Response,
    @Query('format') format: 'csv' | 'xlsx' | 'json' = 'csv',
    @Query('includeHeaders') includeHeaders: string = 'true',
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('status') status?: string,
    @Query('agentId') agentId?: string,
    @Query('campaignId') campaignId?: string,
  ) {
    try {
      const options: ExportOptions = {
        format,
        includeHeaders: includeHeaders === 'true',
        filters: {},
      };

      if (dateFrom || dateTo) {
        options.dateRange = {
          from: dateFrom ? new Date(dateFrom) : new Date('1900-01-01'),
          to: dateTo ? new Date(dateTo) : new Date(),
        };
      }

      if (status) options.filters.status = status;
      if (agentId) options.filters.agentId = agentId;
      if (campaignId) options.filters.campaignId = campaignId;

      const fileBuffer = await this.exportImportService.exportCalls(
        req.user.accountId,
        options,
      );

      const filename = `llamadas_${new Date().toISOString().split('T')[0]}.${format}`;

      res.set({
        'Content-Type': this.getContentType(format),
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.length.toString(),
      });

      res.send(fileBuffer);
    } catch (_error) {
      throw new BadRequestException('Error al exportar llamadas');
    }
  }

  @Get('campaigns/export')
  async exportCampaigns(
    @Request() req,
    @Res() res: Response,
    @Query('format') format: 'csv' | 'xlsx' | 'json' = 'csv',
    @Query('includeHeaders') includeHeaders: string = 'true',
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    try {
      const options: ExportOptions = {
        format,
        includeHeaders: includeHeaders === 'true',
        filters: {},
      };

      if (dateFrom || dateTo) {
        options.dateRange = {
          from: dateFrom ? new Date(dateFrom) : new Date('1900-01-01'),
          to: dateTo ? new Date(dateTo) : new Date(),
        };
      }

      if (status) options.filters.status = status;
      if (type) options.filters.type = type;

      const fileBuffer = await this.exportImportService.exportCampaigns(
        req.user.accountId,
        options,
      );

      const filename = `campañas_${new Date().toISOString().split('T')[0]}.${format}`;

      res.set({
        'Content-Type': this.getContentType(format),
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.length.toString(),
      });

      res.send(fileBuffer);
    } catch (_error) {
      throw new BadRequestException('Error al exportar campañas');
    }
  }

  @Get('agents/export')
  async exportAgents(
    @Request() req,
    @Res() res: Response,
    @Query('format') format: 'csv' | 'xlsx' | 'json' = 'csv',
    @Query('includeHeaders') includeHeaders: string = 'true',
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    try {
      const options: ExportOptions = {
        format,
        includeHeaders: includeHeaders === 'true',
        filters: {},
      };

      if (status) options.filters.status = status;
      if (type) options.filters.type = type;

      const fileBuffer = await this.exportImportService.exportAgents(
        req.user.accountId,
        options,
      );

      const filename = `agentes_${new Date().toISOString().split('T')[0]}.${format}`;

      res.set({
        'Content-Type': this.getContentType(format),
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.length.toString(),
      });

      res.send(fileBuffer);
    } catch (_error) {
      throw new BadRequestException('Error al exportar agentes');
    }
  }

  // =====================================================
  // IMPORT ENDPOINTS
  // =====================================================

  @Get('contacts/example')
  async downloadContactsExample(@Res() res: Response) {
    try {
      const exampleBuffer =
        await this.exportImportService.generateContactsExample();

      res.set({
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="contactos_ejemplo.csv"',
        'Content-Length': exampleBuffer.length.toString(),
      });

      res.send(exampleBuffer);
    } catch (_error) {
      throw new BadRequestException('Error al generar archivo de ejemplo');
    }
  }

  @Post('contacts/import')
  @UseInterceptors(FileInterceptor('file'))
  async importContacts(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body('listName') listName?: string,
    @Body('columnMapping') columnMapping?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó archivo');
    }

    try {
      // Parsear el mapeo de columnas si se proporciona
      let parsedColumnMapping = {};
      if (columnMapping) {
        try {
          parsedColumnMapping = JSON.parse(columnMapping);
        } catch (error) {
          throw new BadRequestException(
            'Formato de mapeo de columnas inválido',
          );
        }
      }

      const result = await this.exportImportService.importContacts(
        req.user.accountId,
        file.buffer,
        file.originalname,
        listName || `Lista Importada - ${new Date().toLocaleDateString()}`,
        parsedColumnMapping,
      );

      return {
        success: true,
        message: `Importación completada: ${result.success} exitosos, ${result.errors} errores`,
        result,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al importar contactos');
    }
  }

  // =====================================================
  // BACKUP ENDPOINTS
  // =====================================================

  @Get('backup/create')
  async createBackup(@Request() req, @Res() res: Response) {
    try {
      const backupBuffer = await this.exportImportService.createBackup(
        req.user.accountId,
      );

      const filename = `backup_${req.user.accountId}_${new Date().toISOString().split('T')[0]}.json`;

      res.set({
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': backupBuffer.length.toString(),
      });

      res.send(backupBuffer);
    } catch (_error) {
      throw new BadRequestException('Error al crear backup');
    }
  }

  @Post('backup/restore')
  @UseInterceptors(FileInterceptor('file'))
  async restoreBackup(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó archivo de backup');
    }

    try {
      const result = await this.exportImportService.restoreBackup(
        req.user.accountId,
        file.buffer,
      );

      return {
        success: true,
        message: 'Backup restaurado exitosamente',
        result,
      };
    } catch (_error) {
      throw new BadRequestException('Error al restaurar backup');
    }
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  private getContentType(format: string): string {
    switch (format) {
      case 'csv':
        return 'text/csv';
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'json':
        return 'application/json';
      default:
        return 'application/octet-stream';
    }
  }
}
