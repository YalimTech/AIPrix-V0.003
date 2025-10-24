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
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { Readable } from 'stream';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConversationsService } from './conversations.service';

@Controller('conversations')
export class ConversationsController {
  private readonly logger = new Logger(ConversationsController.name);

  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getConversations(
    @Request() req,
    @Query('cursor') cursor?: string,
    @Query('agentId') agentId?: string,
    @Query('callSuccessful') callSuccessful?: string,
    @Query('callStartBeforeUnix') callStartBeforeUnix?: number,
    @Query('callStartAfterUnix') callStartAfterUnix?: number,
    @Query('userId') userId?: string,
    @Query('pageSize') pageSize?: number,
    @Query('summaryMode') summaryMode?: string,
  ) {
    const accountId = req.user.accountId;

    try {
      return await this.conversationsService.getConversations(accountId, {
        cursor,
        agentId,
        callSuccessful,
        callStartBeforeUnix,
        callStartAfterUnix,
        userId,
        pageSize: pageSize || 30,
        summaryMode: summaryMode || 'exclude',
      });
    } catch (_error) {
      // console.error('Error obteniendo conversaciones:', _error);
      throw new BadRequestException('Error obteniendo conversaciones');
    }
  }

  @Get(':conversationId')
  @UseGuards(JwtAuthGuard)
  async getConversationDetails(
    @Param('conversationId') conversationId: string,
    @Request() req,
  ) {
    const accountId = req.user.accountId;

    try {
      return await this.conversationsService.getConversationDetails(
        conversationId,
        accountId,
      );
    } catch (_error) {
      // console.error('Error obteniendo detalles de conversación:', _error);
      throw new BadRequestException(
        'Error obteniendo detalles de conversación',
      );
    }
  }

  @Get(':conversationId/audio')
  @UseGuards(JwtAuthGuard)
  async getConversationAudio(
    @Param('conversationId') conversationId: string,
    @Request() req,
  ) {
    const accountId = req.user.accountId;

    try {
      return await this.conversationsService.getConversationAudio(
        conversationId,
        accountId,
      );
    } catch (_error) {
      // console.error('Error obteniendo audio de conversación:', _error);
      throw new BadRequestException('Error obteniendo audio de conversación');
    }
  }

  @Get(':conversationId/audio/download')
  @UseGuards(JwtAuthGuard)
  async downloadConversationAudio(
    @Param('conversationId') conversationId: string,
    @Request() req,
    @Res() res: Response,
  ) {
    const accountId = req.user.accountId;
    // console.log(
    //   `📥 Descargando audio para conversación ${conversationId}, cuenta ${accountId}`,
    // );

    try {
      // Obtener la llamada de la base de datos
      const call = await this.conversationsService.getCall(
        conversationId,
        accountId,
      );

      if (!call) {
        return res.status(404).json({ message: 'Conversación no encontrada' });
      }

      if (!call.elevenLabsConversationId) {
        return res
          .status(404)
          .json({ message: 'Conversación sin ID de ElevenLabs' });
      }

      // Obtener configuración de ElevenLabs
      const config =
        await this.conversationsService.getElevenLabsConfig(accountId);

      if (!config?.apiKey) {
        return res
          .status(404)
          .json({ message: 'Configuración de ElevenLabs no encontrada' });
      }

      // Hacer la petición a ElevenLabs
      const elevenLabsUrl = `https://api.elevenlabs.io/v1/convai/conversations/${call.elevenLabsConversationId}/audio`;

      // console.log(`🌐 Haciendo petición a ElevenLabs: ${elevenLabsUrl}`);

      const elevenLabsResponse = await fetch(elevenLabsUrl, {
        method: 'GET',
        headers: {
          'xi-api-key': config.apiKey,
          Accept: 'audio/mpeg, audio/wav, audio/*, */*',
        },
      });

      // console.log(`📡 Respuesta de ElevenLabs:`, {
      //   status: elevenLabsResponse.status,
      //   statusText: elevenLabsResponse.statusText,
      //   contentType: elevenLabsResponse.headers.get('content-type'),
      //   contentLength: elevenLabsResponse.headers.get('content-length'),
      //   headers: Object.fromEntries(elevenLabsResponse.headers.entries()),
      // });

      if (!elevenLabsResponse.ok) {
        const errorText = await elevenLabsResponse.text();
        return res.status(elevenLabsResponse.status).json({
          message: `Error obteniendo audio de ElevenLabs: ${elevenLabsResponse.status}`,
          details: errorText,
        });
      }

      // Obtener el contenido completo del audio
      const audioBuffer = await elevenLabsResponse.arrayBuffer();
      // const contentType =
      //   elevenLabsResponse.headers.get('content-type') || 'audio/mpeg';

      // console.log(`📦 Audio buffer info:`, {
      //   size: audioBuffer.byteLength,
      //   contentType,
      //   elevenLabsContentType: elevenLabsResponse.headers.get('content-type'),
      //   elevenLabsContentLength:
      //     elevenLabsResponse.headers.get('content-length'),
      // });

      // Verificar que el buffer tenga contenido
      if (audioBuffer.byteLength === 0) {
        // console.error(`❌ Audio buffer está vacío`);
        return res
          .status(500)
          .json({ message: 'El archivo de audio está vacío' });
      }

      // Establecer headers para descarga
      res.set({
        'Content-Type': 'audio/mpeg', // Forzar tipo MIME correcto
        'Content-Disposition': `attachment; filename="conversation-${conversationId}.mp3"`,
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'no-cache',
      });

      // console.log(
      //   `✅ Enviando audio buffer de ${audioBuffer.byteLength} bytes`,
      // );

      // Enviar el buffer completo
      res.send(Buffer.from(audioBuffer));
    } catch (_error) {
      // console.error('❌ Error descargando audio de conversación:', _error);

      if (!res.headersSent) {
        return res.status(500).json({
          message: 'Error descargando audio de conversación',
          error: _error.message,
        });
      }
    }
  }

  @Get(':conversationId/audio/stream')
  async getConversationAudioStream(
    @Param('conversationId') conversationId: string,
    @Query('token') token: string,
    @Request() req,
    @Res() res: Response,
  ) {
    let accountId;

    // Si hay token en query parameter, validarlo
    if (token) {
      try {
        const jwtService = new JwtService();
        const payload = jwtService.verify(token, {
          secret: process.env.JWT_SECRET,
        });
        accountId = payload.accountId;
      } catch (_error) {
        return res.status(401).json({ message: 'Token inválido' });
      }
    } else if (req.user) {
      // Si no hay token en query, usar el del header (para compatibilidad)
      accountId = req.user.accountId;
    } else {
      return res
        .status(401)
        .json({ message: 'Token de autenticación requerido' });
    }
    // console.log('Streaming audio para conversación:', conversationId, 'cuenta:', accountId);

    try {
      // Obtener la llamada de la base de datos
      // console.log(
      //   `🔍 Buscando llamada ${conversationId} para cuenta ${accountId}`,
      // );
      const call = await this.conversationsService.getCall(
        conversationId,
        accountId,
      );
      // console.log('Llamada encontrada:', call ? 'Sí' : 'No');

      if (!call) {
        // console.log('Llamada no encontrada');
        return res.status(404).json({ message: 'Conversación no encontrada' });
      }

      if (!call.elevenLabsConversationId) {
        // console.log('Llamada sin elevenLabsConversationId');
        return res
          .status(404)
          .json({ message: 'Conversación sin ID de ElevenLabs' });
      }

      // Obtener configuración de ElevenLabs
      // console.log('Obteniendo configuración de ElevenLabs para cuenta:', accountId);
      const config =
        await this.conversationsService.getElevenLabsConfig(accountId);
      // console.log('Configuración encontrada:', config ? 'Sí' : 'No');

      if (!config) {
        // console.log('Configuración de ElevenLabs no encontrada');
        return res
          .status(404)
          .json({ message: 'Configuración de ElevenLabs no encontrada' });
      }

      if (!config.apiKey) {
        // console.log('API Key de ElevenLabs no encontrada');
        return res
          .status(404)
          .json({ message: 'API Key de ElevenLabs no configurada' });
      }

      // Hacer la petición a ElevenLabs
      // console.log('Haciendo petición a ElevenLabs para conversación:', call.elevenLabsConversationId);
      const elevenLabsUrl = `https://api.elevenlabs.io/v1/convai/conversations/${call.elevenLabsConversationId}/audio`;
      // console.log('URL de ElevenLabs:', elevenLabsUrl);

      const elevenLabsResponse = await fetch(elevenLabsUrl, {
        method: 'GET',
        headers: {
          'xi-api-key': config.apiKey,
          Accept: 'audio/mpeg, audio/wav, */*',
        },
      });

      // console.log('Respuesta de ElevenLabs:', elevenLabsResponse.status, elevenLabsResponse.statusText);

      if (!elevenLabsResponse.ok) {
        const errorText = await elevenLabsResponse.text();
        // console.log('Error en ElevenLabs:', elevenLabsResponse.status, errorText);
        return res.status(elevenLabsResponse.status).json({
          message: `Error obteniendo audio de ElevenLabs: ${elevenLabsResponse.status}`,
          details: errorText,
        });
      }

      // Verificar que el response body existe
      if (!elevenLabsResponse.body) {
        // console.log(`❌ No hay body en la respuesta de ElevenLabs`);
        return res
          .status(500)
          .json({ message: 'No hay contenido de audio disponible' });
      }

      // Establecer headers para streaming
      // console.log(`📤 Configurando headers de streaming`);
      const contentType =
        elevenLabsResponse.headers.get('content-type') || 'audio/mpeg';
      const contentLength = elevenLabsResponse.headers.get('content-length');

      res.set({
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Accept-Ranges': 'bytes',
      });

      if (contentLength) {
        res.set('Content-Length', contentLength);
      }

      // Convertir el stream de ElevenLabs al response
      // console.log(`🔄 Iniciando streaming de audio`);

      // Usar pipe para un streaming más eficiente
      if (elevenLabsResponse.body) {
        // Manejar cierre de conexión del cliente
        req.on('close', () => {
          // console.log(`⚠️ Cliente desconectado, cancelando streaming`);
          if (elevenLabsResponse.body) {
            elevenLabsResponse.body.cancel().catch((_error) => {
              this.logger.error('Error canceling response body:', _error);
            });
          }
        });

        // Convertir Web ReadableStream a Node.js Readable stream directamente
        const reader = elevenLabsResponse.body.getReader();

        const nodeStream = new Readable({
          async read() {
            try {
              const { done, value } = await reader.read();

              if (done) {
                // console.log(`✅ Streaming completado`);
                this.push(null);
                return;
              }

              // Verificar que la conexión no se haya cerrado
              if (res.destroyed) {
                // console.log(`⚠️ Conexión cerrada por el cliente`);
                reader.cancel();
                this.push(null);
                return;
              }

              this.push(Buffer.from(value));
            } catch (_error) {
              // console.error('❌ Error en stream:', _error);
              this.destroy(_error);
            }
          },
        });

        nodeStream.pipe(res);
      } else {
        // console.log(`❌ No hay body para hacer stream`);
        return res
          .status(500)
          .json({ message: 'No hay contenido de audio disponible' });
      }

      return;
    } catch (_error) {
      // console.error('❌ Error streaming audio de conversación:', _error);
      // console.error('Stack trace:', _error.stack);

      if (!res.headersSent) {
        return res.status(500).json({
          message: 'Error streaming audio de conversación',
          _error: _error.message,
        });
      }
    }
  }

  @Post(':conversationId/feedback')
  @UseGuards(JwtAuthGuard)
  async sendConversationFeedback(
    @Param('conversationId') conversationId: string,
    @Body() feedbackData: { feedback: 'like' | 'dislike' },
    @Request() req,
  ) {
    const accountId = req.user.accountId;

    try {
      return await this.conversationsService.sendConversationFeedback(
        conversationId,
        feedbackData.feedback,
        accountId,
      );
    } catch (_error) {
      // console.error('Error enviando feedback:', _error);
      throw new BadRequestException('Error enviando feedback');
    }
  }

  @Delete(':conversationId')
  @UseGuards(JwtAuthGuard)
  async deleteConversation(
    @Param('conversationId') conversationId: string,
    @Request() req,
  ) {
    const accountId = req.user.accountId;

    try {
      return await this.conversationsService.deleteConversation(
        conversationId,
        accountId,
      );
    } catch (_error) {
      // console.error('Error eliminando conversación:', _error);
      throw new BadRequestException('Error eliminando conversación');
    }
  }

  @Get('analytics/summary')
  @UseGuards(JwtAuthGuard)
  async getConversationAnalytics(@Request() req) {
    const accountId = req.user.accountId;

    try {
      return await this.conversationsService.getConversationAnalytics(
        accountId,
      );
    } catch (_error) {
      // console.error('Error obteniendo analytics de conversaciones:', _error);
      throw new BadRequestException(
        'Error obteniendo analytics de conversaciones',
      );
    }
  }
}
