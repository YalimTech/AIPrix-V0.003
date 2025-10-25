import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { ElevenLabsService } from './elevenlabs.service';

@Controller('integrations/elevenlabs')
@UseGuards(JwtAuthGuard)
export class ElevenLabsController {
  private readonly logger = new Logger(ElevenLabsController.name);

  constructor(
    private readonly elevenLabsService: ElevenLabsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('config')
  async getConfig(@Request() req) {
    return this.elevenLabsService.getConfig(req.user.accountId);
  }

  @Post('config')
  async updateConfig(@Body() configDto: any, @Request() req) {
    return this.elevenLabsService.updateConfig(req.user.accountId, configDto);
  }

  @Delete('config')
  async deleteConfig(@Request() req) {
    return this.elevenLabsService.removeConfig(req.user.accountId);
  }

  @Get('voices')
  async getVoices(@Request() req) {
    return this.elevenLabsService.getVoices(req.user.accountId);
  }

  // ===== ENDPOINTS DE AGENTS PLATFORM (2025) =====

  @Get('debug/agents')
  async debugGetAgents(@Request() req) {
    try {
      this.logger.log(`[DEBUG] Consultando agentes para accountId: ${req.user.accountId}`);
      
      const config = await this.elevenLabsService.getConfig(req.user.accountId);
      if (!config?.apiKey) {
        return {
          error: 'No se encontró configuración de ElevenLabs',
          accountId: req.user.accountId,
          apiKey: null
        };
      }

      const agents = await this.elevenLabsService.getAgents(req.user.accountId);
      
      return {
        success: true,
        accountId: req.user.accountId,
        apiKey: config.apiKey.substring(0, 8) + '...',
        totalAgents: agents.agents.length,
        agents: agents.agents.map(agent => ({
          agent_id: agent.agent_id,
          name: agent.name,
          created_at: agent.created_at_unix_secs ? new Date(agent.created_at_unix_secs * 1000).toISOString() : 'N/A',
          tags: agent.tags || []
        }))
      };
    } catch (error) {
      this.logger.error('[DEBUG] Error consultando agentes:', error.message);
      return {
        error: error.message,
        accountId: req.user.accountId,
        stack: error.stack
      };
    }
  }

  @Post('agents')
  async createAgent(
    @Body()
    agentData: {
      name?: string | null;
      conversation_config?: any;
      systemPrompt?: string;
      firstMessage?: string;
      language?: string;
      temperature?: number;
      voiceId?: string;
      interruptSensitivity?: boolean;
      responseSpeed?: boolean;
      initialMessageDelay?: number;
      doubleCall?: boolean;
      vmDetection?: boolean;
      webhookUrl?: string;
      platform_settings?: any | null;
      workflow?: any;
      tags?: string[] | null;
    },
    @Request() req,
  ) {
    return this.elevenLabsService.createAgent(req.user.accountId, agentData);
  }

  // Rutas específicas primero (con sufijos después de :id)
  @Get('agents/:id/link')
  async getAgentLink(@Param('id') agentId: string, @Request() req) {
    return this.elevenLabsService.getAgentLink(req.user.accountId, agentId);
  }

  @Post('agents/:id/simulate-conversation')
  async simulateConversation(
    @Param('id') agentId: string,
    @Body()
    data: {
      simulation_specification: {
        simulated_user_config: any;
      };
      extra_evaluation_criteria?: any[] | null;
      new_turns_limit?: number;
    },
    @Request() req,
  ) {
    return this.elevenLabsService.simulateConversation(
      req.user.accountId,
      agentId,
      data,
    );
  }

  @Post('agents/:id/simulate-conversation/stream')
  async simulateConversationStream(
    @Param('id') agentId: string,
    @Body()
    data: {
      simulation_specification: {
        simulated_user_config: any;
      };
      extra_evaluation_criteria?: any[] | null;
      new_turns_limit?: number;
    },
    @Request() req,
    @Res() res: any,
  ) {
    return this.elevenLabsService.simulateConversationStream(
      req.user.accountId,
      agentId,
      data,
      res,
    );
  }

  @Post('agents/:id/llm-usage/calculate')
  async calculateLLMUsage(
    @Param('id') agentId: string,
    @Body()
    data: {
      prompt_length?: number | null;
      number_of_pages?: number | null;
      rag_enabled?: boolean | null;
    },
    @Request() req,
  ) {
    return this.elevenLabsService.calculateLLMUsage(
      req.user.accountId,
      agentId,
      data,
    );
  }

  // Ruta genérica al final (después de todas las rutas específicas)
  @Get('agents/:id')
  async getAgent(
    @Param('id') agentId: string,
    @Query('version_id') versionId: string,
    @Request() req,
  ) {
    return this.elevenLabsService.getAgent(
      req.user.accountId,
      agentId,
      versionId,
    );
  }

  @Patch('agents/:id')
  async updateAgent(
    @Param('id') agentId: string,
    @Body()
    updateData: {
      name?: string;
      voiceId?: string;
      language?: string;
      conversationConfig?: {
        maxDuration?: number;
        endCallPhrases?: string[];
        interruptionThreshold?: number;
      };
    },
    @Request() req,
  ) {
    return this.elevenLabsService.updateAgent(
      req.user.accountId,
      agentId,
      updateData,
    );
  }

  @Delete('agents/:id')
  async deleteAgent(@Param('id') agentId: string, @Request() req) {
    return this.elevenLabsService.deleteAgent(req.user.accountId, agentId);
  }

  @Get('agents/:id/signed-url')
  async getSignedUrl(
    @Param('id') agentId: string,
    @Query('include_conversation_id') includeConversationId?: string,
    @Request() req?,
  ) {
    const includeConversationIdBool = includeConversationId === 'true';
    return this.elevenLabsService.getSignedUrlForAgent(
      req.user.accountId,
      agentId,
      includeConversationIdBool,
    );
  }

  @Get('agents/:id/webrtc-token')
  async getWebRTCToken(
    @Param('id') agentId: string,
    @Query('participant_name') participantName?: string,
    @Request() req?,
  ) {
    return this.elevenLabsService.getWebRTCToken(
      req.user.accountId,
      agentId,
      participantName,
    );
  }

  @Get('agents/:id/widget')
  async getAgentWidget(
    @Param('id') agentId: string,
    @Query('conversation_signature') conversationSignature?: string,
    @Request() req?,
  ) {
    return this.elevenLabsService.getAgentWidget(
      req.user.accountId,
      agentId,
      conversationSignature,
    );
  }

  @Post('agents/sync-with-database')
  async syncAgentWithDatabase(
    @Body()
    data: {
      elevenLabsAgentId: string;
      databaseAgentId: string;
      accountId: string;
    },
  ) {
    // Este endpoint sincroniza un agente de ElevenLabs con un agente en la base de datos
    // Permite asociar el ID de ElevenLabs con el agente local
    return this.elevenLabsService.syncAgentWithDatabase(
      data.elevenLabsAgentId,
      data.databaseAgentId,
      data.accountId,
    );
  }

  @Post('agents/:id/avatar')
  @UseInterceptors(FileInterceptor('avatar_file'))
  async createAgentWidgetAvatar(
    @Param('id') agentId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req?,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó archivo de avatar');
    }

    return this.elevenLabsService.createAgentWidgetAvatar(
      req.user.accountId,
      agentId,
      file,
    );
  }

  @Post('conversations')
  async startConversation(
    @Body()
    data: {
      agentId: string;
      phoneNumber: string;
      accountId: string;
      callId?: string;
    },
  ) {
    return this.elevenLabsService.startConversation(
      data.agentId,
      data.phoneNumber,
      data.accountId,
      data.callId,
    );
  }

  @Get('analytics')
  async getAnalytics(
    @Request() req,
    @Query('agentId') agentId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    // const dateRange = from && to ? { from, to } : undefined;
    // Nota: getAnalytics no existe en el servicio, comentado temporalmente
    // return this.elevenLabsService.getAnalytics(req.user.accountId, agentId, dateRange);
    return { message: 'Analytics endpoint not implemented yet' };
  }

  @Get('conversations/recent')
  async getRecentConversations(@Request() req, @Query('limit') limit?: number) {
    return this.elevenLabsService.getRecentConversations(
      req.user.accountId,
      limit || 10,
    );
  }

  @Get('conversations/:id')
  async getConversationDetails(
    @Param('id') conversationId: string,
    @Request() req,
  ) {
    return this.elevenLabsService.getConversationDetails(
      req.user.accountId,
      conversationId,
    );
  }

  @Delete('conversations/:id')
  async deleteConversation(
    @Param('id') conversationId: string,
    @Request() req,
  ) {
    return this.elevenLabsService.deleteConversation(
      req.user.accountId,
      conversationId,
    );
  }

  @Get('conversations/:id/audio')
  async getConversationAudio(
    @Param('id') conversationId: string,
    @Request() req,
  ) {
    return this.elevenLabsService.getConversationAudio(
      req.user.accountId,
      conversationId,
    );
  }

  @Get('conversations/:id/metadata')
  async getConversationMetadata(
    @Param('id') conversationId: string,
    @Request() req,
  ) {
    return this.elevenLabsService.getConversationMetadata(
      req.user.accountId,
      conversationId,
    );
  }

  @Post('conversations/:id/feedback')
  async sendConversationFeedback(
    @Param('id') conversationId: string,
    @Body() body: { feedback: 'like' | 'dislike' },
    @Request() req,
  ) {
    return this.elevenLabsService.sendConversationFeedback(
      req.user.accountId,
      conversationId,
      body.feedback,
    );
  }

  @Get('voices/:voiceId')
  async getVoice(@Param('voiceId') voiceId: string, @Request() req) {
    return this.elevenLabsService.getVoice(req.user.accountId, voiceId);
  }

  @Post('preview')
  async generatePreview(
    @Body()
    body: {
      voiceId: string;
      text: string;
      modelId?: string;
    },
    @Request() req,
    @Res() res: any,
  ) {
    const audioBuffer = await this.elevenLabsService.generatePreview(
      req.user.accountId,
      body.voiceId,
      body.text,
      body.modelId,
    );

    // Configurar headers para respuesta de audio
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
      'Cache-Control': 'public, max-age=31536000', // Cache por 1 año
    });

    return res.send(audioBuffer);
  }

  @Post('speech')
  async generateSpeech(
    @Body()
    body: {
      text: string;
      voiceId?: string;
      modelId?: string;
      voiceSettings?: {
        stability: number;
        similarityBoost: number;
        style: number;
        useSpeakerBoost: boolean;
      };
    },
    @Request() req,
  ) {
    return this.elevenLabsService.generateSpeech(
      req.user.accountId,
      body.text,
      body.voiceId,
      {
        modelId: body.modelId,
        voiceSettings: body.voiceSettings,
      },
    );
  }

  @Post('voices/clone')
  @UseInterceptors(FileInterceptor('file'))
  async cloneVoice(
    @Body() body: { name: string; description: string },
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) {
      throw new Error('Archivo de audio requerido');
    }

    return this.elevenLabsService.cloneVoice(
      req.user.accountId,
      body.name,
      body.description,
      [file.buffer],
    );
  }

  @Delete('voices/:voiceId')
  async deleteVoice(@Param('voiceId') voiceId: string, @Request() req) {
    return this.elevenLabsService.deleteVoice(req.user.accountId, voiceId);
  }

  @Get('models')
  async getModels(@Request() req) {
    return this.elevenLabsService.getModels(req.user.accountId);
  }

  @Get('user')
  async getUserInfo(@Request() req) {
    return this.elevenLabsService.getUserInfo(req.user.accountId);
  }

  @Get('health')
  async healthCheck() {
    const isHealthy = await this.elevenLabsService.healthCheck();
    return {
      healthy: isHealthy,
      service: 'elevenlabs',
      timestamp: new Date().toISOString(),
    };
  }

  // ===== ENDPOINTS DE PHONE NUMBERS =====

  @Post('agents/:agentId/phone-numbers')
  async assignPhoneNumberToAgent(
    @Param('agentId') agentId: string,
    @Body()
    body: {
      phoneNumberId: string;
    },
    @Request() req,
  ) {
    return this.elevenLabsService.assignPhoneNumberToAgent(
      req.user.accountId,
      agentId,
      body.phoneNumberId,
    );
  }

  @Get('agents/:agentId/phone-numbers')
  async getAgentPhoneNumbers(
    @Param('agentId') agentId: string,
    @Request() req,
  ) {
    return this.elevenLabsService.getAgentPhoneNumbers(
      req.user.accountId,
      agentId,
    );
  }

  @Delete('agents/:agentId/phone-numbers/:phoneNumberId')
  async removePhoneNumberFromAgent(
    @Param('agentId') agentId: string,
    @Param('phoneNumberId') phoneNumberId: string,
    @Request() req,
  ) {
    return this.elevenLabsService.removePhoneNumberFromAgent(
      req.user.accountId,
      agentId,
      phoneNumberId,
    );
  }

  // ===== ENDPOINTS DE LLAMADAS OUTBOUND =====

  @Post('agents/:agentId/outbound-call')
  async makeOutboundCall(
    @Param('agentId') agentId: string,
    @Body()
    body: {
      phoneNumberId: string; // ID del número de teléfono asignado al agente
      toNumber: string; // Número de teléfono al que llamar
      contactName?: string; // Nombre del contacto (opcional)
      conversationData?: any; // Datos adicionales para la conversación
    },
    @Request() req,
  ) {
    try {
      // Verificar que el número de teléfono está asignado al agente
      const agentPhoneNumbers =
        await this.elevenLabsService.getAgentPhoneNumbers(
          req.user.accountId,
          agentId,
        );

      const phoneNumber = agentPhoneNumbers.find(
        (pn) => pn.localPhoneNumber?.id === body.phoneNumberId,
      );

      if (!phoneNumber) {
        throw new BadRequestException(
          'El número de teléfono no está asignado a este agente',
        );
      }

      // Hacer la llamada outbound
      const result = await this.elevenLabsService.makeOutboundCall(
        req.user.accountId,
        agentId,
        phoneNumber.agent_phone_number_id,
        body.toNumber,
        body.conversationData || {
          contactName: body.contactName,
          timestamp: new Date().toISOString(),
        },
      );

      return {
        success: result.success,
        message: result.message || 'Llamada iniciada exitosamente',
        conversationId: result.conversation_id,
        callSid: result.callSid,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error iniciando llamada: ${error.message}`,
        error: error.message,
      };
    }
  }

  @Post('agents/:agentId/batch-calls')
  async makeBatchCalls(
    @Param('agentId') agentId: string,
    @Body()
    body: {
      phoneNumberId: string;
      contacts: Array<{
        phoneNumber: string;
        name?: string;
        data?: any;
      }>;
      delayBetweenCalls?: number; // Retraso en segundos entre llamadas
    },
    @Request() req,
  ) {
    try {
      const results = [];
      const delayMs = (body.delayBetweenCalls || 2) * 1000; // Convertir a milisegundos

      for (const contact of body.contacts) {
        try {
          const result = await this.elevenLabsService.makeOutboundCall(
            req.user.accountId,
            agentId,
            body.phoneNumberId,
            contact.phoneNumber,
            {
              contactName: contact.name,
              ...contact.data,
            },
          );

          results.push({
            phoneNumber: contact.phoneNumber,
            success: result.success,
            conversationId: result.conversation_id,
            callSid: result.callSid,
            error: result.success ? null : result.message,
          });

          // Esperar entre llamadas para no saturar
          if (body.contacts.indexOf(contact) < body.contacts.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          }
        } catch (error) {
          results.push({
            phoneNumber: contact.phoneNumber,
            success: false,
            error: error.message,
          });
        }
      }

      const successCount = results.filter((r) => r.success).length;
      const failedCount = results.filter((r) => !r.success).length;

      return {
        success: true,
        message: `Llamadas procesadas: ${successCount} exitosas, ${failedCount} fallidas`,
        results,
        summary: {
          total: body.contacts.length,
          successful: successCount,
          failed: failedCount,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Error procesando llamadas: ${error.message}`,
        error: error.message,
      };
    }
  }

  // ===== ENDPOINTS DE TRACKING INDIVIDUAL POR CLIENTE =====

  @Get('usage')
  async getClientUsage(
    @Query('accountId') accountId: string,
    @Query('period') period?: 'month' | 'week' | 'day',
  ) {
    return this.elevenLabsService.getClientUsage(accountId, period);
  }

  @Get('usage/agent/:agentId')
  async getAgentUsage(
    @Param('agentId') agentId: string,
    @Query('accountId') accountId: string,
    @Query('period') period?: 'month' | 'week' | 'day',
  ) {
    return this.elevenLabsService.getAgentUsage(accountId, agentId, period);
  }

  @Post('usage/check-balance')
  async checkClientBalance(
    @Body() data: { accountId: string; estimatedCost: number },
  ) {
    const hasBalance = await this.elevenLabsService.checkClientBalance(
      data.accountId,
      data.estimatedCost,
    );
    return {
      hasSufficientBalance: hasBalance,
      accountId: data.accountId,
      estimatedCost: data.estimatedCost,
    };
  }

  @Post('twilio/outbound-call')
  @UseGuards(JwtAuthGuard)
  async makeOutboundCallWithTwilio(
    @Body()
    data: {
      agentId: string;
      agentPhoneNumberId: string;
      toNumber: string;
      conversationInitiationClientData?: any;
    },
    @Request() req,
  ) {
    try {
      const accountId = req.user.accountId;

      // Hacer la llamada usando ElevenLabs + Twilio
      const result = await this.elevenLabsService.makeOutboundCall(
        accountId,
        data.agentId,
        data.agentPhoneNumberId,
        data.toNumber,
        data.conversationInitiationClientData,
      );

      return {
        ...result,
        accountId,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error haciendo llamada outbound: ${error.message}`,
        conversation_id: null,
        callSid: null,
      };
    }
  }

  @Post('webhook/auto-configure')
  @UseGuards(JwtAuthGuard)
  async autoConfigureWebhook(@Request() req) {
    try {
      const accountId = req.user.accountId;
      const nodeEnv = process.env.NODE_ENV;

      this.logger.log(
        `🔧 Configurando webhook automáticamente para entorno: ${nodeEnv}`,
      );

      let webhookUrl;

      if (nodeEnv === 'development') {
        // En desarrollo, usar configuración dinámica
        const port = process.env.API_PORT || '3004';
        const host = process.env.API_HOST || 'localhost';
        const protocol = process.env.API_PROTOCOL || 'http';
        webhookUrl = `${protocol}://${host}:${port}/api/v1/webhooks/twilio`;
      } else if (nodeEnv === 'production') {
        const appUrl = process.env.APP_URL;
        if (!appUrl || appUrl.includes('localhost')) {
          return {
            success: false,
            message:
              'APP_URL no configurado para producción. Actualiza APP_URL en tu .env',
            instructions: [
              '1. Actualiza APP_URL=tu-dominio.com en tu .env',
              '2. Reinicia el servidor',
            ],
          };
        }
        webhookUrl = `${appUrl}/api/v1/webhooks/twilio`;
      } else {
        return {
          success: false,
          message: `NODE_ENV no válido: ${nodeEnv}. Debe ser 'development' o 'production'`,
        };
      }

      // Actualizar en la base de datos
      await this.prisma.accountTwilioConfig.updateMany({
        where: { accountId },
        data: { webhookUrl },
      });

      this.logger.log(`✅ Webhook URL actualizada: ${webhookUrl}`);

      return {
        success: true,
        message: 'Webhook configurado automáticamente',
        webhookUrl,
        environment: nodeEnv,
      };
    } catch (error) {
      this.logger.error('❌ Error configurando webhook:', error);
      return {
        success: false,
        message: `Error configurando webhook: ${error.message}`,
      };
    }
  }

  @Post('testing/create-test')
  @UseGuards(JwtAuthGuard)
  async createAgentTest(
    @Body()
    testData: {
      chat_history: any[];
      success_condition: string;
      success_examples: any[];
      failure_examples: any[];
      name: string;
      tool_call_parameters?: any;
      dynamic_variables?: any;
      type?: 'llm' | 'tool';
      from_conversation_metadata?: any;
    },
    @Request() req,
  ) {
    try {
      const accountId = req.user.accountId;

      // Crear el test usando ElevenLabs
      const result = await this.elevenLabsService.createAgentTest(
        accountId,
        testData,
      );

      return {
        success: true,
        testId: result.id,
        accountId,
        message: 'Test de agente creado exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        message: `Error creando test de agente: ${error.message}`,
      };
    }
  }

  @Get('test-connection')
  @UseGuards(JwtAuthGuard)
  async testConnection(@Request() req) {
    try {
      const accountId = req.user.accountId;
      
      this.logger.log(`🔍 Probando conexión con ElevenLabs para cuenta ${accountId}`);
      
      // Verificar configuración
      const config = await this.elevenLabsService.getConfig(accountId);
      if (!config.apiKey) {
        return {
          success: false,
          message: 'No hay API key configurada para ElevenLabs',
          hasApiKey: false,
        };
      }

      // Probar conexión obteniendo agentes
      const agents = await this.elevenLabsService.getAgents(accountId);
      
      return {
        success: true,
        message: 'Conexión con ElevenLabs exitosa',
        hasApiKey: true,
        agentsCount: agents.agents.length,
        accountId,
      };
    } catch (error) {
      this.logger.error(`❌ Error probando conexión con ElevenLabs:`, error);
      return {
        success: false,
        message: `Error de conexión: ${error.message}`,
        hasApiKey: false,
        error: error.response?.data || error.message,
      };
    }
  }

  @Post('test-create-agent')
  @UseGuards(JwtAuthGuard)
  async testCreateAgent(@Request() req) {
    try {
      const accountId = req.user.accountId;
      
      this.logger.log(`🧪 Probando creación de agente de prueba en ElevenLabs para cuenta ${accountId}`);
      
      // Crear agente de prueba
      const testAgent = await this.elevenLabsService.createAgent(accountId, {
        name: `Test Agent ${Date.now()}`,
        systemPrompt: 'Eres un agente de prueba para verificar la conexión con ElevenLabs.',
        firstMessage: 'Hola, soy un agente de prueba.',
        language: 'es',
        temperature: 0.7,
        voiceId: 'pNInz6obpgDQGcFmaJgB', // Voz por defecto
        interruptSensitivity: false,
        responseSpeed: false,
        initialMessageDelay: 0,
        llmModel: 'gpt-4o-mini',
        maxTokens: 1000,
        doubleCall: false,
        vmDetection: false,
      });

      return {
        success: true,
        message: 'Agente de prueba creado exitosamente en ElevenLabs',
        agentId: testAgent.agent_id,
        accountId,
      };
    } catch (error) {
      this.logger.error(`❌ Error creando agente de prueba:`, error);
      return {
        success: false,
        message: `Error creando agente de prueba: ${error.message}`,
        error: error.response?.data || error.message,
      };
    }
  }

  @Post('testing/run-tests/:agentId')
  @UseGuards(JwtAuthGuard)
  async runAgentTests(
    @Param('agentId') agentId: string,
    @Body()
    data: {
      tests: Array<{ test_id: string }>;
      agent_config_override?: any;
    },
    @Request() req,
  ) {
    try {
      const accountId = req.user.accountId;

      // Ejecutar tests en el agente usando ElevenLabs
      const result = await this.elevenLabsService.runAgentTests(
        accountId,
        agentId,
        data.tests,
        data.agent_config_override,
      );

      return {
        success: true,
        testRunId: result.id,
        testRuns: result.test_runs,
        agentId: result.agent_id,
        createdAt: result.created_at,
        accountId,
        message: 'Tests ejecutados exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        message: `Error ejecutando tests en agente: ${error.message}`,
      };
    }
  }

  @Post('phone-numbers/sync')
  @UseGuards(JwtAuthGuard)
  async syncPhoneNumbersWithElevenLabs(@Request() req) {
    const accountId = req.user.accountId;

    try {
      const result =
        await this.elevenLabsService.syncPhoneNumbersWithElevenLabs(accountId);

      return {
        success: true,
        synced: result.synced,
        failed: result.failed,
        message: result.message,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error sincronizando números con ElevenLabs: ${error.message}`,
      };
    }
  }

  @Post('phone-numbers/register-single')
  @UseGuards(JwtAuthGuard)
  async registerSinglePhoneNumber(
    @Body()
    data: {
      phoneNumberId: string;
      phoneNumber: string;
      twilioSid: string;
    },
    @Request() req,
  ) {
    const accountId = req.user.accountId;

    try {
      // Obtener configuración de Twilio para obtener el auth token
      const twilioConfig = await this.elevenLabsService[
        'prisma'
      ].accountTwilioConfig.findUnique({
        where: { accountId },
      });

      if (!twilioConfig) {
        return {
          success: false,
          message: 'Configuración de Twilio no encontrada para esta cuenta',
        };
      }

      // Registrar el número en ElevenLabs
      const result = await this.elevenLabsService.registerPhoneNumber(
        accountId,
        data.phoneNumber,
        data.twilioSid,
        twilioConfig.authToken,
        data.phoneNumber,
      );

      // Actualizar el registro con el ID de ElevenLabs
      await this.elevenLabsService['prisma'].phoneNumber.update({
        where: { id: data.phoneNumberId },
        data: {
          elevenLabsPhoneNumberId: result.phone_number_id,
        },
      });

      return {
        success: true,
        phone_number_id: result.phone_number_id,
        message: 'Número sincronizado exitosamente con ElevenLabs',
      };
    } catch (error) {
      return {
        success: false,
        message: `Error sincronizando número con ElevenLabs: ${error.message}`,
      };
    }
  }

  // ========== CUSTOM VOICES ENDPOINTS ==========

  @Get('custom-voices')
  async getCustomVoices(@Request() req) {
    return this.elevenLabsService.getCustomVoices(req.user.accountId);
  }

  @Post('custom-voices')
  async createCustomVoice(
    @Body()
    customVoiceData: {
      name: string;
      config: {
        type: string;
        voice_id: string;
        model_id?: string;
        stability?: number;
        similarity_boost?: number;
        [key: string]: any;
      };
    },
    @Request() req,
  ) {
    return this.elevenLabsService.createCustomVoice(
      req.user.accountId,
      customVoiceData,
    );
  }

  @Patch('custom-voices/:id')
  async updateCustomVoice(
    @Param('id') id: string,
    @Body()
    updateData: {
      name?: string;
      config?: {
        type?: string;
        voice_id?: string;
        model_id?: string;
        stability?: number;
        similarity_boost?: number;
        [key: string]: any;
      };
    },
    @Request() req,
  ) {
    return this.elevenLabsService.updateCustomVoice(
      req.user.accountId,
      id,
      updateData,
    );
  }

  @Delete('custom-voices/:id')
  async deleteCustomVoice(@Param('id') id: string, @Request() req) {
    return this.elevenLabsService.deleteCustomVoice(req.user.accountId, id);
  }

  @Post('custom-voices/preview')
  async generateVoicePreview(
    @Body()
    previewData: {
      voice_id: string;
      text?: string;
      model_id?: string;
      stability?: number;
      similarity_boost?: number;
    },
    @Request() req,
  ) {
    return this.elevenLabsService.generateVoicePreview(
      req.user.accountId,
      previewData,
    );
  }
}
