import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';

// Interfaces según documentación oficial GoHighLevel Business API 2025
interface GHLContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tags: string[];
  customFields: { [key: string]: any };
  source: string;
  createdAt: string;
  updatedAt: string;
}

interface GHLOpportunity {
  id: string;
  name: string;
  contactId: string;
  pipelineId: string;
  pipelineStageId: string;
  status: string;
  value: number;
  createdAt: string;
  updatedAt: string;
}

interface GHLPipeline {
  id: string;
  name: string;
  stages: GHLPipelineStage[];
  createdAt: string;
  updatedAt: string;
}

interface GHLPipelineStage {
  id: string;
  name: string;
  order: number;
  probability: number;
}

interface GHLMetrics {
  totalContacts: number;
  newContacts: number;
  totalOpportunities: number;
  totalValue: number;
  conversionRate: number;
  averageDealSize: number;
  activePipelines: number;
}

@Injectable()
export class GHLService {
  private readonly logger = new Logger(GHLService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async getGHLConfig(accountId: string) {
    const config = await this.prisma.accountGhlConfig.findUnique({
      where: { accountId },
    });

    if (!config) {
      throw new BadRequestException('Configuración de GHL no encontrada');
    }

    return {
      locationId: config.locationId,
      baseUrl: config.baseUrl,
      apiKey: config.apiKey, // Necesario para las llamadas a la API
    };
  }

  async updateGHLConfig(accountId: string, config: any) {
    // Si se proporciona una API key, obtener automáticamente el locationId
    let locationId = config.locationId;

    if (config.apiKey && !locationId) {
      try {
        // Intentar obtener el locationId desde la API de GoHighLevel
        const response = await axios.get(
          'https://rest.gohighlevel.com/v1/locations/',
          {
            headers: {
              Authorization: `Bearer ${config.apiKey}`,
              Version: '2021-07-28',
            },
          },
        );

        // Tomar el primer locationId disponible
        if (response.data?.locations && response.data.locations.length > 0) {
          locationId = response.data.locations[0].id;
          this.logger.log(
            `✅ LocationId obtenido automáticamente: ${locationId}`,
          );
        }
      } catch (error) {
        this.logger.warn(
          `⚠️ No se pudo obtener el locationId automáticamente: ${error.message}`,
        );
        // Continuar sin locationId, el usuario puede proporcionarlo más tarde
      }
    }

    return this.prisma.accountGhlConfig.upsert({
      where: { accountId },
      update: {
        apiKey: config.apiKey,
        locationId: locationId || config.locationId,
        baseUrl: config.baseUrl,
      },
      create: {
        accountId,
        apiKey: config.apiKey,
        locationId: locationId || config.locationId,
        baseUrl: config.baseUrl,
      },
    });
  }

  async removeGHLConfig(accountId: string) {
    this.logger.log(`Eliminando configuración de GHL para cuenta ${accountId}`);

    try {
      // Eliminar configuración de GHL de la base de datos
      const deleteResult = await this.prisma.accountGhlConfig.deleteMany({
        where: { accountId },
      });

      this.logger.log(
        `Configuración de GHL eliminada para cuenta ${accountId}: ${deleteResult.count} registros eliminados`,
      );

      return {
        deleted: deleteResult.count,
        message: 'Configuración de GHL eliminada exitosamente',
      };
    } catch (error) {
      this.logger.error(
        `Error eliminando configuración de GHL para cuenta ${accountId}:`,
        error,
      );
      throw new BadRequestException('Error eliminando configuración de GHL');
    }
  }

  async createContact(accountId: string, contactData: any) {
    try {
      const config = await this.getGHLConfig(accountId);

      // Llamada real a la API de GoHighLevel según documentación oficial
      const baseUrl = config.baseUrl || `https://rest.gohighlevel.com/v1`;
      const response = await axios.post(
        `${baseUrl}/contacts/`,
        {
          firstName: contactData.firstName,
          lastName: contactData.lastName,
          email: contactData.email,
          phone: contactData.phone,
          source: 'PrixAgent AI',
          tags: ['ai-generated', 'phone-call'],
          customFields: {
            ai_agent_id: contactData.agentId || null,
            call_duration: contactData.callDuration || null,
            call_outcome: contactData.outcome || null,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
            Version: '2021-07-28', // Versión de API según documentación
          },
          timeout: 10000, // 10 segundos timeout
        },
      );

      this.logger.log(`✅ Contacto creado en GHL: ${response.data.contact.id}`);

      return {
        id: response.data.contact.id,
        email: response.data.contact.email,
        firstName: response.data.contact.firstName,
        lastName: response.data.contact.lastName,
        phone: response.data.contact.phone,
        status: 'created',
        ghlData: response.data.contact,
      };
    } catch (error) {
      this.logger.error(`❌ Error creando contacto en GHL: ${error.message}`);
      throw new BadRequestException(
        `Error creando contacto en GHL: ${error.message}`,
      );
    }
  }

  async updateContact(accountId: string, contactId: string, contactData: any) {
    try {
      const config = await this.getGHLConfig(accountId);

      // Llamada real a la API de GoHighLevel según documentación oficial
      const response = await axios.put(
        `${config.baseUrl || 'https://rest.gohighlevel.com/v1'}/contacts/${contactId}`,
        {
          firstName: contactData.firstName,
          lastName: contactData.lastName,
          email: contactData.email,
          phone: contactData.phone,
          tags: contactData.tags || ['ai-updated'],
          customFields: {
            ai_agent_id: contactData.agentId || null,
            last_call_date: new Date().toISOString(),
            call_outcome: contactData.outcome || null,
            call_notes: contactData.notes || null,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
            Version: '2021-07-28',
          },
          timeout: 10000,
        },
      );

      this.logger.log(`✅ Contacto actualizado en GHL: ${contactId}`);

      return {
        id: contactId,
        ...contactData,
        status: 'updated',
        ghlData: response.data.contact,
      };
    } catch (error) {
      this.logger.error(
        `❌ Error actualizando contacto en GHL: ${error.message}`,
      );
      throw new BadRequestException(
        `Error actualizando contacto en GHL: ${error.message}`,
      );
    }
  }

  // Nuevo método para crear conversaciones según documentación GHL
  async createConversation(accountId: string, conversationData: any) {
    try {
      const config = await this.getGHLConfig(accountId);

      const response = await axios.post(
        `${config.baseUrl || 'https://rest.gohighlevel.com/v1'}/conversations/`,
        {
          contactId: conversationData.contactId,
          type: 'sms', // o 'email', 'call', etc.
          message: conversationData.message,
          direction: 'outbound',
          source: 'PrixAgent AI',
        },
        {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
            Version: '2021-07-28',
          },
          timeout: 10000,
        },
      );

      this.logger.log(
        `✅ Conversación creada en GHL: ${response.data.conversation.id}`,
      );
      return response.data.conversation;
    } catch (error) {
      this.logger.error(
        `❌ Error creando conversación en GHL: ${error.message}`,
      );
      throw new BadRequestException(
        `Error creando conversación en GHL: ${error.message}`,
      );
    }
  }

  // ===== MÉTODOS DE MÉTRICAS Y ANALÍTICAS (2025) =====

  /**
   * Obtener métricas de CRM según documentación oficial GoHighLevel Business API 2025
   */
  async getMetrics(
    accountId: string,
    dateRange?: { from: Date; to: Date },
  ): Promise<GHLMetrics> {
    try {
      const config = await this.getGHLConfig(accountId);

      // Obtener contactos
      const baseUrl = config.baseUrl || `https://rest.gohighlevel.com/v1`;
      const contactsResponse = await axios.get(`${baseUrl}/contacts/`, {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          Version: '2021-07-28',
        },
        params: {
          limit: 1000,
          ...(dateRange && {
            startDate: dateRange.from.toISOString(),
            endDate: dateRange.to.toISOString(),
          }),
        },
      });

      // Obtener oportunidades
      const opportunitiesResponse = await axios.get(
        `${baseUrl}/opportunities/`,
        {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            Version: '2021-07-28',
          },
          params: {
            limit: 1000,
            ...(dateRange && {
              startDate: dateRange.from.toISOString(),
              endDate: dateRange.to.toISOString(),
            }),
          },
        },
      );

      // Obtener pipelines
      const pipelinesResponse = await axios.get(`${baseUrl}/pipelines/`, {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          Version: '2021-07-28',
        },
      });

      const contacts = contactsResponse.data.contacts || [];
      const opportunities = opportunitiesResponse.data.opportunities || [];
      const pipelines = pipelinesResponse.data.pipelines || [];

      // Calcular métricas
      const totalContacts = contacts.length;
      const newContacts = contacts.filter((contact: any) => {
        const createdAt = new Date(contact.dateAdded);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return createdAt >= thirtyDaysAgo;
      }).length;

      const totalOpportunities = opportunities.length;
      const totalValue = opportunities.reduce(
        (sum: number, opp: any) => sum + (opp.monetaryValue || 0),
        0,
      );

      const wonOpportunities = opportunities.filter(
        (opp: any) => opp.status === 'won',
      ).length;
      const conversionRate =
        totalOpportunities > 0
          ? (wonOpportunities / totalOpportunities) * 100
          : 0;

      const averageDealSize =
        totalOpportunities > 0 ? totalValue / totalOpportunities : 0;
      const activePipelines = pipelines.filter(
        (pipeline: any) => pipeline.status === 'active',
      ).length;

      this.logger.log(
        `Métricas GHL calculadas para ${accountId}: ${totalContacts} contactos, ${totalOpportunities} oportunidades`,
      );

      return {
        totalContacts,
        newContacts,
        totalOpportunities,
        totalValue: Math.round(totalValue * 100) / 100,
        conversionRate: Math.round(conversionRate * 100) / 100,
        averageDealSize: Math.round(averageDealSize * 100) / 100,
        activePipelines,
      };
    } catch (error) {
      this.logger.error('Error obteniendo métricas de GHL:', error);
      throw new BadRequestException('Error obteniendo métricas de CRM');
    }
  }

  /**
   * Obtener contactos recientes según documentación oficial GoHighLevel Business API 2025
   */
  async getRecentContacts(
    accountId: string,
    limit: number = 10,
  ): Promise<GHLContact[]> {
    try {
      const config = await this.getGHLConfig(accountId);

      const baseUrl = config.baseUrl || `https://rest.gohighlevel.com/v1`;
      const response = await axios.get(`${baseUrl}/contacts/`, {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          Version: '2021-07-28',
        },
        params: {
          limit,
          sort: 'dateAdded',
          sortOrder: 'desc',
        },
      });

      return (response.data.contacts || []).map((contact: any) => ({
        id: contact.id,
        firstName: contact.firstName || '',
        lastName: contact.lastName || '',
        email: contact.email || '',
        phone: contact.phone || '',
        tags: contact.tags || [],
        customFields: contact.customFields || {},
        source: contact.source || '',
        createdAt: contact.dateAdded,
        updatedAt: contact.dateUpdated,
      }));
    } catch (error) {
      this.logger.error('Error obteniendo contactos recientes de GHL:', error);
      throw new BadRequestException('Error obteniendo contactos recientes');
    }
  }

  /**
   * Obtener oportunidades activas según documentación oficial GoHighLevel Business API 2025
   */
  async getActiveOpportunities(
    accountId: string,
    limit: number = 10,
  ): Promise<GHLOpportunity[]> {
    try {
      const config = await this.getGHLConfig(accountId);

      const baseUrl = config.baseUrl || `https://rest.gohighlevel.com/v1`;
      const response = await axios.get(`${baseUrl}/opportunities/`, {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          Version: '2021-07-28',
        },
        params: {
          limit,
          status: 'open',
          sort: 'dateAdded',
          sortOrder: 'desc',
        },
      });

      return (response.data.opportunities || []).map((opp: any) => ({
        id: opp.id,
        name: opp.name || '',
        contactId: opp.contactId || '',
        pipelineId: opp.pipelineId || '',
        pipelineStageId: opp.pipelineStageId || '',
        status: opp.status || '',
        value: opp.monetaryValue || 0,
        createdAt: opp.dateAdded,
        updatedAt: opp.dateUpdated,
      }));
    } catch (error) {
      this.logger.error(
        'Error obteniendo oportunidades activas de GHL:',
        error,
      );
      throw new BadRequestException('Error obteniendo oportunidades activas');
    }
  }

  /**
   * Obtener pipelines según documentación oficial GoHighLevel Business API 2025
   */
  async getPipelines(accountId: string): Promise<GHLPipeline[]> {
    try {
      const config = await this.getGHLConfig(accountId);

      const baseUrl = config.baseUrl || `https://rest.gohighlevel.com/v1`;
      const response = await axios.get(`${baseUrl}/pipelines/`, {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          Version: '2021-07-28',
        },
      });

      return (response.data.pipelines || []).map((pipeline: any) => ({
        id: pipeline.id,
        name: pipeline.name || '',
        stages: (pipeline.stages || []).map((stage: any) => ({
          id: stage.id,
          name: stage.name || '',
          order: stage.order || 0,
          probability: stage.probability || 0,
        })),
        createdAt: pipeline.dateAdded,
        updatedAt: pipeline.dateUpdated,
      }));
    } catch (error) {
      this.logger.error('Error obteniendo pipelines de GHL:', error);
      throw new BadRequestException('Error obteniendo pipelines');
    }
  }

  /**
   * Crear oportunidad según documentación oficial GoHighLevel Business API 2025
   */
  async createOpportunity(
    accountId: string,
    opportunityData: {
      name: string;
      contactId: string;
      pipelineId: string;
      pipelineStageId: string;
      value: number;
      source?: string;
    },
  ): Promise<GHLOpportunity> {
    try {
      const config = await this.getGHLConfig(accountId);

      const response = await axios.post(
        `${config.baseUrl || 'https://rest.gohighlevel.com/v1'}/opportunities/`,
        {
          name: opportunityData.name,
          contactId: opportunityData.contactId,
          pipelineId: opportunityData.pipelineId,
          pipelineStageId: opportunityData.pipelineStageId,
          monetaryValue: opportunityData.value,
          source: opportunityData.source || 'PrixAgent AI',
        },
        {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
            Version: '2021-07-28',
          },
        },
      );

      this.logger.log(
        `Oportunidad creada en GHL: ${response.data.opportunity.id}`,
      );

      return {
        id: response.data.opportunity.id,
        name: response.data.opportunity.name,
        contactId: response.data.opportunity.contactId,
        pipelineId: response.data.opportunity.pipelineId,
        pipelineStageId: response.data.opportunity.pipelineStageId,
        status: response.data.opportunity.status,
        value: response.data.opportunity.monetaryValue,
        createdAt: response.data.opportunity.dateAdded,
        updatedAt: response.data.opportunity.dateUpdated,
      };
    } catch (error) {
      this.logger.error('Error creando oportunidad en GHL:', error);
      throw new BadRequestException('Error creando oportunidad');
    }
  }

  /**
   * Obtener calendarios de GoHighLevel
   */
  async getCalendars(accountId: string): Promise<any[]> {
    try {
      const config = await this.getGHLConfig(accountId);
      this.logger.debug(
        `[GHL Calendars] Usando configuración para accountId ${accountId}:`,
        {
          locationId: config.locationId,
          baseUrl: config.baseUrl,
          apiKey: config.apiKey ? `${config.apiKey.substring(0, 5)}...` : 'N/A',
        },
      );

      // Corrección: Usar la baseUrl de la configuración o un default más robusto.
      // La API v1 de GHL a menudo requiere el locationId como query param.
      const baseUrl = `https://services.leadconnectorhq.com/calendars/`;

      this.logger.log(
        `Obteniendo calendarios para locationId: ${config.locationId} desde ${baseUrl}`,
      );

      const response = await axios.get(baseUrl, {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          Version: '2021-07-28',
        },
        params: {
          locationId: config.locationId,
        },
      });

      if (!response.data?.calendars) {
        this.logger.warn(
          `La respuesta de GHL para calendarios no tiene el formato esperado.`,
          response.data,
        );
        return [];
      }

      return response.data.calendars;
    } catch (error) {
      this.logger.error(
        `[GHL Calendars] Error obteniendo calendarios para la cuenta ${accountId}.`,
      );
      if (axios.isAxiosError(error)) {
        this.logger.error('[GHL Calendars] Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers,
        });
        const errorMessage =
          error.response?.data?.message || error.message || 'Error desconocido';
        if (
          errorMessage.toLowerCase().includes('invalid jwt') ||
          errorMessage.toLowerCase().includes('unauthorized') ||
          error.response?.status === 401
        ) {
          throw new BadRequestException(
            'La conexión con GoHighLevel ha fallado. Por favor, verifica tu API Key en la configuración de integraciones.',
          );
        }
        throw new BadRequestException(
          `Error obteniendo calendarios de GHL: ${errorMessage}`,
        );
      } else {
        this.logger.error('[GHL Calendars] Unexpected error:', error);
        throw new BadRequestException(
          `Error obteniendo calendarios de GHL: ${error.message}`,
        );
      }
    }
  }

  /**
   * Obtener horarios disponibles de un calendario de GoHighLevel
   */
  async getAvailableSlots(
    accountId: string,
    calendarId: string,
    startDate: string,
    endDate: string,
  ): Promise<any[]> {
    try {
      const config = await this.getGHLConfig(accountId);
      const baseUrl = `https://services.leadconnectorhq.com`;

      this.logger.log(
        `Obteniendo slots para calendario ${calendarId} entre ${startDate} y ${endDate}`,
      );

      const response = await axios.get(
        `${baseUrl}/calendars/${calendarId}/free-slots`,
        {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            Version: '2021-07-28',
          },
          params: {
            locationId: config.locationId,
            startDate,
            endDate,
          },
        },
      );

      this.logger.log(
        `Slots obtenidos: ${response.data?.freeSlots?.length || 0}`,
      );
      return response.data.freeSlots || [];
    } catch (error) {
      this.logger.error(
        `Error obteniendo horarios disponibles de GHL para la cuenta ${accountId}:`,
        error.response?.data || error.message,
      );
      throw new BadRequestException(
        'Error obteniendo horarios disponibles de GHL',
      );
    }
  }

  /**
   * Crear una cita en un calendario de GoHighLevel
   */
  async createAppointment(
    accountId: string,
    calendarId: string,
    appointmentData: any,
  ): Promise<any> {
    try {
      const config = await this.getGHLConfig(accountId);
      const baseUrl = `https://services.leadconnectorhq.com`;

      this.logger.log(
        `Creando cita en calendario ${calendarId} con datos:`,
        appointmentData,
      );

      const response = await axios.post(
        `${baseUrl}/calendars/${calendarId}/appointments`,
        appointmentData,
        {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
            Version: '2021-07-28',
          },
          params: {
            locationId: config.locationId,
          },
        },
      );

      this.logger.log(`Cita creada exitosamente: ${response.data.id}`);
      return response.data;
    } catch (error) {
      this.logger.error(
        `Error creando cita en GHL para la cuenta ${accountId}:`,
        error.response?.data || error.message,
      );
      throw new BadRequestException('Error creando cita en GHL');
    }
  }

  /**
   * Verificar salud de la conexión con GoHighLevel
   */
  async healthCheck(accountId: string): Promise<boolean> {
    try {
      const config = await this.getGHLConfig(accountId);

      // Usar la URL correcta de GoHighLevel v1 API
      const baseUrl = config.baseUrl || `https://rest.gohighlevel.com/v1`;

      // URL correcta según documentación: /v1/contacts/ (sin locationId)
      const apiUrl = `${baseUrl}/contacts/`;

      this.logger.log(`Testing GHL connection to: ${apiUrl}`);

      await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          Version: '2021-07-28',
        },
        params: { limit: 1 },
        timeout: 10000,
      });

      this.logger.log('✅ GHL health check successful');
      return true;
    } catch (error) {
      this.logger.error(
        '❌ Error en health check de GHL:',
        error.response?.data || error.message,
      );
      return false;
    }
  }
}
