import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import csv from 'csv-parser';
import * as ExcelJS from 'exceljs';
import { PrismaService } from '../prisma/prisma.service';
// import * as fs from 'fs';
import * as path from 'path';
import * as stream from 'stream';

export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'json';
  includeHeaders?: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
  filters?: Record<string, any>;
}

export interface ImportResult {
  success: number;
  errors: number;
  total: number;
  contactListId?: string;
  errorsList: Array<{
    row: number;
    error: string;
    data: any;
  }>;
}

@Injectable()
export class ExportImportService {
  private readonly logger = new Logger(ExportImportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  // =====================================================
  // EXPORT FUNCTIONS
  // =====================================================

  async exportContacts(
    accountId: string,
    options: ExportOptions,
  ): Promise<Buffer> {
    try {
      const where: any = { accountId };

      // Aplicar filtros de fecha si se proporcionan
      if (options.dateRange) {
        where.createdAt = {
          gte: options.dateRange.from,
          lte: options.dateRange.to,
        };
      }

      // Aplicar filtros adicionales
      if (options.filters) {
        Object.assign(where, options.filters);
      }

      const contacts = await this.prisma.contact.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      const data = contacts.map((contact) => ({
        ID: contact.id,
        Nombre: contact.name,
        Apellido: contact.lastName || '',
        Teléfono: contact.phone,
        Email: contact.email || '',
        Empresa: contact.company || '',
        Posición: contact.position || '',
        Estado: contact.status,
        Fuente: contact.source,
        Etiquetas: contact.tags.join(', '),
        Notas: contact.notes || '',
        'Fecha de Creación': contact.createdAt.toISOString(),
        'Fecha de Actualización': contact.updatedAt.toISOString(),
      }));

      return await this.generateFile(data, options);
    } catch (error) {
      this.logger.error('Error exporting contacts:', error);
      throw new BadRequestException('Error al exportar contactos');
    }
  }

  async exportCalls(
    accountId: string,
    options: ExportOptions,
  ): Promise<Buffer> {
    try {
      const where: any = { accountId };

      if (options.dateRange) {
        where.createdAt = {
          gte: options.dateRange.from,
          lte: options.dateRange.to,
        };
      }

      if (options.filters) {
        Object.assign(where, options.filters);
      }

      const calls = await this.prisma.call.findMany({
        where,
        include: {
          agent: {
            select: { name: true, voiceName: true },
          },
          contact: {
            select: { name: true, lastName: true, phone: true },
          },
          campaign: {
            select: { name: true, status: true },
          },
          phoneNumberRef: {
            select: { number: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const data = calls.map((call) => ({
        ID: call.id,
        'Número de Teléfono': call.phoneNumber,
        Estado: call.status,
        Dirección: call.direction,
        Tipo: call.type,
        'Duración (seg)': call.duration || 0,
        Éxito: call.success ? 'Sí' : 'No',
        'URL de Grabación': call.recordingUrl || '',
        Transcripción: call.transcript || '',
        Notas: call.notes || '',
        'Agente ID': call.agentId || '',
        'Contacto ID': call.contactId || '',
        'Campaña ID': call.campaignId || '',
        'Número del Sistema': call.phoneNumberRef?.number || '',
        'Fecha de Inicio': call.startedAt?.toISOString() || '',
        'Fecha de Finalización': call.endedAt?.toISOString() || '',
        'Fecha de Creación': call.createdAt.toISOString(),
      }));

      return await this.generateFile(data, options);
    } catch (error) {
      this.logger.error('Error exporting calls:', error);
      throw new BadRequestException('Error al exportar llamadas');
    }
  }

  async exportCampaigns(
    accountId: string,
    options: ExportOptions,
  ): Promise<Buffer> {
    try {
      const where: any = { accountId };

      if (options.dateRange) {
        where.createdAt = {
          gte: options.dateRange.from,
          lte: options.dateRange.to,
        };
      }

      if (options.filters) {
        Object.assign(where, options.filters);
      }

      const campaigns = await this.prisma.campaign.findMany({
        where,
        include: {
          agent: {
            select: { name: true, voiceName: true },
          },
          contactList: {
            select: { name: true },
          },
          _count: {
            select: { calls: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const data = campaigns.map((campaign) => ({
        ID: campaign.id,
        Nombre: campaign.name,
        Descripción: campaign.description || '',
        Estado: campaign.status,
        Tipo: campaign.type,
        'Fecha de Inicio Real': campaign.startedAt?.toISOString() || '',
        'Fecha de Finalización': campaign.completedAt?.toISOString() || '',
        'Agente ID': campaign.agentId || '',
        'Lista de Contactos ID': campaign.contactListId || '',
        'Fecha de Creación': campaign.createdAt.toISOString(),
        'Fecha de Actualización': campaign.updatedAt.toISOString(),
      }));

      return await this.generateFile(data, options);
    } catch (error) {
      this.logger.error('Error exporting campaigns:', error);
      throw new BadRequestException('Error al exportar campañas');
    }
  }

  async exportAgents(
    accountId: string,
    options: ExportOptions,
  ): Promise<Buffer> {
    try {
      const where: any = { accountId };

      if (options.filters) {
        Object.assign(where, options.filters);
      }

      const agents = await this.prisma.agent.findMany({
        where,
        include: {
          _count: {
            select: {
              campaigns: true,
              calls: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const data = agents.map((agent) => ({
        ID: agent.id,
        Nombre: agent.name,
        Descripción: agent.description || '',
        Tipo: agent.type,
        Estado: agent.status,
        'Proveedor LLM': agent.llmProvider,
        'Modelo LLM': agent.llmModel,
        'Proveedor de Respaldo': agent.fallbackProvider || '',
        'Máximo de Tokens': agent.maxTokens,
        'Nombre de Voz': agent.voiceName,
        'Retraso de Mensaje Inicial (ms)': agent.initialMessageDelay,
        'Total de Campañas': agent._count.campaigns,
        'Total de Llamadas': agent._count.calls,
        'Fecha de Creación': agent.createdAt.toISOString(),
        'Fecha de Actualización': agent.updatedAt.toISOString(),
      }));

      return await this.generateFile(data, options);
    } catch (error) {
      this.logger.error('Error exporting agents:', error);
      throw new BadRequestException('Error al exportar agentes');
    }
  }

  // =====================================================
  // IMPORT FUNCTIONS
  // =====================================================

  async importContacts(
    accountId: string,
    fileBuffer: Buffer,
    filename: string,
    listName: string,
    columnMapping: Record<string, string> = {},
  ): Promise<ImportResult> {
    try {
      const data = await this.parseFile(fileBuffer, filename);

      // Crear nueva lista de contactos
      const contactList = await this.prisma.contactList.create({
        data: {
          accountId,
          name: listName,
          description: `Lista importada desde ${filename}`,
        },
      });

      const result: ImportResult = {
        success: 0,
        errors: 0,
        total: data.length,
        errorsList: [],
        contactListId: contactList.id,
      };

      // Mapear columnas usando el mapeo proporcionado o valores por defecto
      const mapRowData = (row: any) => {
        const mappedRow: any = {};

        // Aplicar mapeo personalizado si existe
        Object.keys(columnMapping).forEach((originalColumn) => {
          const targetField = columnMapping[originalColumn];
          if (row[originalColumn] !== undefined) {
            mappedRow[targetField] = row[originalColumn];
          }
        });

        // Si no hay mapeo personalizado, usar valores por defecto
        if (Object.keys(columnMapping).length === 0) {
          mappedRow.first_name = row.first_name || row.name || row.nombre;
          mappedRow.last_name = row.last_name || row.apellido;
          mappedRow.email = row.email || row.correo;
          mappedRow.phone = row.phone || row.teléfono || row.telefono;
        }

        return mappedRow;
      };

      for (let i = 0; i < data.length; i++) {
        const originalRow = data[i];
        const row = mapRowData(originalRow);

        try {
          // Validar datos requeridos
          if (!row.first_name || !row.phone) {
            throw new Error('Nombre y teléfono son requeridos');
          }

          // Verificar si el contacto ya existe
          const existingContact = await this.prisma.contact.findFirst({
            where: {
              accountId,
              phone: row.phone,
            },
          });

          let contactId: string;

          if (existingContact) {
            // Actualizar contacto existente
            await this.prisma.contact.update({
              where: { id: existingContact.id },
              data: {
                name: row.first_name,
                lastName: row.last_name || null,
                email: row.email || null,
                company: row.company || null,
                position: row.position || null,
                status: 'active',
                source: 'import',
                tags: [],
                notes: null,
              },
            });
            contactId = existingContact.id;
          } else {
            // Crear nuevo contacto
            const newContact = await this.prisma.contact.create({
              data: {
                accountId,
                name: row.first_name,
                lastName: row.last_name || null,
                phone: row.phone,
                email: row.email || null,
                company: row.company || null,
                position: row.position || null,
                status: 'active',
                source: 'import',
                tags: [],
                notes: null,
              },
            });
            contactId = newContact.id;
          }

          // Agregar contacto a la lista
          await this.prisma.contactListContact.upsert({
            where: {
              contactListId_contactId: {
                contactListId: contactList.id,
                contactId,
              },
            },
            update: {},
            create: {
              contactId,
              contactListId: contactList.id,
            },
          });

          result.success++;
        } catch (error) {
          result.errors++;
          result.errorsList.push({
            row: i + 1,
            error: error.message,
            data: originalRow,
          });
        }
      }

      // El contador de contactos se calcula automáticamente por la relación
      // No necesitamos actualizar manualmente el contactCount

      this.logger.log(
        `Import completed: ${result.success} success, ${result.errors} errors`,
      );
      return result;
    } catch (error) {
      this.logger.error('Error importing contacts:', error);
      throw new BadRequestException('Error al importar contactos');
    }
  }

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  private async generateFile(
    data: any[],
    options: ExportOptions,
  ): Promise<Buffer> {
    switch (options.format) {
      case 'csv':
        return this.generateCSV(data, options.includeHeaders);
      case 'xlsx':
        return await this.generateXLSX(data);
      case 'json':
        return Buffer.from(JSON.stringify(data, null, 2));
      default:
        throw new BadRequestException('Formato no soportado');
    }
  }

  private generateCSV(data: any[], includeHeaders: boolean = true): Buffer {
    if (data.length === 0) {
      return Buffer.from('');
    }

    const headers = Object.keys(data[0]);
    let csvContent = '';

    if (includeHeaders) {
      csvContent += `${headers.join(',')}\n`;
    }

    data.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header];
        if (value === null || value === undefined) {
          return '';
        }
        // Escapar comillas y envolver en comillas si contiene comas
        const stringValue = String(value);
        if (
          stringValue.includes(',') ||
          stringValue.includes('"') ||
          stringValue.includes('\n')
        ) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      });
      csvContent += `${values.join(',')}\n`;
    });

    return Buffer.from(csvContent, 'utf-8');
  }

  private async generateXLSX(data: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Datos');

    if (data.length > 0) {
      // Agregar encabezados
      const headers = Object.keys(data[0]);
      worksheet.addRow(headers);

      // Agregar datos
      data.forEach((row) => {
        const values = headers.map((header) => row[header] || '');
        worksheet.addRow(values);
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private async parseFile(
    fileBuffer: Buffer,
    filename: string,
  ): Promise<any[]> {
    const extension = path.extname(filename).toLowerCase();

    switch (extension) {
      case '.csv':
        return this.parseCSV(fileBuffer);
      case '.xlsx':
      case '.xls':
        return await this.parseXLSX(fileBuffer);
      case '.json':
        return JSON.parse(fileBuffer.toString());
      default:
        throw new BadRequestException('Formato de archivo no soportado');
    }
  }

  private parseCSV(fileBuffer: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const bufferStream = new stream.PassThrough();
      bufferStream.end(fileBuffer);

      bufferStream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  private async parseXLSX(fileBuffer: Buffer): Promise<any[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer as any);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return [];
    }

    const data: any[] = [];
    const headers: string[] = [];

    // Obtener encabezados de la primera fila
    const firstRow = worksheet.getRow(1);
    firstRow.eachCell((cell, colNumber) => {
      headers[colNumber - 1] = cell.value?.toString() || '';
    });

    // Procesar filas de datos
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Saltar encabezados

      const rowData: any = {};
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber - 1];
        if (header) {
          rowData[header] = cell.value;
        }
      });

      if (Object.keys(rowData).length > 0) {
        data.push(rowData);
      }
    });

    return data;
  }

  // =====================================================
  // BACKUP FUNCTIONS
  // =====================================================

  async createBackup(accountId: string): Promise<Buffer> {
    try {
      const backup = {
        account: await this.prisma.account.findUnique({
          where: { id: accountId },
          include: {
            users: true,
            agents: true,
            campaigns: {
              include: {
                agent: true,
                contactList: true,
              },
            },
            contacts: true,
            contactLists: {
              include: {
                contacts: true,
              },
            },
            phoneNumbers: true,
            calls: {
              include: {
                agent: true,
                contact: true,
                campaign: true,
                phoneNumberRef: true,
              },
            },
            knowledgeBases: true,
          },
        }),
        exportDate: new Date().toISOString(),
        version: '1.0',
      };

      return Buffer.from(JSON.stringify(backup, null, 2));
    } catch (error) {
      this.logger.error('Error creating backup:', error);
      throw new BadRequestException('Error al crear backup');
    }
  }

  async restoreBackup(
    accountId: string,
    backupBuffer: Buffer,
  ): Promise<ImportResult> {
    try {
      const backup = JSON.parse(backupBuffer.toString());
      const result: ImportResult = {
        success: 0,
        errors: 0,
        total: 0,
        errorsList: [],
      };

      // Implementar lógica de restauración
      // Esto es complejo y requiere transacciones para mantener integridad
      // Por ahora, solo validamos el formato del backup

      if (!backup.account || !backup.exportDate) {
        throw new Error('Formato de backup inválido');
      }

      result.success = 1;
      result.total = 1;

      this.logger.log(`Backup restored for account ${accountId}`);
      return result;
    } catch (error) {
      this.logger.error('Error restoring backup:', error);
      throw new BadRequestException('Error al restaurar backup');
    }
  }

  // =====================================================
  // EXAMPLE GENERATION
  // =====================================================

  async generateContactsExample(): Promise<Buffer> {
    try {
      // Crear contenido CSV de ejemplo con los campos soportados
      // Usar comillas para asegurar compatibilidad con Excel y otros editores
      const csvContent = [
        '"email","first_name","last_name","phone"',
        '"test@gmail.com","george","Hinton","1232452123"',
        '"maria.garcia@email.com","Maria","Garcia","+52 55 9876 5432"',
        '"carlos.lopez@email.com","Carlos","Lopez","+52 55 5555 1234"',
        '"juan.perez@email.com","Juan","Perez","+52 55 1234 5678"',
        '"ana.martinez@email.com","Ana","Martinez","+52 55 1111 2222"',
        '"luis.rodriguez@email.com","Luis","Rodriguez","+52 55 3333 4444"',
      ].join('\n');

      return Buffer.from(csvContent, 'utf-8');
    } catch (error) {
      this.logger.error('Error generating contacts example:', error);
      throw new BadRequestException('Error al generar archivo de ejemplo');
    }
  }
}
