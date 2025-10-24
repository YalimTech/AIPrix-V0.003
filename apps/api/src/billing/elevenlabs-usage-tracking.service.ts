import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ElevenLabsUsageTrackingService {
  private readonly logger = new Logger(ElevenLabsUsageTrackingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registrar uso de ElevenLabs para un cliente específico
   * Se llama cada vez que se hace una llamada o se consume tokens
   */
  async trackUsage(
    accountId: string,
    usage: {
      minutes?: number;
      tokens?: number;
      cost?: number;
      callId?: string;
      agentId?: string;
    },
  ) {
    try {
      // Crear registro de uso
      await this.prisma.elevenLabsUsage.create({
        data: {
          accountId,
          characterCount: 0, // Se puede calcular basado en tokens
          cost: usage.cost || 0,
          model: 'conversational-agent', // Modelo por defecto para agentes conversacionales
          minutes: usage.minutes || 0,
          tokens: usage.tokens || 0,
          callId: usage.callId,
          agentId: usage.agentId,
        },
      });

      // Actualizar balance del cliente (debitar el costo)
      if (usage.cost && usage.cost > 0) {
        await this.debitFromBalance(accountId, usage.cost, {
          description: `ElevenLabs usage - ${usage.minutes || 0} minutes`,
          callId: usage.callId,
          agentId: usage.agentId,
        });
      }

      this.logger.log(
        `Usage tracked for account ${accountId}: ${usage.minutes || 0} minutes, $${usage.cost || 0} cost`,
      );
    } catch (error) {
      this.logger.error(
        `Error tracking usage for account ${accountId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Obtener uso total de ElevenLabs por cliente
   */
  async getClientUsage(accountId: string, period?: 'month' | 'week' | 'day') {
    try {
      const whereClause: any = { accountId };

      if (period) {
        const now = new Date();
        let startDate: Date;

        switch (period) {
          case 'day':
            startDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
            );
            break;
          case 'week':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        }

        whereClause.timestamp = { gte: startDate };
      }

      const usageRecords = await this.prisma.elevenLabsUsage.findMany({
        where: whereClause,
        orderBy: { timestamp: 'desc' },
      });

      const totalMinutes = usageRecords.reduce(
        (sum, record) => sum + Number(record.minutes),
        0,
      );
      const totalTokens = usageRecords.reduce(
        (sum, record) => sum + record.tokens,
        0,
      );
      const totalCost = usageRecords.reduce(
        (sum, record) => sum + Number(record.cost),
        0,
      );
      const totalCalls = usageRecords.filter((record) => record.callId).length;

      return {
        totalMinutes,
        totalTokens,
        totalCost,
        totalCalls,
        records: usageRecords,
      };
    } catch (error) {
      this.logger.error(
        `Error getting client usage for account ${accountId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Obtener uso por agente específico
   */
  async getAgentUsage(
    accountId: string,
    agentId: string,
    period?: 'month' | 'week' | 'day',
  ) {
    try {
      const whereClause: any = { accountId, agentId };

      if (period) {
        const now = new Date();
        let startDate: Date;

        switch (period) {
          case 'day':
            startDate = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
            );
            break;
          case 'week':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        }

        whereClause.timestamp = { gte: startDate };
      }

      const usageRecords = await this.prisma.elevenLabsUsage.findMany({
        where: whereClause,
        orderBy: { timestamp: 'desc' },
      });

      const totalMinutes = usageRecords.reduce(
        (sum, record) => sum + Number(record.minutes),
        0,
      );
      const totalTokens = usageRecords.reduce(
        (sum, record) => sum + record.tokens,
        0,
      );
      const totalCost = usageRecords.reduce(
        (sum, record) => sum + Number(record.cost),
        0,
      );
      const totalCalls = usageRecords.length;

      return {
        agentId,
        totalMinutes,
        totalTokens,
        totalCost,
        totalCalls,
        averageDuration: totalCalls > 0 ? totalMinutes / totalCalls : 0,
        records: usageRecords,
      };
    } catch (error) {
      this.logger.error(
        `Error getting agent usage for account ${accountId}, agent ${agentId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Debitar del balance del cliente
   */
  private async debitFromBalance(
    accountId: string,
    amount: number,
    metadata?: {
      description?: string;
      callId?: string;
      agentId?: string;
    },
  ) {
    try {
      // Crear transacción de débito
      await this.prisma.transaction.create({
        data: {
          accountId,
          type: 'debit',
          amount,
          description: metadata?.description || 'ElevenLabs usage',
          status: 'completed',
          metadata: {
            callId: metadata?.callId,
            agentId: metadata?.agentId,
            service: 'elevenlabs',
          },
        },
      });

      this.logger.log(
        `Debited $${amount} from account ${accountId} for ElevenLabs usage`,
      );
    } catch (error) {
      this.logger.error(
        `Error debiting from balance for account ${accountId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Verificar si el cliente tiene balance suficiente
   */
  async hasSufficientBalance(
    accountId: string,
    requiredAmount: number,
  ): Promise<boolean> {
    try {
      const balance = await this.getClientBalance(accountId);
      return balance >= requiredAmount;
    } catch (error) {
      this.logger.error(
        `Error checking balance for account ${accountId}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Obtener balance actual del cliente
   */
  private async getClientBalance(accountId: string): Promise<number> {
    try {
      const transactions = await this.prisma.transaction.findMany({
        where: { accountId },
        orderBy: { createdAt: 'desc' },
      });

      return transactions.reduce((balance, transaction) => {
        if (
          transaction.type === 'credit' &&
          transaction.status === 'completed'
        ) {
          return balance + Number(transaction.amount);
        } else if (
          transaction.type === 'debit' &&
          transaction.status === 'completed'
        ) {
          return balance - Number(transaction.amount);
        }
        return balance;
      }, 0);
    } catch (error) {
      this.logger.error(
        `Error getting balance for account ${accountId}:`,
        error,
      );
      return 0;
    }
  }
}
