import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Logger,
    Param,
    Patch,
    Post,
    Query,
    Request,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ElevenLabsService } from '../integrations/elevenlabs/elevenlabs.service';
import { PrismaService } from '../prisma/prisma.service';
import { AccountGuard } from '../tenancy/account.guard';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';

@Controller('agents')
@UseGuards(JwtAuthGuard, AccountGuard)
export class AgentsController {
  private readonly logger = new Logger(AgentsController.name);

  constructor(
    private readonly agentsService: AgentsService,
    private readonly elevenLabsService: ElevenLabsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(@Body() createAgentDto: CreateAgentDto, @Request() req) {
    return this.agentsService.create(createAgentDto, req.accountId);
  }

  @Get()
  findAll(@Request() _req) {
    return this.agentsService.findAll(_req.accountId);
  }

  @Post('sync-elevenlabs')
  @HttpCode(HttpStatus.OK)
  syncElevenLabsAgents(@Request() req) {
    return this.agentsService.syncElevenLabsAgents(req.accountId);
  }

  @Get('diagnostics')
  async getDiagnostics(@Request() req) {
    return this.agentsService.getDiagnostics(req.accountId);
  }

  @Post('sync-bidirectional')
  @HttpCode(HttpStatus.OK)
  async syncBidirectional(@Request() req) {
    return this.agentsService.syncBidirectional(req.accountId);
  }

  @Post('sync-local-with-elevenlabs')
  @HttpCode(HttpStatus.OK)
  async syncLocalWithElevenLabs(
    @Body() body: { localAgentId: string; elevenLabsAgentId: string },
    @Request() req,
  ) {
    return this.agentsService.syncLocalWithElevenLabs(
      body.localAgentId,
      body.elevenLabsAgentId,
      req.accountId,
    );
  }

  @Delete('bidirectional/:id')
  @HttpCode(HttpStatus.OK)
  async deleteBidirectional(@Param('id') id: string, @Request() req) {
    return this.agentsService.deleteBidirectional(id, req.accountId);
  }

  @Get('sync-status')
  async getSyncStatus(@Request() req) {
    return this.agentsService.getSyncStatus(req.accountId);
  }

  @Post('import-elevenlabs')
  @HttpCode(HttpStatus.OK)
  importElevenLabsAgent(@Request() req, @Body() body: { agentId: string }) {
    return this.agentsService.importElevenLabsAgent(
      req.accountId,
      body.agentId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() _req) {
    return this.agentsService.findOne(id, _req.accountId);
  }

  @Get(':id/stats')
  getStats(@Param('id') id: string, @Request() _req) {
    return this.agentsService.getStats(id, _req.accountId);
  }

  @Post(':id/test')
  @HttpCode(HttpStatus.OK)
  testAgent(
    @Param('id') id: string,
    @Body() body: { testPrompt: string },
    @Request() _req,
  ) {
    return this.agentsService.testAgent(
      id,
      _req.accountId,
      body.testPrompt,
    );
  }

  @Post(':id/duplicate')
  duplicate(
    @Param('id') id: string,
    @Body() body: { newName: string },
    @Request() _req,
  ) {
    return this.agentsService.duplicate(id, _req.accountId, body.newName);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAgentDto: UpdateAgentDto,
    @Request() _req,
  ) {
    return this.agentsService.update(id, updateAgentDto, _req.accountId);
  }

  @Patch(':id/activate')
  @HttpCode(HttpStatus.OK)
  activate(@Param('id') id: string, @Request() _req) {
    return this.agentsService.activate(id, _req.accountId);
  }

  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  deactivate(@Param('id') id: string, @Request() _req) {
    return this.agentsService.deactivate(id, _req.accountId);
  }

  @Patch(':id/testing')
  @HttpCode(HttpStatus.OK)
  setTesting(@Param('id') id: string, @Request() _req) {
    return this.agentsService.setTesting(id, _req.accountId);
  }

  @Patch(':id/calendar-booking')
  @HttpCode(HttpStatus.OK)
  updateCalendarBookingConfig(
    @Param('id') id: string,
    @Body()
    calendarBookingData: {
      calendarBookingEnabled: boolean;
      calendarBookingProvider?: string;
      calendarBookingId?: string;
      calendarBookingTimezone?: string;
    },
    @Request() _req,
  ) {
    return this.agentsService.update(
      id,
      calendarBookingData,
      _req.accountId,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() _req) {
    return this.agentsService.remove(id, _req.accountId);
  }

  // ===== ENDPOINTS ESPECÍFICOS PARA DASHBOARD DEL CLIENTE =====

  @Get(':id/config')
  getAgentConfig(@Param('id') id: string, @Request() _req) {
    return this.agentsService.getAgentConfig(id, _req.accountId);
  }

  @Patch(':id/config')
  updateAgentConfig(
    @Param('id') id: string,
    @Body()
    configData: {
      preMadePrompt?: string;
      voiceName?: string;
      llmProvider?: string;
      llmModel?: string;
      maxTokens?: number;
      initialMessageDelay?: number;
      vmDetection?: boolean;
      doubleCall?: boolean;
      webhookConfig?: any;
    },
    @Request() _req,
  ) {
    return this.agentsService.updateAgentConfig(
      id,
      configData,
      _req.accountId,
    );
  }

  @Get(':id/voice-options')
  getVoiceOptions(@Request() _req) {
    return this.agentsService.getVoiceOptions();
  }

  @Get(':id/llm-models')
  getLLMModels(@Request() _req) {
    return this.agentsService.getLLMModels();
  }

  @Post(':id/validate-config')
  @HttpCode(HttpStatus.OK)
  validateAgentConfig(
    @Param('id') id: string,
    @Body() configData: any,
    @Request() _req,
  ) {
    return this.agentsService.validateAgentConfig(
      id,
      configData,
      _req.accountId,
    );
  }

  @Post(':id/create-elevenlabs-agent')
  @HttpCode(HttpStatus.OK)
  async createElevenLabsAgent(
    @Param('id') id: string,
    @Body()
    agentData: {
      voiceId: string;
      language: string;
      phoneNumberId?: string; // ID del número de teléfono a asignar
      conversationConfig: {
        maxDuration: number;
        endCallPhrases: string[];
        interruptionThreshold: number;
      };
      tools?: Array<{
        type: string;
        name?: string;
        description?: string;
        parameters?: any;
        config?: any;
      }>;
    },
    @Request() _req,
  ) {
    try {
      // Verificar que el agente existe
      const agent = await this.agentsService.findOne(id, _req.accountId);

      // Preparar herramientas para el agente (incluyendo calendar booking si está habilitado)
      const tools = agentData.tools || [];

      // Agregar herramienta de calendar booking si está habilitada
      if (agent.calendarBookingEnabled && agent.calendarBookingId) {
        tools.push({
          type: 'calendar_booking',
          name: 'Agendar cita',
          description: 'Permite agendar citas en el calendario del cliente',
          config: {
            provider: agent.calendarBookingProvider || 'GHL',
            calendarId: agent.calendarBookingId,
            timezone: agent.calendarBookingTimezone || 'America/Mexico_City',
          },
        });
      }

      // Agregar herramienta de transferencia de llamada si está configurada
      if (agent.callTransferPhoneNumber) {
        tools.push({
          type: 'call_transfer',
          name: 'Transferir llamada',
          description: 'Transfiere la llamada a un agente humano',
          config: {
            transferType: agent.callTransferType || 'prompt',
            phoneNumber: agent.callTransferPhoneNumber,
            keywords: agent.callTransferKeywords || [],
            businessHours: agent.callTransferBusinessHours || false,
          },
        });
      }

      // Obtener información del número de teléfono si se proporciona
      let phoneNumberInfo = null;
      if (agentData.phoneNumberId) {
        const phoneNumber = await this.prisma.phoneNumber.findFirst({
          where: {
            id: agentData.phoneNumberId,
            accountId: _req.accountId,
          },
        });

        if (phoneNumber && phoneNumber.twilioSid) {
          phoneNumberInfo = {
            phoneNumberId: phoneNumber.id,
            twilioPhoneNumberSid: phoneNumber.twilioSid,
          };
        }
      }

      // Crear agente en ElevenLabs según documentación oficial
      // https://elevenlabs.io/docs/api-reference/agents-platform/create-agent
      const elevenLabsAgent = await this.elevenLabsService.createAgent(
        _req.accountId,
        {
          name: agent.name,
          conversation_config: {
            // Configuración del agente
            agent: {
              prompt:
                agent.systemPrompt ||
                agent.preMadePrompt ||
                'Eres un asistente telefónico profesional y amigable que ayuda a los clientes con sus consultas.',
              first_message: agent.initialMessageDelay
                ? undefined
                : 'Hola, gracias por llamar. ¿En qué puedo ayudarte hoy?',
              language: agentData.language,
            },
            // Configuración de voz (TTS)
            tts: {
              voice_id: agentData.voiceId,
              model_id: 'eleven_turbo_v2_5', // Modelo optimizado para llamadas
              language: agentData.language,
              voice_settings: {
                stability: 0.8,
                similarity_boost: 0.85,
                style: 0.5,
                use_speaker_boost: true,
              },
            },
            // Configuración de reconocimiento de voz (STT)
            stt: {
              language: agentData.language,
              model: 'nova-2-phonecall', // Modelo optimizado para llamadas telefónicas
            },
            // Configuración del modelo de lenguaje (LLM)
            llm: {
              model: agent.llmModel || 'gpt-4o-mini',
              temperature: agent.temperature || 0.7,
              max_tokens: agent.maxTokens || 150,
            },
            // Configuración de detección de turnos
            turn_detection: {
              type: 'server_vad',
              threshold: agentData.conversationConfig.interruptionThreshold,
              silence_duration_ms: agent.responseSpeed ? 500 : 700,
            },
          },
          platform_settings: {
            twilio: phoneNumberInfo || {},
            double_call: agent.doubleCall || false,
            vm_detection:
              agent.vmDetection !== undefined ? agent.vmDetection : false,
            webhook_url:
              agent.webhookUrl ||
              `${process.env.APP_URL || 'https://tu-dominio.com'}/webhooks/elevenlabs`,
          },
        },
      );

      // Actualizar el agente local con el ID de ElevenLabs
      const updatedAgent = await this.agentsService.update(
        id,
        { elevenLabsAgentId: elevenLabsAgent.agent_id },
        _req.accountId,
      );

      return {
        success: true,
        message: 'Agente de ElevenLabs creado exitosamente',
        data: {
          localAgent: updatedAgent,
          elevenLabsAgent,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Error creando agente de ElevenLabs: ${error.message}`,
        error: error.message,
      };
    }
  }

  @Get(':id/elevenlabs-status')
  async getElevenLabsAgentStatus(@Param('id') id: string, @Request() _req) {
    try {
      const agent = await this.agentsService.findOne(id, _req.accountId);

      if (!agent.elevenLabsAgentId) {
        return {
          hasElevenLabsAgent: false,
          message: 'Este agente no tiene un agente de ElevenLabs asociado',
        };
      }

      // Obtener información del agente de ElevenLabs
      // Obtener información detallada del agente de ElevenLabs
      const elevenLabsAgent = await this.elevenLabsService.getAgent(
        _req.accountId,
        agent.elevenLabsAgentId,
      );

      return {
        hasElevenLabsAgent: true,
        localAgent: agent,
        elevenLabsAgent,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error obteniendo estado del agente: ${error.message}`,
        error: error.message,
      };
    }
  }

  @Get(':id/elevenlabs-usage')
  async getElevenLabsAgentUsage(
    @Param('id') id: string,
    @Query('period') period: 'month' | 'week' | 'day' = 'month',
    @Request() _req,
  ) {
    try {
      const agent = await this.agentsService.findOne(id, _req.accountId);

      if (!agent.elevenLabsAgentId) {
        return {
          success: false,
          message: 'Este agente no tiene un agente de ElevenLabs asociado',
        };
      }

      // Obtener uso del agente específico
      const usage = await this.elevenLabsService.getAgentUsage(
        _req.accountId,
        agent.elevenLabsAgentId,
        period,
      );

      return {
        success: true,
        data: {
          agentId: id,
          elevenLabsAgentId: agent.elevenLabsAgentId,
          period,
          usage,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Error obteniendo uso del agente: ${error.message}`,
        error: error.message,
      };
    }
  }

  @Get('elevenlabs-usage')
  async getAllElevenLabsUsage(
    @Query('period') period: 'month' | 'week' | 'day' = 'month',
    @Request() _req,
  ) {
    try {
      // Obtener uso total de ElevenLabs para el cliente
      const usage = await this.elevenLabsService.getClientUsage(
        _req.accountId,
        period,
      );

      return {
        success: true,
        data: {
          accountId: _req.accountId,
          period,
          usage,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Error obteniendo uso de ElevenLabs: ${error.message}`,
        error: error.message,
      };
    }
  }

  @Post(':id/make-call')
  @HttpCode(HttpStatus.OK)
  async makeCall(
    @Param('id') id: string,
    @Body()
    callData: {
      toNumber: string;
      phoneNumberId?: string; // ID del número desde el cual llamar
      contactName?: string;
      conversationData?: any;
    },
    @Request() _req,
  ) {
    try {
      // Verificar que el agente existe y tiene elevenLabsAgentId
      const agent = await this.agentsService.findOne(id, _req.accountId);

      if (!agent.elevenLabsAgentId) {
        return {
          success: false,
          message:
            'Este agente no tiene un agente de ElevenLabs configurado. Primero crea el agente de ElevenLabs.',
        };
      }

      // Si no se proporciona phoneNumberId, obtener el primer número asignado al agente
      let phoneNumberToUse = null;

      if (!callData.phoneNumberId) {
        const agentPhoneNumbers =
          await this.elevenLabsService.getAgentPhoneNumbers(
            _req.accountId,
            agent.elevenLabsAgentId,
          );

        if (agentPhoneNumbers.length === 0) {
          return {
            success: false,
            message:
              'No hay números de teléfono asignados a este agente. Primero asigna un número.',
          };
        }

        phoneNumberToUse = agentPhoneNumbers[0];
      } else {
        // Verificar que el número proporcionado está asignado al agente
        const agentPhoneNumbers =
          await this.elevenLabsService.getAgentPhoneNumbers(
            _req.accountId,
            agent.elevenLabsAgentId,
          );

        phoneNumberToUse = agentPhoneNumbers.find(
          (pn) => pn.localPhoneNumber?.id === callData.phoneNumberId,
        );

        if (!phoneNumberToUse) {
          return {
            success: false,
            message:
              'El número de teléfono especificado no está asignado a este agente.',
          };
        }
      }

      // Hacer la llamada usando el servicio de ElevenLabs
      const result = await this.elevenLabsService.makeOutboundCall(
        _req.accountId,
        agent.elevenLabsAgentId,
        phoneNumberToUse.agent_phone_number_id,
        callData.toNumber,
        {
          contactName: callData.contactName,
          agentName: agent.name,
          ...callData.conversationData,
        },
      );

      // Crear registro de llamada en la base de datos
      if (result.success && result.conversation_id) {
        await this.prisma.call.create({
          data: {
            accountId: _req.accountId,
            agentId: id,
            phoneNumberId: phoneNumberToUse.localPhoneNumber?.id || null,
            phoneNumber: callData.toNumber,
            direction: 'outbound',
            type: 'agent',
            status: 'initiated',
            notes: JSON.stringify({
              elevenLabsConversationId: result.conversation_id,
              callSid: result.callSid,
              contactName: callData.contactName,
            }),
          },
        });
      }

      return {
        success: result.success,
        message: result.message || 'Llamada iniciada exitosamente',
        data: {
          conversationId: result.conversation_id,
          callSid: result.callSid,
          toNumber: callData.toNumber,
          fromNumber: phoneNumberToUse.localPhoneNumber?.number,
        },
      };
    } catch (error) {
      this.logger.error('Error iniciando llamada:', error);
      return {
        success: false,
        message: `Error iniciando llamada: ${error.message}`,
        error: error.message,
      };
    }
  }

  // ===== ENDPOINTS DE CARPETAS =====

  @Patch(':id/assign-folder')
  @HttpCode(HttpStatus.OK)
  assignAgentToFolder(
    @Param('id') id: string,
    @Body() body: { folderId: string | null },
    @Request() req,
  ) {
    return this.agentsService.assignAgentToFolder(
      id,
      body.folderId,
      req.accountId,
    );
  }

  @Patch('move-to-folder')
  @HttpCode(HttpStatus.OK)
  moveAgentsToFolder(
    @Body() body: { agentIds: string[]; folderId: string | null },
    @Request() req,
  ) {
    return this.agentsService.moveAgentsToFolder(
      body.agentIds,
      body.folderId,
      req.accountId,
    );
  }
}
