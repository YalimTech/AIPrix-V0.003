import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ElevenLabsService } from '../integrations/elevenlabs/elevenlabs.service';
import { PrismaService } from '../prisma/prisma.service';
import { ElevenLabsUsageTrackingService } from './elevenlabs-usage-tracking.service';

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(
    private readonly elevenLabsService: ElevenLabsService,
    private readonly elevenLabsUsageTrackingService: ElevenLabsUsageTrackingService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Obtener información de balance y minutos del cliente actual
   */
  @Get('balance')
  async getBalance(@Request() req) {
    try {
      const accountId = req.user.accountId;

      // Obtener información local del cliente
      const account = await this.prisma.account.findUnique({
        where: { id: accountId },
        select: {
          id: true,
          name: true,
          email: true,
          subscriptionPlan: true,
          createdAt: true,
        },
      });

      if (!account) {
        return {
          success: false,
          message: 'Cliente no encontrado',
        };
      }

      // Calcular balance local del cliente
      const localBalance = await this.calculateLocalBalance(accountId);

      // Obtener uso de ElevenLabs por este cliente específico (minutos y costos calculados localmente)
      const clientUsage =
        await this.elevenLabsUsageTrackingService.getClientUsage(
          accountId,
          'month',
        );

      // console.log(`📊 [Billing] Uso del cliente ${accountId} (local):`, {
      //   totalMinutes: clientUsage.totalMinutes,
      //   totalCost: clientUsage.totalCost,
      //   totalCalls: clientUsage.totalCalls,
      // });

      // Obtener analíticas REALES de ElevenLabs (incluye minutos y costos)
      let elevenLabsAnalytics = null;
      try {
        // console.log(
        //   `🔍 [Billing] Obteniendo analíticas de ElevenLabs para cuenta: ${accountId}`,
        // );
        // Nota: getAnalytics no está implementado aún en el servicio
        // elevenLabsAnalytics = await this.elevenLabsService.getAnalytics(accountId);
        elevenLabsAnalytics = {
          totalConversations: 0,
          activeConversations: 0,
          averageDuration: 0,
          successRate: 0,
          totalMinutes: 0,
          cost: 0,
        };
        // console.log(
        //   `✅ [Billing] Analíticas de ElevenLabs obtenidas:`,
        //   JSON.stringify(elevenLabsAnalytics, null, 2),
        // );
      } catch (_analyticsError) {
        // console.error(
        //   '❌ [Billing] Error obteniendo analíticas de ElevenLabs:',
        //   analyticsError.message,
        // );
        // Continuar sin las analíticas
      }

      // Obtener información real de la cuenta de ElevenLabs (si está configurada)
      let elevenLabsAccountInfo = null;
      try {
        // console.log(
        //   `🔍 [Billing] Obteniendo información de ElevenLabs para cuenta: ${accountId}`,
        // );
        const elevenLabsUserInfo =
          await this.elevenLabsService.getUserInfo(accountId);
        // console.log(
        //   `✅ [Billing] Información de ElevenLabs obtenida:`,
        //   JSON.stringify(elevenLabsUserInfo, null, 2),
        // );
        elevenLabsAccountInfo = {
          userId: elevenLabsUserInfo.id,
          email: elevenLabsUserInfo.email || null,
          firstName: elevenLabsUserInfo.firstName || null,
          lastName: elevenLabsUserInfo.lastName || null,
          subscription: {
            tier: elevenLabsUserInfo.subscription?.tier || 'free',
            characterCount:
              elevenLabsUserInfo.subscription?.characterCount || 0,
            characterLimit:
              elevenLabsUserInfo.subscription?.characterLimit || 0,
            canExtendCharacterLimit:
              elevenLabsUserInfo.subscription?.canExtendCharacterLimit || false,
            canExtendCharacterLimitCount:
              elevenLabsUserInfo.subscription?.allowedToExtendCharacterLimit ||
              false,
            currency: elevenLabsUserInfo.subscription?.currency || 'USD',
            status: elevenLabsUserInfo.subscription?.status || 'active',
            resetAt: elevenLabsUserInfo.subscription
              ?.nextCharacterCountResetUnix
              ? new Date(
                  elevenLabsUserInfo.subscription.nextCharacterCountResetUnix *
                    1000,
                ).toISOString()
              : null,
            hasOpenInvoice: false,
            availableModels: [],
          },
          features: {
            canUseInstantVoiceCloning:
              elevenLabsUserInfo.subscription?.canUseInstantVoiceCloning ||
              false,
            canUseProfessionalVoiceCloning:
              elevenLabsUserInfo.subscription?.canUseProfessionalVoiceCloning ||
              false,
            canUseVoiceConversion: false,
            canUseDubbing: false,
            canUseVoiceDesign: false,
            canUseCustomVoices: false,
          },
        };
      } catch (_elevenLabsError) {
        // console.error(
        //   '❌ [Billing] Error obteniendo información de ElevenLabs:',
        //   elevenLabsError.message,
        // );
        // console.error('❌ [Billing] Stack trace:', elevenLabsError.stack);
        // Continuar sin la información de ElevenLabs
      }

      // console.log(
      //   `📊 [Billing] Respuesta final para ${accountId}:`,
      //   JSON.stringify(
      //     {
      //       hasElevenLabsAccount: !!elevenLabsAccountInfo,
      //       elevenLabsAccountInfo,
      //     },
      //     null,
      //     2,
      //   ),
      // );

      return {
        success: true,
        data: {
          // Balance interno del cliente
          currentBalance: localBalance.currentBalance,
          creditLimit: localBalance.creditLimit,
          lastPayment: localBalance.lastPayment,
          nextPayment: localBalance.nextPayment,
          usage: localBalance.usage,
          autoRefill: localBalance.autoRefill,

          // Uso de ElevenLabs por este cliente (calculado localmente + datos reales de ElevenLabs)
          elevenLabsUsage: {
            minutesUsed:
              elevenLabsAnalytics?.totalMinutes || clientUsage.totalMinutes,
            tokensUsed: clientUsage.totalTokens,
            callsMade:
              elevenLabsAnalytics?.totalConversations || clientUsage.totalCalls,
            totalCost: elevenLabsAnalytics?.cost || clientUsage.totalCost,
            thisMonth:
              elevenLabsAnalytics?.totalMinutes || clientUsage.totalMinutes,
            lastMonth: 0, // Se puede calcular con datos históricos
            averageDuration: elevenLabsAnalytics?.averageDuration || 0,
            successRate: elevenLabsAnalytics?.successRate || 0,
          },

          // Balance del cliente en dinero (calculado localmente)
          clientBalance: {
            currentBalance: localBalance.currentBalance,
            creditLimit: localBalance.creditLimit,
            currency: 'USD',
          },

          // Información REAL de la cuenta de ElevenLabs
          elevenLabsAccount: elevenLabsAccountInfo,

          // Información del cliente
          account: {
            id: account.id,
            name: account.name,
            email: account.email,
            subscriptionPlan: account.subscriptionPlan,
            createdAt: account.createdAt,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error obteniendo información de balance',
        error: error.message,
      };
    }
  }

  /**
   * Obtener uso detallado por agente
   */
  @Get('usage/agents')
  async getAgentUsage(@Request() req, @Query('agentId') agentId?: string) {
    try {
      const accountId = req.user.accountId;

      // Verificar que el agente pertenece al cliente
      if (agentId) {
        const agent = await this.prisma.agent.findFirst({
          where: {
            id: agentId,
            accountId,
          },
        });

        if (!agent) {
          return {
            success: false,
            message: 'Agente no encontrado o no autorizado',
          };
        }
      }

      // Obtener uso de ElevenLabs
      // Obtener uso de ElevenLabs desde nuestro servicio de tracking interno
      const elevenLabsUsage =
        await this.elevenLabsUsageTrackingService.getClientUsage(
          accountId,
          'month',
        );

      // Obtener uso local de la base de datos
      const localUsage = await this.getLocalAgentUsage(accountId, agentId);

      return {
        success: true,
        data: {
          elevenLabs: elevenLabsUsage,
          local: localUsage,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error obteniendo uso por agente',
        error: error.message,
      };
    }
  }

  /**
   * Obtener historial de pagos y transacciones
   */
  @Get('transactions')
  async getTransactions(
    @Request() req,
    @Query('limit') limit: string = '50',
    @Query('offset') offset: string = '0',
  ) {
    try {
      const accountId = req.user.accountId;

      const transactions = await this.prisma.transaction.findMany({
        where: { accountId },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
        select: {
          id: true,
          type: true,
          amount: true,
          description: true,
          status: true,
          createdAt: true,
          metadata: true,
        },
      });

      return {
        success: true,
        data: transactions,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error obteniendo transacciones',
        error: error.message,
      };
    }
  }

  /**
   * Obtener métodos de pago del cliente
   */
  @Get('payment-methods')
  async getPaymentMethods(@Request() req) {
    try {
      const accountId = req.user.accountId;

      const paymentMethods = await this.prisma.paymentMethod.findMany({
        where: { accountId },
        select: {
          id: true,
          type: true,
          lastFour: true,
          brand: true,
          isDefault: true,
          createdAt: true,
        },
      });

      return {
        success: true,
        data: paymentMethods,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error obteniendo métodos de pago',
        error: error.message,
      };
    }
  }

  // Métodos auxiliares privados

  private async calculateLocalBalance(accountId: string) {
    // Obtener transacciones del cliente
    const transactions = await this.prisma.transaction.findMany({
      where: { accountId },
      orderBy: { createdAt: 'desc' },
    });

    // Calcular balance actual
    const currentBalance = transactions.reduce((total, transaction) => {
      if (transaction.type === 'credit' && transaction.status === 'completed') {
        return total + Number(transaction.amount);
      } else if (
        transaction.type === 'debit' &&
        transaction.status === 'completed'
      ) {
        return total - Number(transaction.amount);
      }
      return total;
    }, 0);

    // Obtener último pago
    const lastPayment = transactions.find(
      (t) => t.type === 'credit' && t.status === 'completed',
    );

    // Obtener configuración de auto-refill
    const autoRefill = await this.prisma.account.findUnique({
      where: { id: accountId },
      select: {
        autoRefillEnabled: true,
        autoRefillThreshold: true,
        autoRefillAmount: true,
      },
    });

    return {
      currentBalance,
      creditLimit: 1000, // Límite por defecto
      lastPayment: lastPayment
        ? {
            amount: Number(lastPayment.amount),
            date: lastPayment.createdAt.toISOString(),
            method: (lastPayment.metadata as any)?.paymentMethod || 'Unknown',
          }
        : null,
      nextPayment: null, // Se puede calcular basado en el plan
      usage: {
        thisMonth: 0, // Se puede calcular con datos de llamadas
        lastMonth: 0,
        projected: 0,
      },
      autoRefill: {
        enabled: autoRefill?.autoRefillEnabled || false,
        threshold: autoRefill?.autoRefillThreshold || 50,
        amount: autoRefill?.autoRefillAmount || 100,
      },
    };
  }

  private async getLocalAgentUsage(accountId: string, agentId?: string) {
    const whereClause: any = { accountId };
    if (agentId) {
      whereClause.agentId = agentId;
    }

    const calls = await this.prisma.call.findMany({
      where: whereClause,
      select: {
        id: true,
        agentId: true,
        duration: true,
        cost: true,
        status: true,
        createdAt: true,
      },
    });

    // Agrupar por agente
    const agentUsage = calls.reduce(
      (acc, call) => {
        const agentId = call.agentId || 'unknown';
        if (!acc[agentId]) {
          acc[agentId] = {
            agentId,
            totalMinutes: 0,
            totalCost: 0,
            conversations: 0,
            averageDuration: 0,
          };
        }

        acc[agentId].totalMinutes += (call.duration || 0) / 60;
        acc[agentId].totalCost += Number(call.cost || 0);
        acc[agentId].conversations += 1;

        return acc;
      },
      {} as Record<string, any>,
    );

    // Calcular duración promedio
    Object.values(agentUsage).forEach((usage: any) => {
      usage.averageDuration =
        usage.conversations > 0 ? usage.totalMinutes / usage.conversations : 0;
    });

    return Object.values(agentUsage);
  }
}
