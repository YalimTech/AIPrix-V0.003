import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin/clients')
@UseGuards(JwtAuthGuard, AdminAuthGuard)
export class AdminClientsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getAllClients(
    @Request() _req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('plan') plan?: string,
    @Query('search') search?: string,
  ) {
    try {
      const pageNum = page ? parseInt(page, 10) : 1;
      const limitNum = limit ? parseInt(limit, 10) : 20;
      const skip = (pageNum - 1) * limitNum;

      const whereClause: any = {};

      if (status) {
        whereClause.status = status;
      }

      if (plan) {
        whereClause.subscriptionPlan = plan;
      }

      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [accounts, total] = await Promise.all([
        this.prisma.account.findMany({
          where: whereClause,
          skip,
          take: limitNum,
          include: {
            _count: {
              select: {
                users: true,
                agents: true,
                calls: true,
                campaigns: true,
                contacts: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.account.count({ where: whereClause }),
      ]);

      return {
        success: true,
        data: {
          accounts,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Error obteniendo clientes: ${error.message}`,
        error: error.message,
      };
    }
  }

  @Get('stats')
  async getClientsStats(@Request() _req) {
    try {
      const [
        totalClients,
        activeClients,
        suspendedClients,
        cancelledClients,
        basicPlan,
        proPlan,
        enterprisePlan,
        recentClients,
      ] = await Promise.all([
        this.prisma.account.count(),
        this.prisma.account.count({ where: { status: 'active' } }),
        this.prisma.account.count({ where: { status: 'suspended' } }),
        this.prisma.account.count({ where: { status: 'cancelled' } }),
        this.prisma.account.count({ where: { subscriptionPlan: 'basic' } }),
        this.prisma.account.count({ where: { subscriptionPlan: 'pro' } }),
        this.prisma.account.count({
          where: { subscriptionPlan: 'enterprise' },
        }),
        this.prisma.account.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 días
            },
          },
        }),
      ]);

      return {
        success: true,
        data: {
          total: totalClients,
          byStatus: {
            active: activeClients,
            suspended: suspendedClients,
            cancelled: cancelledClients,
          },
          byPlan: {
            basic: basicPlan,
            pro: proPlan,
            enterprise: enterprisePlan,
          },
          recentClients,
          growthRate:
            recentClients > 0
              ? ((recentClients / totalClients) * 100).toFixed(2)
              : 0,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Error obteniendo estadísticas: ${error.message}`,
        error: error.message,
      };
    }
  }

  @Get(':accountId')
  async getClientDetails(
    @Param('accountId') accountId: string,
    @Request() _req,
  ) {
    try {
      const account = await this.prisma.account.findUnique({
        where: { id: accountId },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              status: true,
              lastLoginAt: true,
              createdAt: true,
            },
          },
          agents: {
            select: {
              id: true,
              name: true,
              type: true,
              status: true,
              llmProvider: true,
              llmModel: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              calls: true,
              campaigns: true,
              contacts: true,
              phoneNumbers: true,
            },
          },
        },
      });

      if (!account) {
        return {
          success: false,
          message: 'Cliente no encontrado',
        };
      }

      // Obtener estadísticas de uso reciente
      const recentStats = await this.getTenantUsageStats(accountId);

      return {
        success: true,
        data: {
          account,
          usageStats: recentStats,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Error obteniendo detalles del cliente: ${error.message}`,
        error: error.message,
      };
    }
  }

  @Patch(':accountId')
  async updateClient(
    @Param('accountId') accountId: string,
    @Body()
    updateData: {
      name?: string;
      email?: string;
      phone?: string;
      timezone?: string;
      status?: string;
      subscriptionPlan?: string;
      billingEmail?: string;
    },
    @Request() _req,
  ) {
    try {
      const account = await this.prisma.account.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        return {
          success: false,
          message: 'Cliente no encontrado',
        };
      }

      const updatedTenant = await this.prisma.account.update({
        where: { id: accountId },
        data: updateData,
        include: {
          _count: {
            select: {
              users: true,
              agents: true,
              calls: true,
              campaigns: true,
              contacts: true,
            },
          },
        },
      });

      return {
        success: true,
        message: 'Cliente actualizado exitosamente',
        data: updatedTenant,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error actualizando cliente: ${error.message}`,
        error: error.message,
      };
    }
  }

  @Patch(':accountId/status')
  @HttpCode(HttpStatus.OK)
  async updateClientStatus(
    @Param('accountId') accountId: string,
    @Body() body: { status: string; reason?: string },
    @Request() _req,
  ) {
    try {
      const account = await this.prisma.account.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        return {
          success: false,
          message: 'Cliente no encontrado',
        };
      }

      const updatedTenant = await this.prisma.account.update({
        where: { id: accountId },
        data: { status: body.status },
      });

      // Log del cambio de estado
      await this.prisma.errorLog.create({
        data: {
          accountId,
          level: 'info',
          category: 'admin',
          message: `Estado del cliente ${accountId} cambiado a ${body.status}`,
          context: {
            accountId,
            oldStatus: account.status,
            newStatus: body.status,
            reason: body.reason,
            changedBy: _req.user.id,
          },
        },
      });

      return {
        success: true,
        message: `Estado del cliente actualizado a ${body.status}`,
        data: {
          id: updatedTenant.id,
          name: updatedTenant.name,
          status: updatedTenant.status,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Error actualizando estado: ${error.message}`,
        error: error.message,
      };
    }
  }

  @Patch(':accountId/plan')
  @HttpCode(HttpStatus.OK)
  async updateSubscriptionPlan(
    @Param('accountId') accountId: string,
    @Body() body: { plan: string; reason?: string },
    @Request() _req,
  ) {
    try {
      const validPlans = ['basic', 'pro', 'enterprise'];

      if (!validPlans.includes(body.plan)) {
        return {
          success: false,
          message: 'Plan de suscripción no válido',
        };
      }

      const account = await this.prisma.account.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        return {
          success: false,
          message: 'Cliente no encontrado',
        };
      }

      const updatedTenant = await this.prisma.account.update({
        where: { id: accountId },
        data: { subscriptionPlan: body.plan },
      });

      // Log del cambio de plan
      await this.prisma.errorLog.create({
        data: {
          accountId,
          level: 'info',
          category: 'billing',
          message: `Plan de suscripción del cliente ${accountId} cambiado a ${body.plan}`,
          context: {
            accountId,
            oldPlan: account.subscriptionPlan,
            newPlan: body.plan,
            reason: body.reason,
            changedBy: _req.user.id,
          },
        },
      });

      return {
        success: true,
        message: `Plan de suscripción actualizado a ${body.plan}`,
        data: {
          id: updatedTenant.id,
          name: updatedTenant.name,
          subscriptionPlan: updatedTenant.subscriptionPlan,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Error actualizando plan: ${error.message}`,
        error: error.message,
      };
    }
  }

  @Get(':accountId/usage')
  async getClientUsage(
    @Request() _req: any,
    @Param('accountId') accountId: string,
    @Query('period') period?: string, // 'week', 'month', 'quarter', 'year'
  ) {
    try {
      const account = await this.prisma.account.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        return {
          success: false,
          message: 'Cliente no encontrado',
        };
      }

      const usageStats = await this.getTenantUsageStats(accountId, period);

      return {
        success: true,
        data: usageStats,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error obteniendo uso del cliente: ${error.message}`,
        error: error.message,
      };
    }
  }

  @Get(':accountId/billing')
  async getBillingInfo(@Param('accountId') accountId: string, @Request() _req) {
    try {
      const account = await this.prisma.account.findUnique({
        where: { id: accountId },
        select: {
          id: true,
          name: true,
          email: true,
          subscriptionPlan: true,
          billingEmail: true,
          createdAt: true,
        },
      });

      if (!account) {
        return {
          success: false,
          message: 'Cliente no encontrado',
        };
      }

      // Obtener límites del plan
      const planLimits = this.getPlanLimits(account.subscriptionPlan);

      // Obtener uso actual
      const currentUsage = await this.getCurrentUsage(accountId);

      return {
        success: true,
        data: {
          account,
          planLimits,
          currentUsage,
          usagePercentage: {
            calls: Math.round((currentUsage.calls / planLimits.calls) * 100),
            agents: Math.round((currentUsage.agents / planLimits.agents) * 100),
            contacts: Math.round(
              (currentUsage.contacts / planLimits.contacts) * 100,
            ),
            storage: Math.round(
              (currentUsage.storage / planLimits.storage) * 100,
            ),
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Error obteniendo información de facturación: ${error.message}`,
        error: error.message,
      };
    }
  }

  // Métodos auxiliares privados
  private async getTenantUsageStats(
    accountId: string,
    period: string = 'month',
  ) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const [calls, campaigns, contacts] = await Promise.all([
      this.prisma.call.count({
        where: {
          accountId,
          createdAt: { gte: startDate },
        },
      }),
      this.prisma.campaign.count({
        where: {
          accountId,
          createdAt: { gte: startDate },
        },
      }),
      this.prisma.contact.count({
        where: {
          accountId,
          createdAt: { gte: startDate },
        },
      }),
    ]);

    return {
      period,
      startDate,
      endDate: now,
      calls,
      campaigns,
      contacts,
      totalActivity: calls + campaigns + contacts,
    };
  }

  private getPlanLimits(plan: string) {
    const limits = {
      basic: {
        calls: 1000,
        agents: 3,
        contacts: 10000,
        storage: 1024, // MB
        users: 5,
        price: 29.99,
      },
      pro: {
        calls: 10000,
        agents: 10,
        contacts: 100000,
        storage: 10240, // MB
        users: 25,
        price: 99.99,
      },
      enterprise: {
        calls: 100000,
        agents: -1, // Ilimitado
        contacts: -1, // Ilimitado
        storage: 102400, // MB
        users: -1, // Ilimitado
        price: 299.99,
      },
    };

    return limits[plan] || limits.basic;
  }

  private async getCurrentUsage(accountId: string) {
    const [calls, agents, contacts, users] = await Promise.all([
      this.prisma.call.count({ where: { accountId } }),
      this.prisma.agent.count({ where: { accountId } }),
      this.prisma.contact.count({ where: { accountId } }),
      this.prisma.user.count({ where: { accountId } }),
    ]);

    return {
      calls,
      agents,
      contacts,
      users,
      storage: 0, // Implementar cálculo de almacenamiento si es necesario
    };
  }
}
