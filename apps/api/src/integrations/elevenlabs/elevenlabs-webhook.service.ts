import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface ElevenLabsWebhookData {
  caller_id: string;
  agent_id: string;
  called_number: string;
  call_sid: string;
}

@Injectable()
export class ElevenLabsWebhookService {
  private readonly logger = new Logger(ElevenLabsWebhookService.name);

  constructor(private readonly prisma: PrismaService) {}

  async processConversationInitiation(webhookData: ElevenLabsWebhookData) {
    try {
      const { caller_id, agent_id, called_number, call_sid } = webhookData;

      this.logger.log(
        `🔍 Procesando iniciación de conversación:`,
        `Caller: ${caller_id}, Agent: ${agent_id}, Called: ${called_number}, CallSid: ${call_sid}`,
      );

      // Buscar el agente en nuestra base de datos
      const agent = await this.prisma.agent.findFirst({
        where: {
          elevenLabsAgentId: agent_id,
        },
        include: {
          account: true,
        },
      });

      if (!agent) {
        this.logger.warn(`⚠️ Agente no encontrado: ${agent_id}`);
        // Retornar respuesta básica sin personalización
        return this.getBasicResponse();
      }

      // Buscar información del cliente/contacto si existe
      const contact = await this.prisma.contact.findFirst({
        where: {
          accountId: agent.accountId,
          phone: caller_id,
        },
      });

      // Buscar si ya existe una llamada con este CallSid
      let callRecord = await this.prisma.call.findFirst({
        where: {
          notes: {
            contains: call_sid,
          },
        },
      });

      // Si no existe, crear el registro de llamada con los datos de ElevenLabs
      if (!callRecord) {
        callRecord = await this.prisma.call.create({
          data: {
            accountId: agent.accountId,
            agentId: agent.id,
            phoneNumber: caller_id, // Número del que llama
            direction: 'inbound',
            type: 'manual',
            status: 'initiated',
            notes: JSON.stringify({
              elevenLabsCallSid: call_sid,
              caller_id,
              agent_id,
              called_number,
              source: 'elevenlabs_webhook',
            }),
          },
        });

        this.logger.log(`✅ Registro de llamada creado: ${callRecord.id}`);
      } else {
        // Actualizar el registro existente con los datos de ElevenLabs
        const existingNotes = callRecord.notes
          ? JSON.parse(callRecord.notes)
          : {};
        const updatedNotes = {
          ...existingNotes,
          elevenLabsCallSid: call_sid,
          caller_id,
          agent_id,
          called_number,
          source: 'elevenlabs_webhook',
        };

        await this.prisma.call.update({
          where: { id: callRecord.id },
          data: {
            notes: JSON.stringify(updatedNotes),
          },
        });

        this.logger.log(`✅ Registro de llamada actualizado: ${callRecord.id}`);
      }

      // Preparar respuesta de personalización
      const response = {
        type: 'conversation_initiation_client_data',
        dynamic_variables: {
          customer_name: contact?.name || contact?.lastName || 'Cliente',
          customer_phone: caller_id,
          agent_name: agent.name,
          called_number,
        },
        conversation_config_override: {
          agent: {
            prompt: {
              prompt:
                agent.systemPrompt || 'Eres un asistente virtual profesional.',
            },
            first_message: `Hola, soy ${agent.name}. ¿En qué puedo ayudarte hoy?`,
            language: agent.language || 'es',
          },
        },
      };

      this.logger.log(`📤 Respuesta de personalización enviada:`, response);

      return response;
    } catch (error) {
      this.logger.error('❌ Error procesando webhook de ElevenLabs:', error);
      // En caso de error, retornar respuesta básica
      return this.getBasicResponse();
    }
  }

  private getBasicResponse() {
    return {
      type: 'conversation_initiation_client_data',
      dynamic_variables: {
        customer_name: 'Cliente',
      },
      conversation_config_override: {
        agent: {
          first_message: 'Hola, ¿en qué puedo ayudarte?',
          language: 'es',
        },
      },
    };
  }
}
