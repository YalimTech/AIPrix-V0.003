import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCampaignDto,
  // CampaignType,
  CampaignStatus,
} from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import {
  CampaignDto,
  CampaignStatsDto,
  CampaignExecutionDto,
} from './dto/campaign.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WebSocketService } from '../websocket/websocket.service';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly webSocketService: WebSocketService,
  ) {}

  async create(
    createCampaignDto: CreateCampaignDto,
    accountId: string,
  ): Promise<CampaignDto> {
    // Validar que el agente existe y pertenece al account
    const agent = await this.prisma.agent.findFirst({
      where: { id: createCampaignDto.agentId, accountId },
    });

    if (!agent) {
      throw new BadRequestException('Agente no encontrado');
    }

    // Validar que la lista de contactos existe y pertenece al account
    const contactList = await this.prisma.contactList.findFirst({
      where: { id: createCampaignDto.contactListId, accountId },
    });

    if (!contactList) {
      throw new BadRequestException('Lista de contactos no encontrada');
    }

    // Validar fechas
    if (
      createCampaignDto.scheduledStartDate &&
      createCampaignDto.scheduledEndDate
    ) {
      if (
        createCampaignDto.scheduledStartDate >=
        createCampaignDto.scheduledEndDate
      ) {
        throw new BadRequestException(
          'La fecha de inicio debe ser anterior a la fecha de fin',
        );
      }
    }

    const campaign = await this.prisma.campaign.create({
      data: {
        ...createCampaignDto,
        accountId,
        status: CampaignStatus.DRAFT,
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            voiceName: true,
          },
        },
        contactList: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    this.logger.log(`Campaña creada: ${campaign.id} - ${campaign.name}`);
    this.eventEmitter.emit('campaign.created', {
      campaignId: campaign.id,
      accountId,
    });

    // Notificar via WebSocket
    this.webSocketService.logCampaignUpdate(accountId, {
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      type: 'created',
    });

    return this.mapToDto(campaign);
  }

  async findAll(
    accountId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ campaigns: CampaignDto[]; total: number }> {
    const skip = (page - 1) * limit;

    const [campaigns, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where: { accountId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              voiceName: true,
            },
          },
          contactList: {
            select: {
              id: true,
              name: true,
            },
          },
          calls: {
            select: {
              id: true,
              status: true,
              duration: true,
              success: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      }),
      this.prisma.campaign.count({ where: { accountId } }),
    ]);

    return {
      campaigns: campaigns.map((campaign) => this.mapToDto(campaign)),
      total,
    };
  }

  async findOne(id: string, accountId: string): Promise<CampaignDto> {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, accountId },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            voiceName: true,
          },
        },
        contactList: {
          select: {
            id: true,
            name: true,
          },
        },
        calls: {
          select: {
            id: true,
            status: true,
            duration: true,
            success: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaña no encontrada');
    }

    return this.mapToDto(campaign);
  }

  async update(
    id: string,
    updateCampaignDto: UpdateCampaignDto,
    accountId: string,
  ): Promise<CampaignDto> {
    const existingCampaign = await this.findOne(id, accountId);

    // Validar que no se pueda cambiar el estado de una campaña completada
    if (
      existingCampaign.status === CampaignStatus.COMPLETED &&
      updateCampaignDto.status
    ) {
      throw new BadRequestException(
        'No se puede modificar una campaña completada',
      );
    }

    // Validar fechas si se proporcionan
    if (
      updateCampaignDto.scheduledStartDate &&
      updateCampaignDto.scheduledEndDate
    ) {
      if (
        updateCampaignDto.scheduledStartDate >=
        updateCampaignDto.scheduledEndDate
      ) {
        throw new BadRequestException(
          'La fecha de inicio debe ser anterior a la fecha de fin',
        );
      }
    }

    const campaign = await this.prisma.campaign.update({
      where: { id },
      data: updateCampaignDto,
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            voiceName: true,
          },
        },
        contactList: {
          select: {
            id: true,
            name: true,
          },
        },
        calls: {
          select: {
            id: true,
            status: true,
            duration: true,
            success: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    this.logger.log(`Campaña actualizada: ${campaign.id} - ${campaign.name}`);
    this.eventEmitter.emit('campaign.updated', {
      campaignId: campaign.id,
      accountId,
    });

    return this.mapToDto(campaign);
  }

  async remove(id: string, accountId: string): Promise<void> {
    const campaign = await this.findOne(id, accountId);

    // No permitir eliminar campañas en ejecución
    if (campaign.status === CampaignStatus.RUNNING) {
      throw new BadRequestException(
        'No se puede eliminar una campaña en ejecución',
      );
    }

    await this.prisma.campaign.delete({
      where: { id },
    });

    this.logger.log(`Campaña eliminada: ${id}`);
    this.eventEmitter.emit('campaign.deleted', { campaignId: id, accountId });
  }

  async start(id: string, accountId: string): Promise<CampaignExecutionDto> {
    const campaign = await this.findOne(id, accountId);

    if (
      campaign.status !== CampaignStatus.DRAFT &&
      campaign.status !== CampaignStatus.PAUSED
    ) {
      throw new BadRequestException(
        'Solo se pueden iniciar campañas en estado draft o pausadas',
      );
    }

    // Actualizar estado a running
    await this.prisma.campaign.update({
      where: { id },
      data: { status: CampaignStatus.RUNNING },
    });

    // Obtener contactos de la lista
    const contacts = await this.prisma.contactListContact.findMany({
      where: { contactListId: campaign.contactListId },
      include: { contact: true },
    });

    this.logger.log(
      `Iniciando campaña: ${id} con ${contacts.length} contactos`,
    );
    this.eventEmitter.emit('campaign.started', {
      campaignId: id,
      accountId,
      contactCount: contacts.length,
    });

    // Aquí se implementaría la lógica de ejecución de la campaña
    // Por ahora, simulamos el inicio
    return {
      campaignId: id,
      status: 'starting',
      currentCall: 0,
      totalCalls: contacts.length,
      progress: 0,
      estimatedCompletion: new Date(Date.now() + contacts.length * 60000), // 1 min por llamada estimado
    };
  }

  async pause(id: string, accountId: string): Promise<void> {
    const campaign = await this.findOne(id, accountId);

    if (campaign.status !== CampaignStatus.RUNNING) {
      throw new BadRequestException(
        'Solo se pueden pausar campañas en ejecución',
      );
    }

    await this.prisma.campaign.update({
      where: { id },
      data: { status: CampaignStatus.PAUSED },
    });

    this.logger.log(`Campaña pausada: ${id}`);
    this.eventEmitter.emit('campaign.paused', { campaignId: id, accountId });
  }

  async getStats(id: string, accountId: string): Promise<CampaignStatsDto> {
    await this.findOne(id, accountId); // Verificar que existe

    const calls = await this.prisma.call.findMany({
      where: { campaignId: id, accountId },
    });

    const totalCalls = calls.length;
    const completedCalls = calls.filter(
      (call) => call.status === 'completed',
    ).length;
    const successfulCalls = calls.filter(
      (call) => call.success === true,
    ).length;
    const failedCalls = calls.filter((call) => call.success === false).length;

    const averageDuration =
      completedCalls > 0
        ? calls
            .filter((call) => call.duration)
            .reduce((sum, call) => sum + (call.duration || 0), 0) /
          completedCalls
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
    };
  }

  private mapToDto(campaign: any): CampaignDto {
    return {
      id: campaign.id,
      accountId: campaign.accountId,
      agentId: campaign.agentId,
      contactListId: campaign.contactListId,
      name: campaign.name,
      description: campaign.description,
      status: campaign.status,
      type: campaign.type,
      scheduledStartDate: campaign.scheduledStartDate,
      scheduledEndDate: campaign.scheduledEndDate,
      maxRetries: campaign.maxRetries,
      retryDelayMinutes: campaign.retryDelayMinutes,
      timezone: campaign.timezone,
      scheduleConfig: campaign.scheduleConfig,
      webhookUrl: campaign.webhookUrl,
      notes: campaign.notes,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
      agent: campaign.agent,
      contactList: campaign.contactList,
      calls: campaign.calls,
    };
  }
}
