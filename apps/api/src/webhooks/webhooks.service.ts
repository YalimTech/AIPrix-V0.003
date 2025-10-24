import { Injectable, Logger } from '@nestjs/common';
import { ConversationOrchestratorService } from '../conversation/conversation-orchestrator.service';
import { ElevenLabsService } from '../integrations/elevenlabs/elevenlabs.service';
import { TwilioService } from '../integrations/twilio/twilio.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly twilioService: TwilioService,
    private readonly elevenLabsService: ElevenLabsService,
    private readonly prisma: PrismaService,
    private readonly conversationOrchestrator: ConversationOrchestratorService,
  ) {}

  async processTwilioVoiceWebhook(webhookData: any) {
    try {
      this.logger.log('Procesando webhook de voz de Twilio', webhookData);

      const callSid = webhookData.CallSid;
      const speechResult = webhookData.SpeechResult;
      // const _callStatus = webhookData.CallStatus;

      // Buscar la llamada en la base de datos
      const call = await this.prisma.call.findFirst({
        where: {
          notes: {
            contains: webhookData.CallSid,
            equals: callSid,
          },
        },
        include: {
          agent: true,
          account: true,
        },
      });

      if (!call) {
        this.logger.warn(`Llamada no encontrada: ${callSid}`);
        return this.generateBasicTwiML(
          'No se pudo encontrar la información de la llamada.',
        );
      }

      // Si hay resultado de voz, procesarlo con agente de conversación de ElevenLabs
      if (speechResult && call.agentId) {
        try {
          // Obtener configuración del agente desde la base de datos
          const agent = await this.prisma.agent.findFirst({
            where: { id: call.agentId, accountId: call.accountId },
          });

          if (!agent) {
            throw new Error('Agente no encontrado');
          }

          // Verificar si el agente tiene un ElevenLabs Agent ID configurado
          if (agent.elevenLabsAgentId) {
            // Para llamadas inbound, necesitamos conectar la llamada con el agente de ElevenLabs
            // El agente ya debe tener un número de teléfono asignado que maneja automáticamente las llamadas

            this.logger.log(
              `Conectando llamada inbound al agente de ElevenLabs: ${agent.elevenLabsAgentId}`,
            );

            // Actualizar la llamada con la información del agente
            await this.prisma.call.update({
              where: { id: call.id },
              data: {
                transcript:
                  speechResult || 'Llamada conectada con agente de IA',
                notes: JSON.stringify({
                  agentId: agent.elevenLabsAgentId,
                  type: 'elevenlabs_agent',
                  timestamp: new Date().toISOString(),
                }),
              },
            });

            // Generar TwiML que transfiere la llamada al webhook de ElevenLabs
            // ElevenLabs maneja automáticamente la conversación cuando Twilio conecta
            return this.generateElevenLabsInboundTwiML(agent, call);
          } else {
            this.logger.error(
              `El agente ${call.agentId} no tiene un elevenLabsAgentId configurado. No se puede proceder con la llamada.`,
            );
            return this.generateBasicTwiML(
              'Lo siento, este número no está configurado correctamente para recibir llamadas.',
            );
          }
        } catch (error) {
          this.logger.error('Error procesando respuesta de agente:', error);
          return this.generateBasicTwiML(
            'Lo siento, no pude procesar tu solicitud en este momento.',
          );
        }
      }

      // Si no hay resultado de voz, pedir al usuario que hable
      return this.generateBasicTwiML('Por favor, dime cómo puedo ayudarte.');
    } catch (error) {
      this.logger.error('Error procesando webhook de voz:', error);
      return this.generateBasicTwiML(
        'Lo siento, ocurrió un error. Por favor, inténtalo de nuevo.',
      );
    }
  }

  async processTwilioStatusWebhook(webhookData: any) {
    try {
      this.logger.log('Procesando webhook de estado de Twilio', webhookData);

      const callSid = webhookData.CallSid;
      const callStatus = webhookData.CallStatus;
      const callDuration = webhookData.CallDuration;

      // Actualizar estado de la llamada
      await this.prisma.call.updateMany({
        where: {
          notes: {
            contains: webhookData.CallSid,
            equals: callSid,
          },
        },
        data: {
          status: callStatus,
          ...(callStatus === 'completed' && {
            completedAt: new Date(),
            duration: parseInt(callDuration) || 0,
            success: callStatus === 'completed',
          }),
        },
      });

      this.logger.log(
        `Estado de llamada actualizado: ${callSid} - ${callStatus}`,
      );
    } catch (error) {
      this.logger.error('Error procesando webhook de estado:', error);
    }
  }

  async processTwilioRecordingWebhook(webhookData: any) {
    try {
      this.logger.log('Procesando webhook de grabación de Twilio', webhookData);

      const callSid = webhookData.CallSid;
      const recordingUrl = webhookData.RecordingUrl;
      // const _recordingDuration = webhookData.RecordingDuration;

      // Actualizar URL de grabación
      await this.prisma.call.updateMany({
        where: {
          notes: {
            contains: webhookData.CallSid,
            equals: callSid,
          },
        },
        data: {
          recordingUrl,
        },
      });

      this.logger.log(
        `URL de grabación actualizada para la llamada ${callSid}`,
      );
    } catch (error) {
      this.logger.error('Error procesando webhook de grabación:', error);
    }
  }

  private generateBasicTwiML(message: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>
        ${message}
    </Say>
    <Hangup/>
</Response>`;
  }

  private generateAudioTwiML(audioUrl: string, _text: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Play>${audioUrl}</Play>
    <Say>
        ¿Hay algo más en lo que pueda ayudarte?
    </Say>
    <Gather input="speech" action="/webhooks/twilio/voice" 
            speechTimeout="3" timeout="10" numDigits="1">
        <Say>
            Por favor, dime si necesitas algo más.
        </Say>
    </Gather>
    <Say>
        Gracias por llamar. ¡Que tengas un buen día!
    </Say>
    <Hangup/>
</Response>`;
  }

  /**
   * Genera TwiML para conectar directamente con un agente de conversación de ElevenLabs
   * Esto permite que ElevenLabs maneje toda la conversación de forma nativa
   */
  private generateElevenLabsAgentTwiML(conversationId: string): string {
    const wssUrl = `wss://api.elevenlabs.io/v1/conversations/${conversationId}/websocket`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alloy">
        Conectándote con nuestro asistente virtual... Un momento, por favor.
    </Say>
    <Connect>
        <Stream url="${wssUrl}" />
    </Connect>
</Response>`;
  }

  /**
   * Genera TwiML para llamadas inbound que conecta directamente con el webhook de ElevenLabs
   * Esto permite que ElevenLabs maneje automáticamente la llamada entrante
   */
  private generateElevenLabsInboundTwiML(agent: any, _call: any): string {
    // Para llamadas inbound, ElevenLabs tiene su propio webhook de Twilio
    // que maneja automáticamente la conexión cuando el agente tiene un número asignado
    const elevenLabsWebhookUrl = `https://api.elevenlabs.io/v1/convai/webhook/twilio`;

    this.logger.log(
      `Redirigiendo llamada inbound a ElevenLabs para agente: ${agent.elevenLabsAgentId}`,
    );

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Redirect method="POST">${elevenLabsWebhookUrl}</Redirect>
</Response>`;
  }

  /**
   * Procesar webhooks de ElevenLabs para tracking de uso individual
   */
  async processElevenLabsWebhook(webhookData: any) {
    try {
      this.logger.log('Procesando webhook de ElevenLabs:', webhookData);

      const { event_type } = webhookData;
      // const { conversation_id, account_id, agent_id, call_id } = webhookData;

      switch (event_type) {
        case 'conversation.started':
          await this.handleElevenLabsConversationStarted(webhookData);
          break;
        case 'conversation.ended':
          await this.handleElevenLabsConversationEnded(webhookData);
          break;
        case 'conversation.failed':
          await this.handleElevenLabsConversationFailed(webhookData);
          break;
        default:
          this.logger.warn(
            `Tipo de evento ElevenLabs no manejado: ${event_type}`,
          );
      }
    } catch (error) {
      this.logger.error('Error procesando webhook de ElevenLabs:', error);
    }
  }

  private async handleElevenLabsConversationStarted(webhookData: any) {
    const { conversation_id, account_id, _agent_id, _call_id } = webhookData;

    this.logger.log(
      `Conversación ElevenLabs iniciada: ${conversation_id} para cliente: ${account_id}`,
    );

    // El tracking del inicio ya se hace en startConversation
    // Aquí solo logueamos el evento
  }

  private async handleElevenLabsConversationEnded(webhookData: any) {
    const {
      conversation_id,
      account_id,
      agent_id,
      call_id,
      duration,
      tokens_used,
      cost,
      transcript,
      recording_url,
      from_number,
      to_number,
      direction,
      status,
    } = webhookData;

    this.logger.log(`Conversación ElevenLabs finalizada: ${conversation_id}`);

    try {
      // 1. Trackear finalización con métricas completas (para facturación)
      await this.elevenLabsService.trackConversationEnd(
        account_id,
        conversation_id,
        duration || 0,
        tokens_used || 0,
        call_id,
        agent_id,
      );

      // 2. Obtener detalles completos de la conversación de ElevenLabs
      let conversationDetails;
      try {
        conversationDetails =
          await this.elevenLabsService.getConversationDetails(
            account_id,
            conversation_id,
          );
        this.logger.log(
          `Detalles de conversación obtenidos para ${conversation_id}`,
        );
      } catch (error) {
        this.logger.error(
          `Error obteniendo detalles de conversación: ${error.message}`,
        );
        conversationDetails = null;
      }

      // 3. Buscar el agente local en la base de datos
      const agent = await this.prisma.agent.findFirst({
        where: {
          elevenLabsAgentId: agent_id,
          accountId: account_id,
        },
        select: {
          id: true,
          name: true,
        },
      });

      if (!agent) {
        this.logger.warn(
          `Agente no encontrado en la base de datos para agent_id: ${agent_id}`,
        );
        return;
      }

      // 4. Determinar el outcome de la llamada
      let outcome = 'completed';
      if (status === 'failed') {
        outcome = 'failed';
      } else if (status === 'no_answer') {
        outcome = 'no_answer';
      }

      // 5. Determinar la dirección
      const callDirection = direction || 'inbound'; // Por defecto inbound

      // 6. Crear o actualizar el registro de llamada en la base de datos
      const metadataJson = {
        elevenLabsConversationId: conversation_id,
        tokensUsed: tokens_used || 0,
        cost: cost || 0,
        fromNumber: from_number,
        toNumber: to_number,
      };

      const notesJson = {
        elevenLabsConversationId: conversation_id,
        tokensUsed: tokens_used || 0,
        cost: cost || 0,
      };

      const callData: any = {
        accountId: String(account_id),
        agentId: String(agent.id),
        direction: callDirection,
        status: 'completed' as const,
        outcome,
        duration: Number(duration || 0),
        initiatedAt: new Date(Date.now() - (duration || 0) * 1000),
        completedAt: new Date(),
        metadata: metadataJson,
        transcript: conversationDetails?.transcript || transcript || null,
        recordingUrl:
          conversationDetails?.recording_url || recording_url || null,
        notes: notesJson,
      };

      // Buscar si ya existe una llamada con este conversation_id en las notas
      const allCalls = await this.prisma.call.findMany({
        where: {
          accountId: account_id,
        },
      });

      const existingCall = allCalls.find((call) => {
        try {
          const notes =
            typeof call.notes === 'string'
              ? JSON.parse(call.notes)
              : call.notes;
          return notes?.elevenLabsConversationId === conversation_id;
        } catch {
          return false;
        }
      });

      if (existingCall) {
        // Actualizar llamada existente
        await this.prisma.call.update({
          where: { id: existingCall.id },
          data: callData,
        });
        this.logger.log(
          `Llamada actualizada en la base de datos: ${existingCall.id}`,
        );
      } else {
        // Crear nueva llamada
        const newCall = await this.prisma.call.create({
          data: callData,
        });
        this.logger.log(
          `Nueva llamada creada en la base de datos: ${newCall.id}`,
        );
      }

      this.logger.log(
        `✅ Información de llamada guardada exitosamente para conversación ${conversation_id}`,
      );
    } catch (error) {
      this.logger.error(
        `Error guardando información de llamada: ${error.message}`,
        error.stack,
      );
    }
  }

  private async handleElevenLabsConversationFailed(webhookData: any) {
    const { conversation_id, _account_id, error_message } = webhookData;

    this.logger.error(
      `Conversación ElevenLabs falló: ${conversation_id} - ${error_message}`,
    );

    // Registrar el fallo pero no cobrar al cliente
    // Solo loguear para análisis
  }

  async processElevenLabsToolCall(webhookData: any) {
    this.logger.log('Procesando tool call de ElevenLabs:', webhookData);

    // TODO: Validar la estructura del webhook de ElevenLabs Tool Call
    const { call_id, tool_name, parameters } = webhookData;

    if (!call_id || !tool_name) {
      this.logger.error(
        'Webhook de Tool Call inválido: faltan call_id o tool_name.',
        webhookData,
      );
      throw new Error('Payload de Tool Call inválido');
    }

    // Dejamos que el orquestador se encargue de la lógica de la herramienta
    return this.conversationOrchestrator.handleElevenLabsToolCall(
      call_id,
      tool_name,
      parameters || {},
    );
  }

  async processCustomWebhook(
    webhookData: any,
    accountId: string,
    eventType: string,
  ) {
    try {
      this.logger.log(
        `Procesando webhook personalizado: ${eventType}`,
        webhookData,
      );

      // Aquí se pueden procesar webhooks personalizados según el tipo de evento
      switch (eventType) {
        case 'call_completed':
          await this.handleCallCompleted(webhookData, accountId);
          break;
        case 'agent_updated':
          await this.handleAgentUpdated(webhookData, accountId);
          break;
        case 'campaign_started':
          await this.handleCampaignStarted(webhookData, accountId);
          break;
        default:
          this.logger.warn(`Tipo de webhook no reconocido: ${eventType}`);
      }
    } catch (error) {
      this.logger.error('Error procesando webhook personalizado:', error);
    }
  }

  private async handleCallCompleted(webhookData: any, _accountId: string) {
    // Lógica para manejar llamadas completadas
    this.logger.log('Manejando llamada completada', webhookData);
  }

  private async handleAgentUpdated(webhookData: any, _accountId: string) {
    // Lógica para manejar actualizaciones de agentes
    this.logger.log('Manejando agente actualizado', webhookData);
  }

  private async handleCampaignStarted(webhookData: any, _accountId: string) {
    // Lógica para manejar campañas iniciadas
    this.logger.log('Manejando campaña iniciada', webhookData);
  }

  /**
   * Sincronizar conversaciones desde ElevenLabs para un agente específico
   * Esto es útil para recuperar conversaciones que no se guardaron por webhook
   */
  async syncConversationsFromElevenLabs(accountId: string, agentId: string) {
    this.logger.log(
      `Sincronizando conversaciones para agente ${agentId} (account: ${accountId})`,
    );

    try {
      // 1. Obtener el agente local
      const agent = await this.prisma.agent.findFirst({
        where: {
          id: agentId,
          accountId,
        },
      });

      if (!agent) {
        throw new Error(`Agente no encontrado: ${agentId}`);
      }

      if (!agent.elevenLabsAgentId) {
        throw new Error(
          `El agente ${agentId} no tiene un elevenLabsAgentId configurado`,
        );
      }

      // 2. Obtener conversaciones desde ElevenLabs
      const conversations = await this.elevenLabsService.getConversations(
        accountId,
        {
          agent_id: agent.elevenLabsAgentId,
        },
      );

      this.logger.log(
        `Encontradas ${conversations.length} conversaciones en ElevenLabs`,
      );

      let syncedCount = 0;
      let skippedCount = 0;

      // 3. Procesar cada conversación
      for (const conversation of conversations) {
        try {
          // Verificar si ya existe en la base de datos
          const existingCall = await this.prisma.call.findFirst({
            where: {
              elevenLabsConversationId: conversation.conversation_id,
            },
          });

          if (existingCall) {
            this.logger.log(
              `Conversación ${conversation.conversation_id} ya existe, saltando...`,
            );
            skippedCount++;
            continue;
          }

          // Obtener detalles completos de la conversación
          const conversationDetails =
            await this.elevenLabsService.getConversationDetails(
              accountId,
              conversation.conversation_id,
            );

          // Determinar outcome
          let outcome = 'completed';
          if (conversationDetails.status === 'failed') {
            outcome = 'failed';
          } else if (conversationDetails.status === 'no_answer') {
            outcome = 'no_answer';
          }

          // Determinar dirección
          const callDirection = conversationDetails.direction || 'inbound';

          // Crear registro en la base de datos
          const metadataJson = {
            elevenLabsConversationId: conversation.conversation_id,
            tokensUsed: conversationDetails.tokens_used || 0,
            cost: conversationDetails.cost || 0,
            fromNumber: conversationDetails.from_number,
            toNumber: conversationDetails.to_number,
          };

          const notesJson = {
            elevenLabsConversationId: conversation.conversation_id,
            tokensUsed: conversationDetails.tokens_used || 0,
            cost: conversationDetails.cost || 0,
          };

          await this.prisma.call.create({
            data: {
              accountId,
              agentId,
              direction: callDirection,
              status: 'completed',
              duration: conversationDetails.duration || 0,
              startedAt: new Date(conversationDetails.created_at),
              endedAt: new Date(
                conversationDetails.ended_at || conversationDetails.created_at,
              ),
              transcript: conversationDetails.transcript || '',
              recordingUrl: conversationDetails.recording_url || '',
              notes: JSON.stringify(notesJson),
              phoneNumber:
                conversationDetails.from_number ||
                conversationDetails.to_number ||
                'unknown',
              elevenLabsConversationId: conversation.conversation_id,
            },
          });

          syncedCount++;
          this.logger.log(
            `✅ Conversación ${conversation.conversation_id} sincronizada exitosamente`,
          );
        } catch (error) {
          this.logger.error(
            `Error sincronizando conversación ${conversation.conversation_id}:`,
            error,
          );
        }
      }

      this.logger.log(
        `✅ Sincronización completada: ${syncedCount} nuevas, ${skippedCount} existentes`,
      );

      return {
        success: true,
        synced: syncedCount,
        skipped: skippedCount,
        total: conversations.length,
      };
    } catch (error) {
      this.logger.error('Error sincronizando conversaciones:', error);
      throw error;
    }
  }
}
