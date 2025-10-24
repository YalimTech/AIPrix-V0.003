import {
    BadRequestException,
    forwardRef,
    Inject,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { ElevenLabsService } from '../integrations/elevenlabs/elevenlabs.service';
import { PrismaService } from '../prisma/prisma.service';
import { BidirectionalSyncService } from './bidirectional-sync.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';

@Injectable()
export class AgentsService {
  private readonly logger = new Logger(AgentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => ElevenLabsService))
    private readonly elevenLabsService: ElevenLabsService,
    private readonly bidirectionalSyncService: BidirectionalSyncService,
  ) {}

  async create(createAgentDto: CreateAgentDto, accountId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundException('Tenant no encontrado');
    }

    this.logger.debug(
      `[AgentsService] Received CreateAgentDto for account ${accountId}:`,
      createAgentDto,
    );

    // 1. Crear el agente en nuestra base de datos primero
    const newAgent = await this.prisma.agent.create({
      data: {
        ...createAgentDto,
        accountId,
      },
    });

    // Validar que se proporcione una voz válida antes de crear en ElevenLabs
    if (!newAgent.voiceName || newAgent.voiceName.trim() === '') {
      this.logger.error(
        `[AgentsService] Intento de crear agente sin voz válida. voiceName: ${newAgent.voiceName}`,
      );
      // Eliminar el agente creado localmente
      await this.prisma.agent.delete({ where: { id: newAgent.id } });
      throw new BadRequestException(
        'Se debe proporcionar una voz válida de ElevenLabs para crear el agente. Por favor, selecciona una voz en el formulario.',
      );
    }

    try {
      // 2. Preparar y crear el agente en ElevenLabs según la documentación oficial
      // Enviar campos en la estructura correcta que espera ElevenLabsService.createAgent
      const elevenLabsPayload = {
        name: newAgent.name,
        systemPrompt:
          (newAgent as any).preMadePrompt ||
          (newAgent as any).systemPrompt ||
          'Eres un asistente telefónico profesional y amigable.',
        firstMessage:
          (newAgent as any).openingMessage || newAgent.description || 'Hola, ¿en qué puedo ayudarte hoy?',
        language: newAgent.language?.toLowerCase() === 'spanish' ? 'es' : newAgent.language?.toLowerCase() || 'es',
        temperature: newAgent.temperature || 0.7,
        voiceId: newAgent.voiceName, // ID de la voz (debe ser proporcionado por el usuario)
        llmModel: (newAgent as any).llmModel || 'gpt-4o-mini', // Modelo LLM por defecto
        maxTokens: (newAgent as any).maxTokens || 150, // Tokens por defecto
        interruptSensitivity: (newAgent as any).interruptSensitivity || false,
        responseSpeed: (newAgent as any).responseSpeed !== false, // Default true
        initialMessageDelay: (newAgent as any).initialMessageDelay || 2000,
        doubleCall: (newAgent as any).doubleCall || false,
        vmDetection: (newAgent as any).vmDetection || false,
        webhookUrl: (newAgent as any).webhookUrl || null,
      };

      this.logger.log(
        `[create] Prompt que se enviará a ElevenLabs: ${elevenLabsPayload.systemPrompt}`,
      );

      this.logger.debug(
        `[AgentsService] Creating agent on ElevenLabs with payload:`,
        elevenLabsPayload,
      );
      this.logger.log(`Creando agente en ElevenLabs con payload...`);
      const elevenLabsAgent = await this.elevenLabsService.createAgent(
        accountId,
        elevenLabsPayload,
      );

      // 3. Actualizar nuestro agente con el ID de ElevenLabs
      if (elevenLabsAgent && elevenLabsAgent.agent_id) {
        return await this.prisma.agent.update({
          where: { id: newAgent.id },
          data: { elevenLabsAgentId: elevenLabsAgent.agent_id },
        });
      }
    } catch (error) {
      this.logger.error(
        `Fallo al crear agente en ElevenLabs. Revirtiendo creación local...`,
        error,
      );
      // Si falla la creación en ElevenLabs, eliminamos el agente que creamos localmente
      await this.prisma.agent.delete({ where: { id: newAgent.id } });
      throw new BadRequestException(
        `Error creando agente en ElevenLabs: ${error.message}`,
      );
    }

    return newAgent;
  }

  async findAll(accountId: string) {
    return this.prisma.agent.findMany({
      where: { accountId },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        _count: {
          select: {
            campaigns: true,
            calls: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, accountId: string) {
    const agent = await this.prisma.agent.findFirst({
      where: {
        id,
        accountId,
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        _count: {
          select: {
            campaigns: true,
            calls: true,
          },
        },
      },
    });

    if (!agent) {
      throw new NotFoundException('Agente no encontrado');
    }

    return agent;
  }

  async update(id: string, updateAgentDto: UpdateAgentDto, accountId: string) {
    const existingAgent = await this.findOne(id, accountId);

    const updatedAgentInDb = await this.prisma.agent.update({
      where: { id },
      data: updateAgentDto,
    });

    try {
      // Construir el payload según la documentación oficial de ElevenLabs
      // Solo enviar campos que ElevenLabs acepta en su API de actualización
      const elevenLabsPayload = {
        name: updatedAgentInDb.name,
        systemPrompt:
          updatedAgentInDb.preMadePrompt ||
          updatedAgentInDb.systemPrompt ||
          'Eres un asistente telefónico profesional y amigable.',
        firstMessage:
          updatedAgentInDb.description || 'Hola, ¿en qué puedo ayudarte hoy?',
        language: updatedAgentInDb.language?.toLowerCase() || 'es',
        temperature: updatedAgentInDb.temperature || 0.7,
        voiceId: updatedAgentInDb.voiceName, // ID de la voz
        // Campos adicionales que ElevenLabs puede procesar
        webhookUrl: (updatedAgentInDb as any).webhookUrl || null,
      };

      this.logger.log(
        `[update] Prompt que se enviará a ElevenLabs: ${elevenLabsPayload.systemPrompt}`,
      );

      this.logger.log(
        `[update] Payload para ElevenLabs: ${JSON.stringify(elevenLabsPayload, null, 2)}`,
      );

      if (existingAgent.elevenLabsAgentId) {
        this.logger.log(
          `Actualizando agente ${existingAgent.elevenLabsAgentId} en ElevenLabs...`,
        );
        await this.elevenLabsService.updateAgent(
          accountId,
          existingAgent.elevenLabsAgentId,
          elevenLabsPayload,
        );
      } else {
        this.logger.log(
          `Creando agente en ElevenLabs durante la actualización (no existía antes)...`,
        );
        const elevenLabsAgent = await this.elevenLabsService.createAgent(
          accountId,
          elevenLabsPayload,
        );
        if (elevenLabsAgent && elevenLabsAgent.agent_id) {
          return await this.prisma.agent.update({
            where: { id: updatedAgentInDb.id },
            data: { elevenLabsAgentId: elevenLabsAgent.agent_id },
          });
        }
      }
    } catch (error) {
      this.logger.error(
        `Fallo al actualizar/crear agente en ElevenLabs para el agente local ${id}`,
        error,
      );
      this.logger.error(`Detalles del error: ${error.message}`, error.stack);
      // No revertimos el cambio local, pero sí notificamos el fallo de sincronización.
      // Podríamos añadir un estado 'sync_failed' al agente si fuera necesario.
      throw new BadRequestException(
        `La configuración del agente se guardó, pero falló la sincronización con ElevenLabs: ${error.message}`,
      );
    }

    return updatedAgentInDb;
  }

  async remove(id: string, accountId: string) {
    const agentToDelete = await this.findOne(id, accountId);

    // Verificar si el agente tiene campañas activas
    const activeCampaigns = await this.prisma.campaign.findMany({
      where: {
        agentId: id,
        status: {
          in: ['running', 'scheduled'],
        },
      },
    });

    if (activeCampaigns.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar el agente porque tiene campañas activas',
      );
    }

    if (agentToDelete.elevenLabsAgentId) {
      try {
        this.logger.log(
          `Eliminando agente ${agentToDelete.elevenLabsAgentId} de ElevenLabs...`,
        );
        await this.elevenLabsService.deleteAgent(
          accountId,
          agentToDelete.elevenLabsAgentId,
        );
      } catch (error) {
        this.logger.error(
          `Fallo al eliminar el agente de ElevenLabs: ${agentToDelete.elevenLabsAgentId}. El agente local se eliminará de todas formas.`,
          error,
        );
        // Decidimos continuar y eliminar el agente localmente aunque falle en ElevenLabs para no bloquear al usuario.
        // Se podría añadir un log de errores para limpieza manual.
      }
    }

    return this.prisma.agent.delete({
      where: { id },
    });
  }

  async activate(id: string, accountId: string) {
    return this.update(id, { status: 'active' }, accountId);
  }

  async deactivate(id: string, accountId: string) {
    return this.update(id, { status: 'inactive' }, accountId);
  }

  async setTesting(id: string, accountId: string) {
    return this.update(id, { status: 'testing' }, accountId);
  }

  async getStats(id: string, accountId: string) {
    const agent = await this.findOne(id, accountId);

    const stats = await this.prisma.agent.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            campaigns: true,
            calls: true,
          },
        },
        calls: {
          select: {
            status: true,
            success: true,
            duration: true,
            createdAt: true,
          },
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 días
            },
          },
        },
      },
    });

    const callsByStatus = stats.calls.reduce((acc, call) => {
      acc[call.status] = (acc[call.status] || 0) + 1;
      return acc;
    }, {});

    const successRate =
      stats.calls.length > 0
        ? (stats.calls.filter((call) => call.success).length /
            stats.calls.length) *
          100
        : 0;

    const avgDuration =
      stats.calls.length > 0
        ? stats.calls.reduce((sum, call) => sum + (call.duration || 0), 0) /
          stats.calls.length
        : 0;

    return {
      agent: {
        id: agent.id,
        name: agent.name,
        type: agent.type,
        status: agent.status,
        llmProvider: agent.llmProvider,
        llmModel: agent.llmModel,
      },
      stats: {
        totalCampaigns: stats._count.campaigns,
        totalCalls: stats._count.calls,
        callsLast30Days: stats.calls.length,
        callsByStatus,
        successRate: Math.round(successRate * 100) / 100,
        avgDuration: Math.round(avgDuration),
      },
    };
  }

  async testAgent(id: string, accountId: string, testPrompt: string) {
    const agent = await this.findOne(id, accountId);

    if (agent.status !== 'active' && agent.status !== 'testing') {
      throw new BadRequestException(
        'El agente debe estar activo o en modo testing para realizar pruebas',
      );
    }

    // Aquí se integraría con el orquestador de LLM
    // Por ahora retornamos una respuesta simulada
    return {
      agentId: agent.id,
      agentName: agent.name,
      testPrompt,
      response: `Respuesta simulada del agente ${agent.name} para: "${testPrompt}"`,
      timestamp: new Date(),
      status: 'success',
    };
  }

  async duplicate(id: string, accountId: string, newName: string) {
    const originalAgent = await this.findOne(id, accountId);

    // Verificar que el agente original tenga un ID de ElevenLabs
    if (!originalAgent.elevenLabsAgentId) {
      this.logger.warn(
        `El agente ${id} no tiene un elevenLabsAgentId. Creando duplicado sin ElevenLabs.`,
      );

      // Si no tiene elevenLabsAgentId, crear un duplicado local sin sincronizar con ElevenLabs
      const duplicateData: any = {
        name: newName,
        description: originalAgent.description,
        type: originalAgent.type,
        status: 'inactive' as const,
        llmProvider: originalAgent.llmProvider,
        llmModel: originalAgent.llmModel,
        fallbackProvider: originalAgent.fallbackProvider,
        maxTokens: originalAgent.maxTokens,
        voiceName: originalAgent.voiceName,
        initialMessageDelay: originalAgent.initialMessageDelay,
        preMadePrompt: originalAgent.preMadePrompt,
        language: (originalAgent as any).language,
        temperature: (originalAgent as any).temperature,
        doubleCall: (originalAgent as any).doubleCall,
        vmDetection: (originalAgent as any).vmDetection,
        interruptSensitivity: (originalAgent as any).interruptSensitivity,
        responseSpeed: (originalAgent as any).responseSpeed,
        webhookUrl: (originalAgent as any).webhookUrl,
        callTransferType: (originalAgent as any).callTransferType,
        callTransferPhoneNumber: (originalAgent as any).callTransferPhoneNumber,
        callTransferKeywords: (originalAgent as any).callTransferKeywords,
        callTransferBusinessHours: (originalAgent as any)
          .callTransferBusinessHours,
        calendarBookingEnabled: (originalAgent as any).calendarBookingEnabled,
        calendarBookingProvider: (originalAgent as any).calendarBookingProvider,
        calendarBookingId: (originalAgent as any).calendarBookingId,
        calendarBookingTimezone: (originalAgent as any).calendarBookingTimezone,
      };

      // Crear el agente usando el método create que construye el payload correctamente
      return this.create(duplicateData, accountId);
    }

    // Si tiene elevenLabsAgentId, usar el endpoint de duplicación de ElevenLabs
    try {
      this.logger.log(`Duplicando agente ${id} en ElevenLabs...`);
      const elevenLabsDuplicate = await this.elevenLabsService.duplicateAgent(
        accountId,
        originalAgent.elevenLabsAgentId,
        newName,
      );

      // Crear el agente duplicado en nuestra base de datos
      const duplicateData: any = {
        name: newName,
        description: originalAgent.description,
        type: originalAgent.type,
        status: 'inactive' as const,
        llmProvider: originalAgent.llmProvider,
        llmModel: originalAgent.llmModel,
        fallbackProvider: originalAgent.fallbackProvider,
        maxTokens: originalAgent.maxTokens,
        voiceName: originalAgent.voiceName,
        initialMessageDelay: originalAgent.initialMessageDelay,
        preMadePrompt: originalAgent.preMadePrompt,
        language: (originalAgent as any).language,
        temperature: (originalAgent as any).temperature,
        doubleCall: (originalAgent as any).doubleCall,
        vmDetection: (originalAgent as any).vmDetection,
        interruptSensitivity: (originalAgent as any).interruptSensitivity,
        responseSpeed: (originalAgent as any).responseSpeed,
        webhookUrl: (originalAgent as any).webhookUrl,
        callTransferType: (originalAgent as any).callTransferType,
        callTransferPhoneNumber: (originalAgent as any).callTransferPhoneNumber,
        callTransferKeywords: (originalAgent as any).callTransferKeywords,
        callTransferBusinessHours: (originalAgent as any)
          .callTransferBusinessHours,
        calendarBookingEnabled: (originalAgent as any).calendarBookingEnabled,
        calendarBookingProvider: (originalAgent as any).calendarBookingProvider,
        calendarBookingId: (originalAgent as any).calendarBookingId,
        calendarBookingTimezone: (originalAgent as any).calendarBookingTimezone,
        elevenLabsAgentId: elevenLabsDuplicate.agent_id,
      };

      // Crear el agente en nuestra base de datos
      const newAgent = await this.prisma.agent.create({
        data: {
          ...duplicateData,
          accountId,
        },
      });

      this.logger.log(`Agente duplicado creado con ID: ${newAgent.id}`);
      return newAgent;
    } catch (error) {
      this.logger.error(
        `Error duplicando agente en ElevenLabs: ${error.message}`,
      );
      throw error;
    }
  }

  // ===== MÉTODOS ESPECÍFICOS PARA DASHBOARD DEL CLIENTE =====

  async getAgentConfig(agentId: string, accountId: string) {
    const agent = await this.prisma.agent.findFirst({
      where: { id: agentId, accountId },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        status: true,
        llmProvider: true,
        llmModel: true,
        fallbackProvider: true,
        maxTokens: true,
        voiceName: true,
        initialMessageDelay: true,
        preMadePrompt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!agent) {
      throw new NotFoundException('Agente no encontrado');
    }

    return {
      success: true,
      data: agent,
    };
  }

  async updateAgentConfig(agentId: string, configData: any, accountId: string) {
    const agent = await this.prisma.agent.findFirst({
      where: { id: agentId, accountId },
    });

    if (!agent) {
      throw new NotFoundException('Agente no encontrado');
    }

    const updatedAgent = await this.prisma.agent.update({
      where: { id: agentId },
      data: configData,
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        status: true,
        llmProvider: true,
        llmModel: true,
        fallbackProvider: true,
        maxTokens: true,
        voiceName: true,
        initialMessageDelay: true,
        preMadePrompt: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      message: 'Configuración del agente actualizada exitosamente',
      data: updatedAgent,
    };
  }

  async getVoiceOptions() {
    // Opciones de voz disponibles (integración con ElevenLabs)
    const voiceOptions = [
      { id: 'echo', name: 'Echo', gender: 'male', language: 'es' },
      { id: 'fable', name: 'Fable', gender: 'male', language: 'es' },
      { id: 'onyx', name: 'Onyx', gender: 'male', language: 'es' },
      { id: 'nova', name: 'Nova', gender: 'female', language: 'es' },
      { id: 'shimmer', name: 'Shimmer', gender: 'female', language: 'es' },
      // Voces adicionales de ElevenLabs
      { id: 'rachel', name: 'Rachel', gender: 'female', language: 'es' },
      { id: 'domi', name: 'Domi', gender: 'female', language: 'es' },
      { id: 'bella', name: 'Bella', gender: 'female', language: 'es' },
      { id: 'antoni', name: 'Antoni', gender: 'male', language: 'es' },
      { id: 'elli', name: 'Elli', gender: 'female', language: 'es' },
      { id: 'josh', name: 'Josh', gender: 'male', language: 'es' },
      { id: 'arnold', name: 'Arnold', gender: 'male', language: 'es' },
      { id: 'adam', name: 'Adam', gender: 'male', language: 'es' },
      { id: 'sam', name: 'Sam', gender: 'male', language: 'es' },
    ];

    return {
      success: true,
      data: voiceOptions,
    };
  }

  async getLLMModels() {
    // Modelos de LLM disponibles según documentación oficial 2025
    const llmModels = {
      openai: [
        {
          id: 'gpt-5-pro',
          name: 'GPT-5 Pro',
          description: 'Modelo más avanzado de OpenAI (2025)',
          maxTokens: 128000,
          cost: 'high',
        },
        {
          id: 'gpt-4-turbo',
          name: 'GPT-4 Turbo',
          description: 'Modelo rápido y eficiente',
          maxTokens: 128000,
          cost: 'medium',
        },
        {
          id: 'gpt-4',
          name: 'GPT-4',
          description: 'Modelo estándar de GPT-4',
          maxTokens: 8192,
          cost: 'medium',
        },
        {
          id: 'gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          description: 'Modelo económico y rápido',
          maxTokens: 4096,
          cost: 'low',
        },
      ],
      gemini: [
        {
          id: 'gemini-2.5-pro',
          name: 'Gemini 2.5 Pro',
          description: 'Modelo más avanzado de Google (2025)',
          maxTokens: 1000000,
          cost: 'high',
        },
        {
          id: 'gemini-1.5-pro',
          name: 'Gemini 1.5 Pro',
          description: 'Modelo Pro de Gemini',
          maxTokens: 2000000,
          cost: 'medium',
        },
        {
          id: 'gemini-1.5-flash',
          name: 'Gemini 1.5 Flash',
          description: 'Modelo rápido de Gemini',
          maxTokens: 1000000,
          cost: 'low',
        },
      ],
    };

    return {
      success: true,
      data: llmModels,
    };
  }

  async validateAgentConfig(
    agentId: string,
    configData: any,
    accountId: string,
  ) {
    const agent = await this.prisma.agent.findFirst({
      where: { id: agentId, accountId },
    });

    if (!agent) {
      throw new NotFoundException('Agente no encontrado');
    }

    const validationErrors: string[] = [];
    const warnings: string[] = [];

    // Validar prompt
    if (configData.preMadePrompt) {
      if (configData.preMadePrompt.length < 10) {
        validationErrors.push('El prompt debe tener al menos 10 caracteres');
      }
      if (configData.preMadePrompt.length > 4000) {
        validationErrors.push('El prompt no debe exceder 4000 caracteres');
      }
    }

    // Validar maxTokens
    if (configData.maxTokens) {
      if (configData.maxTokens < 100) {
        validationErrors.push('maxTokens debe ser al menos 100');
      }
      if (configData.maxTokens > 8000) {
        warnings.push('maxTokens muy alto puede causar latencia');
      }
    }

    // Validar initialMessageDelay
    if (configData.initialMessageDelay) {
      if (configData.initialMessageDelay < 500) {
        validationErrors.push('initialMessageDelay debe ser al menos 500ms');
      }
      if (configData.initialMessageDelay > 10000) {
        warnings.push('initialMessageDelay muy alto puede causar abandono');
      }
    }

    // Validar proveedor y modelo
    if (configData.llmProvider && configData.llmModel) {
      const models = await this.getLLMModels();
      const providerModels = models.data[configData.llmProvider];

      if (!providerModels) {
        validationErrors.push(`Proveedor ${configData.llmProvider} no válido`);
      } else {
        const modelExists = providerModels.some(
          (model) => model.id === configData.llmModel,
        );
        if (!modelExists) {
          validationErrors.push(
            `Modelo ${configData.llmModel} no válido para ${configData.llmProvider}`,
          );
        }
      }
    }

    return {
      success: validationErrors.length === 0,
      data: {
        valid: validationErrors.length === 0,
        errors: validationErrors,
        warnings,
        configData,
      },
    };
  }

  /**
   * Sincroniza todos los agentes existentes de ElevenLabs con la base de datos local
   */
  async syncElevenLabsAgents(accountId: string) {
    try {
      this.logger.log(
        `🔄 Iniciando sincronización de agentes de ElevenLabs para cuenta ${accountId}`,
      );

      // 1. Obtener todos los agentes de ElevenLabs
      const elevenLabsResponse =
        await this.elevenLabsService.getAgents(accountId);
      const elevenLabsAgents = elevenLabsResponse.agents || [];

      this.logger.log(
        `📋 Encontrados ${elevenLabsAgents.length} agentes en ElevenLabs`,
      );

      const syncResults = {
        total: elevenLabsAgents.length,
        created: 0,
        updated: 0,
        skipped: 0,
        errors: 0,
        details: [] as any[],
      };

      // 2. Para cada agente de ElevenLabs, verificar si existe en nuestra base de datos
      for (const elevenLabsAgent of elevenLabsAgents) {
        try {
          // Buscar si ya existe un agente con este elevenLabsAgentId
          const existingAgent = await this.prisma.agent.findFirst({
            where: {
              elevenLabsAgentId: elevenLabsAgent.agent_id,
              accountId: accountId,
            },
          });

          if (existingAgent) {
            // Actualizar agente existente
            await this.prisma.agent.update({
              where: { id: existingAgent.id },
              data: {
                name: elevenLabsAgent.name,
                description:
                  (elevenLabsAgent as any).conversation_config?.first_message ||
                  '',
                status: 'active', // Asumir que los agentes de ElevenLabs están activos
                // Mapear otros campos según sea necesario
                systemPrompt:
                  (elevenLabsAgent as any).conversation_config?.system_prompt ||
                  '',
                language:
                  (elevenLabsAgent as any).conversation_config?.language ||
                  'es',
                temperature:
                  (elevenLabsAgent as any).conversation_config?.temperature ||
                  0.7,
                voiceName:
                  (elevenLabsAgent as any).conversation_config?.voice_id ||
                  null,
                maxTokens:
                  (elevenLabsAgent as any).conversation_config?.max_tokens ||
                  1000,
              },
            });

            syncResults.updated++;
            syncResults.details.push({
              agentId: elevenLabsAgent.agent_id,
              name: elevenLabsAgent.name,
              action: 'updated',
              status: 'success',
            });

            this.logger.log(
              `✅ Agente actualizado: ${elevenLabsAgent.name} (${elevenLabsAgent.agent_id})`,
            );
          } else {
            // Crear nuevo agente en nuestra base de datos
            const newAgent = await this.prisma.agent.create({
              data: {
                name: elevenLabsAgent.name,
                description:
                  (elevenLabsAgent as any).conversation_config?.first_message ||
                  '',
                type: 'inbound', // Asumir inbound por defecto
                status: 'active',
                language:
                  (elevenLabsAgent as any).conversation_config?.language ||
                  'es',
                llmProvider: 'openai',
                llmModel: 'gpt-4',
                maxTokens:
                  (elevenLabsAgent as any).conversation_config?.max_tokens ||
                  1000,
                voiceName:
                  (elevenLabsAgent as any).conversation_config?.voice_id ||
                  null,
                temperature:
                  (elevenLabsAgent as any).conversation_config?.temperature ||
                  0.7,
                systemPrompt:
                  (elevenLabsAgent as any).conversation_config?.system_prompt ||
                  '',
                preMadePrompt:
                  (elevenLabsAgent as any).conversation_config?.system_prompt ||
                  '',
                elevenLabsAgentId: elevenLabsAgent.agent_id,
                accountId: accountId,
                // Campos adicionales
                initialMessageDelay: 2000,
                vmDetection: false,
                doubleCall: false,
                interruptSensitivity: false,
                responseSpeed: true,
              },
            });

            syncResults.created++;
            syncResults.details.push({
              agentId: elevenLabsAgent.agent_id,
              name: elevenLabsAgent.name,
              action: 'created',
              status: 'success',
              localId: newAgent.id,
            });

            this.logger.log(
              `🆕 Agente creado: ${elevenLabsAgent.name} (${elevenLabsAgent.agent_id})`,
            );
          }
        } catch (error) {
          syncResults.errors++;
          syncResults.details.push({
            agentId: elevenLabsAgent.agent_id,
            name: elevenLabsAgent.name,
            action: 'error',
            status: 'error',
            error: error.message,
          });

          this.logger.error(
            `❌ Error procesando agente ${elevenLabsAgent.name}:`,
            error,
          );
        }
      }

      this.logger.log(
        `🎯 Sincronización completada: ${syncResults.created} creados, ${syncResults.updated} actualizados, ${syncResults.errors} errores`,
      );

      return {
        success: true,
        message: 'Sincronización de agentes completada',
        data: syncResults,
      };
    } catch (error) {
      this.logger.error(
        'Error en sincronización de agentes de ElevenLabs:',
        error,
      );
      throw new BadRequestException(
        `Error sincronizando agentes: ${error.message}`,
      );
    }
  }

  // ===== MÉTODOS DE CARPETAS =====

  /**
   * Asignar un agente a una carpeta
   */
  async assignAgentToFolder(
    agentId: string,
    folderId: string | null,
    accountId: string,
  ) {
    try {
      this.logger.log(
        `Asignando agente ${agentId} a carpeta ${folderId || 'sin carpeta'} para cuenta ${accountId}`,
      );

      // Verificar que el agente existe y pertenece a la cuenta
      const agent = await this.findOne(agentId, accountId);

      // Si se está asignando a una carpeta, verificar que la carpeta existe
      if (folderId) {
        const folder = await this.prisma.folder.findFirst({
          where: {
            id: folderId,
            accountId,
          },
        });

        if (!folder) {
          throw new BadRequestException(`Carpeta con ID ${folderId} no encontrada`);
        }
      }

      // Actualizar el agente
      const updatedAgent = await this.prisma.agent.update({
        where: { id: agentId },
        data: { folderId },
        include: {
          folder: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      });

      this.logger.log(
        `✅ Agente "${updatedAgent.name}" asignado exitosamente`,
      );

      return updatedAgent;
    } catch (error) {
      this.logger.error(
        `Error asignando agente ${agentId} a carpeta ${folderId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Mover múltiples agentes a una carpeta
   */
  async moveAgentsToFolder(
    agentIds: string[],
    folderId: string | null,
    accountId: string,
  ) {
    try {
      this.logger.log(
        `Moviendo ${agentIds.length} agente(s) a carpeta ${folderId || 'sin carpeta'} para cuenta ${accountId}`,
      );

      // Verificar que todos los agentes existen y pertenecen a la cuenta
      const agents = await this.prisma.agent.findMany({
        where: {
          id: { in: agentIds },
          accountId,
        },
      });

      if (agents.length !== agentIds.length) {
        throw new BadRequestException(
          'Uno o más agentes no fueron encontrados o no pertenecen a esta cuenta',
        );
      }

      // Si se está moviendo a una carpeta, verificar que la carpeta existe
      if (folderId) {
        const folder = await this.prisma.folder.findFirst({
          where: {
            id: folderId,
            accountId,
          },
        });

        if (!folder) {
          throw new BadRequestException(`Carpeta con ID ${folderId} no encontrada`);
        }
      }

      // Actualizar todos los agentes
      const updatedAgents = await this.prisma.agent.updateMany({
        where: {
          id: { in: agentIds },
          accountId,
        },
        data: { folderId },
      });

      this.logger.log(
        `✅ ${updatedAgents.count} agente(s) movido(s) exitosamente`,
      );

      return {
        success: true,
        message: `${updatedAgents.count} agente(s) movido(s) exitosamente`,
        movedCount: updatedAgents.count,
      };
    } catch (error) {
      this.logger.error(
        `Error moviendo agentes a carpeta ${folderId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Obtiene información de diagnóstico para la cuenta
   */
  async getDiagnostics(accountId: string) {
    try {
      this.logger.log(`🔍 Obteniendo diagnósticos para cuenta ${accountId}`);

      // 1. Verificar configuración de ElevenLabs
      const elevenLabsConfig = await this.elevenLabsService.getConfig(accountId);
      const hasElevenLabsConfig = !!elevenLabsConfig?.apiKey;

      // 2. Obtener agentes locales
      const localAgents = await this.prisma.agent.findMany({
        where: { accountId },
        select: {
          id: true,
          name: true,
          elevenLabsAgentId: true,
          status: true,
          createdAt: true,
        },
      });

      // 3. Intentar obtener agentes de ElevenLabs
      let elevenLabsAgents = [];
      let elevenLabsError = null;
      
      if (hasElevenLabsConfig) {
        try {
          const response = await this.elevenLabsService.getAgents(accountId);
          elevenLabsAgents = response.agents || [];
        } catch (error) {
          elevenLabsError = error.message;
        }
      }

      // 4. Calcular estadísticas
      const stats = {
        localAgents: localAgents.length,
        elevenLabsAgents: elevenLabsAgents.length,
        syncedAgents: localAgents.filter(a => a.elevenLabsAgentId).length,
        unsyncedLocal: localAgents.filter(a => !a.elevenLabsAgentId).length,
        unsyncedElevenLabs: elevenLabsAgents.filter(elAgent => 
          !localAgents.some(local => local.elevenLabsAgentId === elAgent.agent_id)
        ).length,
      };

      return {
        success: true,
        data: {
          accountId,
          elevenLabsConfig: {
            configured: hasElevenLabsConfig,
            apiKeyPresent: !!elevenLabsConfig?.apiKey,
            error: elevenLabsError,
          },
          agents: {
            local: localAgents,
            elevenLabs: elevenLabsAgents,
          },
          stats,
          recommendations: this.getRecommendations(stats, hasElevenLabsConfig, elevenLabsError),
        },
      };
    } catch (error) {
      this.logger.error('Error en diagnósticos:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private getRecommendations(stats: any, hasElevenLabsConfig: boolean, elevenLabsError: string | null) {
    const recommendations = [];

    if (!hasElevenLabsConfig) {
      recommendations.push({
        type: 'error',
        message: 'No hay configuración de ElevenLabs. Configure su API key primero.',
        action: 'configure_elevenlabs',
      });
    } else if (elevenLabsError) {
      recommendations.push({
        type: 'error',
        message: `Error conectando con ElevenLabs: ${elevenLabsError}`,
        action: 'check_api_key',
      });
    } else if (stats.unsyncedElevenLabs > 0) {
      recommendations.push({
        type: 'warning',
        message: `Hay ${stats.unsyncedElevenLabs} agentes en ElevenLabs que no están sincronizados.`,
        action: 'sync_agents',
      });
    } else if (stats.unsyncedLocal > 0) {
      recommendations.push({
        type: 'info',
        message: `Hay ${stats.unsyncedLocal} agentes locales que no están en ElevenLabs.`,
        action: 'create_elevenlabs_agents',
      });
    } else {
      recommendations.push({
        type: 'success',
        message: 'Todo está sincronizado correctamente.',
        action: 'none',
      });
    }

    return recommendations;
  }

  /**
   * Importa un agente específico de ElevenLabs por su ID
   */
  async importElevenLabsAgent(accountId: string, elevenLabsAgentId: string) {
    try {
      this.logger.log(
        `🔄 Importando agente específico ${elevenLabsAgentId} para cuenta ${accountId}`,
      );

      // 1. Obtener el agente específico de ElevenLabs
      const elevenLabsResponse =
        await this.elevenLabsService.getAgents(accountId);
      const elevenLabsAgent = elevenLabsResponse.agents?.find(
        (agent) => agent.agent_id === elevenLabsAgentId,
      );

      if (!elevenLabsAgent) {
        throw new BadRequestException(
          `Agente con ID ${elevenLabsAgentId} no encontrado en ElevenLabs`,
        );
      }

      // 2. Verificar si ya existe en nuestra base de datos
      const existingAgent = await this.prisma.agent.findFirst({
        where: {
          elevenLabsAgentId: elevenLabsAgentId,
          accountId: accountId,
        },
      });

      if (existingAgent) {
        // Actualizar agente existente
        const updatedAgent = await this.prisma.agent.update({
          where: { id: existingAgent.id },
          data: {
            name: elevenLabsAgent.name,
            description:
              (elevenLabsAgent as any).conversation_config?.first_message || '',
            status: 'active',
            systemPrompt:
              (elevenLabsAgent as any).conversation_config?.system_prompt || '',
            language:
              (elevenLabsAgent as any).conversation_config?.language || 'es',
            temperature:
              (elevenLabsAgent as any).conversation_config?.temperature || 0.7,
            voiceName:
              (elevenLabsAgent as any).conversation_config?.voice_id || null,
            maxTokens:
              (elevenLabsAgent as any).conversation_config?.max_tokens || 1000,
          },
        });

        this.logger.log(
          `✅ Agente actualizado: ${elevenLabsAgent.name} (${elevenLabsAgentId})`,
        );

        return {
          success: true,
          message: 'Agente actualizado exitosamente',
          data: {
            action: 'updated',
            agent: updatedAgent,
            elevenLabsAgentId: elevenLabsAgentId,
          },
        };
      } else {
        // Crear nuevo agente
        const newAgent = await this.prisma.agent.create({
          data: {
            name: elevenLabsAgent.name,
            description:
              (elevenLabsAgent as any).conversation_config?.first_message || '',
            type: 'inbound',
            status: 'active',
            language:
              (elevenLabsAgent as any).conversation_config?.language || 'es',
            llmProvider: 'openai',
            llmModel: 'gpt-4',
            maxTokens:
              (elevenLabsAgent as any).conversation_config?.max_tokens || 1000,
            voiceName:
              (elevenLabsAgent as any).conversation_config?.voice_id || null,
            temperature:
              (elevenLabsAgent as any).conversation_config?.temperature || 0.7,
            systemPrompt:
              (elevenLabsAgent as any).conversation_config?.system_prompt || '',
            preMadePrompt:
              (elevenLabsAgent as any).conversation_config?.system_prompt || '',
            elevenLabsAgentId: elevenLabsAgentId,
            accountId: accountId,
            initialMessageDelay: 2000,
            vmDetection: false,
            doubleCall: false,
            interruptSensitivity: false,
            responseSpeed: true,
          },
        });

        this.logger.log(
          `🆕 Agente importado: ${elevenLabsAgent.name} (${elevenLabsAgentId})`,
        );

        return {
          success: true,
          message: 'Agente importado exitosamente',
          data: {
            action: 'created',
            agent: newAgent,
            elevenLabsAgentId: elevenLabsAgentId,
          },
        };
      }
    } catch (error) {
      this.logger.error(
        'Error importando agente específico de ElevenLabs:',
        error,
      );
      throw new BadRequestException(
        `Error importando agente: ${error.message}`,
      );
    }
  }

  async syncBidirectional(accountId: string) {
    try {
      this.logger.log(`🔄 Iniciando sincronización bidireccional para cuenta ${accountId}`);
      const results = await this.bidirectionalSyncService.syncAllElevenLabsAgents(accountId);
      return {
        success: true,
        data: results,
        message: `Sincronización completada: ${results.created} creados, ${results.updated} actualizados, ${results.errors} errores`,
      };
    } catch (error) {
      this.logger.error('Error en sincronización bidireccional:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async syncLocalWithElevenLabs(localAgentId: string, elevenLabsAgentId: string, accountId: string) {
    try {
      this.logger.log(`🔄 Sincronizando agente local ${localAgentId} con ElevenLabs ${elevenLabsAgentId}`);
      const result = await this.bidirectionalSyncService.syncLocalAgentWithElevenLabs(
        localAgentId,
        elevenLabsAgentId,
        accountId,
      );
      return {
        success: true,
        data: result,
        message: 'Agente local sincronizado con ElevenLabs exitosamente',
      };
    } catch (error) {
      this.logger.error('Error sincronizando agente local con ElevenLabs:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async deleteBidirectional(agentId: string, accountId: string) {
    try {
      this.logger.log(`🔄 Eliminando agente bidireccional ${agentId}`);
      const results = await this.bidirectionalSyncService.deleteAgentBidirectional(agentId, accountId);
      return {
        success: true,
        data: results,
        message: `Agente eliminado: ${results.localDeleted ? 'Local' : 'No local'}, ${results.elevenLabsDeleted ? 'ElevenLabs' : 'No ElevenLabs'}`,
      };
    } catch (error) {
      this.logger.error('Error eliminando agente bidireccional:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getSyncStatus(accountId: string) {
    try {
      this.logger.log(`🔍 Obteniendo estado de sincronización para cuenta ${accountId}`);
      const status = await this.bidirectionalSyncService.getSyncStatus(accountId);
      return {
        success: true,
        data: status,
      };
    } catch (error) {
      this.logger.error('Error obteniendo estado de sincronización:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
