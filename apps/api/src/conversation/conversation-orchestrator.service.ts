import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { DeepgramService } from '../integrations/deepgram/deepgram.service'; // Removed - using Twilio STT instead
import { ElevenLabsService } from '../integrations/elevenlabs/elevenlabs.service';
import { TwilioService } from '../integrations/twilio/twilio.service';
// import { LLMOrchestratorService } from '../llm/llm-orchestrator.service';
import { PrismaService } from '../prisma/prisma.service';
import { WebSocketGateway } from '../websocket/websocket.gateway';
// import { ConversationMemoryService } from './conversation-memory.service'; // Removed - using PostgreSQL instead
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GHLService } from '../integrations/ghl/ghl.service';
// import { RAGService } from '../rag/rag.service';

// Interfaces para el orquestador
interface ConversationContext {
  callId: string;
  accountId: string;
  agentId: string;
  contactId?: string;
  startTime: Date;
  lastActivity: Date;
  conversationHistory: ConversationTurn[];
  currentTurn?: ConversationTurn;
  agentConfig: AgentConfig;
  contactInfo?: ContactInfo;
  keyTopics?: string[];
  customerIntent?: string;
  summary?: string;
}

interface ConversationTurn {
  id: string;
  timestamp: Date;
  type: 'user' | 'agent';
  audioData?: Buffer;
  transcript?: string;
  intent?: string;
  sentiment?: string;
  responseAudio?: Buffer;
  responseText?: string;
  processingTime?: number;
  latency?: number;
}

interface AgentConfig {
  id: string;
  name: string;
  voiceName: string;
  llmProvider: string;
  llmModel: string;
  maxTokens: number;
  preMadePrompt: string;
  calendarBookingEnabled: boolean;
  calendarBookingProvider?: string | null;
  calendarBookingId?: string | null;
  calendarBookingTimezone?: string | null;
}

interface ContactInfo {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  customFields?: any;
  conversationHistory?: any[];
}

interface MediaStreamConfig {
  callId: string;
  accountId: string;
  agentId: string;
  contactId?: string;
  streamUrl: string;
  audioFormat: 'mulaw' | 'linear';
  sampleRate: number;
}

@Injectable()
export class ConversationOrchestratorService {
  private readonly logger = new Logger(ConversationOrchestratorService.name);
  private activeConversations = new Map<string, ConversationContext>();
  private readonly MAX_LATENCY_MS = 300; // Objetivo de latencia ≤ 300ms
  private readonly PIPELINE_BUFFER_SIZE = 1024; // Buffer para pipelining

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly twilioService: TwilioService,
    private readonly elevenLabsService: ElevenLabsService,
    // private readonly deepgramService: DeepgramService, // Removed - using Twilio STT instead
    // private readonly llmOrchestrator: LLMOrchestratorService,
    private readonly websocketGateway: WebSocketGateway,
    // private readonly memoryService: ConversationMemoryService, // Removed - using PostgreSQL instead
    private readonly eventEmitter: EventEmitter2,
    private readonly ghlService: GHLService,
    // private readonly ragService: RAGService,
  ) {}

  /**
   * Maneja las llamadas a herramientas (tools) desde ElevenLabs Agents.
   * Esta función es invocada por un webhook que recibe las peticiones de ElevenLabs.
   */
  async handleElevenLabsToolCall(
    callId: string,
    toolName: string,
    parameters: any,
  ): Promise<any> {
    const context = this.activeConversations.get(callId);
    if (!context) {
      this.logger.error(
        `Contexto de conversación no encontrado para la llamada: ${callId} al intentar usar la herramienta: ${toolName}`,
      );
      throw new BadRequestException('Conversación no activa');
    }

    if (
      !context.agentConfig.calendarBookingEnabled ||
      context.agentConfig.calendarBookingProvider !== 'GHL'
    ) {
      this.logger.warn(
        `[${callId}] Se intentó usar una herramienta de calendario, pero no está habilitada para este agente.`,
      );
      return {
        success: false,
        error: 'La reserva de calendario no está configurada para este agente.',
      };
    }

    this.logger.log(
      `[${callId}] Agente de ElevenLabs invocó la herramienta: '${toolName}' con parámetros:`,
      parameters,
    );

    switch (toolName) {
      case 'get_available_calendar_slots':
        try {
          const { startDate, endDate } = this.mapDateParameters(parameters);

          if (!context.agentConfig.calendarBookingId) {
            throw new Error(
              'El ID del calendario no está configurado para este agente.',
            );
          }

          const availableSlots = await this.ghlService.getAvailableSlots(
            context.accountId,
            context.agentConfig.calendarBookingId,
            startDate,
            endDate,
          );

          this.logger.log(
            `[${callId}] Horarios disponibles encontrados:`,
            availableSlots,
          );

          // Formateamos los slots para que sean más legibles para la IA
          const formattedSlots = availableSlots.map((slot) =>
            new Date(slot.start).toLocaleString('es-ES', {
              weekday: 'long',
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
            }),
          );

          return { success: true, slots: formattedSlots };
        } catch (error) {
          this.logger.error(
            `[${callId}] Error al obtener horarios de GHL:`,
            error,
          );
          return {
            success: false,
            error: 'No se pudieron obtener los horarios disponibles.',
          };
        }

      case 'book_appointment':
        try {
          if (!context.agentConfig.calendarBookingId) {
            throw new Error(
              'El ID del calendario no está configurado para este agente.',
            );
          }

          const appointmentData = this.mapAppointmentParameters(
            parameters,
            context.contactInfo,
          );

          const newAppointment = await this.ghlService.createAppointment(
            context.accountId,
            context.agentConfig.calendarBookingId,
            appointmentData,
          );

          this.logger.log(
            `[${callId}] Cita creada exitosamente en GHL:`,
            newAppointment,
          );

          return {
            success: true,
            confirmation: {
              startTime: newAppointment.startTime,
              title: newAppointment.title,
            },
          };
        } catch (error) {
          this.logger.error(
            `[${callId}] Error al crear la cita en GHL:`,
            error,
          );
          return { success: false, error: 'No se pudo agendar la cita.' };
        }

      default:
        this.logger.warn(
          `[${callId}] Se intentó llamar a una herramienta desconocida: ${toolName}`,
        );
        return {
          success: false,
          error: `Herramienta '${toolName}' no reconocida.`,
        };
    }
  }

  /**
   * Mapea parámetros de fecha desde ElevenLabs a un formato utilizable.
   * Asume que ElevenLabs puede enviar 'today', 'tomorrow', o una fecha ISO.
   */
  private mapDateParameters(parameters: any): {
    startDate: string;
    endDate: string;
  } {
    let targetDate = new Date();
    if (parameters.date) {
      if (parameters.date === 'tomorrow') {
        targetDate.setDate(targetDate.getDate() + 1);
      } else if (parameters.date !== 'today') {
        targetDate = new Date(parameters.date);
      }
    }

    targetDate.setHours(0, 0, 0, 0); // Inicio del día
    const startDate = targetDate.toISOString();

    targetDate.setHours(23, 59, 59, 999); // Final del día
    const endDate = targetDate.toISOString();

    return { startDate, endDate };
  }

  /**
   * Mapea parámetros de cita desde ElevenLabs a la estructura de GHL.
   */
  private mapAppointmentParameters(
    parameters: any,
    contactInfo?: ContactInfo,
  ): any {
    if (!parameters.startTime) {
      throw new Error(
        "El parámetro 'startTime' es requerido para agendar una cita.",
      );
    }

    return {
      calendarId: parameters.calendarId, // GHL lo requiere en el body
      contactId: contactInfo?.id, // Asocia la cita al contacto actual
      startTime: new Date(parameters.startTime).toISOString(),
      title: parameters.title || `Cita para ${contactInfo?.name || 'Cliente'}`,
      appointmentStatus: 'confirmed',
    };
  }

  /**
   * Inicia una nueva conversación con Twilio Media Streams
   * Implementa pipelining para minimizar latencia percibida
   */
  async startConversation(
    streamConfig: MediaStreamConfig,
  ): Promise<ConversationContext> {
    this.logger.log(`Iniciando conversación: ${streamConfig.callId}`);

    try {
      // 1. Obtener configuración del agente
      const agentConfig = await this.getAgentConfig(
        streamConfig.agentId,
        streamConfig.accountId,
      );

      // 2. Obtener información del contacto si está disponible
      const contactInfo = streamConfig.contactId
        ? await this.getContactInfo(
            streamConfig.contactId,
            streamConfig.accountId,
          )
        : undefined;

      // 3. Crear contexto de conversación
      const context: ConversationContext = {
        callId: streamConfig.callId,
        accountId: streamConfig.accountId,
        agentId: streamConfig.agentId,
        contactId: streamConfig.contactId,
        startTime: new Date(),
        lastActivity: new Date(),
        conversationHistory: [],
        agentConfig,
        contactInfo,
      };

      // 4. Guardar contexto activo
      this.activeConversations.set(streamConfig.callId, context);

      // 5. Configurar WebSocket para Media Streams de Twilio
      await this.setupTwilioMediaStream(streamConfig, context);

      // 6. Emitir evento de inicio de conversación
      this.eventEmitter.emit('conversation.started', {
        callId: streamConfig.callId,
        accountId: streamConfig.accountId,
        agentId: streamConfig.agentId,
        timestamp: new Date(),
      });

      // 7. Notificar al dashboard
      this.websocketGateway.notifyCallStatus(
        streamConfig.accountId,
        streamConfig.callId,
        'conversation_started',
        { agentName: agentConfig.name },
      );

      this.logger.log(
        `Conversación iniciada exitosamente: ${streamConfig.callId}`,
      );
      return context;
    } catch (error) {
      this.logger.error(
        `Error iniciando conversación ${streamConfig.callId}:`,
        error,
      );
      throw new BadRequestException(
        `Error iniciando conversación: ${error.message}`,
      );
    }
  }

  /**
   * Procesa audio entrante con pipelining optimizado
   * Implementa superposición de STT, LLM y TTS para minimizar latencia
   */
  async processIncomingAudio(
    callId: string,
    audioChunk: Buffer,
  ): Promise<void> {
    const context = this.activeConversations.get(callId);
    if (!context) {
      this.logger.warn(`Contexto no encontrado para llamada: ${callId}`);
      return;
    }

    const startTime = Date.now();
    context.lastActivity = new Date();

    try {
      // PIPELINE STEP 1: Iniciar STT de forma asíncrona
      const sttPromise = this.processSpeechToText(audioChunk, context);

      // PIPELINE STEP 2: Preparar procesamiento LLM mientras STT está corriendo
      let llmPromise: Promise<any> | null = null;
      let ttsPromise: Promise<any> | null = null;

      // Esperar STT y procesar inmediatamente
      const sttResult = await sttPromise;

      if (sttResult.transcript && sttResult.transcript.trim().length > 0) {
        // Crear turno de conversación
        const turn: ConversationTurn = {
          id: `turn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          type: 'user',
          audioData: audioChunk,
          transcript: sttResult.transcript,
          intent: sttResult.intent,
          sentiment: sttResult.sentiment,
        };

        // Agregar al historial
        context.conversationHistory.push(turn);
        context.currentTurn = turn;

        // PIPELINE STEP 3: Procesar con LLM (iniciar inmediatamente)
        llmPromise = this.processLLMResponse(context, turn);

        // Notificar transcripción en tiempo real
        this.websocketGateway.emitToTenant(
          context.accountId,
          'transcript_update',
          {
            callId,
            transcript: sttResult.transcript,
            timestamp: new Date(),
            confidence: sttResult.confidence,
          },
        );
      }

      // Esperar respuesta del LLM y generar TTS inmediatamente
      let llmResult: any = null;
      if (llmPromise) {
        llmResult = await llmPromise;

        if (context.currentTurn) {
          context.currentTurn.responseText = llmResult.text;
          context.currentTurn.processingTime = Date.now() - startTime;
        }

        // PIPELINE STEP 4: Generar audio de respuesta con ElevenLabs
        ttsPromise = this.generateResponseAudio(
          llmResult.text,
          context.agentConfig,
        );
      }

      // Enviar audio de respuesta cuando esté listo
      if (ttsPromise) {
        const ttsResult = await ttsPromise;

        if (context.currentTurn) {
          context.currentTurn.responseAudio = ttsResult.audioBuffer;
          context.currentTurn.latency = Date.now() - startTime;
        }

        // Enviar audio a Twilio Media Streams
        await this.sendAudioToTwilio(callId, ttsResult.audioBuffer);

        // Notificar respuesta generada
        this.websocketGateway.emitToTenant(
          context.accountId,
          'agent_response',
          {
            callId,
            response: llmResult?.text || '',
            audioGenerated: true,
            latency: Date.now() - startTime,
            timestamp: new Date(),
          },
        );
      }

      // Guardar contexto en memoria persistente (usando PostgreSQL)
      if (llmResult?.text) {
        // await this.memoryService.addMessage(callId, 'assistant', llmResult.text);
      }
    } catch (error) {
      this.logger.error(`Error procesando audio para ${callId}:`, error);

      // Enviar respuesta de fallback
      await this.handleProcessingError(callId, context, error);
    }
  }

  /**
   * Procesa Speech-to-Text con Deepgram optimizado para llamadas telefónicas
   */
  private async processSpeechToText(
    audioChunk: Buffer,
    context: ConversationContext,
  ): Promise<{
    transcript: string;
    confidence: number;
    intent?: string;
    sentiment?: string;
  }> {
    const startTime = Date.now();

    try {
      // Usar Deepgram con configuración optimizada para llamadas telefónicas
      // const result = await this.deepgramService.transcribeAudio(
      //   audioChunk.toString('base64'),
      //   {
      //     model: 'nova-2-phonecall', // Modelo optimizado para llamadas telefónicas
      //     language: 'es', // Español por defecto, se puede configurar por account
      //     punctuate: true,
      //     profanity_filter: false,
      //     redact: [],
      //     diarize: false, // No necesario para conversaciones 1:1
      //     multichannel: false,
      //     alternatives: 1,
      //     search: [], // Se puede agregar búsqueda de términos específicos
      //     keywords: [], // Keywords del negocio del account
      //     detect_language: true,
      //   },
      // );

      // Simulación temporal hasta que se implemente Deepgram
      const result = {
        transcript: 'Transcripción simulada - servicio no disponible',
        confidence: 0.95,
        language: 'es',
      };

      const processingTime = Date.now() - startTime;
      this.logger.debug(
        `STT completado en ${processingTime}ms para ${context.callId}`,
      );

      return {
        transcript: result.transcript || '',
        confidence: result.confidence || 0,
        intent: this.extractIntent(result.transcript || ''),
        sentiment: this.extractSentiment(result.transcript || ''),
      };
    } catch (error) {
      this.logger.error(`Error en STT para ${context.callId}:`, error);
      throw new BadRequestException(`Error procesando audio: ${error.message}`);
    }
  }

  /**
   * Procesa respuesta del LLM con contexto y memoria
   */
  private async processLLMResponse(
    context: ConversationContext,
    _turn: ConversationTurn,
  ): Promise<{
    response: string;
    confidence: number;
    tokens: number;
  }> {
    const startTime = Date.now();

    try {
      // 1. Obtener contexto de memoria a corto plazo (usando PostgreSQL)
      // const shortTermMemory = await this.memoryService.getConversationContext(context.callId);
      // const shortTermMemory = null; // Temporal hasta implementar memoryService

      // 2. Obtener contexto RAG (memoria a largo plazo)
      // const ragContext = await this.ragService.getConversationContext(
      //   context.accountId,
      //   context.contactId || '',
      //   turn.transcript || '',
      //   context.conversationHistory,
      // );

      // 3. Construir prompt contextual con RAG
      // const prompt = this.buildContextualPrompt(
      //   context,
      //   turn,
      //   shortTermMemory,
      //   null, // ragContext
      // );

      // 4. Procesar con LLM usando el orquestador
      // const llmResult = await this.llmOrchestrator.generateText(
      //   {
      //     prompt: turn.transcript || '',
      //     systemPrompt: prompt,
      //     provider: context.agentConfig.llmProvider,
      //     model: context.agentConfig.llmModel,
      //     maxTokens: context.agentConfig.maxTokens,
      //     temperature: 0.7, // Balance entre creatividad y consistencia
      //   },
      //   context.accountId,
      //   context.agentId,
      // );

      const processingTime = Date.now() - startTime;
      this.logger.debug(
        `LLM procesado en ${processingTime}ms para ${context.callId}`,
      );

      // 5. Guardar en memoria a corto plazo
      // await this.memoryService.saveConversationTurn(
      //   context.callId,
      //   turn,
      //   llmResult,
      // );

      return {
        response: 'Respuesta no disponible', // llmResult.text,
        confidence: 0.8, // Valor por defecto ya que no está en el DTO
        tokens: 0, // llmResult.tokensUsed || 0,
      };
    } catch (error) {
      this.logger.error(`Error en LLM para ${context.callId}:`, error);
      throw new BadRequestException(
        `Error procesando con LLM: ${error.message}`,
      );
    }
  }

  /**
   * Genera audio de respuesta con ElevenLabs optimizado para baja latencia
   */
  private async generateResponseAudio(
    text: string,
    agentConfig: AgentConfig,
  ): Promise<{
    audioBuffer: Buffer;
    duration: number;
    format: string;
  }> {
    const startTime = Date.now();

    try {
      // Usar ElevenLabs con configuración optimizada para baja latencia
      const audioResult = await this.elevenLabsService.generateSpeech(
        (agentConfig as any).accountId || '',
        text,
        agentConfig.voiceName,
        {
          modelId: 'eleven_multilingual_v2', // Modelo más rápido
          voiceSettings: {
            stability: 0.8, // Máxima estabilidad para conversaciones telefónicas
            similarityBoost: 0.85, // Máxima similitud para mantener características de voz
            style: 0.5, // Más expresivo para conversaciones naturales
            useSpeakerBoost: true, // Mejorar claridad en llamadas telefónicas
          },
        },
      );

      const processingTime = Date.now() - startTime;
      this.logger.debug(`TTS completado en ${processingTime}ms`);

      // Convertir base64 a buffer
      const base64Data = audioResult.audioUrl.split(',')[1];
      const audioBuffer = Buffer.from(base64Data, 'base64');

      return {
        audioBuffer,
        duration: audioResult.duration,
        format: audioResult.format,
      };
    } catch (error) {
      this.logger.error(`Error en TTS:`, error);
      throw new BadRequestException(`Error generando audio: ${error.message}`);
    }
  }

  /**
   * Configura WebSocket para Twilio Media Streams
   */
  private async setupTwilioMediaStream(
    streamConfig: MediaStreamConfig,
    _context: ConversationContext,
  ): Promise<void> {
    // Esta función se implementaría para manejar la conexión WebSocket
    // con Twilio Media Streams según su documentación oficial
    this.logger.log(`Configurando Media Stream para ${streamConfig.callId}`);

    // Por ahora, simulamos la configuración
    // En una implementación real, aquí se establecería la conexión WebSocket
    // con Twilio usando su API de Media Streams
  }

  /**
   * Envía audio a Twilio Media Streams
   */
  private async sendAudioToTwilio(
    callId: string,
    audioBuffer: Buffer,
  ): Promise<void> {
    // Implementar envío de audio a Twilio Media Streams
    this.logger.debug(
      `Enviando audio a Twilio para ${callId}: ${audioBuffer.length} bytes`,
    );

    // En una implementación real, aquí se enviaría el audio buffer
    // a través de la conexión WebSocket establecida con Twilio
  }

  /**
   * Maneja errores en el procesamiento
   */
  private async handleProcessingError(
    callId: string,
    context: ConversationContext,
    error: any,
  ): Promise<void> {
    this.logger.error(`Manejo de error para ${callId}:`, error);

    // Respuesta de fallback
    const fallbackResponse =
      'Disculpa, no pude procesar tu solicitud en este momento. ¿Podrías repetirlo?';

    try {
      const fallbackAudio = await this.generateResponseAudio(
        fallbackResponse,
        context.agentConfig,
      );
      await this.sendAudioToTwilio(callId, fallbackAudio.audioBuffer);
    } catch (fallbackError) {
      this.logger.error(
        `Error en respuesta de fallback para ${callId}:`,
        fallbackError,
      );
    }

    // Notificar error al dashboard
    this.websocketGateway.emitToTenant(
      context.accountId,
      'conversation_error',
      {
        callId,
        error: error.message,
        timestamp: new Date(),
      },
    );
  }

  /**
   * Finaliza una conversación
   */
  async endConversation(
    callId: string,
    reason: string = 'completed',
  ): Promise<void> {
    const context = this.activeConversations.get(callId);
    if (!context) {
      this.logger.warn(`Contexto no encontrado para finalizar: ${callId}`);
      return;
    }

    try {
      // Guardar contexto final en memoria persistente
      // await this.memoryService.saveConversationSummary(
      //   callId,
      //   {
      //   callId: context.callId,
      //   agentId: context.agentId,
      //   accountId: context.accountId,
      //   messages: context.conversationHistory.map((turn, index) => ({
      //     id: `msg_${index}`,
      //     type: turn.type,
      //     content: turn.transcript || turn.responseText || '',
      //     timestamp: new Date(),
      //     role: turn.type === 'user' ? 'user' : 'assistant',
      //   })),
      //   keyTopics: context.keyTopics || [],
      //   customerIntent: context.customerIntent,
      //   lastActivity: new Date(),
      // },
      // reason,
      // );

      // Indexar conversación en RAG para futuras referencias
      if (context.conversationHistory.length > 0) {
        // const transcript = this.buildFullTranscript(context);
        // const summary = this.generateConversationSummary(context);
        // await this.ragService.indexConversationHistory(
        //   context.accountId,
        //   callId,
        //   {
        //     transcript,
        //     summary,
        //     topics: this.extractTopics(transcript),
        //     sentiment: this.extractSentiment(transcript),
        //     intent: this.extractMainIntent(context),
        //   },
        // );
      }

      // Eliminar de conversaciones activas
      this.activeConversations.delete(callId);

      // Emitir evento de finalización
      this.eventEmitter.emit('conversation.ended', {
        callId,
        accountId: context.accountId,
        agentId: context.agentId,
        reason,
        duration: Date.now() - context.startTime.getTime(),
        timestamp: new Date(),
      });

      // Notificar al dashboard
      this.websocketGateway.notifyCallCompleted(context.accountId, {
        callId,
        duration: Date.now() - context.startTime.getTime(),
        turns: context.conversationHistory.length,
        reason,
      });

      this.logger.log(`Conversación finalizada: ${callId} - ${reason}`);
    } catch (error) {
      this.logger.error(`Error finalizando conversación ${callId}:`, error);
    }
  }

  // Métodos auxiliares
  private async getAgentConfig(
    agentId: string,
    accountId: string,
  ): Promise<AgentConfig> {
    const agent = await this.prisma.agent.findFirst({
      where: { id: agentId, accountId },
    });

    if (!agent) {
      throw new BadRequestException('Agente no encontrado');
    }

    return {
      id: agent.id,
      name: agent.name,
      voiceName: agent.voiceName,
      llmProvider: agent.llmProvider,
      llmModel: agent.llmModel,
      maxTokens: agent.maxTokens,
      preMadePrompt: agent.preMadePrompt || '',
      calendarBookingEnabled: agent.calendarBookingEnabled,
      calendarBookingProvider: agent.calendarBookingProvider,
      calendarBookingId: agent.calendarBookingId,
      calendarBookingTimezone: agent.calendarBookingTimezone,
    };
  }

  private async getContactInfo(
    contactId: string,
    accountId: string,
  ): Promise<ContactInfo | undefined> {
    const contact = await this.prisma.contact.findFirst({
      where: { id: contactId, accountId },
    });

    if (!contact) return undefined;

    return {
      id: contact.id,
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      company: contact.company,
      customFields: contact.customFields,
    };
  }

  private buildContextualPrompt(
    context: ConversationContext,
    turn: ConversationTurn,
    shortTermMemory: any,
    ragContext: any,
  ): string {
    const basePrompt = context.agentConfig.preMadePrompt;

    // Construir contexto del contacto
    const contactContext = context.contactInfo
      ? `\nInformación del contacto:\n- Nombre: ${context.contactInfo.name}\n- Teléfono: ${context.contactInfo.phone}\n- Empresa: ${context.contactInfo.company || 'No especificada'}\n`
      : '';

    // Construir historial de conversación
    const conversationHistory = context.conversationHistory
      .slice(-5) // Últimos 5 turnos
      .map(
        (t) =>
          `${t.type === 'user' ? 'Cliente' : 'Agente'}: ${t.transcript || t.responseText}`,
      )
      .join('\n');

    // Construir contexto RAG (memoria a largo plazo)
    const ragContextText =
      ragContext?.relevantDocuments?.length > 0
        ? `\nInformación relevante de la base de conocimiento:\n${ragContext.relevantDocuments
            .map(
              (doc: any, index: number) =>
                `${index + 1}. ${doc.metadata.type}: ${doc.content.substring(0, 300)}...`,
            )
            .join('\n')}\n`
        : '';

    return `${basePrompt}

${contactContext}

Historial de la conversación actual:
${conversationHistory}

${ragContextText}

Instrucciones:
- Responde de manera natural y conversacional
- Mantén el contexto de la conversación
- Usa la información relevante de la base de conocimiento cuando sea apropiado
- Sé conciso pero completo
- Usa el nombre del contacto cuando sea apropiado
- Si no entiendes algo, pide aclaración amablemente
- Basa tus respuestas en la información proporcionada

Respuesta actual del cliente: ${turn.transcript}`;
  }

  private extractIntent(transcript: string): string {
    // Implementar extracción básica de intenciones
    const lowerTranscript = transcript.toLowerCase();

    if (
      lowerTranscript.includes('hola') ||
      lowerTranscript.includes('buenos días')
    ) {
      return 'greeting';
    } else if (
      lowerTranscript.includes('gracias') ||
      lowerTranscript.includes('adios')
    ) {
      return 'farewell';
    } else if (
      lowerTranscript.includes('información') ||
      lowerTranscript.includes('precio')
    ) {
      return 'inquiry';
    } else if (
      lowerTranscript.includes('problema') ||
      lowerTranscript.includes('queja')
    ) {
      return 'complaint';
    }

    return 'general';
  }

  private extractSentiment(transcript: string): string {
    // Implementar análisis básico de sentimiento
    const lowerTranscript = transcript.toLowerCase();
    const positiveWords = [
      'bueno',
      'excelente',
      'perfecto',
      'gracias',
      'genial',
    ];
    const negativeWords = ['malo', 'terrible', 'problema', 'error', 'molesto'];

    const positiveCount = positiveWords.filter((word) =>
      lowerTranscript.includes(word),
    ).length;
    const negativeCount = negativeWords.filter((word) =>
      lowerTranscript.includes(word),
    ).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  // Métodos públicos para monitoreo
  getActiveConversations(): Map<string, ConversationContext> {
    return this.activeConversations;
  }

  getConversationContext(callId: string): ConversationContext | undefined {
    return this.activeConversations.get(callId);
  }

  getConversationMetrics(callId: string): any {
    const context = this.activeConversations.get(callId);
    if (!context) return null;

    const totalTurns = context.conversationHistory.length;
    const avgLatency =
      context.conversationHistory
        .filter((t) => t.latency)
        .reduce((sum, t) => sum + (t.latency || 0), 0) / totalTurns;

    return {
      callId,
      duration: Date.now() - context.startTime.getTime(),
      totalTurns,
      avgLatency: Math.round(avgLatency),
      lastActivity: context.lastActivity,
      agentName: context.agentConfig.name,
    };
  }

  // Métodos auxiliares adicionales
  private buildFullTranscript(context: ConversationContext): string {
    return context.conversationHistory
      .map(
        (turn) =>
          `${turn.type === 'user' ? 'Cliente' : 'Agente'}: ${turn.transcript || turn.responseText || ''}`,
      )
      .join('\n');
  }

  private generateConversationSummary(context: ConversationContext): string {
    const totalTurns = context.conversationHistory.length;
    const duration = Date.now() - context.startTime.getTime();

    return `Conversación con ${context.contactInfo?.name || 'cliente'} completada. ${totalTurns} intercambios en ${Math.round(duration / 1000)} segundos. Agente: ${context.agentConfig.name}.`;
  }

  private extractTopics(transcript: string): string[] {
    const topicKeywords = {
      precio: ['precio', 'costo', 'tarifa', 'cuánto cuesta'],
      servicio: ['servicio', 'atención', 'soporte', 'ayuda'],
      producto: ['producto', 'artículo', 'item', 'mercancía'],
      entrega: ['entrega', 'envío', 'shipping', 'llegada'],
      garantía: ['garantía', 'devolución', 'reembolso', 'cambio'],
    };

    const lowerTranscript = transcript.toLowerCase();
    const topics: string[] = [];

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some((keyword) => lowerTranscript.includes(keyword))) {
        topics.push(topic);
      }
    }

    return topics;
  }

  private extractMainIntent(context: ConversationContext): string {
    const userMessages = context.conversationHistory.filter(
      (turn) => turn.type === 'user',
    );
    if (userMessages.length === 0) return 'general';

    const lastMessage =
      userMessages[userMessages.length - 1].transcript?.toLowerCase() || '';

    if (lastMessage.includes('problema') || lastMessage.includes('queja'))
      return 'complaint';
    if (lastMessage.includes('información') || lastMessage.includes('precio'))
      return 'inquiry';
    if (lastMessage.includes('hola') || lastMessage.includes('buenos días'))
      return 'greeting';
    if (lastMessage.includes('gracias') || lastMessage.includes('adios'))
      return 'farewell';

    return 'general';
  }
}
