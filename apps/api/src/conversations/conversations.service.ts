import { Injectable, Logger } from '@nestjs/common';
import { ElevenLabsService } from '../integrations/elevenlabs/elevenlabs.service';
import { PrismaService } from '../prisma/prisma.service';

export interface ConversationFilters {
  cursor?: string;
  agentId?: string;
  callSuccessful?: string;
  callStartBeforeUnix?: number;
  callStartAfterUnix?: number;
  userId?: string;
  pageSize: number;
  summaryMode: string;
}

export interface ConversationAnalytics {
  totalConversations: number;
  activeConversations: number;
  averageDuration: number;
  successRate: number;
  totalMinutes: number;
  cost: number;
  agentPerformance: Array<{
    agentId: string;
    agentName: string;
    totalCalls: number;
    successRate: number;
    averageDuration: number;
  }>;
  dailyStats: Array<{
    date: string;
    calls: number;
    successfulCalls: number;
    totalMinutes: number;
  }>;
}

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(
    private readonly elevenLabsService: ElevenLabsService,
    private readonly prisma: PrismaService,
  ) {}

  async getConversations(accountId: string, filters: ConversationFilters) {
    this.logger.log(
      `📞 Obteniendo conversaciones para account ${accountId} con filtros:`,
      JSON.stringify(filters, null, 2),
    );

    try {
      // Preparar filtros para ElevenLabs API según documentación oficial
      const elevenLabsFilters: any = {};

      if (filters.cursor) {
        elevenLabsFilters.cursor = filters.cursor;
      }

      if (filters.agentId) {
        elevenLabsFilters.agent_id = filters.agentId;
      }

      if (filters.callSuccessful) {
        elevenLabsFilters.call_successful = filters.callSuccessful;
      }

      if (filters.callStartBeforeUnix) {
        elevenLabsFilters.call_start_before_unix = filters.callStartBeforeUnix;
      }

      if (filters.callStartAfterUnix) {
        elevenLabsFilters.call_start_after_unix = filters.callStartAfterUnix;
      }

      if (filters.userId) {
        elevenLabsFilters.user_id = filters.userId;
      }

      if (filters.pageSize) {
        elevenLabsFilters.page_size = filters.pageSize;
      }

      if (filters.summaryMode) {
        elevenLabsFilters.summary_mode = filters.summaryMode;
      }

      this.logger.log(
        `🔍 Filtros mapeados para ElevenLabs:`,
        JSON.stringify(elevenLabsFilters, null, 2),
      );

      this.logger.log(`🔍 Llamando a elevenLabsService.getConversations...`);

      // Usar el servicio de ElevenLabs que ya está conectado a la API real
      const elevenLabsResponse = await this.elevenLabsService.getConversations(
        accountId,
        elevenLabsFilters,
      );

      this.logger.log(
        `🔍 Respuesta de ElevenLabs:`,
        JSON.stringify(elevenLabsResponse, null, 2),
      );

      // Debug: Log de la primera conversación para ver su estructura
      if (elevenLabsResponse && elevenLabsResponse.length > 0) {
        this.logger.log(
          `🔍 Estructura de la primera conversación:`,
          JSON.stringify(elevenLabsResponse[0], null, 2),
        );
        this.logger.log(
          `🔍 Campos disponibles en la conversación:`,
          Object.keys(elevenLabsResponse[0]),
        );
      }

      // Obtener números de teléfono de ElevenLabs para mapear correctamente
      const phoneNumbers =
        await this.elevenLabsService.getPhoneNumbers(accountId);
      this.logger.log(`📞 Números de teléfono obtenidos:`, phoneNumbers);

      // Mapear las conversaciones según la documentación oficial de ElevenLabs
      const mappedConversations = elevenLabsResponse.map((conv: any) => {
        // Buscar el agente asignado para obtener el número de teléfono
        let assignedAgent = phoneNumbers.find(
          (phone) => phone.assigned_agent?.agent_id === conv.agent_id,
        );

        // Si no hay agente asignado, usar el primer número disponible (fallback)
        if (!assignedAgent && phoneNumbers.length > 0) {
          assignedAgent = phoneNumbers[0];
          this.logger.log(
            `⚠️ Agente ${conv.agent_id} no tiene número asignado, usando número por defecto: ${assignedAgent.phone_number}`,
          );
        }

        return {
          id: conv.conversation_id,
          agentId: conv.agent_id,
          agentName: conv.agent_name || 'Agente Desconocido',
          status: conv.status,
          startTime: conv.start_time_unix_secs,
          duration: conv.call_duration_secs,
          messageCount: conv.message_count,
          callSuccessful: conv.call_successful,
          transcriptSummary: conv.transcript_summary,
          callSummaryTitle: conv.call_summary_title,
          direction: conv.direction,
          hasAudio: true, // ElevenLabs siempre tiene audio
          hasTranscript: conv.transcript_summary ? true : false,
          // Agregar información de números de teléfono
          agentPhoneNumber: assignedAgent?.phone_number || null,
          phoneNumberId: assignedAgent?.phone_number_id || null,
          // Número del participante (cliente) - buscar en múltiples campos posibles
          participantPhoneNumber:
            conv.metadata?.phone_call?.external_number ||
            conv.participant_phone_number ||
            conv.participant_phone ||
            conv.phone_number ||
            conv.caller_phone_number ||
            conv.caller_phone ||
            conv.to_phone_number ||
            conv.to_phone ||
            null,
          // Incluir toda la conversación para debugging
          rawConversation: conv,
        };
      });

      this.logger.log(
        `✅ Obtenidas ${mappedConversations.length} conversaciones exitosamente`,
      );

      return {
        conversations: mappedConversations,
        hasMore: mappedConversations.length === filters.pageSize,
        nextCursor: filters.cursor ? `${parseInt(filters.cursor) + 1}` : null,
        total: mappedConversations.length,
      };
    } catch (error) {
      this.logger.error(
        '❌ Error obteniendo conversaciones de ElevenLabs:',
        error.message,
        error.stack,
      );

      // Devolver array vacío para cualquier error
      return {
        conversations: [],
        hasMore: false,
        nextCursor: null,
        total: 0,
      };
    }
  }

  async getConversationDetails(conversationId: string, accountId: string) {
    this.logger.log(
      `📋 Obteniendo detalles de conversación ${conversationId} para account ${accountId}`,
    );

    try {
      const details = await this.elevenLabsService.getConversationDetails(
        accountId,
        conversationId,
      );

      this.logger.log(
        `✅ Detalles obtenidos para conversación ${conversationId}`,
      );

      // Mapear exactamente según la documentación oficial de ElevenLabs
      return {
        agent_id: details.agent_id,
        conversation_id: details.conversation_id,
        status: details.status,
        transcript: details.transcript || [],
        metadata: details.metadata || {},
        has_audio: details.has_audio || false,
        has_user_audio: details.has_user_audio || false,
        has_response_audio: details.has_response_audio || false,
        user_id: details.user_id || null,
        analysis: details.analysis || null,
        conversation_initiation_client_data:
          details.conversation_initiation_client_data || null,
      };
    } catch (error) {
      this.logger.error(
        '❌ Error obteniendo detalles de conversación de ElevenLabs:',
        error.message,
        error.stack,
      );

      // Devolver null para cualquier error
      return null;
    }
  }

  async getConversationAudio(conversationId: string, accountId: string) {
    this.logger.log(
      `🎵 Obteniendo audio de conversación ${conversationId} para account ${accountId}`,
    );

    try {
      const audioData = await this.elevenLabsService.getConversationAudio(
        accountId,
        conversationId,
      );

      this.logger.log(
        `✅ Audio obtenido exitosamente para conversación ${conversationId}`,
      );

      // Retornar los datos tal como vienen de ElevenLabs
      return audioData;
    } catch (error) {
      this.logger.error(
        `❌ Error obteniendo audio de ElevenLabs para conversación ${conversationId}:`,
        error.message,
      );

      // Devolver estructura vacía para cualquier error
      return {
        audioUrl: null,
        duration: 0,
        format: null,
        error: error.message,
      };
    }
  }

  async sendConversationFeedback(
    conversationId: string,
    feedback: 'like' | 'dislike',
    accountId: string,
  ) {
    this.logger.log(
      `👍 Enviando feedback "${feedback}" para conversación ${conversationId} (account: ${accountId})`,
    );

    try {
      const result = await this.elevenLabsService.sendConversationFeedback(
        accountId,
        conversationId,
        feedback,
      );

      this.logger.log(
        `✅ Feedback "${feedback}" enviado exitosamente para conversación ${conversationId}`,
      );

      return {
        success: true,
        message: 'Feedback enviado correctamente',
        conversationId,
        feedback,
        result,
      };
    } catch (error) {
      this.logger.error(
        `❌ Error enviando feedback a ElevenLabs para conversación ${conversationId}:`,
        error.message,
      );

      return {
        success: false,
        message: 'Error enviando feedback',
        conversationId,
        feedback,
        error: error.message,
      };
    }
  }

  async deleteConversation(conversationId: string, accountId: string) {
    this.logger.log(
      `Eliminando conversación ${conversationId} para account ${accountId}`,
    );

    try {
      const result = await this.elevenLabsService.deleteConversation(
        accountId,
        conversationId,
      );

      return {
        success: true,
        message: 'Conversación eliminada correctamente',
        conversationId,
        result,
      };
    } catch (error) {
      this.logger.warn(
        'Error eliminando conversación de ElevenLabs:',
        error.message,
      );

      return {
        success: false,
        message: 'Error eliminando conversación',
        conversationId,
        error: error.message,
      };
    }
  }

  async getConversationAnalytics(
    accountId: string,
  ): Promise<ConversationAnalytics> {
    this.logger.log(
      `Obteniendo analytics de conversaciones para account ${accountId}`,
    );

    try {
      // Usar el servicio de ElevenLabs que calcula analytics desde conversaciones reales
      // Nota: getAnalytics no está implementado aún en el servicio
      // const analytics = await this.elevenLabsService.getAnalytics(accountId);
      const analytics = {
        totalConversations: 0,
        activeConversations: 0,
        averageDuration: 0,
        successRate: 0,
        totalMinutes: 0,
        cost: 0,
      };

      return {
        totalConversations: analytics.totalConversations,
        activeConversations: analytics.activeConversations,
        averageDuration: analytics.averageDuration,
        successRate: analytics.successRate,
        totalMinutes: analytics.totalMinutes,
        cost: analytics.cost,
        agentPerformance: [],
        dailyStats: [],
      };
    } catch (error) {
      this.logger.error(
        '❌ Error obteniendo analytics de ElevenLabs:',
        error.message,
        error.stack,
      );

      // Devolver analytics vacíos para cualquier error
      return {
        totalConversations: 0,
        activeConversations: 0,
        averageDuration: 0,
        successRate: 0,
        totalMinutes: 0,
        cost: 0,
        agentPerformance: [],
        dailyStats: [],
      };
    }
  }

  async getCall(conversationId: string, accountId: string) {
    return this.prisma.call.findFirst({
      where: {
        id: conversationId,
        accountId,
      },
      select: {
        id: true,
        elevenLabsConversationId: true,
        accountId: true,
      },
    });
  }

  async getElevenLabsConfig(accountId: string) {
    return this.prisma.accountElevenLabsConfig.findUnique({
      where: { accountId },
    });
  }
}
