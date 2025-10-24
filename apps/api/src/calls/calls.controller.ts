import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConversationOrchestratorService } from '../conversation/conversation-orchestrator.service';
import { AccountGuard } from '../tenancy/account.guard';
import { CallsService } from './calls.service';
import { CallFilterDto, CallNotesDto, CallStatus } from './dto/call.dto';

@Controller('calls')
@UseGuards(JwtAuthGuard, AccountGuard)
export class CallsController {
  constructor(
    private readonly callsService: CallsService,
    private readonly conversationOrchestrator: ConversationOrchestratorService,
  ) {}

  @Get()
  findAll(
    @Request() _req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('direction') direction?: string,
    @Query('agentId') agentId?: string,
    @Query('campaignId') campaignId?: string,
    @Query('contactId') contactId?: string,
    @Query('phoneNumber') phoneNumber?: string,
    @Query('success') success?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    const filters: CallFilterDto = {
      status: status as CallStatus,
      type: type as any,
      direction: direction as any,
      agentId,
      campaignId,
      contactId,
      phoneNumber,
      success:
        success === 'true' ? true : success === 'false' ? false : undefined,
      dateFrom,
      dateTo,
    };

    return this.callsService.findAll(
      _req.user.accountId,
      pageNum,
      limitNum,
      filters,
    );
  }

  @Get('stats')
  getStats(
    @Request() _req,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('direction') direction?: string,
    @Query('agentId') agentId?: string,
    @Query('campaignId') campaignId?: string,
    @Query('contactId') contactId?: string,
    @Query('phoneNumber') phoneNumber?: string,
    @Query('success') success?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const filters: CallFilterDto = {
      status: status as CallStatus,
      type: type as any,
      direction: direction as any,
      agentId,
      campaignId,
      contactId,
      phoneNumber,
      success:
        success === 'true' ? true : success === 'false' ? false : undefined,
      dateFrom,
      dateTo,
    };

    return this.callsService.getStats(_req.user.accountId, filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() _req) {
    return this.callsService.findOne(id, _req.user.accountId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: CallStatus },
    @Request() _req,
  ) {
    return this.callsService.updateStatus(id, body.status, _req.user.accountId);
  }

  @Patch(':id/notes')
  updateNotes(
    @Param('id') id: string,
    @Body() notesDto: CallNotesDto,
    @Request() _req,
  ) {
    return this.callsService.updateNotes(id, notesDto, _req.user.accountId);
  }

  @Get(':id/analysis')
  getConversationAnalysis(@Param('id') id: string, @Request() _req) {
    return this.callsService.getConversationAnalysis(id, _req.user.accountId);
  }

  @Post(':id/analysis')
  createConversationAnalysis(
    @Param('id') id: string,
    @Body()
    analysisData: {
      transcript: string;
      sentiment: string;
      sentimentScore: number;
      intent: string;
      topics?: string[];
      keywords?: string[];
      summary?: string;
      qualityScore?: number;
      recommendations?: string[];
    },
    @Request() _req,
  ) {
    return this.callsService.createConversationAnalysis(
      id,
      analysisData,
      _req.user.accountId,
    );
  }

  // ===== ENDPOINTS DEL ORQUESTADOR DE CONVERSACIÓN =====

  @Post('outbound')
  @HttpCode(HttpStatus.OK)
  async makeOutboundCall(
    @Body()
    callData: {
      phoneNumber: string;
      agentId: string;
      agentPhoneNumberId?: string; // Nuevo campo opcional
      contactId?: string;
      campaignId?: string;
      instruction?: string;
    },
    @Request() _req,
  ) {
    try {
      // Iniciar llamada saliente usando Twilio
      const result = await this.callsService.makeOutboundCall(
        _req.user.accountId,
        callData.phoneNumber,
        callData.agentId,
        callData.contactId,
        callData.campaignId,
        callData.instruction,
        callData.agentPhoneNumberId, // Pasar el nuevo campo
      );

      return {
        success: true,
        message: 'Llamada iniciada exitosamente',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error iniciando llamada: ${error.message}`,
        error: error.message,
      };
    }
  }

  @Post(':callId/start-conversation')
  @HttpCode(HttpStatus.OK)
  async startConversation(
    @Param('callId') callId: string,
    @Body()
    streamConfig: {
      streamUrl: string;
      audioFormat?: 'mulaw' | 'linear';
      sampleRate?: number;
    },
    @Request() _req,
  ) {
    try {
      // Verificar que la llamada existe y pertenece al account
      const call = await this.callsService.findOne(callId, _req.user.accountId);
      if (!call) {
        throw new Error('Llamada no encontrada');
      }

      // Iniciar orquestación de conversación
      const context = await this.conversationOrchestrator.startConversation({
        callId,
        accountId: _req.user.accountId,
        agentId: call.agentId,
        contactId: call.contactId,
        streamUrl: streamConfig.streamUrl,
        audioFormat: streamConfig.audioFormat || 'mulaw',
        sampleRate: streamConfig.sampleRate || 8000,
      });

      return {
        success: true,
        message: 'Conversación iniciada exitosamente',
        data: {
          callId: context.callId,
          agentName: context.agentConfig.name,
          startTime: context.startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Error iniciando conversación: ${error.message}`,
        error: error.message,
      };
    }
  }

  @Post(':callId/process-audio')
  @HttpCode(HttpStatus.OK)
  async processAudio(
    @Param('callId') callId: string,
    @Body()
    audioData: {
      audioChunk: string; // Base64 encoded audio
      timestamp: number;
    },
    @Request() _req,
  ) {
    try {
      // Verificar que la llamada existe y pertenece al account
      const call = await this.callsService.findOne(callId, _req.user.accountId);
      if (!call) {
        throw new Error('Llamada no encontrada');
      }

      // Decodificar audio de base64
      const audioBuffer = Buffer.from(audioData.audioChunk, 'base64');

      // Procesar audio con el orquestador
      await this.conversationOrchestrator.processIncomingAudio(
        callId,
        audioBuffer,
      );

      return {
        success: true,
        message: 'Audio procesado exitosamente',
        data: {
          callId,
          timestamp: audioData.timestamp,
          processedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Error procesando audio: ${error.message}`,
        error: error.message,
      };
    }
  }

  @Post(':callId/end-conversation')
  @HttpCode(HttpStatus.OK)
  async endConversation(
    @Param('callId') callId: string,
    @Body()
    endData: {
      reason?: string;
    },
    @Request() _req,
  ) {
    try {
      // Verificar que la llamada existe y pertenece al account
      const call = await this.callsService.findOne(callId, _req.user.accountId);
      if (!call) {
        throw new Error('Llamada no encontrada');
      }

      // Finalizar conversación
      await this.conversationOrchestrator.endConversation(
        callId,
        endData.reason || 'completed',
      );

      return {
        success: true,
        message: 'Conversación finalizada exitosamente',
        data: {
          callId,
          endedAt: new Date().toISOString(),
          reason: endData.reason || 'completed',
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Error finalizando conversación: ${error.message}`,
        error: error.message,
      };
    }
  }

  @Get(':callId/conversation-metrics')
  getConversationMetrics(@Param('callId') callId: string, @Request() _req) {
    try {
      const metrics =
        this.conversationOrchestrator.getConversationMetrics(callId);

      if (!metrics) {
        return {
          success: false,
          message: 'Conversación no encontrada o no activa',
        };
      }

      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error obteniendo métricas: ${error.message}`,
        error: error.message,
      };
    }
  }

  @Get('active-conversations')
  getActiveConversations(@Request() _req) {
    try {
      const activeConversations =
        this.conversationOrchestrator.getActiveConversations();

      // Filtrar conversaciones del account actual
      const accountConversations = Array.from(activeConversations.entries())
        .filter(([_, context]) => context.accountId === _req.user.accountId)
        .map(([callId, context]) => ({
          callId,
          agentName: context.agentConfig.name,
          startTime: context.startTime,
          lastActivity: context.lastActivity,
          totalTurns: context.conversationHistory.length,
        }));

      return {
        success: true,
        data: {
          activeConversations: accountConversations,
          total: accountConversations.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Error obteniendo conversaciones activas: ${error.message}`,
        error: error.message,
      };
    }
  }
}
