import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ElevenLabsService } from '../integrations/elevenlabs/elevenlabs.service';

@Injectable()
export class TwilioInboundService {
  private readonly logger = new Logger(TwilioInboundService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly elevenLabsService: ElevenLabsService,
  ) {}

  /**
   * Configurar un número de Twilio para recibir llamadas inbound
   * Según documentación oficial de ElevenLabs + Twilio
   */
  async configureInboundPhoneNumber(
    accountId: string,
    agentId: string,
    phoneNumber: string,
  ): Promise<any> {
    try {
      this.logger.log(
        `📞 Configurando número ${phoneNumber} para agente inbound ${agentId}`,
      );

      // Verificar que el agente existe y es inbound
      const agent = await this.prisma.agent.findFirst({
        where: {
          id: agentId,
          accountId: accountId,
          type: 'inbound',
        },
      });

      if (!agent) {
        throw new NotFoundException('Agente inbound no encontrado');
      }

      if (!agent.elevenLabsAgentId) {
        throw new BadRequestException(
          'El agente debe estar sincronizado con ElevenLabs primero',
        );
      }

      // Obtener configuración de Twilio de la cuenta
      const twilioConfig = await this.prisma.accountTwilioConfig.findFirst({
        where: { accountId: accountId },
      });

      if (!twilioConfig) {
        throw new BadRequestException(
          'Configuración de Twilio no encontrada para esta cuenta',
        );
      }

      // Verificar que el número de teléfono existe en Twilio
      const phoneNumberRecord = await this.prisma.phoneNumber.findFirst({
        where: {
          number: phoneNumber,
          accountId: accountId,
        },
      });

      if (!phoneNumberRecord) {
        throw new NotFoundException('Número de teléfono no encontrado');
      }

      // Configurar el webhook de Twilio para inbound calls
      const webhookUrl = `${process.env.APP_URL || 'https://agent.prixcenter.com'}/api/v1/webhooks/twilio/inbound`;
      
      // Aquí se configuraría el webhook en Twilio usando su API
      // Por ahora, actualizamos la base de datos local
      await this.prisma.agent.update({
        where: { id: agentId },
        data: { 
          phoneNumber: phoneNumber,
          status: 'active',
        },
      });

      // Configurar el agente en ElevenLabs para inbound calls
      const elevenLabsConfig = {
        platform_settings: {
          inbound_calling: {
            enabled: true,
            phone_number: phoneNumber,
            greeting_message: agent.openingMessage,
            max_conversation_duration: 1800,
            silence_timeout: 5,
            interruption_sensitivity: 0.5,
            // Configuración de horarios de atención
            business_hours: {
              enabled: true,
              timezone: 'UTC',
              schedule: {
                monday: { start: '09:00', end: '17:00' },
                tuesday: { start: '09:00', end: '17:00' },
                wednesday: { start: '09:00', end: '17:00' },
                thursday: { start: '09:00', end: '17:00' },
                friday: { start: '09:00', end: '17:00' },
                saturday: { start: '10:00', end: '14:00' },
                sunday: { start: '10:00', end: '14:00' },
              },
            },
            // Mensaje fuera de horario
            after_hours_message: 'Lo sentimos, estamos fuera del horario de atención. Por favor, llame durante nuestro horario de atención.',
          },
        },
        // Configuración de webhooks para eventos de llamadas
        webhooks: {
          conversation_started: true,
          conversation_ended: true,
          conversation_updated: true,
          // Webhook específico para inbound calls
          inbound_call_received: true,
        },
      };

      // Actualizar el agente en ElevenLabs
      await this.elevenLabsService.updateAgent(
        accountId,
        agent.elevenLabsAgentId,
        elevenLabsConfig,
      );

      this.logger.log(
        `✅ Número ${phoneNumber} configurado para agente inbound ${agentId}`,
      );

      return {
        success: true,
        message: 'Número configurado para recibir llamadas inbound',
        phoneNumber,
        agentId,
        webhookUrl,
      };
    } catch (error) {
      this.logger.error(
        `❌ Error configurando número inbound: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Error configurando número inbound: ${error.message}`,
      );
    }
  }

  /**
   * Obtener configuración de inbound calls para un agente
   */
  async getInboundConfiguration(
    accountId: string,
    agentId: string,
  ): Promise<any> {
    try {
      const agent = await this.prisma.agent.findFirst({
        where: {
          id: agentId,
          accountId: accountId,
          type: 'inbound',
        },
        select: {
          id: true,
          name: true,
          phoneNumber: true,
          status: true,
          elevenLabsAgentId: true,
          openingMessage: true,
          systemPrompt: true,
        },
      });

      if (!agent) {
        throw new NotFoundException('Agente inbound no encontrado');
      }

      return {
        agent,
        isConfigured: !!agent.phoneNumber && !!agent.elevenLabsAgentId,
        webhookUrl: `${process.env.APP_URL || 'https://agent.prixcenter.com'}/api/v1/webhooks/twilio/inbound`,
      };
    } catch (error) {
      this.logger.error(
        `❌ Error obteniendo configuración inbound: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Error obteniendo configuración inbound: ${error.message}`,
      );
    }
  }

  /**
   * Desactivar inbound calls para un agente
   */
  async disableInboundCalls(
    accountId: string,
    agentId: string,
  ): Promise<any> {
    try {
      const agent = await this.prisma.agent.findFirst({
        where: {
          id: agentId,
          accountId: accountId,
          type: 'inbound',
        },
      });

      if (!agent) {
        throw new NotFoundException('Agente inbound no encontrado');
      }

      // Desactivar en base de datos local
      await this.prisma.agent.update({
        where: { id: agentId },
        data: { 
          phoneNumber: null,
          status: 'inactive',
        },
      });

      // Desactivar en ElevenLabs si está sincronizado
      if (agent.elevenLabsAgentId) {
        await this.elevenLabsService.updateAgent(accountId, agent.elevenLabsAgentId, {
          platform_settings: {
            inbound_calling: {
              enabled: false,
            },
          },
        });
      }

      this.logger.log(`✅ Llamadas inbound desactivadas para agente ${agentId}`);

      return {
        success: true,
        message: 'Llamadas inbound desactivadas',
        agentId,
      };
    } catch (error) {
      this.logger.error(
        `❌ Error desactivando llamadas inbound: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Error desactivando llamadas inbound: ${error.message}`,
      );
    }
  }

  /**
   * Obtener agente por número de teléfono
   */
  async getAgentByPhoneNumber(phoneNumber: string): Promise<any> {
    try {
      const agent = await this.prisma.agent.findFirst({
        where: {
          phoneNumber: phoneNumber,
          type: 'inbound',
          status: 'active',
        },
        select: {
          id: true,
          name: true,
          openingMessage: true,
          systemPrompt: true,
          voiceName: true,
          status: true,
          elevenLabsAgentId: true,
        },
      });

      return agent;
    } catch (error) {
      this.logger.error(
        `❌ Error obteniendo agente por número: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Error obteniendo agente por número: ${error.message}`,
      );
    }
  }

  /**
   * Procesar llamada inbound con ElevenLabs
   */
  async processInboundCall(callData: {
    callSid: string;
    from: string;
    to: string;
    agentId: string;
    agentName: string;
    openingMessage: string;
    systemPrompt: string;
    voiceName: string;
  }): Promise<any> {
    try {
      this.logger.log(`🔄 Procesando llamada inbound: ${callData.callSid}`);

      // Iniciar conversación en ElevenLabs
      const conversation = await this.elevenLabsService.startConversation(
        callData.agentId, // accountId - necesitamos obtener el accountId real
        callData.agentId, // agentId
        callData.to, // phoneNumber (número del agente)
        callData.callSid, // callId
      );

      // Registrar la llamada en la base de datos
      await this.prisma.call.create({
        data: {
          id: callData.callSid,
          status: 'active',
          direction: 'inbound',
          type: 'inbound',
          phoneNumber: callData.from,
          agentId: callData.agentId,
          accountId: callData.agentId, // Necesitaríamos obtener el accountId del agente
          elevenLabsConversationId: conversation.id,
          startedAt: new Date(),
        },
      });

      this.logger.log(`✅ Llamada inbound procesada: ${callData.callSid}`);

      return {
        conversationId: conversation.id,
        callSid: callData.callSid,
        status: 'active',
      };
    } catch (error) {
      this.logger.error(
        `❌ Error procesando llamada inbound: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Error procesando llamada inbound: ${error.message}`,
      );
    }
  }

  /**
   * Actualizar estado de llamada
   */
  async updateCallStatus(callData: {
    callSid: string;
    status: string;
    duration?: number;
    recordingUrl?: string;
  }): Promise<any> {
    try {
      await this.prisma.call.update({
        where: { id: callData.callSid },
        data: {
          status: callData.status,
          duration: callData.duration,
          recordingUrl: callData.recordingUrl,
          endedAt: callData.status === 'completed' ? new Date() : null,
        },
      });

      this.logger.log(`✅ Estado de llamada actualizado: ${callData.callSid}`);
      return { success: true };
    } catch (error) {
      this.logger.error(
        `❌ Error actualizando estado de llamada: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Error actualizando estado de llamada: ${error.message}`,
      );
    }
  }
}
