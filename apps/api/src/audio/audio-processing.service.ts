import { Injectable, Logger } from '@nestjs/common';
// import { DeepgramService } from '../integrations/deepgram/deepgram.service'; // Removed - using Twilio STT instead
import { ElevenLabsService } from '../integrations/elevenlabs/elevenlabs.service';
import { KnowledgeService } from '../knowledge/knowledge.service';
// import { LLMOrchestratorService } from '../llm/llm-orchestrator.service';
// import { ConversationMemoryService } from '../conversation/conversation-memory.service'; // Removed - using PostgreSQL instead
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AudioProcessingService {
  private readonly logger = new Logger(AudioProcessingService.name);
  private activeConnections = new Map<string, any>();

  constructor(
    // private readonly deepgramService: DeepgramService, // Removed - using Twilio STT instead
    private readonly elevenLabsService: ElevenLabsService,
    // private readonly llmOrchestrator: LLMOrchestratorService,
    private readonly knowledgeService: KnowledgeService,
    // private readonly conversationMemory: ConversationMemoryService, // Removed - using PostgreSQL instead
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async startRealTimeTranscription(
    callId: string,
    agentId: string,
    accountId: string,
  ) {
    try {
      this.logger.log(
        `Iniciando transcripción en tiempo real para llamada: ${callId}`,
      );

      // Inicializar memoria de conversación (usando PostgreSQL)
      // await this.conversationMemory.initializeConversation(callId, agentId, accountId);

      // Obtener configuración del agente
      const agent = await this.prisma.agent.findFirst({
        where: { id: agentId, accountId },
      });

      if (!agent) {
        throw new Error('Agente no encontrado');
      }

      // TODO: Implementar transcripción en tiempo real usando Twilio STT
      // Por ahora, solo logueamos que se inició la transcripción

      this.logger.log(
        `Transcripción en tiempo real iniciada para llamada: ${callId}`,
      );

      return { success: true, callId };
    } catch (error) {
      this.logger.error('Error iniciando transcripción en tiempo real:', error);
      throw error;
    }
  }

  async stopRealTimeTranscription(callId: string) {
    try {
      const connection = this.activeConnections.get(callId);

      if (connection) {
        connection.finish();
        this.activeConnections.delete(callId);
        this.logger.log(
          `Transcripción en tiempo real detenida para llamada: ${callId}`,
        );
      }

      return { success: true, callId };
    } catch (error) {
      this.logger.error(
        'Error deteniendo transcripción en tiempo real:',
        error,
      );
      throw error;
    }
  }

  async sendAudioToTranscription(callId: string, audioBuffer: Buffer) {
    try {
      const connection = this.activeConnections.get(callId);

      if (connection) {
        connection.send(audioBuffer);
        this.logger.debug(`Audio enviado para transcripción: ${callId}`);
      } else {
        this.logger.warn(`No hay conexión activa para la llamada: ${callId}`);
      }
    } catch (error) {
      this.logger.error('Error enviando audio para transcripción:', error);
      throw error;
    }
  }

  private async handleTranscript(
    data: any,
    callId: string,
    agentId: string,
    accountId: string,
  ) {
    try {
      const transcript = data.channel?.alternatives?.[0]?.transcript;
      const confidence = data.channel?.alternatives?.[0]?.confidence;
      const isFinal = data.is_final;

      if (transcript?.trim()) {
        this.logger.log(
          `Transcripción ${isFinal ? 'final' : 'interina'}: ${transcript}`,
        );

        // Emitir evento de transcripción
        this.eventEmitter.emit('transcription.received', {
          callId,
          transcript,
          confidence,
          isFinal,
          timestamp: new Date(),
        });

        // Si es transcripción final, procesar con IA
        if (isFinal) {
          // Agregar mensaje del usuario a la memoria (usando PostgreSQL)
          // await this.conversationMemory.addMessage(callId, 'user', transcript, { confidence, isFinal, timestamp: new Date() });

          await this.processTranscriptWithAI(
            transcript,
            callId,
            agentId,
            accountId,
          );
        }
      }
    } catch (error) {
      this.logger.error('Error manejando transcripción:', error);
    }
  }

  private async handleUtteranceEnd(
    data: any,
    callId: string,
    agentId: string,
    accountId: string,
  ) {
    try {
      const transcript = data.channel?.alternatives?.[0]?.transcript;

      if (transcript?.trim()) {
        this.logger.log(`Fin de enunciado: ${transcript}`);

        // Procesar con IA
        await this.processTranscriptWithAI(
          transcript,
          callId,
          agentId,
          accountId,
        );
      }
    } catch (error) {
      this.logger.error('Error manejando fin de enunciado:', error);
    }
  }

  private async processTranscriptWithAI(
    transcript: string,
    callId: string,
    agentId: string,
    accountId: string,
  ) {
    try {
      this.logger.log(`Procesando transcripción con IA: ${transcript}`);

      // Obtener configuración del agente
      const agent = await this.prisma.agent.findFirst({
        where: { id: agentId, accountId },
      });

      if (!agent) {
        this.logger.warn(`Agente no encontrado: ${agentId}`);
        return;
      }

      // Generar respuesta con IA (con RAG habilitado)
      // const aiResponse = await this.llmOrchestrator.generateText(
      //   {
      //     prompt: transcript,
      //     systemPrompt:
      //       agent.preMadePrompt || 'Eres un asistente telefónico profesional.',
      //     maxTokens: agent.maxTokens || 1000,
      //     temperature: 0.7,
      //     enableRAG: true, // Habilitar RAG para contexto empresarial
      //     contextLimit: 3, // Usar hasta 3 documentos de contexto
      //   },
      //   accountId,
      //   agentId,
      // );

      // Generar audio con ElevenLabs
      // const audioResponse = await this.elevenLabsService.generateSpeech(
      //   aiResponse.text,
      //   agent.voiceName, // Debe ser proporcionado por el usuario
      //   {
      //     modelId: 'eleven_multilingual_v2',
      //     voiceSettings: {
      //       stability: 0.5,
      //       similarityBoost: 0.5,
      //       style: 0.0,
      //       useSpeakerBoost: true,
      //     },
      //   },
      // );

      // Agregar respuesta del asistente a la memoria (usando PostgreSQL)
      // await this.conversationMemory.addMessage(callId, 'assistant', aiResponse.text, { provider: aiResponse.provider, model: aiResponse.model, tokensUsed: aiResponse.tokensUsed, cost: aiResponse.cost, audioUrl: audioResponse.audioUrl, duration: audioResponse.duration });

      // Emitir evento de respuesta generada
      // this.eventEmitter.emit('ai.response.generated', {
      //   callId,
      //   transcript,
      //   aiResponse: aiResponse.text,
      //   audioUrl: audioResponse.audioUrl,
      //   timestamp: new Date(),
      // });

      // Actualizar la llamada con la transcripción y respuesta
      await this.prisma.call.update({
        where: { id: callId },
        data: {
          transcript,
          notes: JSON.stringify({
            aiResponse: {
              // text: aiResponse.text,
              // audioUrl: audioResponse.audioUrl,
              // tokensUsed: aiResponse.tokensUsed,
              // cost: aiResponse.cost,
              // latency: aiResponse.latency,
            },
          }),
        },
      });

      this.logger.log(`Respuesta de IA generada para llamada: ${callId}`);
    } catch (error) {
      this.logger.error('Error procesando transcripción con IA:', error);
    }
  }

  async processCallRecording(callId: string, _recordingUrl: string) {
    try {
      this.logger.log(`Procesando grabación de llamada: ${callId}`);

      // TODO: Implementar transcripción de grabación usando Twilio STT
      // Por ahora, solo logueamos que se procesó la grabación

      // TODO: Crear análisis de conversación cuando se implemente Twilio STT
      // await this.prisma.conversationAnalysis.create({
      //   data: {
      //     accountId:
      //       (await this.prisma.call.findUnique({ where: { id: callId } }))
      //         ?.accountId || '',
      //     callId,
      //     transcript: transcription.transcript,
      //     sentiment: analysis.sentiment,
      //     sentimentScore: analysis.sentimentScore,
      //     intent: analysis.intent,
      //     keyTopics: analysis.keyTopics,
      //     summary: analysis.summary,
      //     actionItems: analysis.actionItems || [],
      //   },
      // });

      this.logger.log(`Grabación procesada completamente: ${callId}`);

      return {
        success: true,
        message: 'Grabación procesada (pendiente implementación Twilio STT)',
      };
    } catch (error) {
      this.logger.error('Error procesando grabación de llamada:', error);
      throw error;
    }
  }

  private async analyzeConversation(_transcript: string, _callId: string) {
    try {
      // Usar el orquestador de LLM para analizar la conversación
      // const analysis = await this.llmOrchestrator.generateText(
      //   {
      //     prompt: `Analiza la siguiente conversación telefónica y proporciona un análisis completo:

      // ${transcript}

      // Proporciona:
      // 1. Sentimiento (positive, negative, neutral, mixed)
      // 2. Puntuación de sentimiento (0-1)
      // 3. Intención principal
      // 4. Temas identificados (array)
      // 5. Palabras clave (array)
      // 6. Resumen de la conversación
      // 7. Puntuación de calidad (0-10)
      // 8. Insights y recomendaciones (array)

      // Responde en formato JSON.`,
      //     systemPrompt:
      //       'Eres un experto en análisis de conversaciones telefónicas. Responde siempre en formato JSON válido.',
      //     maxTokens: 2000,
      //     temperature: 0.3,
      //   },
      //   (await this.prisma.call.findUnique({ where: { id: callId } }))
      //     ?.accountId || '',
      // );

      // Parsear la respuesta JSON
      // try {
      //   const parsedAnalysis = JSON.parse(analysis.text);
      //   return {
      //     sentiment: parsedAnalysis.sentiment || 'neutral',
      //     sentimentScore: parsedAnalysis.sentimentScore || 0.5,
      //     intent: parsedAnalysis.intent || 'unknown',
      //     keyTopics: parsedAnalysis.keyTopics || [],
      //     keywords: parsedAnalysis.keywords || [],
      //     summary: parsedAnalysis.summary || '',
      //     qualityScore: parsedAnalysis.qualityScore || 5,
      //     insights: parsedAnalysis.insights || [],
      //     actionItems: parsedAnalysis.actionItems || [],
      //   };
      // } catch (parseError) {
      //   this.logger.warn(
      //     'Error parseando análisis de conversación, usando valores por defecto',
      //     parseError,
      //   );
      return {
        sentiment: 'neutral',
        sentimentScore: 0.5,
        intent: 'unknown',
        keyTopics: [],
        keywords: [],
        summary: 'Análisis no disponible',
        qualityScore: 5,
        insights: [],
        actionItems: [],
      };
      // }
    } catch (error) {
      this.logger.error('Error analizando conversación:', error);
      return {
        sentiment: 'neutral',
        sentimentScore: 0.5,
        intent: 'unknown',
        topics: [],
        keywords: [],
        summary: 'Error en el análisis',
        qualityScore: 0,
        insights: ['Error en el análisis de la conversación'],
      };
    }
  }

  async endConversation(callId: string): Promise<void> {
    try {
      // Finalizar memoria de conversación (usando PostgreSQL)
      // await this.conversationMemory.endConversation(callId);

      // Cerrar conexión de transcripción si existe
      const connection = this.activeConnections.get(callId);
      if (connection) {
        connection.finish();
        this.activeConnections.delete(callId);
      }

      this.logger.log(`Conversación finalizada: ${callId}`);
    } catch (error) {
      this.logger.error('Error finalizando conversación:', error);
    }
  }

  async getConversationInsights(_callId: string) {
    // return this.conversationMemory.getConversationInsights(callId);
    // TODO: Implementar usando PostgreSQL
    return null;
  }

  getActiveConnections() {
    return Array.from(this.activeConnections.keys());
  }

  isConnectionActive(callId: string): boolean {
    return this.activeConnections.has(callId);
  }
}
