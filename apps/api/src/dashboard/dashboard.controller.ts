import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Logger,
    Param,
    Post,
    Query,
    Request,
    Res,
    UseGuards,
} from '@nestjs/common';
import axios from 'axios';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConversationsService } from '../conversations/conversations.service';
import { ElevenLabsService } from '../integrations/elevenlabs/elevenlabs.service';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardIntegratedService } from './dashboard-integrated.service';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly dashboardIntegratedService: DashboardIntegratedService,
    private readonly conversationsService: ConversationsService,
    private readonly elevenLabsService: ElevenLabsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('stats')
  async getStats(@Request() req) {
    // Usar el servicio integrado que conecta con todas las APIs
    return this.dashboardIntegratedService.getStats(req.user.accountId);
  }

  @Get('recent-activity')
  async getRecentActivity(@Request() req) {
    // Usar el servicio integrado que conecta con todas las APIs
    return this.dashboardIntegratedService.getRecentActivity(
      req.user.accountId,
    );
  }

  @Get('analytics')
  async getAnalytics(
    @Request() req,
    @Query('agentId') agentId?: string,
    @Query('callType') callType?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('type') type?: string,
    @Query('phoneNumber') phoneNumber?: string,
  ) {
    // Usar el servicio integrado para obtener datos de analytics reales
    return this.dashboardIntegratedService.getAnalytics(req.user.accountId, {
      agentId,
      callType,
      dateFrom,
      dateTo,
      type,
      phoneNumber,
    });
  }

  // Endpoint para obtener métricas específicas de cada API
  @Get('integrations/status')
  async getIntegrationsStatus(@Request() req) {
    const accountId = req.user.accountId;

    const status = {
      twilio: false,
      elevenLabs: false,
      goHighLevel: false,
    };

    try {
      // Verificar Twilio - verificar que las credenciales estén configuradas
      const twilioService = this.dashboardIntegratedService.getTwilioService();
      const twilioConfig = await twilioService.getTwilioConfig(accountId);
      if (twilioConfig && twilioConfig.accountSid && twilioConfig.authToken) {
        // Verificar que las credenciales sean válidas haciendo una llamada real
        await twilioService.getCallMetrics(accountId);
        status.twilio = true;
      } else {
        status.twilio = false;
      }
    } catch (_error) {
      // console.warn('Twilio no configurado para este cliente:', _error.message);
      status.twilio = false;
    }

    try {
      // Verificar ElevenLabs - verifica AMBOS: API key del desarrollador (variables de entorno) Y API key del cliente (base de datos)
      const elevenLabsService =
        this.dashboardIntegratedService.getElevenLabsService();

      // 1. Verificar si el cliente tiene su propia API key en la base de datos
      const clientConfig = await elevenLabsService.getConfig(accountId);
      let clientApiKeyValid = false;

      if (clientConfig && clientConfig.apiKey) {
        try {
          // Validar la API key del cliente
          const tempClient = new ElevenLabsClient({
            apiKey: clientConfig.apiKey,
          });
          await tempClient.user.get();
          clientApiKeyValid = true;
          // console.log(`✅ ElevenLabs: API key del cliente ${accountId} válida`);
        } catch (_error) {
          // console.warn(
          //   `ElevenLabs: API key del cliente ${accountId} inválida:`,
          //   _error.message,
          // );
        }
      }

      // El estado es true si el cliente tiene API key configurada
      // NOTA: Las API keys de ElevenLabs están en la base de datos, no en el .env
      status.elevenLabs = clientApiKeyValid;

      if (status.elevenLabs) {
        // console.log('ElevenLabs: API key configurada correctamente');
      } else {
        // console.warn('ElevenLabs: API key no configurada o inválida');
      }
    } catch (_error) {
      // console.warn('ElevenLabs: Error verificando configuración:', _error.message);
      status.elevenLabs = false;
    }

    try {
      // Verificar GoHighLevel - verificar que las credenciales estén configuradas
      const ghlService = this.dashboardIntegratedService.getGHLService();
      const ghlConfig = await ghlService.getGHLConfig(accountId);
      if (ghlConfig && ghlConfig.apiKey) {
        // Verificar que las credenciales sean válidas haciendo una llamada real
        const ghlHealthy = await ghlService.healthCheck(accountId);
        status.goHighLevel = ghlHealthy;
      } else {
        status.goHighLevel = false;
      }
    } catch (_error) {
      // console.warn('GoHighLevel no configurado para este cliente:', _error.message);
      status.goHighLevel = false;
    }

    return {
      status,
      lastChecked: new Date().toISOString(),
    };
  }

  // ===== ENDPOINTS ESPECÍFICOS PARA DASHBOARD OVERVIEW =====

  // Cache temporal para IDs eliminados (en producción usar Redis o BD)
  private deletedCallIds = new Set<string>();

  @Post('sync-phone-numbers')
  async syncPhoneNumbers(@Request() req) {
    const accountId = req.user.accountId;

    try {
      this.logger.log(
        `🔄 Iniciando sincronización de números de teléfono para cuenta ${accountId}`,
      );

      // Obtener configuración de Twilio
      const twilioConfig = await this.prisma.accountTwilioConfig.findUnique({
        where: { accountId },
      });

      if (!twilioConfig) {
        throw new BadRequestException('Configuración de Twilio no encontrada');
      }

      // Obtener configuración de ElevenLabs
      const elevenLabsConfig =
        await this.prisma.accountElevenLabsConfig.findUnique({
          where: { accountId },
        });

      if (!elevenLabsConfig) {
        throw new BadRequestException(
          'Configuración de ElevenLabs no encontrada',
        );
      }

      // Obtener números de Twilio
      this.logger.log(`📞 Obteniendo números de Twilio...`);
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioConfig.accountSid}/IncomingPhoneNumbers.json`;
      const twilioResponse = await axios.get(twilioUrl, {
        auth: {
          username: twilioConfig.accountSid,
          password: twilioConfig.authToken,
        },
        timeout: 30000,
      });

      const twilioNumbers = twilioResponse.data.incoming_phone_numbers || [];
      this.logger.log(`✅ Obtenidos ${twilioNumbers.length} números de Twilio`);

      // Obtener números actuales de ElevenLabs
      this.logger.log(`📞 Obteniendo números actuales de ElevenLabs...`);
      const elevenLabsUrl = 'https://api.elevenlabs.io/v1/convai/phone-numbers';
      const elevenLabsResponse = await axios.get(elevenLabsUrl, {
        headers: {
          'xi-api-key': elevenLabsConfig.apiKey,
          Accept: 'application/json',
        },
        timeout: 30000,
      });

      const elevenLabsNumbers = elevenLabsResponse.data || [];
      this.logger.log(
        `✅ Obtenidos ${elevenLabsNumbers.length} números de ElevenLabs`,
      );

      // Sincronizar números
      const syncResults = [];

      for (const twilioNumber of twilioNumbers) {
        try {
          this.logger.log(
            `🔄 Sincronizando número ${twilioNumber.phone_number}...`,
          );

          // Verificar si el número ya existe en ElevenLabs
          const existingNumber = elevenLabsNumbers.find(
            (el) => el.phone_number === twilioNumber.phone_number,
          );

          if (existingNumber) {
            this.logger.log(
              `✅ Número ${twilioNumber.phone_number} ya existe en ElevenLabs`,
            );
            syncResults.push({
              number: twilioNumber.phone_number,
              status: 'already_synced',
              elevenLabsId: existingNumber.phone_number_id,
            });
            continue;
          }

          // Crear número en ElevenLabs
          const createUrl = 'https://api.elevenlabs.io/v1/convai/phone-numbers';
          const createResponse = await axios.post(
            createUrl,
            {
              phone_number: twilioNumber.phone_number,
              country: twilioNumber.phone_number.startsWith('+1') ? 'US' : 'DO',
            },
            {
              headers: {
                'xi-api-key': elevenLabsConfig.apiKey,
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              timeout: 30000,
            },
          );

          this.logger.log(
            `✅ Número ${twilioNumber.phone_number} sincronizado exitosamente`,
          );
          syncResults.push({
            number: twilioNumber.phone_number,
            status: 'synced',
            elevenLabsId: createResponse.data.phone_number_id,
          });
        } catch (_error) {
          this.logger.error(
            `❌ Error sincronizando número ${twilioNumber.phone_number}:`,
            _error.message,
          );
          syncResults.push({
            number: twilioNumber.phone_number,
            status: '_error',
            _error: _error.message,
          });
        }
      }

      this.logger.log(
        `✅ Sincronización completada: ${syncResults.length} números procesados`,
      );

      return {
        success: true,
        message: 'Sincronización completada',
        results: syncResults,
        summary: {
          total: syncResults.length,
          synced: syncResults.filter((r) => r.status === 'synced').length,
          already_synced: syncResults.filter(
            (r) => r.status === 'already_synced',
          ).length,
          errors: syncResults.filter((r) => r.status === '_error').length,
        },
      };
    } catch (_error) {
      this.logger.error('❌ Error en sincronización:', _error);
      throw new BadRequestException(
        `Error en sincronización: ${_error.message}`,
      );
    }
  }

  @Get('call-logs')
  async getCallLogs(@Request() req, @Query() query: any) {
    const accountId = req.user.accountId;

    try {
      let twilioCalls = [];
      let elevenLabsConversations = [];

      // Intentar obtener call logs de Twilio (si está configurado)
      try {
        const twilioService =
          this.dashboardIntegratedService.getTwilioService();
        twilioCalls = await twilioService.getRecentCalls(
          accountId,
          parseInt(query.limit) || 50,
        );
      } catch (twilioError) {
        // Si Twilio no está configurado, continuar solo con datos locales
        this.logger.warn(
          `Twilio no configurado para este cliente ${accountId}, usando solo datos locales:`,
          twilioError.message,
        );
        // twilioCalls = [];
      }

      // Obtener conversaciones de ElevenLabs directamente
      try {
        this.logger.log(
          `🔍 Obteniendo conversaciones de ElevenLabs para account ${accountId}`,
        );

        // Usar directamente el servicio de ElevenLabs en lugar del servicio de conversaciones
        const elevenLabsResponse =
          await this.elevenLabsService.getConversations(accountId, {
            page_size: parseInt(query.limit) || 50,
          });

        this.logger.log(
          `📊 ElevenLabs responde con ${elevenLabsResponse?.length || 0} conversaciones`,
        );

        // Obtener detalles de cada conversación para extraer números de teléfono
        this.logger.log(
          `🔍 Obteniendo detalles de ${elevenLabsResponse?.length || 0} conversaciones...`,
        );

        // Obtener detalles directamente de la API de ElevenLabs
        const conversationsWithDetails = await Promise.all(
          (elevenLabsResponse || []).map(async (conv: any) => {
            try {
              // Obtener detalles directamente de la API de ElevenLabs
              this.logger.log(
                `🔍 [Debug] Obteniendo detalles directamente para ${conv.conversation_id}...`,
              );

              const config = await this.elevenLabsService.getConfig(accountId);
              if (!config?.apiKey) {
                this.logger.error(
                  `No se encontró configuración para accountId: ${accountId}`,
                );
                return conv;
              }

              const detailsResponse = await axios.get(
                `https://api.elevenlabs.io/v1/convai/conversations/${conv.conversation_id}`,
                {
                  headers: {
                    'xi-api-key': config.apiKey,
                    Accept: 'application/json',
                  },
                  timeout: 10000,
                },
              );

              const details = detailsResponse.data;
              this.logger.log(
                `🔍 [Debug] Detalles obtenidos directamente para ${conv.conversation_id}: ${details ? 'Disponible' : 'No disponible'}`,
              );

              if (details) {
                this.logger.log(
                  `🔍 [Debug] Estructura de detalles: ${JSON.stringify(details, null, 2).substring(0, 500)}...`,
                );
              }

              return { ...conv, details };
            } catch (_error) {
              this.logger.warn(
                `No se pudieron obtener detalles para ${conv.conversation_id}:`,
                _error.message,
              );
              return conv;
            }
          }),
        );

        this.logger.log(
          `✅ Obtenidos detalles de ${conversationsWithDetails.length} conversaciones`,
        );

        elevenLabsConversations = conversationsWithDetails
          .map((conv: any) => {
            // Determinar el tipo de llamada y estado
            const callType =
              conv.direction === 'inbound' ? 'inbound' : 'outbound';
            const callStatus =
              conv.call_successful === 'success' ? 'answered' : 'no_answer';
            const hasConversation =
              conv.message_count > 0 && conv.transcript_summary;

            // Extraer números de teléfono de los detalles
            const phoneCall = conv.details?.metadata?.phone_call;
            const dynamicVars =
              conv.details?.conversation_initiation_client_data
                ?.dynamic_variables;

            // Debug: Log de la estructura de detalles
            this.logger.log(
              `🔍 [Debug] Estructura de detalles para ${conv.conversation_id}:`,
            );
            this.logger.log(
              `   - details: ${conv.details ? 'Disponible' : 'No disponible'}`,
            );
            this.logger.log(
              `   - phoneCall: ${phoneCall ? 'Disponible' : 'No disponible'}`,
            );
            this.logger.log(
              `   - dynamicVars: ${dynamicVars ? 'Disponible' : 'No disponible'}`,
            );

            if (phoneCall) {
              this.logger.log(
                `   - phoneCall.agent_number: ${phoneCall.agent_number}`,
              );
              this.logger.log(
                `   - phoneCall.external_number: ${phoneCall.external_number}`,
              );
              this.logger.log(
                `   - phoneCall.direction: ${phoneCall.direction}`,
              );
            }

            if (dynamicVars) {
              this.logger.log(
                `   - dynamicVars.system__caller_id: ${dynamicVars.system__caller_id}`,
              );
              this.logger.log(
                `   - dynamicVars.system__called_number: ${dynamicVars.system__called_number}`,
              );
            }

            // Debug: Log de transcripción
            const transcriptSummary =
              conv.details?.analysis?.transcript_summary;
            const transcriptArray = conv.details?.transcript;
            this.logger.log(
              `🔍 [Debug] Datos de transcripción para ${conv.conversation_id}:`,
            );
            this.logger.log(
              `   - transcript_summary: ${transcriptSummary ? 'Disponible' : 'No disponible'}`,
            );
            this.logger.log(
              `   - transcript array: ${transcriptArray ? `${transcriptArray.length} mensajes` : 'No disponible'}`,
            );

            if (transcriptArray && Array.isArray(transcriptArray) && transcriptArray.length > 0) {
              this.logger.log(
                `   - Primer mensaje completo: ${JSON.stringify(transcriptArray[0], null, 2)}`,
              );
              this.logger.log(
                `   - Segundo mensaje completo: ${JSON.stringify(transcriptArray[1], null, 2)}`,
              );
            }

            if (transcriptSummary) {
              this.logger.log(
                `   - transcript_summary content: ${transcriptSummary.substring(0, 100)}...`,
              );
            }

            // Determinar números de contacto y agente
            let contactNumber = 'No disponible';
            let agentNumber = 'No disponible';
            let fromNumber = 'No disponible';
            let toNumber = 'No disponible';

            if (phoneCall) {
              agentNumber = phoneCall.agent_number || 'No disponible';
              contactNumber = phoneCall.external_number || 'No disponible';
              fromNumber =
                phoneCall.direction === 'outbound'
                  ? phoneCall.agent_number
                  : phoneCall.external_number;
              toNumber =
                phoneCall.direction === 'outbound'
                  ? phoneCall.external_number
                  : phoneCall.agent_number;
              this.logger.log(
                `✅ [Debug] Usando datos de phoneCall: contactNumber=${contactNumber}, agentNumber=${agentNumber}`,
              );
            } else if (dynamicVars) {
              agentNumber = dynamicVars.system__caller_id || 'No disponible';
              contactNumber =
                dynamicVars.system__called_number || 'No disponible';
              fromNumber =
                conv.direction === 'outbound'
                  ? dynamicVars.system__caller_id
                  : dynamicVars.system__called_number;
              toNumber =
                conv.direction === 'outbound'
                  ? dynamicVars.system__called_number
                  : dynamicVars.system__caller_id;
              this.logger.log(
                `✅ [Debug] Usando datos de dynamicVars: contactNumber=${contactNumber}, agentNumber=${agentNumber}`,
              );
            } else {
              this.logger.warn(
                `⚠️ [Debug] No se encontraron datos de teléfono para ${conv.conversation_id}`,
              );
            }

            // Extraer transcripción completa (no resumen)
            let finalTranscript = '';

            try {
              // Priorizar transcripción completa sobre resumen
              if (
                conv.details?.transcript &&
                Array.isArray(conv.details.transcript) &&
                conv.details.transcript.length > 0
              ) {
                // Construir transcripción completa desde el array de mensajes
                // ORDENAR mensajes por timestamp si está disponible para mantener orden cronológico
                const sortedTranscript = [...conv.details.transcript].sort((a, b) => {
                  const timeA = a.timestamp || a.start_time || 0;
                  const timeB = b.timestamp || b.start_time || 0;
                  return timeA - timeB;
                });

                // Función helper para convertir segundos a formato MM:SS
                const formatTimestamp = (seconds: number): string => {
                  const mins = Math.floor(seconds / 60);
                  const secs = Math.floor(seconds % 60);
                  return `${mins}:${secs.toString().padStart(2, '0')}`;
                };

                finalTranscript = sortedTranscript
                  .map((t: any, index: number) => {
                    // Log detallado de cada mensaje para debugging
                    this.logger.log(
                      `🔍 [Debug] Procesando mensaje ${index + 1}:`,
                      JSON.stringify(t, null, 2),
                    );

                    // Intentar obtener el speaker de diferentes campos posibles
                    let speaker = 'Usuario';
                    if (t.speaker === 'user' || t.speaker === 'user_input' || t.speaker === 'User') {
                      speaker = 'Usuario';
                    } else if (t.speaker === 'agent' || t.speaker === 'agent_output' || t.speaker === 'Agent') {
                      speaker = 'Agente';
                    } else if (t.speaker) {
                      speaker = t.speaker;
                    }
                    
                    const message = t.message || t.text || t.transcript || t.content || '';
                    
                    // Intentar obtener timestamp de diferentes campos posibles
                    let timestamp = t.timestamp || t.start_time || t.time || t.offset || t.start_time_unix_secs;
                    
                    // SOLO usar timestamp real de ElevenLabs, NO inventar datos
                    if (timestamp === undefined || timestamp === null || timestamp === 0) {
                      // Si no hay timestamp real, omitir el timestamp en lugar de inventarlo
                      this.logger.warn(
                        `⚠️ No hay timestamp disponible para mensaje ${index + 1}, omitiendo timestamp`,
                      );
                      return `${speaker}: ${message}`;
                    }
                    
                    // Convertir a segundos si está en milisegundos
                    if (timestamp > 1000000000) { // Probablemente en milisegundos o unix timestamp
                      // Si es un timestamp Unix muy grande, es milisegundos
                      if (timestamp > 1600000000000 && timestamp < 3000000000000) {
                        timestamp = timestamp / 1000;
                      } else {
                        // Es un timestamp Unix en segundos, extraer solo los segundos desde el inicio
                        // Necesitamos el start_time_unix_secs del inicio de la llamada
                        const callStartTime = conv.start_time_unix_secs || conv.details?.metadata?.start_time_unix_secs;
                        if (callStartTime) {
                          timestamp = timestamp - callStartTime;
                        }
                      }
                    }
                    
                    // Convertir a formato MM:SS
                    const timeStr = formatTimestamp(timestamp);
                    return `[${timeStr}] ${speaker}: ${message}`;
                  })
                  .join('\n\n'); // Separar mensajes con doble salto de línea para legibilidad
                
                this.logger.log(
                  `📝 [Debug] Transcripción completa extraída desde transcript array: ${finalTranscript.length} caracteres, ${sortedTranscript.length} mensajes`,
                );
                this.logger.log(
                  `📝 [Debug] Primeros 500 caracteres de la transcripción final: ${finalTranscript.substring(0, 500)}`,
                );
              } else if (conv.details?.analysis?.transcript_summary) {
                // Si no hay transcripción completa, usar el resumen como fallback
                finalTranscript = conv.details.analysis.transcript_summary;
                this.logger.log(
                  `📝 [Debug] Usando transcript_summary como fallback: ${finalTranscript.length} caracteres`,
                );
                this.logger.warn(
                  `⚠️ [Debug] Transcripción completa no disponible, usando resumen para ${conv.conversation_id}`,
                );
              } else if (conv.transcript_summary) {
                finalTranscript = conv.transcript_summary;
                this.logger.log(
                  `📝 [Debug] Usando transcript_summary del nivel superior: ${finalTranscript.length} caracteres`,
                );
              } else if (conv.transcript) {
                finalTranscript = conv.transcript;
                this.logger.log(
                  `📝 [Debug] Usando transcript del nivel superior: ${finalTranscript.length} caracteres`,
                );
              } else {
                this.logger.warn(
                  `⚠️ [Debug] No hay transcripción disponible para ${conv.conversation_id}`,
                );
              }
            } catch (transcriptError) {
              this.logger.error(
                `❌ [Debug] Error extrayendo transcripción: ${transcriptError.message}`,
              );
              finalTranscript = '';
            }

            this.logger.log(
              `📝 [Debug] Transcripción final para ${conv.conversation_id}: ${finalTranscript ? `${finalTranscript.length} caracteres` : 'Vacía'}`,
            );
            if (finalTranscript) {
              this.logger.log(
                `   - Contenido: ${finalTranscript.substring(0, 200)}...`,
              );
            }

            // Extraer URL del audio
            const audioUrl =
              conv.recording_url ||
              conv.recordingUrl ||
              `${process.env.APP_URL || `${process.env.API_PROTOCOL || 'http'}://${process.env.API_HOST || 'localhost'}:${process.env.API_PORT || '3004'}`}/api/v1/audio/${conv.conversation_id}?accountId=${req.user.accountId}`;
            this.logger.log(
              `🎵 [Debug] URL del audio para ${conv.conversation_id}: ${audioUrl}`,
            );

            return {
              id: conv.conversation_id,
              contactName: '---', // ElevenLabs no proporciona nombre de contacto
              agentName: conv.agent_name || 'Agente ElevenLabs',
              contactNumber,
              agentNumber,
              from: fromNumber,
              to: toNumber,
              status: callStatus, // 'answered' o 'no_answer'
              direction: callType, // 'inbound' o 'outbound'
              duration: conv.call_duration_secs || conv.duration || 0,
              startTime: conv.start_time_unix_secs
                ? new Date(conv.start_time_unix_secs * 1000)
                : new Date(),
              endTime: conv.start_time_unix_secs
                ? new Date(
                    (conv.start_time_unix_secs +
                      (conv.call_duration_secs || 0)) *
                      1000,
                  )
                : null,
              price: 0,
              recordingUrl:
                conv.recording_url ||
                conv.recordingUrl ||
                `${process.env.APP_URL || `${process.env.API_PROTOCOL || 'http'}://${process.env.API_HOST || 'localhost'}:${process.env.API_PORT || '3004'}`}/api/v1/audio/${conv.conversation_id}?accountId=${req.user.accountId}` ||
                null,
              transcript: finalTranscript, // Usar la transcripción completa extraída
              transcriptLength: finalTranscript ? finalTranscript.length : 0, // Agregar longitud para debugging
              hasAudio: conv.hasAudio || false,
              callSuccessful:
                conv.call_successful === 'success' ? 'success' : 'failure',
              agentId: conv.agent_id,
              elevenLabsConversationId: conv.conversation_id,
              source: 'elevenlabs', // Marcar como origen ElevenLabs
              // Información adicional para debugging
              messageCount: conv.message_count || 0,
              hasConversation,
              callType,
              // Métricas y metadatos adicionales de ElevenLabs
              metadata: {
                // Costos (convertir de centavos a dólares)
                cost: conv.details?.metadata?.cost ? conv.details.metadata.cost / 100 : (conv.cost ? conv.cost / 100 : null),
                llmTotalCost: conv.details?.metadata?.charging?.llm_price || null,
                costPerMinute: conv.details?.metadata?.cost_per_minute ? conv.details.metadata.cost_per_minute / 100 : null,
                // Tokens usados (sumar input y output de todas las generaciones)
                tokensUsed: (() => {
                  const llmUsage = conv.details?.metadata?.charging?.llm_usage;
                  if (llmUsage) {
                    let totalTokens = 0;
                    // Sumar tokens de irreversible_generation
                    if (llmUsage.irreversible_generation?.model_usage) {
                      Object.values(llmUsage.irreversible_generation.model_usage).forEach((model: any) => {
                        totalTokens += (model.input?.tokens || 0) + (model.output_total?.tokens || 0);
                      });
                    }
                    // Sumar tokens de initiated_generation
                    if (llmUsage.initiated_generation?.model_usage) {
                      Object.values(llmUsage.initiated_generation.model_usage).forEach((model: any) => {
                        totalTokens += (model.input?.tokens || 0) + (model.output_total?.tokens || 0);
                      });
                    }
                    return totalTokens;
                  }
                  return conv.details?.metadata?.tokens_used || conv.tokens_used || null;
                })(),
                // Duración real
                callDuration: conv.details?.metadata?.call_duration_secs || conv.call_duration_secs || conv.duration || null,
                // Información completa de los detalles
                fullDetails: conv.details || {},
              }, // 'inbound' o 'outbound'
              callStatus, // 'answered' o 'no_answer'
            };
          })
          .filter((conv) => conv !== null); // Filtrar conversaciones nulas

        this.logger.log(
          `✅ Obtenidas ${elevenLabsConversations.length} conversaciones de ElevenLabs con detalles completos`,
        );
        
        // Log de ejemplo de los metadatos enviados
        if (elevenLabsConversations.length > 0) {
          this.logger.log(
            `📊 Ejemplo de metadatos enviados para la primera conversación:`,
            JSON.stringify(elevenLabsConversations[0].metadata, null, 2),
          );
        }
      } catch (elevenLabsError) {
        this.logger.warn(
          `ElevenLabs no configurado o _error para este cliente ${accountId}:`,
          elevenLabsError.message,
        );
        elevenLabsConversations = [];
      }

      // Obtener call logs locales
      // const prisma = this.dashboardIntegratedService.getPrisma();
      // const localCalls = await prisma.call.findMany({
      //   where: {
      //     accountId,
      //     ...(query.from &&
      //       query.to && {
      //         createdAt: {
      //           gte: new Date(query.from),
      //           lte: new Date(query.to),
      //         },
      //       }),
      //     ...(query.outcome && { status: query.outcome }),
      //     ...(query.direction && { direction: query.direction }),
      //   },
      //   include: {
      //     agent: {
      //       select: {
      //         id: true,
      //         name: true,
      //       },
      //     },
      //     contact: {
      //       select: {
      //         id: true,
      //         name: true,
      //         lastName: true,
      //       },
      //     },
      //   },
      //   orderBy: { createdAt: 'desc' },
      //   take: parseInt(query.limit) || 50,
      // });

      // Filtrar conversaciones eliminadas
      const filteredElevenLabsConversations = elevenLabsConversations.filter(
        (conv) =>
          !this.deletedCallIds.has(conv.id) &&
          !this.deletedCallIds.has(conv.elevenLabsConversationId),
      );

      // const filteredTwilioCalls = twilioCalls.filter(
      //   (call) => !this.deletedCallIds.has(call.id),
      // );

      // SOLO MOSTRAR CONVERSACIONES REALES DE ELEVENLABS
      // Eliminar todos los datos mock/falsos y solo mostrar datos reales
      const allCalls = [
        ...filteredElevenLabsConversations, // Solo conversaciones reales de ElevenLabs
        // Eliminamos Twilio y datos locales para mostrar solo datos reales
      ];

      this.logger.log(
        `✅ Mostrando solo datos reales: ${allCalls.length} conversaciones reales de ElevenLabs`,
      );

      // Debug: Log de las conversaciones que se están devolviendo
      if (allCalls.length > 0) {
        this.logger.log(
          '🔍 Primera conversación que se devuelve:',
          JSON.stringify(allCalls[0], null, 2),
        );
      } else {
        this.logger.warn('⚠️ No hay conversaciones para devolver');
      }

      // Debug: Log detallado de las conversaciones
      if (allCalls.length > 0) {
        this.logger.log('📋 Conversaciones que se van a mostrar:');
        allCalls.forEach((call, index) => {
          this.logger.log(
            `${index + 1}. ID: ${call.id}, Agent: ${call.agentName}, Direction: ${call.direction}, Duration: ${call.duration}`,
          );
        });
      } else {
        this.logger.warn(
          '⚠️ No se encontraron conversaciones reales para mostrar',
        );
      }

      // Las conversaciones de ElevenLabs ya tienen los datos reales, no necesitamos procesamiento adicional
      const callsWithRealPhoneNumbers = allCalls;

      // Aplicar paginación
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 50;
      const offset = (page - 1) * limit;

      const paginatedCalls = callsWithRealPhoneNumbers.slice(
        offset,
        offset + limit,
      );

      return {
        calls: paginatedCalls,
        total: callsWithRealPhoneNumbers.length,
        page,
        limit,
        totalPages: Math.ceil(callsWithRealPhoneNumbers.length / limit),
        filters: query,
        dataSources: {
          elevenlabs: filteredElevenLabsConversations.length > 0,
          realDataOnly: true, // Solo datos reales, sin mocks
        },
      };
    } catch (_error) {
      this.logger.error('Error obteniendo call logs:', _error);
      // En lugar de lanzar el _error, devolver una respuesta con _error
      return {
        calls: [],
        total: 0,
        filters: query,
        dataSources: {
          elevenlabs: false,
          realDataOnly: true,
        },
        _error: 'Error obteniendo call logs. Por favor, intente nuevamente.',
      };
    }
  }

  @Get('user-info')
  async getUserInfo(@Request() req) {
    const accountId = req.user.accountId;

    try {
      // Función para generar Client ID de 12 dígitos basado en el accountId
      const generateClientId = (accountId: string): string => {
        // Usar el accountId como seed para generar un número consistente
        let hash = 0;
        for (let i = 0; i < accountId.length; i++) {
          const char = accountId.charCodeAt(i);
          hash = (hash << 5) - hash + char;
          hash = hash & hash; // Convertir a 32-bit integer
        }

        // Tomar el valor absoluto y generar un número de 12 dígitos
        const num = Math.abs(hash);
        const clientId = (num % 1000000000000).toString().padStart(12, '0');
        return clientId;
      };

      // Si es el super admin, devolver información virtual
      const adminEmail = '';
      if (req.user.sub === adminEmail) {
        return {
          id: req.user.sub,
          firstName: req.user.firstName || 'Super',
          lastName: req.user.lastName || 'Admin',
          email: req.user.email,
          clientId: generateClientId(req.user.accountId),
          accountBalance: 0,
          accountStatus: 'active',
          createdAt: new Date().toISOString(),
        };
      }

      // Obtener información del usuario desde la base de datos
      const prisma = this.dashboardIntegratedService.getPrisma();
      const user = await prisma.user.findFirst({
        where: { accountId },
        include: { account: true },
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        clientId: generateClientId(user.accountId),
        accountBalance: 0, // No hay campo balance en el esquema actual
        accountStatus: 'active', // user.account?.status || 'active',
        createdAt: user.createdAt,
      };
    } catch (_error) {
      // console.error('Error obteniendo información del usuario:', _error);
      throw _error;
    }
  }

  @Get('phone-numbers')
  async getPhoneNumbers(@Request() req) {
    const accountId = req.user.accountId;
    this.logger.log(
      `Obteniendo números de teléfono para la cuenta ${accountId}`,
    );

    try {
      // Paso 1: Ejecutar sincronización y esperar a que termine para obtener datos actualizados
      const twilioService = this.dashboardIntegratedService.getTwilioService();
      let syncResult;

      try {
        this.logger.log(
          `Iniciando sincronización de números para cuenta ${accountId}`,
        );
        syncResult = await twilioService.syncTwilioPhoneNumbers(accountId);
        this.logger.log(
          `Sincronización completada para ${accountId}: ${(syncResult as any)?.message}`,
        );
      } catch (syncError) {
        this.logger.warn(
          `Sincronización falló para ${accountId}: ${syncError.message}`,
        );
        // Continuar aunque la sincronización falle
      }

      // Paso 2: Obtener números desde nuestra base de datos local (actualizados por la sincronización)
      const prisma = this.dashboardIntegratedService.getPrisma();
      const localNumbers = await prisma.phoneNumber.findMany({
        where: { accountId, status: { not: 'released' } },
        orderBy: { createdAt: 'desc' },
      });

      this.logger.log(
        `📊 Devolviendo ${localNumbers.length} números locales para la cuenta ${accountId}`,
      );

      // Log detallado de los números encontrados
      if (localNumbers.length > 0) {
        this.logger.log(
          `📱 Números encontrados en BD:`,
          localNumbers.map((n) => ({
            id: n.id,
            number: n.number,
            country: n.country,
            status: n.status,
            twilioSid: n.twilioSid,
          })),
        );
      } else {
        this.logger.log(
          `⚠️ No se encontraron números en la base de datos para la cuenta ${accountId}`,
        );
      }

      // Obtener números reales de ElevenLabs para verificar sincronización
      let elevenLabsNumbers = [];
      try {
        // Obtener configuración de ElevenLabs
        const elevenLabsConfig =
          await this.prisma.accountElevenLabsConfig.findUnique({
            where: { accountId },
          });

        if (elevenLabsConfig?.apiKey) {
          try {
            const elevenLabsResponse = await axios.get(
              'https://api.elevenlabs.io/v1/convai/phone-numbers',
              {
                headers: {
                  'xi-api-key': elevenLabsConfig.apiKey,
                  Accept: 'application/json',
                },
                timeout: 10000, // Reducir timeout para evitar bloqueos
              },
            );
            elevenLabsNumbers = elevenLabsResponse.data || [];
            this.logger.log(
              `✅ Obtenidos ${elevenLabsNumbers.length} números reales de ElevenLabs`,
            );
          } catch (elevenLabsError) {
            // No propagar errores de ElevenLabs - solo loggear
            this.logger.warn(
              `⚠️ Error consultando ElevenLabs (no crítico): ${elevenLabsError.message}`,
            );
            // Continuar sin datos de ElevenLabs
            elevenLabsNumbers = [];
          }
        } else {
          this.logger.log(
            `ℹ️ No hay configuración de ElevenLabs para la cuenta ${accountId}`,
          );
        }
      } catch (configError) {
        this.logger.warn(
          `⚠️ Error obteniendo configuración de ElevenLabs (no crítico): ${configError.message}`,
        );
        // Continuar sin datos de ElevenLabs
        elevenLabsNumbers = [];
      }

      // Mapear al formato consistente que espera el frontend.
      return localNumbers.map((number) => {
        // Verificar si el número realmente está sincronizado con ElevenLabs
        const isReallySynced =
          number.elevenLabsPhoneNumberId &&
          elevenLabsNumbers.some(
            (el) => el.phone_number_id === number.elevenLabsPhoneNumberId,
          );

        return {
          id: number.id,
          number: number.number, // Campo correcto del esquema
          country: number.country,
          capabilities: number.capabilities,
          status: number.status,
          elevenLabsPhoneNumberId: isReallySynced
            ? number.elevenLabsPhoneNumberId
            : null, // Solo si realmente existe
          twilioSid: number.twilioSid, // Twilio SID para sincronización
          createdAt: number.createdAt.toISOString(),
          updatedAt: number.updatedAt.toISOString(),
        };
      });
    } catch (_error) {
      this.logger.error(
        `Error crítico obteniendo números telefónicos para ${accountId}:`,
        _error,
      );
      throw new BadRequestException(
        'Ocurrió un _error al obtener los números de teléfono.',
      );
    }
  }

  @Post('call-logs/export')
  async exportCallLogs(@Request() req, @Body() exportData: any) {
    const accountId = req.user.accountId;

    try {
      // Implementar lógica de exportación
      const prisma = this.dashboardIntegratedService.getPrisma();
      const calls = await prisma.call.findMany({
        where: {
          accountId,
          ...(exportData.filters && {
            createdAt: {
              gte: new Date(exportData.filters.from),
              lte: new Date(exportData.filters.to),
            },
          }),
        },
        orderBy: { createdAt: 'desc' },
      });

      // Generar CSV o Excel
      const csvData = calls.map((call) => ({
        'Contact Name': '---', // No hay campo contactName en el esquema actual
        'Agent Name': '---', // No hay campo agentName en el esquema actual
        'Contact Number': call.phoneNumber,
        'Agent Number': call.phoneNumber,
        Outcome: call.status,
        Direction: call.direction,
        Date: call.createdAt,
        Duration: call.duration,
        Cost: 0, // No hay campo cost en el esquema actual
      }));

      return {
        data: csvData,
        format: exportData.format || 'csv',
        filename: `call-logs-${new Date().toISOString().split('T')[0]}.csv`,
      };
    } catch (_error) {
      // console.error('Error exportando call logs:', _error);
      throw _error;
    }
  }

  @Post('call-logs/summary')
  async generateCallSummary(@Request() req, @Body() summaryData: any) {
    const accountId = req.user.accountId;

    try {
      // Obtener datos para el resumen
      const stats = await this.dashboardIntegratedService.getStats(accountId);
      const prisma = this.dashboardIntegratedService.getPrisma();
      const recentCalls = await prisma.call.findMany({
        where: {
          accountId,
          ...(summaryData.dateRange && {
            createdAt: {
              gte: new Date(summaryData.dateRange.from),
              lte: new Date(summaryData.dateRange.to),
            },
          }),
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });

      // Generar resumen con IA (usando ElevenLabs o OpenAI)
      const summary = {
        totalCalls: stats.totalCalls,
        answeredCalls: stats.answeredCalls,
        missedCalls: stats.missedCalls,
        successRate: stats.successRate,
        totalMinutes: stats.totalMinutes,
        totalCost: stats.totalCost,
        averageDuration: stats.averageDuration,
        topOutcomes: this.calculateTopOutcomes(recentCalls),
        recommendations: this.generateRecommendations(stats, recentCalls),
        generatedAt: new Date().toISOString(),
      };

      return summary;
    } catch (_error) {
      // console.error('Error generando resumen:', _error);
      throw _error;
    }
  }

  @Delete('call-logs/:callId')
  async deleteCallLog(@Request() req, @Param('callId') callId: string) {
    const accountId = req.user.accountId;

    try {
      this.logger.log(
        `🗑️ Eliminando call log ${callId} para account ${accountId}`,
      );

      const prisma = this.dashboardIntegratedService.getPrisma();

      // Buscar la llamada en la base de datos
      const call = await prisma.call.findFirst({
        where: {
          OR: [
            { id: callId, accountId },
            { elevenLabsConversationId: callId, accountId },
          ],
        },
      });

      if (call) {
        // Si es una conversación de ElevenLabs, eliminarla también de ElevenLabs
        if (call.elevenLabsConversationId) {
          try {
            this.logger.log(
              `🗑️ Eliminando conversación de ElevenLabs: ${call.elevenLabsConversationId}`,
            );
            await this.conversationsService.deleteConversation(
              accountId,
              call.elevenLabsConversationId,
            );
            this.logger.log(
              `✅ Conversación de ElevenLabs ${call.elevenLabsConversationId} eliminada exitosamente`,
            );
          } catch (elevenLabsError) {
            this.logger.warn(
              `⚠️ Error eliminando conversación de ElevenLabs: ${elevenLabsError.message}`,
            );
            // Continuar con la eliminación local aunque falle ElevenLabs
          }
        }

        // Eliminar la llamada de la base de datos local
        await prisma.call.delete({
          where: { id: call.id },
        });

        this.logger.log(`✅ Call log ${callId} eliminado exitosamente`);

        // Agregar a la blacklist para que no aparezca en futuras consultas
        this.deletedCallIds.add(callId);

        return {
          success: true,
          message: 'Conversación eliminada exitosamente',
          deletedCallId: callId,
        };
      }

      // Si no se encuentra en la base de datos local, verificar si es un Call SID de Twilio
      // o un Conversation ID de ElevenLabs
      if (callId.startsWith('CA')) {
        // Es un Call SID de Twilio - las llamadas de Twilio no se pueden eliminar
        // pero podemos intentar encontrar la conversación de ElevenLabs asociada
        this.logger.log(
          `🔍 Call SID de Twilio ${callId} - buscando conversación de ElevenLabs asociada`,
        );

        // Intentar obtener conversaciones de ElevenLabs para encontrar la asociada
        try {
          const elevenLabsResponse =
            await this.conversationsService.getConversations(accountId, {
              pageSize: 100,
              summaryMode: 'exclude',
            });

          // Buscar conversación que pueda estar asociada con este Call SID
          const associatedConversation = elevenLabsResponse.conversations.find(
            (conv) => {
              // Verificar si hay alguna relación en los metadatos
              return (
                conv.conversation_id &&
                conv.conversation_id.includes(callId.substring(0, 10))
              );
            },
          );

          if (associatedConversation) {
            this.logger.log(
              `🗑️ Eliminando conversación de ElevenLabs asociada: ${associatedConversation.conversation_id}`,
            );
            await this.conversationsService.deleteConversation(
              accountId,
              associatedConversation.conversation_id,
            );
            this.logger.log(
              `✅ Conversación de ElevenLabs ${associatedConversation.conversation_id} eliminada exitosamente`,
            );

            // Agregar ambos IDs a la blacklist
            this.deletedCallIds.add(callId);
            this.deletedCallIds.add(associatedConversation.conversation_id);

            return {
              success: true,
              message:
                'Conversación de ElevenLabs asociada eliminada exitosamente',
              deletedCallId: callId,
              deletedConversationId: associatedConversation.conversation_id,
            };
          } else {
            this.logger.log(
              `⚠️ No se encontró conversación de ElevenLabs asociada con Call SID ${callId}`,
            );

            // Agregar a la blacklist para que no aparezca en futuras consultas
            this.deletedCallIds.add(callId);

            return {
              success: true,
              message:
                'Call SID de Twilio marcado como eliminado (no se puede eliminar del sistema de Twilio)',
              deletedCallId: callId,
            };
          }
        } catch (_error) {
          this.logger.warn(
            `⚠️ Error buscando conversación asociada: ${_error.message}`,
          );

          // Agregar a la blacklist para que no aparezca en futuras consultas
          this.deletedCallIds.add(callId);

          return {
            success: true,
            message: 'Call SID de Twilio marcado como eliminado',
            deletedCallId: callId,
          };
        }
      } else {
        // Podría ser un Conversation ID de ElevenLabs directo
        try {
          this.logger.log(
            `🗑️ Intentando eliminar conversación directamente de ElevenLabs: ${callId}`,
          );
          await this.conversationsService.deleteConversation(accountId, callId);
          this.logger.log(
            `✅ Conversación de ElevenLabs ${callId} eliminada exitosamente`,
          );

          // Agregar a la blacklist para que no aparezca en futuras consultas
          this.deletedCallIds.add(callId);

          return {
            success: true,
            message: 'Conversación eliminada de ElevenLabs exitosamente',
            deletedCallId: callId,
          };
        } catch (elevenLabsError) {
          this.logger.warn(
            `⚠️ No se pudo eliminar la conversación ${callId} de ElevenLabs: ${elevenLabsError.message}`,
          );

          // Agregar a la blacklist para que no aparezca en futuras consultas
          this.deletedCallIds.add(callId);

          return {
            success: true,
            message: 'Conversación marcada como eliminada',
            deletedCallId: callId,
          };
        }
      }
    } catch (_error) {
      this.logger.error(`❌ Error eliminando call log ${callId}:`, _error);
      return {
        success: false,
        message: 'Error eliminando conversación',
        _error: _error.message,
      };
    }
  }

  @Delete('call-logs/bulk')
  async deleteBulkCallLogs(
    @Request() req,
    @Body() body: { callIds: string[] },
  ) {
    const accountId = req.user.accountId;
    const { callIds } = body;

    try {
      this.logger.log(
        `🗑️ Eliminando ${callIds.length} call logs para account ${accountId}`,
      );

      if (!callIds || callIds.length === 0) {
        throw new BadRequestException(
          'No se proporcionaron IDs de llamadas para eliminar',
        );
      }

      const prisma = this.dashboardIntegratedService.getPrisma();
      let deletedCount = 0;
      const results = [];

      // Procesar cada ID individualmente para manejar diferentes tipos de conversaciones
      for (const callId of callIds) {
        try {
          // Verificar si es una conversación de ElevenLabs
          const callFromDb = await prisma.call.findFirst({
            where: {
              elevenLabsConversationId: callId,
              accountId,
            },
          });

          if (callFromDb) {
            // Eliminar conversación de ElevenLabs también de ElevenLabs
            try {
              this.logger.log(
                `🗑️ Eliminando conversación de ElevenLabs: ${callFromDb.elevenLabsConversationId}`,
              );
              await this.conversationsService.deleteConversation(
                callFromDb.elevenLabsConversationId,
                accountId,
              );
              this.logger.log(
                `✅ Conversación de ElevenLabs ${callFromDb.elevenLabsConversationId} eliminada exitosamente`,
              );
            } catch (elevenLabsError) {
              this.logger.warn(
                `⚠️ Error eliminando conversación de ElevenLabs: ${elevenLabsError.message}`,
              );
              // Continuar con la eliminación local aunque falle ElevenLabs
            }

            // Eliminar conversación de ElevenLabs de la base de datos local
            await prisma.call.delete({
              where: { id: callFromDb.id },
            });
            deletedCount++;
            results.push({
              id: callId,
              status: 'deleted_from_elevenlabs_and_local',
              source: 'elevenlabs',
            });
            continue;
          }

          // Verificar si es una llamada local
          const localCall = await prisma.call.findFirst({
            where: {
              id: callId,
              accountId,
            },
          });

          if (localCall) {
            // Eliminar llamada local
            await prisma.call.delete({
              where: { id: callId },
            });
            deletedCount++;
            results.push({ id: callId, status: 'deleted', source: 'local' });
            continue;
          }

          // Si no se encuentra en la base de datos local, podría ser una conversación de ElevenLabs
          // que no se ha sincronizado aún. Intentar eliminarla directamente de ElevenLabs
          try {
            this.logger.log(
              `🗑️ Intentando eliminar conversación directamente de ElevenLabs: ${callId}`,
            );
            await this.conversationsService.deleteConversation(
              callId,
              accountId,
            );
            this.logger.log(
              `✅ Conversación de ElevenLabs ${callId} eliminada exitosamente`,
            );
            deletedCount++;
            results.push({
              id: callId,
              status: 'deleted_from_elevenlabs',
              source: 'elevenlabs_direct',
            });
          } catch (elevenLabsError) {
            this.logger.warn(
              `⚠️ No se pudo eliminar la conversación ${callId} de ElevenLabs: ${elevenLabsError.message}`,
            );
            // Si no se puede eliminar de ElevenLabs, marcar como eliminada localmente
            this.logger.log(
              `⚠️ Call log ${callId} no encontrado, pero marcado como eliminado`,
            );
            deletedCount++;
            results.push({
              id: callId,
              status: 'marked_deleted',
              source: 'not_found',
            });
          }
        } catch (_error) {
          this.logger.error(`❌ Error eliminando call log ${callId}:`, _error);
          results.push({
            id: callId,
            status: '_error',
            _error: _error.message,
          });
        }
      }

      this.logger.log(`✅ ${deletedCount} call logs procesados exitosamente`);

      return {
        success: true,
        message: `${deletedCount} conversaciones procesadas exitosamente`,
        deletedCount,
        deletedCallIds: callIds,
        results,
      };
    } catch (_error) {
      this.logger.error(`❌ Error eliminando call logs en lote:`, _error);
      throw _error;
    }
  }

  private calculateTopOutcomes(calls: any[]) {
    const outcomes = calls.reduce((acc, call) => {
      acc[call.status] = (acc[call.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(outcomes)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([outcome, count]) => ({ outcome, count }));
  }

  private generateRecommendations(stats: any, _calls: any[]) {
    const recommendations = [];

    if (stats.successRate < 50) {
      recommendations.push({
        type: 'warning',
        title: 'Tasa de éxito baja',
        message:
          'La tasa de éxito de llamadas está por debajo del 50%. Considera revisar los scripts y horarios de llamada.',
      });
    }

    if (stats.averageDuration < 30) {
      recommendations.push({
        type: 'info',
        title: 'Llamadas cortas',
        message:
          'Las llamadas promedio son muy cortas. Esto podría indicar problemas con el script inicial.',
      });
    }

    if (stats.totalCost > 100) {
      recommendations.push({
        type: 'warning',
        title: 'Costo alto',
        message:
          'El costo total de llamadas es alto. Considera optimizar los horarios y números de destino.',
      });
    }

    return recommendations;
  }

  /**
   * Guarda conversaciones de ElevenLabs que no existen en la base de datos local como llamadas
   * y actualiza las existentes con información del participante
   */
  private async saveMissingConversationsAsCalls(
    accountId: string,
    conversations: any[],
    existingCalls: any[],
  ) {
    try {
      // Optimización: Solo procesar las primeras 10 conversaciones para mejorar rendimiento
      const conversationsToProcess = conversations.slice(0, 10);

      this.logger.log(
        `🔍 Procesando ${conversationsToProcess.length} conversaciones para guardar/actualizar (limitado para rendimiento)`,
      );

      // const existingConversationIds = existingCalls.map(
      //   (call) => call.elevenLabsConversationId,
      // );

      for (const conversation of conversationsToProcess) {
        const existingCall = existingCalls.find(
          (call) =>
            call.elevenLabsConversationId === conversation.conversation_id,
        );

        if (existingCall) {
          // Actualizar llamada existente con información del participante
          const participantPhoneNumber =
            conversation.participantPhoneNumber ||
            conversation.participant_phone_number ||
            conversation.phone_number ||
            'Unknown';

          if (
            participantPhoneNumber !== 'Unknown' &&
            existingCall.phoneNumber === 'Unknown'
          ) {
            await this.prisma.call.update({
              where: { id: existingCall.id },
              data: {
                phoneNumber: participantPhoneNumber,
                notes: JSON.stringify({
                  source: 'elevenlabs_conversation',
                  participant_phone_number:
                    conversation.participant_phone_number,
                  participantPhoneNumber: conversation.participantPhoneNumber,
                  phone_number: conversation.phone_number,
                  agent_phone_number: conversation.agent_phone_number,
                  agentPhoneNumber: conversation.agentPhoneNumber,
                  startTime: conversation.startTime,
                  endTime: conversation.endTime,
                  status: conversation.status,
                  // Incluir toda la conversación para debugging
                  full_conversation: conversation,
                  raw_conversation: conversation.rawConversation,
                }),
              },
            });

            this.logger.log(
              `✅ Llamada existente ${existingCall.id} actualizada con número: ${participantPhoneNumber}`,
            );
          }
        } else {
          // Crear nueva llamada
          const agent = await this.prisma.agent.findFirst({
            where: {
              accountId,
              elevenLabsAgentId: conversation.agent_id,
            },
          });

          if (agent) {
            const participantPhoneNumber =
              conversation.participantPhoneNumber ||
              conversation.participant_phone_number ||
              conversation.phone_number ||
              'Unknown';

            await this.prisma.call.create({
              data: {
                accountId,
                agentId: agent.id,
                phoneNumber: participantPhoneNumber,
                direction: conversation.direction || 'outbound',
                type: 'manual',
                status:
                  conversation.status === 'completed'
                    ? 'completed'
                    : 'initiated',
                duration: conversation.call_duration_secs || 0,
                success: conversation.status === 'done',
                elevenLabsConversationId: conversation.conversation_id,
                notes: JSON.stringify({
                  source: 'elevenlabs_conversation',
                  participant_phone_number:
                    conversation.participant_phone_number,
                  participantPhoneNumber: conversation.participantPhoneNumber,
                  phone_number: conversation.phone_number,
                  agent_phone_number: conversation.agent_phone_number,
                  agentPhoneNumber: conversation.agentPhoneNumber,
                  startTime: conversation.startTime,
                  endTime: conversation.endTime,
                  status: conversation.status,
                  // Incluir toda la conversación para debugging
                  full_conversation: conversation,
                  raw_conversation: conversation.rawConversation,
                }),
                createdAt: conversation.start_time_unix_secs
                  ? new Date(conversation.start_time_unix_secs * 1000)
                  : new Date(),
                endedAt: conversation.start_time_unix_secs
                  ? new Date(
                      (conversation.start_time_unix_secs +
                        (conversation.call_duration_secs || 0)) *
                        1000,
                    )
                  : null,
              },
            });

            this.logger.log(
              `✅ Conversación ${conversation.conversation_id} guardada como nueva llamada con número: ${participantPhoneNumber}`,
            );
          } else {
            this.logger.warn(
              `⚠️ Agente no encontrado para conversación ${conversation.conversation_id}`,
            );
          }
        }
      }
    } catch (_error) {
      this.logger.error(
        'Error guardando/actualizando conversaciones como llamadas:',
        _error,
      );
    }
  }

  /**
   * Obtiene detalles completos de las conversaciones de ElevenLabs
   */
  private async getConversationsWithDetails(
    accountId: string,
    conversations: any[],
  ) {
    // Obtener detalles para todas las conversaciones (no limitar para obtener datos completos)
    const conversationsToProcess = conversations;

    this.logger.log(
      `🔍 Obteniendo detalles para ${conversationsToProcess.length} conversaciones`,
    );

    // Usar Promise.all para hacer llamadas paralelas en lugar de secuenciales
    const conversationsWithDetails = await Promise.allSettled(
      conversationsToProcess.map(async (conversation) => {
        try {
          // Obtener detalles completos de la conversación usando el ID correcto
          const details = await this.elevenLabsService.getConversationDetails(
            accountId,
            conversation.conversation_id,
          );

          // Combinar la conversación básica con los detalles
          const fullConversation = {
            ...conversation,
            ...details,
            // Buscar el número del participante en los detalles
            participantPhoneNumber:
              details.metadata?.phone_call?.external_number ||
              details.participant_phone_number ||
              details.participant_phone ||
              details.phone_number ||
              details.caller_phone_number ||
              details.caller_phone ||
              details.to_phone_number ||
              details.to_phone ||
              null,
          };

          this.logger.log(
            `✅ Detalles obtenidos para conversación ${conversation.conversation_id}:`,
            {
              participantPhoneNumber: fullConversation.participantPhoneNumber,
              duration:
                fullConversation.call_duration_secs ||
                fullConversation.duration,
              transcript:
                fullConversation.transcript_summary ||
                fullConversation.transcript,
              recordingUrl:
                fullConversation.recording_url || fullConversation.recordingUrl,
              messageCount: fullConversation.message_count,
              details: Object.keys(details),
            },
          );

          return fullConversation;
        } catch (_error) {
          this.logger.error(
            `❌ Error obteniendo detalles de conversación ${conversation.id}:`,
            _error.message,
          );
          // Retornar la conversación sin detalles si falla
          return conversation;
        }
      }),
    );

    // Procesar resultados y agregar conversaciones restantes sin detalles
    const processedConversations = conversationsWithDetails
      .filter((result) => result.status === 'fulfilled')
      .map((result) => (result as PromiseFulfilledResult<any>).value);

    // Agregar conversaciones restantes sin detalles
    const remainingConversations = conversations.slice(5);
    processedConversations.push(...remainingConversations);

    return processedConversations;
  }

  @Get('audio/:conversationId')
  async getAudio(
    @Param('conversationId') conversationId: string,
    @Query('accountId') accountId: string,
    @Res() res: Response,
  ) {
    try {
      this.logger.log(
        `🎵 [getAudio] Obteniendo audio para conversación ${conversationId} de cuenta ${accountId}`,
      );

      // Obtener configuración de ElevenLabs
      const config = await this.elevenLabsService.getConfig(accountId);
      if (!config?.apiKey) {
        this.logger.error(
          `❌ [getAudio] No se encontró configuración para accountId: ${accountId}`,
        );
        return res
          .status(404)
          .json({ message: 'Configuración de ElevenLabs no encontrada' });
      }

      // Obtener audio de ElevenLabs
      const audioUrl = `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}/audio`;
      this.logger.log(`🎵 [getAudio] Obteniendo audio desde: ${audioUrl}`);

      const response = await axios.get(audioUrl, {
        headers: {
          'xi-api-key': config.apiKey,
          Accept: 'audio/mpeg',
        },
        responseType: 'stream',
        timeout: 30000,
      });

      this.logger.log(
        `✅ [getAudio] Audio obtenido exitosamente para ${conversationId}`,
      );

      // Configurar headers para streaming
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `inline; filename="conversation-${conversationId}.mp3"`,
        'Cache-Control': 'public, max-age=3600',
      });

      // Stream el audio al cliente
      response.data.pipe(res);
    } catch (_error) {
      this.logger.error(
        `❌ [getAudio] Error obteniendo audio para ${conversationId}:`,
        _error.message,
      );

      if (_error.response?.status === 404) {
        return res.status(404).json({ message: 'Audio no encontrado' });
      } else if (_error.response?.status === 401) {
        return res
          .status(401)
          .json({ message: 'No autorizado para acceder al audio' });
      } else {
        return res.status(500).json({ message: 'Error interno del servidor' });
      }
    }
  }
}
