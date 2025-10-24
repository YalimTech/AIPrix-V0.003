import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ElevenLabsService } from '../integrations/elevenlabs/elevenlabs.service';
import { PrismaService } from '../prisma/prisma.service';
import { WebSocketGateway } from '../websocket/websocket.gateway';
import {
  CallDto,
  CallFilterDto,
  CallNotesDto,
  CallStatsDto,
  CallStatus,
  ConversationAnalysisDto,
} from './dto/call.dto';

@Injectable()
export class CallsService {
  private readonly logger = new Logger(CallsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly webSocketGateway: WebSocketGateway,
    private readonly elevenLabsService: ElevenLabsService,
  ) {}

  async findAll(
    accountId: string,
    page: number = 1,
    limit: number = 10,
    filters?: CallFilterDto,
  ): Promise<{ calls: CallDto[]; total: number }> {
    const skip = (page - 1) * limit;

    const where: any = { accountId };

    if (filters) {
      if (filters.status) where.status = filters.status;
      if (filters.type) where.type = filters.type;
      if (filters.direction) where.direction = filters.direction;
      if (filters.agentId) where.agentId = filters.agentId;
      if (filters.campaignId) where.campaignId = filters.campaignId;
      if (filters.contactId) where.contactId = filters.contactId;
      if (filters.phoneNumber)
        where.phoneNumber = { contains: filters.phoneNumber };
      if (filters.success !== undefined) where.success = filters.success;

      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
        if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
      }
    }

    const [calls, total] = await Promise.all([
      this.prisma.call.findMany({
        where,
        skip,
        take: limit,
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              voiceName: true,
            },
          },
          contact: {
            select: {
              id: true,
              name: true,
              lastName: true,
              phone: true,
            },
          },
          campaign: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          phoneNumberRef: {
            select: {
              id: true,
              number: true,
            },
          },
          callAnalytics: {
            select: {
              id: true,
              transcript: true,
              sentiment: true,
              // sentimentScore: true, // Campo no existe en el modelo
              // intent: true, // Campo no existe en el modelo
              // keyTopics: true, // Campo no existe en el modelo
              // summary: true, // Campo no existe en el modelo
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.call.count({ where }),
    ]);

    // Obtener números de teléfono reales desde ElevenLabs para las llamadas que tienen conversationId
    const callsWithPhoneNumbers = await Promise.all(
      calls.map(async (call) => {
        const callDto = this.mapToDto(call);

        // Si la llamada tiene un elevenLabsConversationId, obtener los números reales
        if (call.elevenLabsConversationId) {
          try {
            this.logger.log(
              `📞 Obteniendo números de teléfono para conversación ${call.elevenLabsConversationId}`,
            );
            const phoneNumbers =
              await this.elevenLabsService.getConversationPhoneNumbers(
                accountId,
                call.elevenLabsConversationId,
              );

            // Actualizar los números de teléfono en el DTO
            if (phoneNumbers.agentPhoneNumber) {
              callDto.phoneNumber = phoneNumbers.agentPhoneNumber;
            }
            if (phoneNumbers.contactPhoneNumber) {
              // Agregar el número de contacto al DTO si no existe
              (callDto as any).contactPhoneNumber =
                phoneNumbers.contactPhoneNumber;
            }
            if (phoneNumbers.direction) {
              callDto.direction = phoneNumbers.direction;
            }

            this.logger.log(
              `✅ Números obtenidos para conversación ${call.elevenLabsConversationId}:`,
              phoneNumbers,
            );
          } catch (error) {
            this.logger.error(
              `❌ Error obteniendo números para conversación ${call.elevenLabsConversationId}:`,
              error,
            );
            // Continuar con los datos originales si hay error
          }
        }

        return callDto;
      }),
    );

    return {
      calls: callsWithPhoneNumbers,
      total,
    };
  }

  async findOne(id: string, accountId: string): Promise<CallDto> {
    const call = await this.prisma.call.findFirst({
      where: { id, accountId },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            voiceName: true,
          },
        },
        contact: {
          select: {
            id: true,
            name: true,
            lastName: true,
            phone: true,
          },
        },
        campaign: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        phoneNumberRef: {
          select: {
            id: true,
            number: true,
          },
        },
        callAnalytics: {
          select: {
            id: true,
            transcript: true,
            sentiment: true,
            // sentimentScore: true, // Campo no existe en el modelo
            // intent: true, // Campo no existe en el modelo
            // keyTopics: true, // Campo no existe en el modelo
            // summary: true, // Campo no existe en el modelo
            createdAt: true,
          },
        },
      },
    });

    if (!call) {
      throw new NotFoundException('Llamada no encontrada');
    }

    return this.mapToDto(call);
  }

  async updateStatus(
    id: string,
    status: CallStatus,
    accountId: string,
  ): Promise<CallDto> {
    const call = await this.findOne(id, accountId);
    const previousStatus = call.status;

    const updateData: any = { status };

    // Actualizar timestamps según el estado
    switch (status) {
      case CallStatus.RINGING:
        updateData.initiatedAt = new Date();
        break;
      case CallStatus.ANSWERED:
        updateData.answeredAt = new Date();
        break;
      case CallStatus.COMPLETED:
        updateData.completedAt = new Date();
        // Calcular duración si tenemos initiatedAt
        if (call.initiatedAt) {
          updateData.duration = Math.floor(
            (Date.now() - call.initiatedAt.getTime()) / 1000,
          );
        }
        break;
    }

    const updatedCall = await this.prisma.call.update({
      where: { id },
      data: updateData,
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            voiceName: true,
          },
        },
        contact: {
          select: {
            id: true,
            name: true,
            lastName: true,
            phone: true,
          },
        },
        campaign: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        phoneNumberRef: {
          select: {
            id: true,
            number: true,
          },
        },
        callAnalytics: {
          select: {
            id: true,
            transcript: true,
            sentiment: true,
            // sentimentScore: true, // Campo no existe en el modelo
            // intent: true, // Campo no existe en el modelo
            // keyTopics: true, // Campo no existe en el modelo
            // summary: true, // Campo no existe en el modelo
            createdAt: true,
          },
        },
      },
    });

    this.logger.log(`Estado de llamada actualizado: ${id} - ${status}`);
    this.eventEmitter.emit('call.status.updated', {
      callId: id,
      accountId,
      status,
    });

    // Notificar via WebSocket
    this.webSocketGateway.notifyCallStatus(accountId, id, status, {
      call: this.mapToDto(updatedCall),
      previousStatus,
    });

    // Notificar si la llamada se completó
    if (status === CallStatus.COMPLETED) {
      this.webSocketGateway.notifyCallCompleted(
        accountId,
        this.mapToDto(updatedCall),
      );
    }

    return this.mapToDto(updatedCall);
  }

  async updateNotes(
    id: string,
    notesDto: CallNotesDto,
    accountId: string,
  ): Promise<CallDto> {
    await this.findOne(id, accountId);

    const updatedCall = await this.prisma.call.update({
      where: { id },
      data: { notes: notesDto.notes },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            voiceName: true,
          },
        },
        contact: {
          select: {
            id: true,
            name: true,
            lastName: true,
            phone: true,
          },
        },
        campaign: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        phoneNumberRef: {
          select: {
            id: true,
            number: true,
          },
        },
        callAnalytics: {
          select: {
            id: true,
            transcript: true,
            sentiment: true,
            // sentimentScore: true, // Campo no existe en el modelo
            // intent: true, // Campo no existe en el modelo
            // keyTopics: true, // Campo no existe en el modelo
            // summary: true, // Campo no existe en el modelo
            createdAt: true,
          },
        },
      },
    });

    this.logger.log(`Notas de llamada actualizadas: ${id}`);
    this.eventEmitter.emit('call.notes.updated', { callId: id, accountId });

    return this.mapToDto(updatedCall);
  }

  async getStats(
    accountId: string,
    filters?: CallFilterDto,
  ): Promise<CallStatsDto> {
    const where: any = { accountId };

    if (filters) {
      if (filters.status) where.status = filters.status;
      if (filters.type) where.type = filters.type;
      if (filters.direction) where.direction = filters.direction;
      if (filters.agentId) where.agentId = filters.agentId;
      if (filters.campaignId) where.campaignId = filters.campaignId;
      if (filters.contactId) where.contactId = filters.contactId;
      if (filters.phoneNumber)
        where.phoneNumber = { contains: filters.phoneNumber };
      if (filters.success !== undefined) where.success = filters.success;

      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
        if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
      }
    }

    const [
      totalCalls,
      completedCalls,
      successfulCalls,
      failedCalls,
      callsByStatus,
      callsByType,
      callsByDirection,
      callsWithDuration,
    ] = await Promise.all([
      this.prisma.call.count({ where }),
      this.prisma.call.count({
        where: { ...where, status: CallStatus.COMPLETED },
      }),
      this.prisma.call.count({ where: { ...where, success: true } }),
      this.prisma.call.count({ where: { ...where, success: false } }),
      this.prisma.call.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),
      this.prisma.call.groupBy({
        by: ['type'],
        where,
        _count: { type: true },
      }),
      this.prisma.call.groupBy({
        by: ['direction'],
        where,
        _count: { direction: true },
      }),
      this.prisma.call.findMany({
        where: { ...where, duration: { not: null } },
        select: { duration: true },
      }),
    ]);

    const averageDuration =
      callsWithDuration.length > 0
        ? callsWithDuration.reduce(
            (sum, call) => sum + (call.duration || 0),
            0,
          ) / callsWithDuration.length
        : 0;

    const successRate =
      totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;
    const completionRate =
      totalCalls > 0 ? (completedCalls / totalCalls) * 100 : 0;

    return {
      totalCalls,
      completedCalls,
      successfulCalls,
      failedCalls,
      averageDuration: Math.round(averageDuration),
      successRate: Math.round(successRate * 100) / 100,
      completionRate: Math.round(completionRate * 100) / 100,
      callsByStatus: callsByStatus.reduce(
        (acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        },
        {} as Record<string, number>,
      ),
      callsByType: callsByType.reduce(
        (acc, item) => {
          acc[item.type] = item._count.type;
          return acc;
        },
        {} as Record<string, number>,
      ),
      callsByDirection: callsByDirection.reduce(
        (acc, item) => {
          acc[item.direction] = item._count.direction;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }

  async getConversationAnalysis(
    callId: string,
    accountId: string,
  ): Promise<ConversationAnalysisDto[]> {
    await this.findOne(callId, accountId); // Verificar que la llamada existe

    const analyses = await this.prisma.conversationAnalysis.findMany({
      where: { callId, accountId },
    });

    return analyses.map((analysis) => ({
      id: analysis.id,
      accountId: analysis.accountId,
      callId: analysis.callId,
      transcript: analysis.transcript,
      sentiment: analysis.sentiment,
      // sentimentScore: analysis.sentimentScore, // Campo no existe
      intent: analysis.intent,
      keyTopics: analysis.keyTopics,
      summary: analysis.summary,
      actionItems: analysis.actionItems,
      createdAt: analysis.createdAt,
    }));
  }

  async createConversationAnalysis(
    callId: string,
    analysisData: {
      transcript: string;
      sentiment: string;
      // sentimentScore: number; // Campo no existe en el modelo
      intent: string;
      topics?: string[];
      keywords?: string[];
      summary?: string;
      qualityScore?: number;
      recommendations?: string[];
    },
    accountId: string,
  ): Promise<ConversationAnalysisDto> {
    await this.findOne(callId, accountId); // Verificar que la llamada existe

    const analysis = await this.prisma.conversationAnalysis.create({
      data: {
        callId,
        accountId,
        ...analysisData,
      },
    });

    this.logger.log(
      `Análisis de conversación creado: ${analysis.id} para llamada ${callId}`,
    );
    this.eventEmitter.emit('call.analysis.created', {
      callId,
      accountId,
      analysisId: analysis.id,
    });

    return {
      id: analysis.id,
      accountId: analysis.accountId,
      callId: analysis.callId,
      transcript: analysis.transcript,
      sentiment: analysis.sentiment,
      // sentimentScore: analysis.sentimentScore, // Campo no existe
      intent: analysis.intent,
      keyTopics: analysis.keyTopics,
      summary: analysis.summary,
      actionItems: analysis.actionItems,
      createdAt: analysis.createdAt,
    };
  }

  private mapToDto(call: any): CallDto {
    return {
      id: call.id,
      accountId: call.accountId,
      campaignId: call.campaignId,
      agentId: call.agentId,
      contactId: call.contactId,
      phoneNumberId: call.phoneNumberId,
      phoneNumber: call.phoneNumber,
      contactPhoneNumber: call.contactPhoneNumber, // Se llenará desde ElevenLabs si está disponible
      status: call.status,
      direction: call.direction,
      type: call.type,
      duration: call.duration,
      success: call.success,
      recordingUrl: call.recordingUrl,
      transcript: call.transcript,
      notes: call.notes,
      config: call.config,
      initiatedAt: call.initiatedAt,
      answeredAt: call.answeredAt,
      completedAt: call.completedAt,
      createdAt: call.createdAt,
      updatedAt: call.updatedAt,
      agent: call.agent,
      contact: call.contact,
      campaign: call.campaign,
      phoneNumberRef: call.phoneNumberRef,
      conversationAnalyses:
        call.conversationAnalysis?.map((analysis: any) => ({
          id: analysis.id,
          accountId: analysis.accountId,
          callId: analysis.callId,
          transcript: analysis.transcript,
          sentiment: analysis.sentiment,
          // sentimentScore: analysis.sentimentScore, // Campo no existe
          intent: analysis.intent,
          topics: analysis.topics,
          keywords: analysis.keywords,
          summary: analysis.summary as string,
          qualityScore: analysis.qualityScore,
          insights: analysis.insights,
          createdAt: analysis.createdAt,
          updatedAt: analysis.updatedAt,
        })) || [],
    };
  }

  async makeOutboundCall(
    accountId: string,
    phoneNumber: string,
    agentId: string,
    contactId?: string,
    campaignId?: string,
    instruction?: string,
    // Se añade el ID del número de teléfono del agente a usar
    agentPhoneNumberId?: string,
  ) {
    try {
      // Verificar que el agente existe y pertenece al account
      const agent = await this.prisma.agent.findFirst({
        where: { id: agentId, accountId },
      });

      if (!agent) {
        throw new BadRequestException('Agente no encontrado');
      }

      // Verificar que el agente está activo
      if (agent.status !== 'active') {
        throw new BadRequestException(
          'El agente debe estar activo para realizar llamadas',
        );
      }

      // **NUEVA LÓGICA: VERIFICAR elevenLabsAgentId**
      if (!agent.elevenLabsAgentId) {
        throw new BadRequestException(
          'Este agente no está sincronizado con un agente de voz y no puede realizar llamadas.',
        );
      }

      // **NUEVA LÓGICA: INICIAR LLAMADA REAL CON ELEVENLABS**
      this.logger.log(
        `Iniciando llamada outbound real a través de ElevenLabs para el agente ${agent.id}`,
      );

      const elevenLabsCall = await this.elevenLabsService.makeOutboundCall(
        accountId,
        agent.elevenLabsAgentId,
        agentPhoneNumberId, // ID del número de teléfono a usar para la llamada
        phoneNumber, // Número de teléfono del cliente a llamar
        {
          // Aquí podemos pasar metadatos o un saludo inicial si la API lo permite
          opening_message: instruction || agent.description,
        },
      );

      // Crear registro de llamada en nuestra BD con los datos de ElevenLabs
      const call = await this.prisma.call.create({
        data: {
          accountId,
          agentId,
          contactId,
          campaignId,
          phoneNumber,
          direction: 'outbound',
          type: campaignId ? 'campaign' : 'manual',
          status: 'initiated',
          notes: instruction || '',
          elevenLabsConversationId: elevenLabsCall.conversation_id, // Guardar el ID de la conversación
          phoneNumberId: agentPhoneNumberId, // Guardar el ID del número de teléfono del agente
        },
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              type: true,
              voiceName: true,
            },
          },
          contact: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            },
          },
          campaign: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
      });

      this.logger.log(
        `Llamada saliente real iniciada: ${call.id} - ${phoneNumber} - ConvID: ${elevenLabsCall.conversation_id}`,
      );

      // Emitir evento
      this.eventEmitter.emit('call.initiated', {
        callId: call.id,
        accountId,
        agentId,
        phoneNumber,
        type: 'outbound',
      });

      // Notificar vía WebSocket
      this.webSocketGateway.notifyCallStatus(accountId, call.id, 'initiated', {
        phoneNumber,
        agentName: agent.name,
        direction: 'outbound',
      });

      return {
        callId: call.id,
        status: call.status,
        phoneNumber,
        agentName: agent.name,
        createdAt: call.createdAt,
        elevenLabsConversationId: elevenLabsCall.conversation_id,
      };
    } catch (error) {
      this.logger.error(`Error creando llamada saliente: ${error.message}`);
      throw new BadRequestException(`Error creando llamada: ${error.message}`);
    }
  }
}
