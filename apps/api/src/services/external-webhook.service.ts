import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

export interface ExternalWebhookPayload {
  call_id: string;
  agent_id: string;
  agent_name: string;
  phone_number: string;
  direction: 'inbound' | 'outbound';
  duration: number;
  status: 'completed' | 'failed' | 'no_answer';
  transcript?: string;
  recording_url?: string;
  tokens_used?: number;
  cost?: number;
  conversation_id?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class ExternalWebhookService {
  private readonly logger = new Logger(ExternalWebhookService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Envía webhook externo cuando una conversación termina
   * Según documentación oficial de ElevenLabs 2025
   */
  async sendConversationEndedWebhook(
    accountId: string,
    agentId: string,
    conversationData: {
      conversation_id: string;
      duration: number;
      transcript?: string;
      recording_url?: string;
      tokens_used?: number;
      cost?: number;
      phone_number: string;
      direction: 'inbound' | 'outbound';
      status: 'completed' | 'failed' | 'no_answer';
    },
  ): Promise<void> {
    try {
      // Obtener configuración del agente
      const agent = await this.prisma.agent.findFirst({
        where: {
          id: agentId,
          accountId: accountId,
        },
        select: {
          id: true,
          name: true,
          webhookUrl: true,
        },
      });

      if (!agent) {
        this.logger.warn(`Agente no encontrado: ${agentId}`);
        return;
      }

      if (!agent.webhookUrl) {
        this.logger.log(`No hay webhook externo configurado para el agente: ${agentId}`);
        return;
      }

      // Construir payload según documentación de ElevenLabs
      const payload: ExternalWebhookPayload = {
        call_id: agentId,
        agent_id: agentId,
        agent_name: agent.name,
        phone_number: conversationData.phone_number,
        direction: conversationData.direction,
        duration: conversationData.duration,
        status: conversationData.status,
        transcript: conversationData.transcript,
        recording_url: conversationData.recording_url,
        tokens_used: conversationData.tokens_used,
        cost: conversationData.cost,
        conversation_id: conversationData.conversation_id,
        timestamp: new Date().toISOString(),
        metadata: {
          source: 'prix-ai',
          version: '1.0',
          account_id: accountId,
        },
      };

      // Enviar webhook externo
      await this.sendWebhook(agent.webhookUrl, payload);

      this.logger.log(
        `Webhook externo enviado exitosamente para agente ${agentId} a ${agent.webhookUrl}`,
      );
    } catch (error) {
      this.logger.error(
        `Error enviando webhook externo para agente ${agentId}:`,
        error,
      );
      // No lanzar error para no interrumpir el flujo principal
    }
  }

  /**
   * Envía webhook externo cuando una conversación inicia
   */
  async sendConversationStartedWebhook(
    accountId: string,
    agentId: string,
    conversationData: {
      conversation_id: string;
      phone_number: string;
      direction: 'inbound' | 'outbound';
    },
  ): Promise<void> {
    try {
      const agent = await this.prisma.agent.findFirst({
        where: {
          id: agentId,
          accountId: accountId,
        },
        select: {
          id: true,
          name: true,
          webhookUrl: true,
        },
      });

      if (!agent?.webhookUrl) {
        return;
      }

      const payload: ExternalWebhookPayload = {
        call_id: agentId,
        agent_id: agentId,
        agent_name: agent.name,
        phone_number: conversationData.phone_number,
        direction: conversationData.direction,
        duration: 0,
        status: 'completed', // Iniciada
        conversation_id: conversationData.conversation_id,
        timestamp: new Date().toISOString(),
        metadata: {
          source: 'prix-ai',
          version: '1.0',
          account_id: accountId,
          event_type: 'conversation_started',
        },
      };

      await this.sendWebhook(agent.webhookUrl, payload);

      this.logger.log(
        `Webhook de inicio enviado para agente ${agentId} a ${agent.webhookUrl}`,
      );
    } catch (error) {
      this.logger.error(
        `Error enviando webhook de inicio para agente ${agentId}:`,
        error,
      );
    }
  }

  /**
   * Envía webhook externo genérico
   */
  private async sendWebhook(
    webhookUrl: string,
    payload: ExternalWebhookPayload,
  ): Promise<void> {
    try {
      const response = await axios.post(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'PrixAI-Webhook/1.0',
        },
        timeout: 10000, // 10 segundos timeout
        validateStatus: (status) => status < 500, // Aceptar 4xx como éxito
      });

      this.logger.log(
        `Webhook enviado exitosamente a ${webhookUrl} - Status: ${response.status}`,
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error(
          `Error HTTP enviando webhook a ${webhookUrl}: ${error.response?.status} - ${error.response?.data}`,
        );
      } else {
        this.logger.error(
          `Error enviando webhook a ${webhookUrl}:`,
          error,
        );
      }
      throw error;
    }
  }

  /**
   * Verifica si un webhook URL es válido
   */
  async validateWebhookUrl(webhookUrl: string): Promise<boolean> {
    try {
      // Verificar que sea una URL válida
      new URL(webhookUrl);
      
      // Verificar que use HTTPS en producción
      if (process.env.NODE_ENV === 'production' && !webhookUrl.startsWith('https://')) {
        this.logger.warn(`Webhook URL debe usar HTTPS en producción: ${webhookUrl}`);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`URL de webhook inválida: ${webhookUrl}`, error);
      return false;
    }
  }

  /**
   * Prueba un webhook URL enviando un payload de prueba
   */
  async testWebhook(webhookUrl: string): Promise<{
    success: boolean;
    message: string;
    statusCode?: number;
  }> {
    try {
      const testPayload: ExternalWebhookPayload = {
        call_id: 'test-call-id',
        agent_id: 'test-agent-id',
        agent_name: 'Test Agent',
        phone_number: '+1234567890',
        direction: 'inbound',
        duration: 0,
        status: 'completed',
        transcript: 'This is a test webhook from PrixAI',
        timestamp: new Date().toISOString(),
        metadata: {
          source: 'prix-ai',
          version: '1.0',
          test: true,
        },
      };

      const response = await axios.post(webhookUrl, testPayload, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'PrixAI-Webhook/1.0',
        },
        timeout: 10000,
      });

      return {
        success: true,
        message: 'Webhook de prueba enviado exitosamente',
        statusCode: response.status,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: `Error HTTP: ${error.response?.status} - ${error.response?.data}`,
          statusCode: error.response?.status,
        };
      }
      return {
        success: false,
        message: `Error: ${error.message}`,
      };
    }
  }
}
