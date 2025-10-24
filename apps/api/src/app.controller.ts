import { Controller, Get, Logger, Param, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';
import { ElevenLabsService } from './integrations/elevenlabs/elevenlabs.service';

@ApiTags('App')
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly _appService: AppService,
    private readonly _elevenLabsService: ElevenLabsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Endpoint raíz de la API' })
  @ApiResponse({ status: 200, description: 'Mensaje de bienvenida' })
  getHello(): string {
    return this._appService.getHello();
  }

  @Get('sub-clients')
  @ApiOperation({ summary: 'Endpoint para sub-clientes (página estática)' })
  @ApiResponse({ status: 200, description: 'Información sobre sub-clientes' })
  @Public()
  getSubClients() {
    return {
      message:
        'Sub-clients es una página estática que no requiere datos de la API',
      info: 'Esta funcionalidad está disponible solo para planes de agencia',
      status: 'static_page',
    };
  }

  @Get('ready')
  @Public()
  @ApiOperation({ summary: 'Health check rápido para load balancers' })
  @ApiResponse({ status: 200, description: 'Servicio listo' })
  getReady() {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
      service: 'prixagent-api',
      uptime: Math.floor(process.uptime()),
    };
  }

  @Get('audio/:conversationId')
  @ApiOperation({ summary: 'Obtener audio de conversación' })
  @ApiResponse({ status: 200, description: 'Audio de la conversación' })
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
      const config = await this._elevenLabsService.getConfig(accountId);
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

      const axios = await import('axios');
      const response = await axios.default.get(audioUrl, {
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
    } catch (error) {
      this.logger.error(
        `❌ [getAudio] Error obteniendo audio para ${conversationId}:`,
        error.message,
      );

      if (error.response?.status === 404) {
        return res.status(404).json({ message: 'Audio no encontrado' });
      } else if (error.response?.status === 401) {
        return res
          .status(401)
          .json({ message: 'No autorizado para acceder al audio' });
      } else {
        return res.status(500).json({ message: 'Error interno del servidor' });
      }
    }
  }
}
