import { Injectable } from '@nestjs/common';
import { ElevenLabsService } from '../integrations/elevenlabs/elevenlabs.service';
import { GHLService } from '../integrations/ghl/ghl.service';
import { TwilioService } from '../integrations/twilio/twilio.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardIntegratedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly elevenLabsService: ElevenLabsService,
    private readonly twilioService: TwilioService,
    private readonly ghlService: GHLService,
  ) {}

  // Getters públicos para exponer los servicios privados
  getPrisma() {
    return this.prisma;
  }

  getElevenLabsService() {
    return this.elevenLabsService;
  }

  getTwilioService() {
    return this.twilioService;
  }

  getGHLService() {
    return this.ghlService;
  }

  async getStats(accountId: string) {
    try {
      // ===== EJECUTAR TODAS LAS CONSULTAS EN PARALELO =====
      const [
        agentsCount,
        activeAgentsCount,
        campaignsCount,
        activeCampaignsCount,
        contactsCount,
        phoneNumbersCount,
        twilioMetricsResult,
        ghlMetricsResult,
        localCalls,
        databaseHealthCheck,
      ] = await Promise.all([
        this.prisma.agent.count({ where: { accountId } }),
        this.prisma.agent.count({ where: { accountId, status: 'active' } }),
        this.prisma.campaign.count({ where: { accountId } }),
        this.prisma.campaign.count({ where: { accountId, status: 'running' } }),
        this.prisma.contact.count({ where: { accountId } }),
        this.prisma.phoneNumber.count({ where: { accountId } }),
        this.twilioService.getCallMetrics(accountId).catch((_e) => {
          // console.warn('Error obteniendo métricas de Twilio:', e.message);
          return null;
        }),
        this.ghlService.getMetrics(accountId).catch((_e) => {
          // console.warn('Error obteniendo métricas de GoHighLevel:', e.message);
          return null;
        }),
        this.prisma.call.findMany({
          where: { accountId },
          select: {
            duration: true,
            direction: true,
            status: true,
            success: true,
          },
        }),
        // Verificación real de la conexión a la base de datos
        this.prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false),
      ]);

      // ===== DATOS DE TWILIO (REALES) =====
      const twilioMetrics = twilioMetricsResult || {
        totalCalls: 0,
        answeredCalls: 0,
        missedCalls: 0,
        totalMinutes: 0,
        totalCost: 0,
        averageDuration: 0,
        successRate: 0,
      };

      // ===== DATOS DE GOHIGHLEVEL (REALES) =====
      const ghlMetrics = ghlMetricsResult || {
        totalContacts: 0,
        newContacts: 0,
        totalOpportunities: 0,
        totalValue: 0,
        conversionRate: 0,
        averageDealSize: 0,
        activePipelines: 0,
      };

      // ===== DATOS DE ELEVENLABS (FALLBACK) =====
      const elevenLabsAnalytics = {
        totalConversations: 0,
        activeConversations: 0,
        averageDuration: 0,
        successRate: 0,
        totalMinutes: 0,
        cost: 0,
      };

      // ===== DATOS LOCALES COMO FALLBACK =====
      const localProjectedOutboundMinutes =
        localCalls
          .filter((call) => call.direction === 'outbound')
          .reduce((total, call) => total + (call.duration || 0), 0) / 60;

      const localProjectedInboundMinutes =
        localCalls
          .filter((call) => call.direction === 'inbound')
          .reduce((total, call) => total + (call.duration || 0), 0) / 60;

      const localTotalCost = 0; // No hay campo cost en el esquema actual
      const localAnsweredCalls = localCalls.filter(
        (call) => call.status === 'completed',
      ).length;
      const localTotalCalls = localCalls.length;

      // ===== COMBINAR DATOS (PRIORIZAR APIs EXTERNAS) =====
      return {
        // Métricas de llamadas (Twilio tiene prioridad)
        totalCalls: twilioMetrics.totalCalls || localTotalCalls,
        answeredCalls: twilioMetrics.answeredCalls || localAnsweredCalls,
        missedCalls:
          twilioMetrics.missedCalls || localTotalCalls - localAnsweredCalls,
        totalMinutes:
          twilioMetrics.totalMinutes ||
          localProjectedOutboundMinutes + localProjectedInboundMinutes,
        totalCost: twilioMetrics.totalCost || localTotalCost,
        averageDuration: twilioMetrics.averageDuration || 0,
        successRate: twilioMetrics.successRate || 0,

        // Métricas de minutos
        projectedOutboundMinutes: localProjectedOutboundMinutes,
        projectedInboundMinutes: localProjectedInboundMinutes,

        // Métricas de infraestructura
        activePhoneNumbers: phoneNumbersCount,
        nextPayment: twilioMetrics.totalCost || localTotalCost,
        activeAgentsCount,
        agentsCount,
        campaignsCount,
        activeCampaignsCount,
        contactsCount,

        // Métricas de ElevenLabs
        elevenLabsAnalytics: {
          totalConversations: elevenLabsAnalytics.totalConversations,
          activeConversations: elevenLabsAnalytics.activeConversations,
          averageDuration: elevenLabsAnalytics.averageDuration,
          successRate: elevenLabsAnalytics.successRate,
          totalMinutes: elevenLabsAnalytics.totalMinutes,
          cost: elevenLabsAnalytics.cost,
        },

        // Métricas de GoHighLevel
        ghlMetrics: {
          totalContacts: ghlMetrics.totalContacts,
          newContacts: ghlMetrics.newContacts,
          totalOpportunities: ghlMetrics.totalOpportunities,
          totalValue: ghlMetrics.totalValue,
          conversionRate: ghlMetrics.conversionRate,
          averageDealSize: ghlMetrics.averageDealSize,
          activePipelines: ghlMetrics.activePipelines,
        },

        // Metadatos
        lastUpdated: new Date().toISOString(),
        dataSources: {
          twilio: twilioMetrics.totalCalls > 0,
          goHighLevel: ghlMetrics.totalContacts > 0,
          local: databaseHealthCheck, // Verificación real de la conexión a la base de datos
        },
      };
    } catch (_error) {
      // console._error('Error obteniendo estadísticas del dashboard:', _error);
      throw _error;
    }
  }

  async getRecentActivity(accountId: string) {
    try {
      // ===== EJECUTAR TODAS LAS CONSULTAS EN PARALELO =====
      const [
        twilioCallsResult,
        elevenLabsConversationsResult,
        ghlContactsResult,
        localActivities,
      ] = await Promise.all([
        this.twilioService.getRecentCalls(accountId, 5).catch((_e) => {
          // console.warn(
          //   'Error obteniendo llamadas recientes de Twilio:',
          //   e.message,
          // );
          return []; // Devolver array vacío en caso de _error
        }),
        this.elevenLabsService
          .getRecentConversations(accountId, 5)
          .catch((_e) => {
            // console.warn(
            //   'Error obteniendo conversaciones recientes de ElevenLabs:',
            //   e.message,
            // );
            return []; // Devolver array vacío en caso de _error
          }),
        this.ghlService.getRecentContacts(accountId, 5).catch((e) => {
          // console.warn(
          //   'Error obteniendo contactos recientes de GoHighLevel:',
          //   e.message,
          // );
          return []; // Devolver array vacío en caso de _error
        }),
        this.prisma.call.findMany({
          where: { accountId },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            phoneNumber: true,
            direction: true,
            status: true,
            createdAt: true,
            duration: true,
            success: true,
          },
        }),
      ]);

      const activities = [];

      // Procesar llamadas de Twilio
      if (twilioCallsResult) {
        activities.push(
          ...twilioCallsResult.map((call) => ({
            id: call.id,
            type: 'call',
            title: `Llamada ${call.direction}`,
            description: `${call.from} → ${call.to}`,
            status: call.status,
            timestamp: call.startTime,
            metadata: {
              duration: call.duration,
              cost: call.price,
              recordingUrl: call.recordingUrl,
            },
          })),
        );
      }

      // Procesar conversaciones de ElevenLabs
      if (elevenLabsConversationsResult) {
        activities.push(
          ...elevenLabsConversationsResult.map((conv) => ({
            id: conv.conversation_id,
            type: 'conversation',
            title: 'Conversación AI',
            description: `Agente: ${conv.agent_id}`,
            status: conv.status,
            timestamp: new Date(conv.start_time_unix_secs * 1000).toISOString(),
            metadata: {
              duration: conv.call_duration_secs,
              transcript: conv.transcript_summary || '',
              recordingUrl: null,
            },
          })),
        );
      }

      // Procesar contactos de GoHighLevel
      if (ghlContactsResult) {
        activities.push(
          ...ghlContactsResult.map((contact) => ({
            id: contact.id,
            type: 'contact',
            title: 'Nuevo Contacto',
            description: `${contact.firstName} ${contact.lastName}`,
            status: 'created',
            timestamp: contact.createdAt,
            metadata: {
              email: contact.email,
              phone: contact.phone,
              source: contact.source,
            },
          })),
        );
      }

      // Procesar actividades locales
      if (localActivities) {
        activities.push(
          ...localActivities.map((call) => ({
            id: call.id,
            type: 'call',
            title: `Llamada ${call.direction}`,
            description: `Número: ${call.phoneNumber}`,
            status: call.status,
            timestamp: call.createdAt,
            metadata: {
              duration: call.duration,
              success: call.success,
            },
          })),
        );
      }

      // Ordenar por timestamp y devolver las más recientes
      return activities
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )
        .slice(0, 20);
    } catch (_error) {
      // console._error('Error obteniendo actividad reciente:', _error);
      throw _error;
    }
  }

  async getAnalytics(
    accountId: string,
    filters: {
      agentId?: string;
      callType?: string;
      dateFrom?: string;
      dateTo?: string;
      type?: string;
      phoneNumber?: string;
    },
  ) {
    try {
      // Construir filtros de fecha
      const dateRange =
        filters.dateFrom && filters.dateTo
          ? {
              from: new Date(filters.dateFrom),
              to: new Date(filters.dateTo),
            }
          : undefined;

      // ===== DATOS DE TWILIO (REALES) =====
      let twilioMetrics = {
        totalCalls: 0,
        answeredCalls: 0,
        missedCalls: 0,
        totalMinutes: 0,
        totalCost: 0,
        averageDuration: 0,
        successRate: 0,
        didNotConnect: 0,
        appointments: 0,
        transfers: 0,
      };

      try {
        const twilioData = await this.twilioService.getCallMetrics(
          accountId,
          dateRange,
        );
        twilioMetrics = {
          ...twilioData,
          didNotConnect: twilioData.missedCalls,
          appointments: 0, // Se calculará desde GHL
          transfers: 0, // Se calculará desde GHL
        };
      } catch (_error) {
        // console.warn('Error obteniendo métricas de Twilio:', _error.message);
      }

      // ===== DATOS DE GOHIGHLEVEL (REALES) =====
      let ghlMetrics = {
        totalContacts: 0,
        newContacts: 0,
        totalOpportunities: 0,
        totalValue: 0,
        conversionRate: 0,
        averageDealSize: 0,
        activePipelines: 0,
        appointments: 0,
        transfers: 0,
      };

      try {
        const ghlData = await this.ghlService.getMetrics(accountId, dateRange);
        ghlMetrics = {
          ...ghlData,
          appointments: ghlData.totalOpportunities, // Aproximación
          transfers: 0, // Se puede calcular desde conversaciones
        };
      } catch (_error) {
        // console.warn('Error obteniendo métricas de GoHighLevel:', _error.message);
      }

      // ===== DATOS DE ELEVENLABS (FALLBACK) =====
      const elevenLabsAnalytics = {
        totalConversations: 0,
        activeConversations: 0,
        averageDuration: 0,
        successRate: 0,
        totalMinutes: 0,
        cost: 0,
      };

      // ===== DATOS LOCALES COMO FALLBACK =====
      const localCalls = await this.prisma.call.findMany({
        where: {
          accountId,
          ...(filters.agentId && { agentId: filters.agentId }),
          ...(filters.callType && { direction: filters.callType as any }),
          ...(filters.phoneNumber && {
            phoneNumber: { contains: filters.phoneNumber },
          }),
          ...(dateRange && {
            createdAt: {
              gte: dateRange.from,
              lte: dateRange.to,
            },
          }),
        },
        select: {
          duration: true,
          direction: true,
          status: true,
          success: true,
          type: true,
        },
      });

      const localTotalCalls = localCalls.length;
      const localAnsweredCalls = localCalls.filter(
        (call) => call.status === 'completed',
      ).length;
      const localMissedCalls = localCalls.filter(
        (call) => call.status === 'no-answer' || call.status === 'busy',
      ).length;
      const localTotalMinutes =
        localCalls
          .filter((call) => call.duration)
          .reduce((total, call) => total + (call.duration || 0), 0) / 60;

      // ===== COMBINAR DATOS (PRIORIZAR APIs EXTERNAS) =====
      const analytics = {
        // Métricas principales
        calls: twilioMetrics.totalCalls || localTotalCalls,
        minutes: twilioMetrics.totalMinutes || localTotalMinutes,
        spent: twilioMetrics.totalCost || 0,
        didNotConnect: twilioMetrics.didNotConnect || localMissedCalls,

        // Métricas de respuesta
        answers: twilioMetrics.answeredCalls || localAnsweredCalls,
        noAnswer: twilioMetrics.missedCalls || localMissedCalls,
        appointments: ghlMetrics.appointments || 0,
        transfers: ghlMetrics.transfers || 0,

        // Porcentajes calculados
        answerRate:
          localTotalCalls > 0
            ? ((twilioMetrics.answeredCalls || localAnsweredCalls) /
                (twilioMetrics.totalCalls || localTotalCalls)) *
              100
            : 0,
        noAnswerRate:
          localTotalCalls > 0
            ? ((twilioMetrics.missedCalls || localMissedCalls) /
                (twilioMetrics.totalCalls || localTotalCalls)) *
              100
            : 0,
        appointmentRate:
          localTotalCalls > 0
            ? ((ghlMetrics.appointments || 0) /
                (twilioMetrics.totalCalls || localTotalCalls)) *
              100
            : 0,
        transferRate:
          localTotalCalls > 0
            ? ((ghlMetrics.transfers || 0) /
                (twilioMetrics.totalCalls || localTotalCalls)) *
              100
            : 0,

        // Datos de fuentes externas
        elevenLabsAnalytics,
        ghlMetrics,
        twilioMetrics,

        // Metadatos
        lastUpdated: new Date().toISOString(),
        filters,
        dataSources: {
          twilio: twilioMetrics.totalCalls > 0,
          elevenLabs: elevenLabsAnalytics.totalConversations > 0,
          goHighLevel: ghlMetrics.totalContacts > 0,
          local: localTotalCalls > 0,
        },
      };

      return analytics;
    } catch (_error) {
      // console._error('Error obteniendo analytics:', _error);
      throw _error;
    }
  }
}
