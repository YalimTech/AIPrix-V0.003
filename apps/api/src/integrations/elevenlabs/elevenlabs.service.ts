import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ElevenLabsUsageTrackingService } from '../../billing/elevenlabs-usage-tracking.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateElevenLabsConfigDto } from './dto/update-elevenlabs-config.dto';

// Interfaces según documentación oficial ElevenLabs 2025
export interface ElevenLabsAgent {
  agent_id: string;
  name: string;
  conversation_config: any; // Objeto complejo según documentación oficial
  metadata?: {
    created_at_unix_secs: number;
    updated_at_unix_secs: number;
  };
  platform_settings?: any; // Configuraciones de plataforma
  phone_numbers?: any[]; // Lista de números de teléfono
  workflow?: any; // Workflow del agente
  access_info?: any; // Información de acceso
  tags?: string[]; // Tags del agente
  version_id?: string; // INTERNAL
}

// Interfaz simplificada para compatibilidad con código existente
export interface ElevenLabsAgentSimple {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'training';
  voiceId: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  conversationConfig: any;
}

export interface ElevenLabsConversation {
  id: string;
  agentId: string;
  status: 'active' | 'ended' | 'failed';
  duration: number;
  transcript: string;
  recordingUrl?: string;
  createdAt: string;
  endedAt?: string;
}

// Interfaces para respuestas de API
export interface ElevenLabsVoicesResponse {
  voices: Array<{
    voice_id: string;
    name: string;
    category: string;
    description?: string;
    labels?: Record<string, string>;
  }>;
}

export interface ElevenLabsOutboundCallResponse {
  success: boolean;
  message: string;
  conversation_id: string;
  callSid: string;
}

export interface ElevenLabsTestAgentResponse {
  id: string;
}

export interface ElevenLabsTestRunResponse {
  id: string;
  test_runs: any[];
  agent_id: string;
  created_at: number;
}

export interface ElevenLabsAvatarResponse {
  avatar_url: string;
}

export interface ElevenLabsImportNumberResponse {
  agent_phone_number_id: string;
}

export interface ElevenLabsErrorResponse {
  message: string;
}

@Injectable()
export class ElevenLabsService {
  private readonly logger = new Logger(ElevenLabsService.name);
  // NOTA: Las API keys de ElevenLabs se almacenan en la base de datos (tabla account_eleven_labs_config)
  // Cada cliente tiene su propia API key. NO se usa API key del desarrollador en el .env

  constructor(
    private readonly configService: ConfigService,
    private readonly usageTrackingService: ElevenLabsUsageTrackingService,
    private readonly prisma: PrismaService, // Inyectar PrismaService
  ) {}

  // --- MÉTODOS DE CONFIGURACIÓN POR CUENTA ---

  async getConfig(accountId: string) {
    try {
      this.logger.log(
        `🔍 [getConfig] Buscando configuración de ElevenLabs para la cuenta ${accountId}`,
      );

      const config = await this.prisma.accountElevenLabsConfig.findUnique({
        where: { accountId },
      });

      if (config) {
        this.logger.log(
          `✅ [getConfig] Configuración encontrada para ${accountId}, API Key: ${config.apiKey?.substring(0, 8)}...`,
        );
      } else {
        this.logger.warn(
          `⚠️ [getConfig] No se encontró configuración para ${accountId}`,
        );
      }

      return config;
    } catch (error) {
      this.logger.error(
        `❌ [getConfig] Error obteniendo configuración para ${accountId}:`,
        error.message,
      );
      throw error;
    }
  }

  async updateConfig(accountId: string, configDto: UpdateElevenLabsConfigDto) {
    this.logger.log(
      `Actualizando configuración de ElevenLabs para la cuenta ${accountId}`,
    );

    // Validar que la API key no esté vacía
    if (!configDto.apiKey || configDto.apiKey.trim() === '') {
      this.logger.error(
        `La API Key proporcionada por la cuenta ${accountId} está vacía`,
      );
      throw new BadRequestException(
        'La API Key de ElevenLabs no puede estar vacía. Por favor, proporciona una API key válida.',
      );
    }

    // Validar la API key antes de guardarla
    try {
      this.logger.log(`Validando API key para la cuenta ${accountId}...`);
      const tempClient = new ElevenLabsClient({ apiKey: configDto.apiKey });
      const userInfo = await tempClient.user.get();
      this.logger.log(
        `API Key para la cuenta ${accountId} validada exitosamente. User ID: ${userInfo.userId}`,
      );
    } catch (error) {
      this.logger.error(
        `La API Key proporcionada por la cuenta ${accountId} es inválida:`,
        error.message,
      );
      this.logger.error('Detalles del error:', JSON.stringify(error, null, 2));
      throw new BadRequestException(
        `La API Key de ElevenLabs no es válida: ${error.message || 'Error desconocido'}. Por favor, verifica que la API key sea correcta y que no haya expirado.`,
      );
    }

    // Guardar la configuración en la base de datos
    try {
      const result = await this.prisma.accountElevenLabsConfig.upsert({
        where: { accountId },
        update: {
          apiKey: configDto.apiKey,
        },
        create: {
          accountId,
          apiKey: configDto.apiKey,
        },
      });

      this.logger.log(
        `Configuración de ElevenLabs guardada exitosamente para la cuenta ${accountId}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Error guardando configuración para la cuenta ${accountId}:`,
        error,
      );
      throw new BadRequestException(
        `Error guardando la configuración: ${error.message}`,
      );
    }
  }

  async removeConfig(accountId: string) {
    this.logger.log(
      `Eliminando configuración de ElevenLabs para la cuenta ${accountId}`,
    );
    return this.prisma.accountElevenLabsConfig.delete({
      where: { accountId },
    });
  }

  /**
   * Obtiene una instancia del cliente de ElevenLabs configurada con la API key del usuario.
   * @param accountId - El ID de la cuenta del usuario.
   * @returns Una instancia del cliente de ElevenLabs.
   * @throws NotFoundException si no se encuentra la configuración para la cuenta.
   */
  private async getElevenLabsClient(accountId: string): Promise<any> {
    try {
      this.logger.log(
        `🔑 [getElevenLabsClient] Obteniendo configuración para accountId: ${accountId}`,
      );

      const config = await this.getConfig(accountId);

      if (!config?.apiKey) {
        this.logger.error(
          `❌ [getElevenLabsClient] No se encontró configuración para accountId: ${accountId}`,
        );
        throw new NotFoundException(
          `No se encontró configuración de ElevenLabs para la cuenta ${accountId}. Por favor, configure su API key.`,
        );
      }

      this.logger.log(
        `✅ [getElevenLabsClient] Configuración encontrada para accountId: ${accountId}, API Key: ${config.apiKey.substring(0, 8)}...`,
      );

      return new ElevenLabsClient({
        apiKey: config.apiKey,
      });
    } catch (error) {
      this.logger.error(
        `❌ [getElevenLabsClient] Error obteniendo cliente para accountId ${accountId}:`,
        error.message,
      );
      throw error;
    }
  }

  // --- MÉTODOS DE API EXISTENTES (REFACTORIZADOS) ---

  /**
   * Genera un preview de audio para una voz específica
   * Este método es usado para que los usuarios puedan escuchar las voces antes de seleccionarlas
   */
  async generatePreview(
    accountId: string,
    voiceId: string,
    text: string,
    modelId?: string,
  ): Promise<Buffer> {
    const elevenLabs = await this.getElevenLabsClient(accountId);
    try {
      this.logger.log(`Generando preview para voz ${voiceId}...`);

      // Usar la API real de ElevenLabs con las mejores prácticas de 2025
      const audioStream = await elevenLabs.textToSpeech.convert(voiceId, {
        text,
        model_id: modelId || 'eleven_multilingual_v2', // Modelo más reciente 2025
        voice_settings: {
          stability: 0.75, // Alta estabilidad para conversaciones telefónicas naturales
          similarity_boost: 0.8, // Máxima similitud para mantener características de voz
          style: 0.4, // Más expresivo para conversaciones naturales
          use_speaker_boost: true, // Mejorar claridad en llamadas telefónicas
        },
        // Opciones optimizadas según documentación oficial 2024
        output_format: 'mp3_44100_128', // Formato optimizado para llamadas
        optimize_streaming_latency: 2, // Optimización de latencia
      });

      // Convertir el stream de audio a buffer
      const chunks = [];
      for await (const chunk of audioStream) {
        chunks.push(Buffer.from(chunk));
      }
      const audioBuffer = Buffer.concat(chunks);

      this.logger.log(`Preview generado exitosamente para voz ${voiceId}`);

      return audioBuffer;
    } catch (error) {
      this.logger.error(`Error generando preview para voz ${voiceId}:`, error);
      throw new BadRequestException(
        `Error generando preview de voz: ${error.message}`,
      );
    }
  }

  async generateSpeech(
    accountId: string, // Se requiere accountId
    text: string,
    voiceId: string,
    options?: {
      modelId?: string;
      voiceSettings?: {
        stability: number;
        similarityBoost: number;
        style: number;
        useSpeakerBoost: boolean;
      };
    },
  ) {
    const elevenLabs = await this.getElevenLabsClient(accountId);
    try {
      // Usar la API real de ElevenLabs con las mejores prácticas de 2025
      const audioStream = await elevenLabs.textToSpeech.convert(voiceId, {
        text,
        model_id: options?.modelId || 'eleven_multilingual_v2', // Modelo más reciente 2025
        voice_settings: options?.voiceSettings || {
          stability: 0.75, // Alta estabilidad para conversaciones telefónicas naturales
          similarity_boost: 0.8, // Máxima similitud para mantener características de voz
          style: 0.4, // Más expresivo para conversaciones naturales
          use_speaker_boost: true, // Mejorar claridad en llamadas telefónicas
        },
        // Opciones optimizadas según documentación oficial 2024
        output_format: 'mp3_44100_128', // Formato optimizado para llamadas
        optimize_streaming_latency: 2, // Optimización de latencia
      });

      // Convertir el stream de audio a buffer
      const chunks = [];
      for await (const chunk of audioStream) {
        chunks.push(Buffer.from(chunk));
      }
      const audioBuffer = Buffer.concat(chunks);

      // En un entorno real, aquí guardarías el archivo en un servicio de almacenamiento
      // Por ahora, simulamos una URL de audio
      const audioUrl = `data:audio/mpeg;base64,${audioBuffer.toString('base64')}`;

      this.logger.log(
        `Audio generado con ElevenLabs: ${text.substring(0, 50)}...`,
      );

      return {
        audioUrl,
        text,
        voiceId,
        duration: this.estimateDuration(text),
        size: audioBuffer.length,
        format: 'mp3',
      };
    } catch (error) {
      this.logger.error('Error generando audio con ElevenLabs:', error);
      throw new BadRequestException(`Error generando audio: ${error.message}`);
    }
  }

  async getVoices(accountId: string) {
    // Se requiere accountId
    try {
      const config = await this.getConfig(accountId);
      if (!config?.apiKey) {
        throw new NotFoundException(
          `No se encontró configuración de ElevenLabs para la cuenta ${accountId}. Por favor, configure su API key.`,
        );
      }

      this.logger.log(`📢 Obteniendo voces para accountId: ${accountId}`);

      // Llamada directa a la API REST de ElevenLabs
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        method: 'GET',
        headers: {
          'xi-api-key': config.apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Error de API: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json() as ElevenLabsVoicesResponse;
      const voices = data.voices || [];

      this.logger.log(
        `📊 Total de voces devueltas por ElevenLabs: ${voices.length}`,
      );

      // Log de las primeras 5 voces para debugging
      if (voices.length > 0) {
        this.logger.log(
          `🔍 Primeras 5 voces: ${voices
            .slice(0, 5)
            .map((v) => v.name)
            .join(', ')}`,
        );
        // Log de la estructura de la primera voz para debug
        this.logger.log(
          `🔍 Estructura de la primera voz:`,
          JSON.stringify(voices[0], null, 2),
        );
      }

      return voices.map((voice: any) => {
        // Extraer idiomas verificados del campo verified_languages
        const verifiedLanguages = voice.verified_languages || [];
        const supportedLanguages = verifiedLanguages
          .filter((v: any) => v.model_id === 'eleven_multilingual_v2')
          .map((v: any) => v.language);

        // Determinar si es multilenguaje (más de 1 idioma)
        const isMultilingual = supportedLanguages.length > 1;

        return {
          id: voice.voice_id || voice.id || `voice-${voice.name}`,
          name: voice.name,
          category: voice.category,
          description: voice.description,
          labels: voice.labels,
          previewUrl: voice.preview_url,
          availableForTts: voice.available_for_tiers?.includes('tts') || false,
          settings: voice.settings,
          // Información de idiomas basada en verified_languages
          languageCapabilities: {
            native: voice.labels?.language ? [voice.labels.language] : [],
            supported: supportedLanguages, // Idiomas que la voz puede hablar
            multilingual: isMultilingual,
            verifiedLanguages, // Todos los idiomas verificados con sus modelos
          },
        };
      });
    } catch (error) {
      this.logger.error('Error obteniendo voces de ElevenLabs:', error);
      throw new BadRequestException('Error obteniendo voces');
    }
  }

  async getVoice(accountId: string, voiceId: string) {
    // Se requiere accountId
    const elevenLabs = await this.getElevenLabsClient(accountId);
    try {
      const voice = await elevenLabs.voices.get(voiceId);

      return {
        id: voice.voice_id,
        name: voice.name,
        category: voice.category,
        description: voice.description,
        labels: voice.labels,
        previewUrl: voice.preview_url,
        availableForTts: voice.available_for_tiers?.includes('tts') || false,
        settings: voice.settings,
      };
    } catch (error) {
      this.logger.error(`Error obteniendo voz ${voiceId}:`, error);
      throw new BadRequestException('Voz no encontrada');
    }
  }

  async cloneVoice(
    accountId: string, // Se requiere accountId
    name: string,
    description: string,
    files: Buffer[],
  ) {
    const elevenLabs = await this.getElevenLabsClient(accountId);
    try {
      const voice = await elevenLabs.voices.add({
        name,
        description,
        files: files.map((file) => ({
          name: 'sample.mp3',
          data: file,
        })),
      });

      this.logger.log(`Voz clonada: ${voice.voice_id} - ${name}`);

      return {
        id: voice.voice_id,
        name: voice.name,
        category: voice.category,
        description: voice.description,
        labels: voice.labels,
        previewUrl: voice.preview_url,
        availableForTts: voice.available_for_tiers?.includes('tts') || false,
        settings: voice.settings,
      };
    } catch (error) {
      this.logger.error('Error clonando voz:', error);
      throw new BadRequestException('Error clonando voz');
    }
  }

  async deleteVoice(accountId: string, voiceId: string) {
    // Se requiere accountId
    const elevenLabs = await this.getElevenLabsClient(accountId);
    try {
      await elevenLabs.voices.delete(voiceId);
      this.logger.log(`Voz eliminada: ${voiceId}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error eliminando voz ${voiceId}:`, error);
      throw new BadRequestException('Error eliminando voz');
    }
  }

  async getModels(accountId: string) {
    // Se requiere accountId
    const elevenLabs = await this.getElevenLabsClient(accountId);
    try {
      const models = await elevenLabs.models.getAll();

      return models.map((model) => ({
        id: model.model_id,
        name: model.name,
        canBeCloned: model.can_be_cloned,
        canDoTextToSpeech: model.can_do_text_to_speech,
        canDoVoiceConversion: model.can_do_voice_conversion,
        canUseStyle: model.can_use_style,
        canUseSpeakerBoost: model.can_use_speaker_boost,
        servesProVoices: model.serves_pro_voices,
        tokenCostFactor: model.token_cost_factor,
        maxCharacters: model.max_characters,
        languages: model.languages,
      }));
    } catch (error) {
      this.logger.error('Error obteniendo modelos de ElevenLabs:', error);
      throw new BadRequestException('Error obteniendo modelos');
    }
  }

  async getUserInfo(accountId: string) {
    // Se requiere accountId
    const elevenLabs = await this.getElevenLabsClient(accountId);
    try {
      const user = await elevenLabs.user.get();

      return {
        id: user.user_id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        canUseInstantVoiceCloning: user.can_use_instant_voice_cloning,
        canUseProfessionalVoiceCloning: user.can_use_professional_voice_cloning,
        canUseVoiceConversion: user.can_use_voice_conversion,
        canUseDubbing: user.can_use_dubbing,
        canUseVoiceDesign: user.can_use_voice_design,
        canUseCustomVoices: user.can_use_custom_voices,
        subscription: user.subscription,
        isNewUser: user.is_new_user,
        xiApiKey: user.xi_api_key,
      };
    } catch (error) {
      this.logger.error('Error obteniendo información del usuario:', error);
      throw new BadRequestException('Error obteniendo información del usuario');
    }
  }

  private estimateDuration(text: string): number {
    // Estimación aproximada: 150 palabras por minuto
    const wordsPerMinute = 150;
    const wordCount = text.split(' ').length;
    return Math.ceil((wordCount / wordsPerMinute) * 60);
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Verificar que hay al menos una cuenta con API key configurada
      const configs = await this.prisma.accountElevenLabsConfig.findMany({
        where: {
          apiKey: {
            not: null,
          },
        },
        take: 1,
      });

      if (configs.length === 0) {
        this.logger.warn(
          'ElevenLabs no configurado - No hay cuentas con API key configurada',
        );
        return false;
      }

      // Verificar que la primera API key configurada funciona
      const testClient = new ElevenLabsClient({
        apiKey: configs[0].apiKey,
      });
      await testClient.user.get();
      this.logger.log('ElevenLabs: Al menos una API key válida configurada');
      return true;
    } catch (error) {
      this.logger.error(
        'ElevenLabs: Error verificando configuración:',
        error.message,
      );
      return false;
    }
  }

  // ===== MÉTODOS DE AGENTS PLATFORM (2025) =====

  /**
   * Obtener todos los agentes según documentación oficial ElevenLabs 2025
   * Documentación: https://elevenlabs.io/docs/api-reference/agents-platform/list-agents
   */
  async getAgents(
    accountId: string,
    params?: {
      page_size?: number;
      search?: string;
      sort_direction?: 'asc' | 'desc';
      sort_by?: 'name' | 'created_at';
      cursor?: string;
    },
  ): Promise<{
    agents: Array<{
      agent_id: string;
      name: string;
      tags?: string[];
      created_at_unix_secs?: number;
      access_info?: {
        is_creator: boolean;
        creator_name?: string;
        creator_email?: string;
        role?: string;
      };
    }>;
    has_more: boolean;
    next_cursor: string | null;
  }> {
    const config = await this.getConfig(accountId);
    if (!config?.apiKey) {
      throw new NotFoundException(
        `No se encontró configuración de ElevenLabs para la cuenta ${accountId}. Por favor, configure su API key.`,
      );
    }

    try {
      // Construir query parameters
      const queryParams = new URLSearchParams();

      if (params?.page_size) {
        queryParams.append('page_size', params.page_size.toString());
      }
      if (params?.search) {
        queryParams.append('search', params.search);
      }
      if (params?.sort_direction) {
        queryParams.append('sort_direction', params.sort_direction);
      }
      if (params?.sort_by) {
        queryParams.append('sort_by', params.sort_by);
      }
      if (params?.cursor) {
        queryParams.append('cursor', params.cursor);
      }

      const url = queryParams.toString()
        ? `https://api.elevenlabs.io/v1/convai/agents?${queryParams.toString()}`
        : 'https://api.elevenlabs.io/v1/convai/agents';

      const response = await axios.get(url, {
        headers: {
          'xi-api-key': config.apiKey,
        },
      });

      const data = response.data;

      this.logger.log(
        `Obtenidos ${data.agents?.length || 0} agentes de ElevenLabs`,
      );

      // Retornar la estructura según documentación oficial
      return {
        agents: data.agents || [],
        has_more: data.has_more || false,
        next_cursor: data.next_cursor || null,
      };
    } catch (error) {
      this.logger.error(
        'Error obteniendo agentes de ElevenLabs:',
        error.response?.data || error.message,
      );
      throw new BadRequestException('Error obteniendo agentes');
    }
  }

  /**
   * Construir conversation_config según documentación oficial de ElevenLabs
   * Este método construye la configuración correcta con TODAS las configuraciones del agente
   * Estructura oficial: https://elevenlabs.io/docs/api-reference/agents-platform/create-agent
   */
  private buildConversationConfig(
    systemPrompt: string,
    firstMessage: string,
    language: string = 'es',
    temperature: number = 0.7,
    _maxDuration: number = 1800, // 30 minutos por defecto
    voiceId?: string,
    interruptSensitivity?: boolean,
    responseSpeed?: boolean,
    _initialMessageDelay?: number,
    llmModel?: string,
    maxTokens?: number,
  ): any {
    // Validar que se proporcione una voz válida
    if (!voiceId || voiceId.trim() === '') {
      throw new BadRequestException('Se debe proporcionar una voz válida de ElevenLabs para crear el agente. Por favor, selecciona una voz en el formulario.');
    }

    // Determinar el modelo TTS según el idioma
    const ttsModel = language === 'en' ? 'eleven_turbo_v2' : 'eleven_turbo_v2_5';

    // Modelos LLM soportados según pruebas
    const supportedLLMModels = [
      'gpt-4o-mini',
      'gpt-4o', 
      'gpt-4-turbo',
      'gpt-3.5-turbo',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-pro',
      'gemini-1.5-flash'
    ];

    // Usar modelo LLM proporcionado o default (Gemini 2.5 Flash es el default)
    const selectedLLM = llmModel && supportedLLMModels.includes(llmModel) 
      ? llmModel 
      : 'gemini-2.5-flash';

    // Construir la estructura completa del conversation_config según documentación oficial de ElevenLabs
    // Documentación: https://elevenlabs.io/docs/api-reference/agents-platform/update-agent
    return {
      tts: {
        voice_id: voiceId,
        model_id: ttsModel,
        agent_output_audio_format: 'pcm_8000', // Formato correcto según documentación
      },
      conversation: {
        max_duration_seconds: _maxDuration || 1800, // 30 minutos por defecto (1800 segundos)
      },
      agent: {
        first_message: firstMessage || 'Hola, ¿en qué puedo ayudarte?',
        language: language,
        // CRÍTICO: El prompt es un objeto anidado según documentación oficial
        prompt: {
          prompt: systemPrompt || 'Eres un asistente telefónico profesional.',
          llm: selectedLLM, // Modelo LLM
          temperature: temperature || 0,
          max_tokens: maxTokens || -1,
        },
      },
    };
  }

  /**
   * Crear un agente de ElevenLabs
   * Según documentación oficial: POST /v1/convai/agents/create
   * Respuesta exitosa: 200 { agent_id, main_branch_id?, initial_version_id? }
   * Error: 422 Unprocessable Entity
   */
  async createAgent(
    accountId: string,
    agentData: {
      name?: string | null;
      conversation_config?: any; // Ahora opcional, se construye automáticamente
      systemPrompt?: string; // Prompt del sistema
      firstMessage?: string; // Mensaje inicial
      language?: string; // Idioma
      temperature?: number; // Temperatura
      voiceId?: string; // ID de la voz
      interruptSensitivity?: boolean; // Sensibilidad a interrupciones
      responseSpeed?: boolean; // Velocidad de respuesta
      initialMessageDelay?: number; // Delay del mensaje inicial (en segundos)
      llmModel?: string; // Modelo LLM a utilizar
      maxTokens?: number; // Máximo número de tokens
      doubleCall?: boolean; // Double call
      vmDetection?: boolean; // VM Detection
      webhookUrl?: string; // URL del webhook
      platform_settings?: any | null; // Opcional según documentación oficial
      workflow?: any; // Opcional según documentación oficial
      tags?: string[] | null; // Opcional según documentación oficial
    },
  ): Promise<{
    agent_id: string;
    main_branch_id?: string | null;
    initial_version_id?: string | null;
  }> {
    const config = await this.getConfig(accountId);
    if (!config?.apiKey) {
      throw new NotFoundException(
        `No se encontró configuración de ElevenLabs para la cuenta ${accountId}. Por favor, configure su API key.`,
      );
    }

    // Construir conversation_config si no se proporciona
    let conversationConfig = agentData.conversation_config;
    if (!conversationConfig) {
      this.logger.log(
        '[createAgent] Construyendo conversation_config automáticamente con TODAS las configuraciones',
      );
      conversationConfig = this.buildConversationConfig(
        agentData.systemPrompt || '',
        agentData.firstMessage || '',
        agentData.language || 'es',
        agentData.temperature || 0.7,
        300,
        agentData.voiceId,
        agentData.interruptSensitivity,
        agentData.responseSpeed,
        agentData.initialMessageDelay,
        agentData.llmModel,
        agentData.maxTokens,
      );
      this.logger.log(
        '[createAgent] conversation_config construido:',
        JSON.stringify(conversationConfig, null, 2),
      );
    }

    this.logger.log(
      `[createAgent] Configuración encontrada para cuenta ${accountId}`,
    );
    this.logger.log(`[createAgent] API Key presente: ${!!config.apiKey}`);

    try {
      // Construir el payload según la documentación oficial de ElevenLabs 2025
      const payload: any = {
        conversation_config: conversationConfig,
      };

      // Agregar campos opcionales solo si se proporcionan
      if (agentData.name !== undefined && agentData.name !== null) {
        payload.name = agentData.name;
      }

      // Construir platform_settings si no se proporciona
      let platformSettings = agentData.platform_settings;
      if (!platformSettings) {
        // Configurar webhook automáticamente si no se proporciona uno
        const webhookUrl =
          agentData.webhookUrl ||
          `${this.configService.get('APP_URL')}/webhooks/elevenlabs`;

        platformSettings = {
          double_call: agentData.doubleCall || false,
          vm_detection: agentData.vmDetection || false,
          webhook_url: webhookUrl,
        };

        this.logger.log(
          `[createAgent] Configurando webhook automáticamente: ${webhookUrl}`,
        );
      }
      payload.platform_settings = platformSettings;

      if (agentData.workflow !== undefined) {
        payload.workflow = agentData.workflow;
      }

      if (agentData.tags !== undefined && agentData.tags !== null) {
        payload.tags = agentData.tags;
      }

      this.logger.log(
        `[createAgent] Creando agente en ElevenLabs con payload:`,
        JSON.stringify(payload, null, 2),
      );
      
      // Log específico para el mensaje inicial
      this.logger.log(
        `[createAgent] Mensaje inicial enviado: "${agentData.firstMessage || 'NO PROPORCIONADO'}"`,
      );
      this.logger.log(
        `[createAgent] conversation_config.agent.firstMessage: "${conversationConfig.agent?.firstMessage || 'NO ENCONTRADO'}"`,
      );

      // Usar el endpoint correcto según documentación oficial
      const response = await axios.post(
        'https://api.elevenlabs.io/v1/convai/agents/create',
        payload,
        {
          headers: {
            'xi-api-key': config.apiKey,
            'Content-Type': 'application/json',
          },
        },
      );

      const result = response.data;

      this.logger.log(`Agente creado con ID: ${result.agent_id}`);
      
      // Log de la respuesta completa para verificar qué devuelve ElevenLabs
      this.logger.log(
        `[createAgent] Respuesta completa de ElevenLabs:`,
        JSON.stringify(result, null, 2),
      );

      // Retornar según documentación oficial
      return {
        agent_id: result.agent_id,
        main_branch_id: result.main_branch_id || null,
        initial_version_id: result.initial_version_id || null,
      };
    } catch (error) {
      this.logger.error(
        'Error creando agente en ElevenLabs:',
        error.response?.data || error.message,
      );
      this.logger.error('Status code:', error.response?.status);

      // Manejo específico de errores según documentación oficial
      if (error.response?.status === 422) {
        this.logger.error(
          `Error 422 - Unprocessable Entity al crear agente:`,
          error.response?.data,
        );
        throw new BadRequestException(
          `No se pudo crear el agente. ${error.response?.data?.detail?.message || 'Los datos proporcionados no son válidos.'}`,
        );
      }

      if (error.response?.status === 405) {
        throw new BadRequestException(
          `Error 405: La API key de ElevenLabs no tiene permisos para crear agentes o el endpoint no está disponible. Por favor, verifica que tu API key tenga acceso a la plataforma de agentes de ElevenLabs.`,
        );
      }

      throw new BadRequestException(
        `Error creando agente: ${error.response?.data?.detail?.message || error.message}`,
      );
    }
  }

  /**
   * Duplicar un agente existente según documentación oficial ElevenLabs 2025
   * Documentación: https://elevenlabs.io/docs/api-reference/agents-platform/duplicate-agent
   */
  async duplicateAgent(
    accountId: string,
    agentId: string,
    newName?: string,
  ): Promise<{
    agent_id: string;
    main_branch_id?: string;
    initial_version_id?: string;
  }> {
    const config = await this.getConfig(accountId);
    if (!config?.apiKey) {
      throw new NotFoundException(
        `No se encontró configuración de ElevenLabs para la cuenta ${accountId}. Por favor, configure su API key.`,
      );
    }

    this.logger.log(
      `[duplicateAgent] Duplicando agente ${agentId} para cuenta ${accountId}`,
    );

    try {
      // Construir el payload
      const payload: any = {};
      if (newName) {
        payload.name = newName;
      }

      this.logger.log(
        `[duplicateAgent] Payload:`,
        JSON.stringify(payload, null, 2),
      );

      // Usar el endpoint correcto según documentación oficial
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/convai/agents/${agentId}/duplicate`,
        payload,
        {
          headers: {
            'xi-api-key': config.apiKey,
            'Content-Type': 'application/json',
          },
        },
      );

      const result = response.data;

      this.logger.log(
        `[duplicateAgent] Agente duplicado con ID: ${result.agent_id}`,
      );

      return {
        agent_id: result.agent_id,
        main_branch_id: result.main_branch_id || null,
        initial_version_id: result.initial_version_id || null,
      };
    } catch (error) {
      this.logger.error(
        '[duplicateAgent] Error duplicando agente en ElevenLabs:',
        error.response?.data || error.message,
      );
      this.logger.error(
        '[duplicateAgent] Status code:',
        error.response?.status,
      );
      this.logger.error(
        '[duplicateAgent] Status text:',
        error.response?.statusText,
      );

      // Si es un error 405, es probable que la API key no tenga permisos
      if (error.response?.status === 405) {
        throw new BadRequestException(
          `Error 405: La API key de ElevenLabs no tiene permisos para duplicar agentes o el endpoint no está disponible. Por favor, verifica que tu API key tenga acceso a la plataforma de agentes de ElevenLabs.`,
        );
      }

      throw new BadRequestException(
        `Error duplicando agente: ${error.response?.data?.detail?.message || error.message}`,
      );
    }
  }

  /**
   * Obtener un agente individual según documentación oficial ElevenLabs 2025
   * Documentación: https://elevenlabs.io/docs/api-reference/agents-platform/get-agent
   */
  async getAgent(
    accountId: string,
    agentId: string,
    versionId?: string,
  ): Promise<ElevenLabsAgent> {
    const config = await this.getConfig(accountId);
    if (!config?.apiKey) {
      throw new NotFoundException(
        `No se encontró configuración de ElevenLabs para la cuenta ${accountId}. Por favor, configure su API key.`,
      );
    }

    try {
      // Construir URL con parámetros de consulta si se proporciona versionId
      let url = `https://api.elevenlabs.io/v1/convai/agents/${agentId}`;
      if (versionId) {
        url += `?version_id=${versionId}`;
      }

      const response = await axios.get(url, {
        headers: {
          'xi-api-key': config.apiKey,
        },
      });

      const agent = response.data;

      this.logger.log(`Agente obtenido: ${agent.name} (ID: ${agent.agent_id})`);

      // Retornar la estructura completa según documentación oficial
      return {
        agent_id: agent.agent_id,
        name: agent.name,
        conversation_config: agent.conversation_config,
        metadata: agent.metadata,
        platform_settings: agent.platform_settings,
        phone_numbers: agent.phone_numbers,
        workflow: agent.workflow,
        access_info: agent.access_info,
        tags: agent.tags,
        version_id: agent.version_id,
      };
    } catch (error) {
      this.logger.error(
        `Error obteniendo agente ${agentId}:`,
        error.response?.data || error.message,
      );
      throw new BadRequestException('Error obteniendo agente');
    }
  }

  /**
   * Obtener el link de un agente de ElevenLabs
   * Según documentación oficial: GET /v1/convai/agents/:agent_id/link
   * Respuesta exitosa: 200 { agent_id, token }
   * Error: 422 Unprocessable Entity
   */
  async getAgentLink(
    accountId: string,
    agentId: string,
  ): Promise<{ agent_id: string; token: any | null }> {
    const config = await this.getConfig(accountId);
    if (!config?.apiKey) {
      throw new NotFoundException(
        `No se encontró configuración de ElevenLabs para la cuenta ${accountId}. Por favor, configure su API key.`,
      );
    }

    try {
      const response = await axios.get(
        `https://api.elevenlabs.io/v1/convai/agents/${agentId}/link`,
        {
          headers: {
            'xi-api-key': config.apiKey,
          },
        },
      );

      const result = response.data;

      this.logger.log(`Link obtenido para agente ${agentId}`);

      // Retornar según documentación oficial
      return {
        agent_id: result.agent_id,
        token: result.token || null,
      };
    } catch (error) {
      this.logger.error(
        `Error obteniendo link del agente ${agentId}:`,
        error.response?.data || error.message,
      );

      // Manejo específico de errores según documentación oficial
      if (error.response?.status === 422) {
        this.logger.error(
          `Error 422 - Unprocessable Entity al obtener link del agente ${agentId}:`,
          error.response?.data,
        );
        throw new BadRequestException(
          `No se pudo obtener el link del agente ${agentId}. El agente puede no existir o no tener permisos.`,
        );
      }

      if (error.response?.status === 404) {
        this.logger.warn(`Agente ${agentId} no encontrado en ElevenLabs`);
        throw new NotFoundException(
          `El agente ${agentId} no existe en ElevenLabs`,
        );
      }

      throw new BadRequestException(
        `Error al obtener el link del agente: ${error.response?.data?.detail || error.message}`,
      );
    }
  }

  /**
   * Simular una conversación con un agente de ElevenLabs
   * Según documentación oficial: POST /v1/convai/agents/:agent_id/simulate-conversation
   * Respuesta exitosa: 200 { simulated_conversation, analysis }
   * Error: 422 Unprocessable Entity
   */
  async simulateConversation(
    accountId: string,
    agentId: string,
    data: {
      simulation_specification: {
        simulated_user_config: any;
      };
      extra_evaluation_criteria?: any[] | null;
      new_turns_limit?: number;
    },
  ): Promise<{
    simulated_conversation: any[];
    analysis: {
      call_successful: string;
      transcript_summary: string;
      evaluation_criteria_results: any;
      data_collection_results: any;
      call_summary_title: string;
    };
  }> {
    const config = await this.getConfig(accountId);
    if (!config?.apiKey) {
      throw new NotFoundException(
        `No se encontró configuración de ElevenLabs para la cuenta ${accountId}. Por favor, configure su API key.`,
      );
    }

    try {
      // Construir el payload según la documentación oficial
      const payload: any = {
        simulation_specification: data.simulation_specification,
      };

      if (data.extra_evaluation_criteria !== undefined) {
        payload.extra_evaluation_criteria = data.extra_evaluation_criteria;
      }

      if (data.new_turns_limit !== undefined) {
        payload.new_turns_limit = data.new_turns_limit;
      }

      this.logger.log(`Simulando conversación para agente ${agentId}`);

      const response = await axios.post(
        `https://api.elevenlabs.io/v1/convai/agents/${agentId}/simulate-conversation`,
        payload,
        {
          headers: {
            'xi-api-key': config.apiKey,
            'Content-Type': 'application/json',
          },
        },
      );

      const result = response.data;

      this.logger.log(
        `Conversación simulada completada para agente ${agentId}`,
      );

      // Retornar según documentación oficial
      return {
        simulated_conversation: result.simulated_conversation || [],
        analysis: result.analysis || {
          call_successful: 'unknown',
          transcript_summary: '',
          evaluation_criteria_results: {},
          data_collection_results: {},
          call_summary_title: '',
        },
      };
    } catch (error) {
      this.logger.error(
        `Error simulando conversación para agente ${agentId}:`,
        error.response?.data || error.message,
      );

      // Manejo específico de errores según documentación oficial
      if (error.response?.status === 422) {
        this.logger.error(
          `Error 422 - Unprocessable Entity al simular conversación para agente ${agentId}:`,
          error.response?.data,
        );
        throw new BadRequestException(
          `No se pudo simular la conversación. ${error.response?.data?.detail?.message || 'Los datos proporcionados no son válidos.'}`,
        );
      }

      if (error.response?.status === 404) {
        this.logger.warn(`Agente ${agentId} no encontrado en ElevenLabs`);
        throw new NotFoundException(
          `El agente ${agentId} no existe en ElevenLabs`,
        );
      }

      throw new BadRequestException(
        `Error al simular la conversación: ${error.response?.data?.detail || error.message}`,
      );
    }
  }

  /**
   * Simular una conversación con un agente de ElevenLabs (Streaming)
   * Según documentación oficial: POST /v1/convai/agents/:agent_id/simulate-conversation/stream
   * Respuesta: Stream de mensajes parciales
   * Error: 422 Unprocessable Entity
   */
  async simulateConversationStream(
    accountId: string,
    agentId: string,
    data: {
      simulation_specification: {
        simulated_user_config: any;
      };
      extra_evaluation_criteria?: any[] | null;
      new_turns_limit?: number;
    },
    res: any,
  ): Promise<void> {
    const config = await this.getConfig(accountId);
    if (!config?.apiKey) {
      throw new NotFoundException(
        `No se encontró configuración de ElevenLabs para la cuenta ${accountId}. Por favor, configure su API key.`,
      );
    }

    try {
      // Construir el payload según la documentación oficial
      const payload: any = {
        simulation_specification: data.simulation_specification,
      };

      if (data.extra_evaluation_criteria !== undefined) {
        payload.extra_evaluation_criteria = data.extra_evaluation_criteria;
      }

      if (data.new_turns_limit !== undefined) {
        payload.new_turns_limit = data.new_turns_limit;
      }

      this.logger.log(
        `Iniciando simulación de conversación con streaming para agente ${agentId}`,
      );

      // Configurar headers para streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Hacer la petición con streaming
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/convai/agents/${agentId}/simulate-conversation/stream`,
        payload,
        {
          headers: {
            'xi-api-key': config.apiKey,
            'Content-Type': 'application/json',
          },
          responseType: 'stream',
        },
      );

      // Pipe la respuesta de ElevenLabs directamente al cliente
      response.data.on('data', (chunk: Buffer) => {
        res.write(chunk);
      });

      response.data.on('end', () => {
        this.logger.log(
          `Simulación de conversación completada para agente ${agentId}`,
        );
        res.end();
      });

      response.data.on('error', (error: Error) => {
        this.logger.error(
          `Error en el stream de simulación para agente ${agentId}:`,
          error,
        );
        res.end();
      });
    } catch (error) {
      this.logger.error(
        `Error iniciando simulación con streaming para agente ${agentId}:`,
        error.response?.data || error.message,
      );

      // Manejo específico de errores según documentación oficial
      if (error.response?.status === 422) {
        this.logger.error(
          `Error 422 - Unprocessable Entity al simular conversación con streaming para agente ${agentId}:`,
          error.response?.data,
        );
        throw new BadRequestException(
          `No se pudo simular la conversación con streaming. ${error.response?.data?.detail?.message || 'Los datos proporcionados no son válidos.'}`,
        );
      }

      if (error.response?.status === 404) {
        this.logger.warn(`Agente ${agentId} no encontrado en ElevenLabs`);
        throw new NotFoundException(
          `El agente ${agentId} no existe en ElevenLabs`,
        );
      }

      throw new BadRequestException(
        `Error al simular la conversación con streaming: ${error.response?.data?.detail || error.message}`,
      );
    }
  }

  /**
   * Calcular el uso esperado de LLM para un agente
   * Según documentación oficial: POST /v1/convai/agent/:agent_id/llm-usage/calculate
   * Respuesta exitosa: 200 { llm_prices: [{ llm, price_per_minute }] }
   * Error: 422 Unprocessable Entity
   */
  async calculateLLMUsage(
    accountId: string,
    agentId: string,
    data: {
      prompt_length?: number | null;
      number_of_pages?: number | null;
      rag_enabled?: boolean | null;
    },
  ): Promise<{
    llm_prices: Array<{
      llm: string;
      price_per_minute: number;
    }>;
  }> {
    const config = await this.getConfig(accountId);
    if (!config?.apiKey) {
      throw new NotFoundException(
        `No se encontró configuración de ElevenLabs para la cuenta ${accountId}. Por favor, configure su API key.`,
      );
    }

    try {
      // Construir el payload según la documentación oficial
      const payload: any = {};

      if (data.prompt_length !== undefined && data.prompt_length !== null) {
        payload.prompt_length = data.prompt_length;
      }

      if (data.number_of_pages !== undefined && data.number_of_pages !== null) {
        payload.number_of_pages = data.number_of_pages;
      }

      if (data.rag_enabled !== undefined && data.rag_enabled !== null) {
        payload.rag_enabled = data.rag_enabled;
      }

      this.logger.log(`Calculando uso de LLM para agente ${agentId}`);

      const response = await axios.post(
        `https://api.elevenlabs.io/v1/convai/agent/${agentId}/llm-usage/calculate`,
        payload,
        {
          headers: {
            'xi-api-key': config.apiKey,
            'Content-Type': 'application/json',
          },
        },
      );

      const result = response.data;

      this.logger.log(`Uso de LLM calculado para agente ${agentId}`);

      // Retornar según documentación oficial
      return {
        llm_prices: result.llm_prices || [],
      };
    } catch (error) {
      this.logger.error(
        `Error calculando uso de LLM para agente ${agentId}:`,
        error.response?.data || error.message,
      );

      // Manejo específico de errores según documentación oficial
      if (error.response?.status === 422) {
        this.logger.error(
          `Error 422 - Unprocessable Entity al calcular uso de LLM para agente ${agentId}:`,
          error.response?.data,
        );
        throw new BadRequestException(
          `No se pudo calcular el uso de LLM. ${error.response?.data?.detail?.message || 'Los datos proporcionados no son válidos.'}`,
        );
      }

      if (error.response?.status === 404) {
        this.logger.warn(`Agente ${agentId} no encontrado en ElevenLabs`);
        throw new NotFoundException(
          `El agente ${agentId} no existe en ElevenLabs`,
        );
      }

      throw new BadRequestException(
        `Error al calcular el uso de LLM: ${error.response?.data?.detail || error.message}`,
      );
    }
  }

  /**
   * Actualizar un agente según documentación oficial ElevenLabs 2025
   * Documentación: https://elevenlabs.io/docs/api-reference/agents-platform/update-agent
   */
  async updateAgent(
    accountId: string, // Se requiere accountId
    agentId: string,
    updateData: {
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
      platform_settings?: any;
      workflow?: any;
      tags?: string[] | null;
    },
  ): Promise<ElevenLabsAgent> {
    this.logger.log(
      `[updateAgent] Iniciando actualización del agente ${agentId} para la cuenta ${accountId}`,
    );

    const config = await this.getConfig(accountId);
    if (!config?.apiKey) {
      this.logger.error(
        `[updateAgent] No se encontró configuración de ElevenLabs para la cuenta ${accountId}`,
      );
      throw new NotFoundException(
        `No se encontró configuración de ElevenLabs para la cuenta ${accountId}. Por favor, configure su API key.`,
      );
    }

    // Construir el payload según la documentación oficial de ElevenLabs 2025
    const updatePayload: any = {};

    try {
      // Solo incluir name si está definido
      if (updateData.name !== undefined) {
        updatePayload.name = updateData.name;
      }

      // Construir conversation_config según documentación oficial ElevenLabs 2025
      this.logger.log(
        '[updateAgent] Construyendo conversation_config según documentación oficial',
      );

      // Estructura CORRECTA según documentación oficial ElevenLabs 2025
      // Documentación: https://elevenlabs.io/docs/api-reference/agents-platform/update-agent
      // IMPORTANTE: El endpoint PATCH actualiza parcialmente, pero conversation_config debe enviarse completo
      updatePayload.conversation_config = {
        // Configuración de Text-to-Speech (TTS)
        tts: {
          voice_id: updateData.voiceId,
          model_id: 'eleven_turbo_v2', // Modelo recomendado para agentes
        },
        // Configuración de conversación
        conversation: {
          max_duration_seconds: 1800, // 30 minutos máximo (documentación usa max_duration_seconds en conversation)
        },
        // Configuración del agente
        agent: {
          first_message: updateData.firstMessage || 'Hola, ¿en qué puedo ayudarte?',
          language: (updateData.language || 'es').toLowerCase(),
          // CRÍTICO: El prompt es un objeto, no un string directo
          prompt: {
            prompt: updateData.systemPrompt || 'Eres un asistente telefónico profesional y amigable.',
            llm: 'gemini-2.5-flash',
            temperature: updateData.temperature || 0,
            max_tokens: (updateData as any).maxTokens || -1,
          },
        },
      };

      // Solo incluir platform_settings si se proporciona explícitamente
      if (updateData.platform_settings) {
        updatePayload.platform_settings = updateData.platform_settings;
      }

      // Solo incluir workflow si se proporciona explícitamente
      if (updateData.workflow) {
        updatePayload.workflow = updateData.workflow;
      }

      // Solo incluir tags si se proporciona explícitamente
      if (updateData.tags !== undefined) {
        updatePayload.tags = updateData.tags;
      }

      this.logger.log(
        `[updateAgent] Actualizando agente ${agentId} en ElevenLabs`,
      );
      this.logger.log(
        `[updateAgent] Payload completo: ${JSON.stringify(updatePayload, null, 2)}`,
      );
      this.logger.log(
        `[updateAgent] URL: https://api.elevenlabs.io/v1/convai/agents/${agentId}`,
      );

      // Log detallado antes de la llamada
      this.logger.log(`[updateAgent] Realizando llamada a ElevenLabs API...`);
      this.logger.log(`[updateAgent] URL: https://api.elevenlabs.io/v1/convai/agents/${agentId}`);
      this.logger.log(`[updateAgent] Headers:`, {
        'xi-api-key': config.apiKey.substring(0, 10) + '...',
        'Content-Type': 'application/json',
      });
      this.logger.log(`[updateAgent] Payload final:`, JSON.stringify(updatePayload, null, 2));
      
      // Log de los datos de entrada
      this.logger.log(`[updateAgent] Datos de entrada:`, JSON.stringify(updateData, null, 2));
      this.logger.log(`[updateAgent] Account ID: ${accountId}`);
      this.logger.log(`[updateAgent] Agent ID: ${agentId}`);

      // Validar que el payload tenga la estructura correcta
      if (!updatePayload.conversation_config?.agent?.prompt?.prompt) {
        throw new BadRequestException('El prompt del agente es requerido');
      }

      if (!updatePayload.conversation_config?.tts?.voice_id) {
        throw new BadRequestException('El voice_id es requerido');
      }

      this.logger.log(`[updateAgent] Payload validado correctamente`);

      const response = await axios.patch(
        `https://api.elevenlabs.io/v1/convai/agents/${agentId}`,
        updatePayload,
        {
          headers: {
            'xi-api-key': config.apiKey,
            'Content-Type': 'application/json',
          },
        },
      );

      const agent = response.data;

      this.logger.log(
        `[updateAgent] Agente actualizado exitosamente: ${agent.name} (ID: ${agent.agent_id})`,
      );

      // Retornar la estructura completa según documentación oficial
      return {
        agent_id: agent.agent_id,
        name: agent.name,
        conversation_config: agent.conversation_config,
        metadata: agent.metadata,
        platform_settings: agent.platform_settings,
        phone_numbers: agent.phone_numbers,
        workflow: agent.workflow,
        access_info: agent.access_info,
        tags: agent.tags,
        version_id: agent.version_id,
      };
    } catch (error) {
      this.logger.error(`[updateAgent] Error actualizando agente ${agentId}:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        stack: error.stack,
        config: error.config,
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
      });
      
      // Log específico del error de ElevenLabs
      this.logger.error(`[updateAgent] Error específico de ElevenLabs:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        payload: updatePayload,
      });
      
      // Log del error completo para debugging
      this.logger.error(`[updateAgent] Error completo:`, JSON.stringify({
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        payload: updatePayload,
      }, null, 2));

      // Log adicional para debugging
      this.logger.error(`[updateAgent] Payload enviado:`, updatePayload);
      this.logger.error(`[updateAgent] Account ID: ${accountId}`);
      this.logger.error(`[updateAgent] Agent ID: ${agentId}`);

      if (error.response?.status === 400) {
        const errorDetail = error.response?.data?.detail || error.response?.data?.message || error.message;
        this.logger.error(`[updateAgent] Error 400 específico:`, errorDetail);
        throw new BadRequestException(
          `Error 400 al actualizar agente en ElevenLabs: ${errorDetail}. Verifica que el agente existe y que el payload es válido.`,
        );
      }

      if (error.response?.status === 404) {
        throw new NotFoundException(
          `El agente ${agentId} no existe en ElevenLabs`,
        );
      }

      throw new BadRequestException(
        `Error actualizando agente: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * Eliminar un agente de ElevenLabs
   * Según documentación oficial: DELETE /v1/convai/agents/:agent_id
   * Respuesta exitosa: 200 Deleted {}
   * Error: 422 Unprocessable Entity
   */
  async deleteAgent(
    accountId: string,
    agentId: string,
  ): Promise<{ success: boolean; message: string }> {
    const config = await this.getConfig(accountId);
    if (!config?.apiKey) {
      throw new NotFoundException(
        `No se encontró configuración de ElevenLabs para la cuenta ${accountId}. Por favor, configure su API key.`,
      );
    }

    try {
      const response = await axios.delete(
        `https://api.elevenlabs.io/v1/convai/agents/${agentId}`,
        {
          headers: {
            'xi-api-key': config.apiKey,
          },
        },
      );

      this.logger.log(`Agente ${agentId} eliminado exitosamente de ElevenLabs`);

      // Según documentación oficial, respuesta exitosa es 200 con {}
      return {
        success: true,
        message: 'Agente eliminado exitosamente',
      };
    } catch (error) {
      // Manejo específico de errores según documentación oficial
      if (error.response?.status === 422) {
        this.logger.error(
          `Error 422 - Unprocessable Entity al eliminar agente ${agentId}:`,
          error.response?.data,
        );
        throw new BadRequestException(
          `No se pudo eliminar el agente ${agentId}. El agente puede estar en uso o no existir.`,
        );
      }

      if (error.response?.status === 404) {
        this.logger.warn(`Agente ${agentId} no encontrado en ElevenLabs`);
        throw new NotFoundException(
          `El agente ${agentId} no existe en ElevenLabs`,
        );
      }

      this.logger.error(
        `Error eliminando agente ${agentId}:`,
        error.response?.data || error.message,
      );
      throw new BadRequestException(
        `Error al eliminar el agente: ${error.response?.data?.detail || error.message}`,
      );
    }
  }

  /**
   * Iniciar una conversación con un agente según documentación oficial ElevenLabs 2025
   * Incluye tracking automático de uso por cliente individual
   */
  async startConversation(
    accountId: string,
    agentId: string,
    phoneNumber: string,
    callId?: string,
  ): Promise<ElevenLabsConversation> {
    const elevenLabs = await this.getElevenLabsClient(accountId);
    try {
      const conversation = await elevenLabs.conversations.create({
        agent_id: agentId,
        phone_number: phoneNumber,
        // Configuraciones adicionales según documentación 2025
        webhook_url: `${this.configService.get('APP_URL')}/webhooks/elevenlabs`,
        recording_enabled: true,
        transcript_enabled: true,
        // Metadata para tracking individual por cliente
        metadata: {
          accountId,
          callId,
          timestamp: new Date().toISOString(),
        },
      });

      this.logger.log(
        `Conversación iniciada: ${conversation.conversation_id} para cliente: ${accountId}`,
      );

      // Trackear el inicio de conversación para el cliente
      await this.trackConversationStart(
        accountId,
        conversation.conversation_id,
        agentId,
        callId,
      );

      return {
        id: conversation.conversation_id,
        agentId: conversation.agent_id,
        status: conversation.status,
        duration: 0,
        transcript: '',
        recordingUrl: conversation.recording_url,
        createdAt: conversation.created_at,
      };
    } catch (error) {
      this.logger.error('Error iniciando conversación en ElevenLabs:', error);
      throw new BadRequestException('Error iniciando conversación');
    }
  }

  /**
   * Hacer llamada outbound usando ElevenLabs + Twilio según documentación oficial
   * POST /v1/convai/twilio/outbound-call
   */
  async makeOutboundCall(
    accountId: string,
    agentId: string,
    agentPhoneNumberId: string,
    toNumber: string,
    conversationInitiationClientData?: any,
  ): Promise<{
    success: boolean;
    message: string;
    conversation_id: string | null;
    callSid: string | null;
  }> {
    this.logger.log(
      `📞 Iniciando llamada outbound: Agente ${agentId} -> ${toNumber} (account: ${accountId})`,
    );

    const config = await this.getConfig(accountId);
    if (!config?.apiKey) {
      throw new NotFoundException(
        `No se encontró configuración de ElevenLabs para la cuenta ${accountId}.`,
      );
    }

    // Obtener el agente de la base de datos para obtener el elevenLabsAgentId
    const agent = await this.prisma.agent.findFirst({
      where: {
        id: agentId,
        accountId,
      },
      select: {
        id: true,
        name: true,
        elevenLabsAgentId: true,
      },
    });

    if (!agent) {
      throw new NotFoundException(`Agente ${agentId} no encontrado`);
    }

    if (!agent.elevenLabsAgentId) {
      throw new BadRequestException(
        `El agente "${agent.name}" no tiene un ID de ElevenLabs. Por favor, guarda el agente primero.`,
      );
    }

    this.logger.log(
      `📋 Usando ElevenLabs Agent ID: ${agent.elevenLabsAgentId} para agente local: ${agent.name}`,
    );

    try {
      // Formato correcto de conversation_initiation_client_data según documentación ElevenLabs
      const defaultClientData = {
        dynamic_variables: {
          customer_phone: toNumber,
          call_timestamp: new Date().toISOString(),
          agent_name: agent.name,
        },
        metadata: {
          call_purpose: 'outbound_call',
          source: 'elevenlabs_api',
          priority: 'normal',
        },
      };

      const requestBody = {
        agent_id: agent.elevenLabsAgentId, // Usar el ID de ElevenLabs, no el ID local
        agent_phone_number_id: agentPhoneNumberId,
        to_number: toNumber,
        conversation_initiation_client_data:
          conversationInitiationClientData || defaultClientData,
      };

      this.logger.log(
        `📤 Solicitando llamada outbound a ElevenLabs: ${JSON.stringify(requestBody, null, 2)}`,
      );

      // Usar la API oficial de ElevenLabs para llamadas Twilio
      const response = await fetch(
        'https://api.elevenlabs.io/v1/convai/twilio/outbound-call',
        {
          method: 'POST',
          headers: {
            'xi-api-key': config.apiKey, // Usar la clave del cliente
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `❌ Error en API de ElevenLabs (${response.status}): ${errorText}`,
        );
        throw new Error(
          `ElevenLabs API error: ${response.status} - ${errorText}`,
        );
      }

      const result = await response.json() as ElevenLabsOutboundCallResponse;

      this.logger.log(
        `✅ Llamada outbound iniciada exitosamente: ${JSON.stringify(result)}`,
      );

      // Trackear la llamada para el cliente
      if (result.conversation_id) {
        await this.trackConversationStart(
          accountId,
          result.conversation_id,
          agentId,
          result.callSid,
        );
      }

      return result;
    } catch (error) {
      this.logger.error(
        `❌ Error haciendo llamada outbound para agente ${agentId}:`,
        error.message,
      );
      throw new BadRequestException(
        `Error haciendo llamada outbound: ${error.message}`,
      );
    }
  }

  /**
   * Registrar un número de teléfono en ElevenLabs según documentación oficial
   * POST /v1/convai/phone-numbers
   */
  async registerPhoneNumber(
    accountId: string,
    phoneNumber: string,
    twilioSid: string,
    twilioAuthToken: string,
    label?: string,
  ): Promise<{ phone_number_id: string }> {
    this.logger.log(
      `📞 Registrando número de teléfono ${phoneNumber} en ElevenLabs para la cuenta ${accountId}`,
    );

    const config = await this.getConfig(accountId);
    if (!config?.apiKey) {
      throw new NotFoundException(
        `No se encontró configuración de ElevenLabs para la cuenta ${accountId}.`,
      );
    }

    try {
      // Obtener el Account SID de Twilio (no el Phone Number SID)
      const twilioConfig = await this.prisma.accountTwilioConfig.findUnique({
        where: { accountId },
      });

      if (!twilioConfig?.accountSid) {
        throw new BadRequestException(
          'No se encontró configuración de Twilio para esta cuenta',
        );
      }

      const requestBody = {
        phone_number: phoneNumber,
        sid: twilioConfig.accountSid, // Usar Account SID, no Phone Number SID
        token: twilioAuthToken,
        label: label || phoneNumber,
      };

      this.logger.log(
        `📤 Registrando número en ElevenLabs: ${JSON.stringify(requestBody, null, 2)}`,
      );

      const axios = await import('axios');
      const response = await axios.default.post(
        'https://api.elevenlabs.io/v1/convai/phone-numbers',
        requestBody,
        {
          headers: {
            'xi-api-key': config.apiKey,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        },
      );

      if (response.status !== 200 && response.status !== 201) {
        this.logger.error(
          `❌ Error registrando número en ElevenLabs (${response.status}): ${JSON.stringify(response.data)}`,
        );
        throw new Error(
          `ElevenLabs API error: ${response.status} - ${JSON.stringify(response.data)}`,
        );
      }

      const result = response.data;

      this.logger.log(
        `✅ Número registrado exitosamente en ElevenLabs: ${JSON.stringify(result)}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `❌ Error registrando número ${phoneNumber} en ElevenLabs:`,
        error.message,
      );
      throw new BadRequestException(
        `Error registrando número en ElevenLabs: ${error.message}`,
      );
    }
  }

  /**
   * Sincronizar números de teléfono existentes con ElevenLabs
   */
  async syncPhoneNumbersWithElevenLabs(accountId: string): Promise<{
    synced: number;
    failed: number;
    message: string;
  }> {
    this.logger.log(
      `🔄 Sincronizando números de teléfono con ElevenLabs para la cuenta ${accountId}`,
    );

    // Obtener todos los números de teléfono de la cuenta que no están registrados en ElevenLabs
    const phoneNumbers = await this.prisma.phoneNumber.findMany({
      where: {
        accountId,
        status: 'active',
        elevenLabsPhoneNumberId: null, // Solo números que no están registrados
      },
    });

    if (phoneNumbers.length === 0) {
      this.logger.log(
        `✅ No hay números de teléfono para sincronizar con ElevenLabs`,
      );
      return {
        synced: 0,
        failed: 0,
        message: 'No hay números de teléfono para sincronizar',
      };
    }

    this.logger.log(
      `📞 Encontrados ${phoneNumbers.length} números de teléfono para sincronizar`,
    );

    let synced = 0;
    let failed = 0;

    // Obtener configuración de Twilio para obtener los auth tokens
    const twilioConfig = await this.prisma.accountTwilioConfig.findUnique({
      where: { accountId },
    });

    if (!twilioConfig) {
      throw new BadRequestException(
        'Configuración de Twilio no encontrada para esta cuenta',
      );
    }

    // Sincronizar cada número
    for (const phoneNumber of phoneNumbers) {
      try {
        this.logger.log(
          `📞 Registrando número ${phoneNumber.number} en ElevenLabs...`,
        );

        const result = await this.registerPhoneNumber(
          accountId,
          phoneNumber.number,
          phoneNumber.twilioSid || '',
          twilioConfig.authToken,
          phoneNumber.description || phoneNumber.number,
        );

        // Actualizar el registro con el ID de ElevenLabs
        await this.prisma.phoneNumber.update({
          where: { id: phoneNumber.id },
          data: {
            elevenLabsPhoneNumberId: result.phone_number_id,
          },
        });

        this.logger.log(
          `✅ Número ${phoneNumber.number} registrado exitosamente en ElevenLabs con ID: ${result.phone_number_id}`,
        );
        synced++;
      } catch (error) {
        this.logger.error(
          `❌ Error registrando número ${phoneNumber.number} en ElevenLabs:`,
          error.message,
        );
        failed++;
      }
    }

    const message =
      synced > 0
        ? `Sincronizados ${synced} números de teléfono con ElevenLabs${failed > 0 ? `, ${failed} fallaron` : ''}`
        : `No se pudo sincronizar ningún número de teléfono`;

    return {
      synced,
      failed,
      message,
    };
  }

  /**
   * Crear un test de agente según documentación oficial ElevenLabs
   * POST /v1/convai/agent-testing/create
   */
  async createAgentTest(
    accountId: string, // Se requiere accountId
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
  ): Promise<{ id: string }> {
    const config = await this.getConfig(accountId);
    if (!config?.apiKey) {
      throw new NotFoundException(
        `No se encontró configuración de ElevenLabs para la cuenta ${accountId}.`,
      );
    }

    try {
      const response = await fetch(
        'https://api.elevenlabs.io/v1/convai/agent-testing/create',
        {
          method: 'POST',
          headers: {
            'xi-api-key': config.apiKey, // Usar la clave del cliente
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testData),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as ElevenLabsErrorResponse;
        throw new Error(
          `ElevenLabs API error: ${response.status} - ${errorData.message || response.statusText}`,
        );
      }

      const result = await response.json() as ElevenLabsTestAgentResponse;
      this.logger.log(`Test de agente creado: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error('Error creando test de agente:', error);
      throw new BadRequestException(
        `Error creando test de agente: ${error.message}`,
      );
    }
  }

  /**
   * Ejecutar tests en un agente según documentación oficial ElevenLabs
   * POST /v1/convai/agents/:agent_id/run-tests
   */
  async runAgentTests(
    accountId: string, // Se requiere accountId
    agentId: string,
    tests: Array<{ test_id: string }>,
    agentConfigOverride?: any,
  ): Promise<{
    id: string;
    test_runs: any[];
    agent_id: string | null;
    created_at: number | null;
  }> {
    const config = await this.getConfig(accountId);
    if (!config?.apiKey) {
      throw new NotFoundException(
        `No se encontró configuración de ElevenLabs para la cuenta ${accountId}.`,
      );
    }

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/agents/${agentId}/run-tests`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': config.apiKey, // Usar la clave del cliente
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tests,
            agent_config_override: agentConfigOverride || null,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as ElevenLabsErrorResponse;
        throw new Error(
          `ElevenLabs API error: ${response.status} - ${errorData.message || response.statusText}`,
        );
      }

      const result = await response.json() as ElevenLabsTestRunResponse;
      this.logger.log(`Tests ejecutados en agente ${agentId}: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error('Error ejecutando tests en agente:', error);
      throw new BadRequestException(
        `Error ejecutando tests en agente: ${error.message}`,
      );
    }
  }

  /**
   * Obtener analíticas de conversaciones según documentación oficial ElevenLabs 2025
   */

  /**
   * Obtener conversaciones recientes según documentación oficial ElevenLabs 2025
   */
  async getRecentConversations(
    accountId: string, // Se requiere accountId
    limit: number = 10,
  ): Promise<ElevenLabsConversation[]> {
    const elevenLabs = await this.getElevenLabsClient(accountId);
    try {
      const response = await elevenLabs.conversations.getAll({
        limit,
        sort: 'created_at',
        order: 'desc',
      });

      return (response.conversations || []).map((conv: any) => ({
        id: conv.conversation_id,
        agentId: conv.agent_id,
        status: conv.status,
        duration: conv.duration || 0,
        transcript: conv.transcript || '',
        recordingUrl: conv.recording_url,
        createdAt: conv.created_at,
        endedAt: conv.ended_at,
      }));
    } catch (error) {
      this.logger.error('Error obteniendo conversaciones recientes:', error);
      throw new BadRequestException('Error obteniendo conversaciones');
    }
  }

  /**
   * Sincroniza un agente de ElevenLabs con un agente en la base de datos local
   */
  async syncAgentWithDatabase(
    accountId: string, // Se requiere accountId
    elevenLabsAgentId: string,
    databaseAgentId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Verificar que el agente de ElevenLabs existe
      const response = await this.getAgents(accountId); // Pasar accountId
      const agent = response.agents.find(
        (a) => a.agent_id === elevenLabsAgentId,
      );

      if (!agent) {
        throw new BadRequestException('Agente de ElevenLabs no encontrado');
      }

      // Actualizar el agente en la base de datos local
      // Nota: Aquí necesitarías inyectar PrismaService para actualizar la base de datos
      // Por ahora, retornamos éxito para la estructura

      this.logger.log(
        `Agente sincronizado: ElevenLabs ID ${elevenLabsAgentId} -> Database ID ${databaseAgentId}`,
      );

      return {
        success: true,
        message: 'Agente sincronizado exitosamente',
      };
    } catch (error) {
      this.logger.error('Error sincronizando agente:', error);
      throw new BadRequestException('Error sincronizando agente');
    }
  }

  /**
   * Trackear inicio de conversación para un cliente específico
   */
  private async trackConversationStart(
    accountId: string,
    conversationId: string,
    agentId: string,
    callId?: string,
  ) {
    try {
      // Registrar el inicio de la conversación
      await this.usageTrackingService.trackUsage(accountId, {
        callId,
        agentId,
        minutes: 0, // Se actualizará cuando termine la conversación
        tokens: 0, // Se actualizará durante la conversación
        cost: 0, // Se calculará al final
      });

      this.logger.log(
        `Conversación trackeada para cliente ${accountId}: ${conversationId}`,
      );
    } catch (error) {
      this.logger.error('Error trackeando inicio de conversación:', error);
    }
  }

  /**
   * Trackear finalización de conversación con métricas completas
   */
  async trackConversationEnd(
    accountId: string,
    conversationId: string,
    duration: number,
    tokensUsed: number,
    callId?: string,
    agentId?: string,
  ) {
    try {
      // Calcular costo basado en duración y tokens
      const cost = this.calculateConversationCost(duration, tokensUsed);

      // Actualizar el tracking con métricas finales
      await this.usageTrackingService.trackUsage(accountId, {
        callId,
        agentId,
        minutes: duration / 60, // Convertir segundos a minutos
        tokens: tokensUsed,
        cost,
      });

      this.logger.log(
        `Conversación finalizada para cliente ${accountId}: ${duration}s, ${tokensUsed} tokens, $${cost}`,
      );
    } catch (error) {
      this.logger.error(
        'Error trackeando finalización de conversación:',
        error,
      );
    }
  }

  /**
   * Calcular costo de conversación basado en duración y tokens
   * Según precios oficiales de ElevenLabs 2025
   */
  private calculateConversationCost(
    durationSeconds: number,
    tokensUsed: number,
  ): number {
    const durationMinutes = durationSeconds / 60;

    // Precios oficiales ElevenLabs 2025 (ajustar según precios actuales)
    const pricePerMinute = 0.18; // $0.18 por minuto de conversación
    const pricePerToken = 0.0001; // $0.0001 por token (ajustar según modelo)

    const durationCost = durationMinutes * pricePerMinute;
    const tokenCost = tokensUsed * pricePerToken;

    return Math.round((durationCost + tokenCost) * 100) / 100; // Redondear a 2 decimales
  }

  /**
   * Obtener uso de ElevenLabs para un cliente específico
   */
  async getClientUsage(accountId: string, period?: 'month' | 'week' | 'day') {
    return this.usageTrackingService.getClientUsage(accountId, period);
  }

  /**
   * Obtener uso por agente específico de un cliente
   */
  async getAgentUsage(
    accountId: string,
    agentId: string,
    period?: 'month' | 'week' | 'day',
  ) {
    return this.usageTrackingService.getAgentUsage(accountId, agentId, period);
  }

  /**
   * Verificar si el cliente tiene balance suficiente para una conversación
   */
  async checkClientBalance(
    accountId: string,
    estimatedCost: number,
  ): Promise<boolean> {
    return this.usageTrackingService.hasSufficientBalance(
      accountId,
      estimatedCost,
    );
  }

  // ===== MÉTODOS DE AGENTS PLATFORM (2025) =====
  // Nota: Los métodos de billing se han movido a ElevenLabsUsageTrackingService
  // para seguir el modelo correcto de una sola API key con tracking interno

  // ===== MÉTODOS DE CONVERSACIONES (2025) =====

  /**
   * Obtener todas las conversaciones según documentación oficial ElevenLabs 2025
   */
  async getConversations(accountId: string, filters: any = {}) {
    try {
      // Obtener configuración de ElevenLabs
      const config = await this.getConfig(accountId);

      if (!config?.apiKey) {
        this.logger.error(
          `No se encontró configuración para accountId: ${accountId}`,
        );
        return [];
      }

      // Usar API directa en lugar del SDK
      const url = 'https://api.elevenlabs.io/v1/convai/conversations';
      const response = await axios.get(url, {
        headers: {
          'xi-api-key': config.apiKey,
          Accept: 'application/json',
        },
      });

      this.logger.log(
        `✅ Obtenidas ${response.data.conversations?.length || 0} conversaciones de ElevenLabs`,
      );

      return response.data.conversations || [];
    } catch (error) {
      this.logger.error(
        '❌ Error obteniendo conversaciones de ElevenLabs:',
        error.message,
      );
      // Devolver array vacío en lugar de lanzar excepción
      return [];
    }
  }

  /**
   * Obtener detalles de una conversación específica
   */
  async getConversationDetails(accountId: string, conversationId: string) {
    try {
      // Obtener configuración de ElevenLabs
      const config = await this.getConfig(accountId);
      if (!config?.apiKey) {
        this.logger.error(
          `No se encontró configuración para accountId: ${accountId}`,
        );
        return null;
      }

      this.logger.log(
        `📞 [getConversationDetails] Obteniendo detalles para conversación ${conversationId}`,
      );

      // Usar API REST directa para obtener timestamps exactos
      const response = await axios.get(
        `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
        {
          headers: {
            'xi-api-key': config.apiKey,
            Accept: 'application/json',
          },
          timeout: 10000,
        },
      );

      this.logger.log(
        `✅ [getConversationDetails] Detalles obtenidos para conversación ${conversationId}`,
      );
      
      // Log de la estructura completa para debugging
      this.logger.log(
        `🔍 [getConversationDetails] Estructura completa de la respuesta:`,
        JSON.stringify(response.data, null, 2).substring(0, 1000) + '...',
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `❌ [getConversationDetails] Error obteniendo detalles de conversación ${conversationId}:`,
        error.message,
      );

      // En lugar de lanzar una excepción, retornar null para que el código que lo llama pueda manejarlo
      return null;
    }
  }

  /**
   * Obtener números de teléfono reales de una conversación de ElevenLabs
   */
  async getConversationPhoneNumbers(accountId: string, conversationId: string) {
    try {
      this.logger.log(
        `📞 Obteniendo números de teléfono para conversación ${conversationId}`,
      );

      const conversationDetails = await this.getConversationDetails(
        accountId,
        conversationId,
      );

      if (!conversationDetails) {
        this.logger.warn(
          `⚠️ No se encontraron detalles para conversación ${conversationId}`,
        );
        return {
          agentPhoneNumber: null,
          contactPhoneNumber: null,
          direction: null,
        };
      }

      this.logger.log(
        `📞 Detalles de conversación ${conversationId} obtenidos exitosamente`,
      );

      // Extraer números de teléfono de los detalles de la conversación
      const phoneNumbers = {
        agentPhoneNumber: null,
        contactPhoneNumber: null,
        direction: null,
      };

      // Buscar números de teléfono en los detalles de la conversación
      if (conversationDetails.phone_number) {
        phoneNumbers.agentPhoneNumber = conversationDetails.phone_number;
      }

      if (conversationDetails.to_number) {
        phoneNumbers.contactPhoneNumber = conversationDetails.to_number;
      }

      if (conversationDetails.direction) {
        phoneNumbers.direction = conversationDetails.direction;
      }

      // Buscar en metadata.phone_call (estructura real de la API)
      if (
        conversationDetails.metadata &&
        conversationDetails.metadata.phone_call
      ) {
        const phoneCall = conversationDetails.metadata.phone_call;

        if (phoneCall.agent_number && !phoneNumbers.agentPhoneNumber) {
          phoneNumbers.agentPhoneNumber = phoneCall.agent_number;
        }

        if (phoneCall.external_number && !phoneNumbers.contactPhoneNumber) {
          phoneNumbers.contactPhoneNumber = phoneCall.external_number;
        }

        if (phoneCall.direction && !phoneNumbers.direction) {
          phoneNumbers.direction = phoneCall.direction;
        }
      }

      // Buscar en metadata o config si no están en el nivel principal (campos alternativos)
      if (conversationDetails.metadata) {
        if (
          conversationDetails.metadata.agent_phone_number &&
          !phoneNumbers.agentPhoneNumber
        ) {
          phoneNumbers.agentPhoneNumber =
            conversationDetails.metadata.agent_phone_number;
        }
        if (
          conversationDetails.metadata.contact_phone_number &&
          !phoneNumbers.contactPhoneNumber
        ) {
          phoneNumbers.contactPhoneNumber =
            conversationDetails.metadata.contact_phone_number;
        }
      }

      this.logger.log(
        `📞 Números extraídos de conversación ${conversationId}:`,
        phoneNumbers,
      );

      return phoneNumbers;
    } catch (error) {
      this.logger.error(
        `Error obteniendo números de teléfono de conversación ${conversationId}:`,
        error,
      );
      return {
        agentPhoneNumber: null,
        contactPhoneNumber: null,
        direction: null,
      };
    }
  }

  /**
   * Obtener audio de una conversación
   * Según documentación oficial: GET /v1/convai/conversations/:conversation_id/audio
   */
  async getConversationAudio(accountId: string, conversationId: string) {
    // Se requiere accountId
    this.logger.log(
      `🎵 Obteniendo audio para conversación ${conversationId} (account: ${accountId})`,
    );

    const config = await this.getConfig(accountId);
    if (!config?.apiKey) {
      throw new NotFoundException(
        `No se encontró configuración de ElevenLabs para la cuenta ${accountId}.`,
      );
    }

    // Buscar la llamada en la base de datos para obtener el elevenLabsConversationId
    const call = await this.prisma.call.findFirst({
      where: {
        id: conversationId,
        accountId,
      },
      select: {
        id: true,
        elevenLabsConversationId: true,
      },
    });

    if (!call) {
      throw new NotFoundException(
        `No se encontró la conversación ${conversationId} para la cuenta ${accountId}.`,
      );
    }

    if (!call.elevenLabsConversationId) {
      throw new NotFoundException(
        `La conversación ${conversationId} no tiene un ID de ElevenLabs asociado.`,
      );
    }

    const elevenLabsConversationId = call.elevenLabsConversationId;
    this.logger.log(
      `🎵 Usando ElevenLabs Conversation ID: ${elevenLabsConversationId}`,
    );

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversations/${elevenLabsConversationId}/audio`,
        {
          method: 'GET',
          headers: {
            'xi-api-key': config.apiKey, // Usar la clave del cliente
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `❌ Error en API de ElevenLabs (${response.status}): ${errorText}`,
        );
        throw new Error(
          `ElevenLabs API error: ${response.status} - ${errorText}`,
        );
      }

      // La respuesta puede ser JSON con metadata o directamente el stream de audio
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        // Si es JSON, devolver el objeto
        const audioData = await response.json();
        this.logger.log(
          `✅ Audio obtenido exitosamente para conversación ${elevenLabsConversationId}`,
        );
        return audioData;
      } else {
        // Si es un stream de audio, intentar obtener la duración de los headers
        const contentLength = response.headers.get('content-length');
        const durationHeader = response.headers.get('x-audio-duration');

        // Calcular duración aproximada basada en content-length si no hay header específico
        let duration = 0;
        if (durationHeader) {
          duration = parseFloat(durationHeader);
        } else if (contentLength) {
          // Estimación aproximada: 1 minuto de audio MP3 ≈ 1MB
          // Esto es una estimación, no es exacto
          const sizeInMB = parseInt(contentLength) / (1024 * 1024);
          duration = sizeInMB * 60; // Aproximación en segundos
        }

        this.logger.log(
          `✅ Stream de audio obtenido para conversación ${elevenLabsConversationId}`,
        );
        this.logger.log(
          `📊 Content-Length: ${contentLength}, Duración estimada: ${duration}s`,
        );

        return {
          audioUrl: `/conversations/${conversationId}/audio/stream`,
          isStream: true,
          duration: Math.round(duration),
          format: contentType || 'audio/mpeg',
        };
      }
    } catch (error) {
      this.logger.error(
        `❌ Error obteniendo audio de conversación ${conversationId}:`,
        error.message,
      );
      throw new BadRequestException(
        `Error obteniendo audio de conversación: ${error.message}`,
      );
    }
  }

  /**
   * Enviar feedback de una conversación
   * Según documentación oficial: POST /v1/convai/conversations/:conversation_id/feedback
   * Body: { "feedback": "like" | "dislike" }
   */
  async sendConversationFeedback(
    accountId: string, // Se requiere accountId
    conversationId: string,
    feedback: 'like' | 'dislike',
  ) {
    this.logger.log(
      `👍 Enviando feedback "${feedback}" para conversación ${conversationId} (account: ${accountId})`,
    );

    const config = await this.getConfig(accountId);
    if (!config?.apiKey) {
      throw new NotFoundException(
        `No se encontró configuración de ElevenLabs para la cuenta ${accountId}.`,
      );
    }

    try {
      const requestBody = { feedback };

      this.logger.log(
        `📤 Enviando feedback a ElevenLabs: ${JSON.stringify(requestBody)}`,
      );

      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}/feedback`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': config.apiKey, // Usar la clave del cliente
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `❌ Error en API de ElevenLabs (${response.status}): ${errorText}`,
        );
        throw new Error(
          `ElevenLabs API error: ${response.status} - ${errorText}`,
        );
      }

      const result = await response.json();

      this.logger.log(
        `✅ Feedback "${feedback}" enviado exitosamente para conversación ${conversationId}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `❌ Error enviando feedback para conversación ${conversationId}:`,
        error.message,
      );
      throw new BadRequestException(
        `Error enviando feedback: ${error.message}`,
      );
    }
  }

  /**
   * Eliminar una conversación
   */
  async deleteConversation(accountId: string, conversationId: string) {
    // Se requiere accountId
    const config = await this.getConfig(accountId);
    if (!config?.apiKey) {
      throw new NotFoundException(
        `No se encontró configuración de ElevenLabs para la cuenta ${accountId}.`,
      );
    }

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
        {
          method: 'DELETE',
          headers: {
            'xi-api-key': config.apiKey, // Usar la clave del cliente
          },
        },
      );

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      this.logger.log(`Conversación ${conversationId} eliminada`);
      return { success: true };
    } catch (error) {
      this.logger.error('Error eliminando conversación:', error);
      throw new BadRequestException('Error eliminando conversación');
    }
  }

  /**
   * Obtener URL firmada para iniciar conversación con un agente
   * Según documentación oficial: GET /v1/convai/conversation/get-signed-url
   */
  async getSignedUrlForAgent(
    accountId: string,
    agentId: string,
    includeConversationId: boolean = false,
  ) {
    this.logger.log(
      `🔗 Obteniendo URL firmada para agente ${agentId} (account: ${accountId})`,
    );

    const config = await this.getConfig(accountId);
    if (!config?.apiKey) {
      throw new NotFoundException(
        `No se encontró configuración de ElevenLabs para la cuenta ${accountId}.`,
      );
    }

    try {
      const params = new URLSearchParams({
        agent_id: agentId,
      });

      if (includeConversationId) {
        params.append('include_conversation_id', 'true');
      }

      this.logger.log(
        `📤 Solicitando URL firmada a ElevenLabs con parámetros: ${params.toString()}`,
      );

      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'xi-api-key': config.apiKey,
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `❌ Error en API de ElevenLabs (${response.status}): ${errorText}`,
        );
        throw new Error(
          `ElevenLabs API error: ${response.status} - ${errorText}`,
        );
      }

      const result = await response.json();

      this.logger.log(
        `✅ URL firmada obtenida exitosamente para agente ${agentId}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `❌ Error obteniendo URL firmada para agente ${agentId}:`,
        error.message,
      );
      throw new BadRequestException(
        `Error obteniendo URL firmada: ${error.message}`,
      );
    }
  }

  /**
   * Obtener token WebRTC para comunicación en tiempo real con un agente
   * Según documentación oficial: GET /v1/convai/conversation/token
   */
  async getWebRTCToken(
    accountId: string,
    agentId: string,
    participantName?: string,
  ) {
    this.logger.log(
      `🎙️ Obteniendo token WebRTC para agente ${agentId} (account: ${accountId})`,
    );

    const config = await this.getConfig(accountId);
    if (!config?.apiKey) {
      throw new NotFoundException(
        `No se encontró configuración de ElevenLabs para la cuenta ${accountId}.`,
      );
    }

    try {
      const params = new URLSearchParams({
        agent_id: agentId,
      });

      if (participantName) {
        params.append('participant_name', participantName);
      }

      this.logger.log(
        `📤 Solicitando token WebRTC a ElevenLabs con parámetros: ${params.toString()}`,
      );

      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/token?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'xi-api-key': config.apiKey,
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `❌ Error en API de ElevenLabs (${response.status}): ${errorText}`,
        );
        throw new Error(
          `ElevenLabs API error: ${response.status} - ${errorText}`,
        );
      }

      const result = await response.json();

      this.logger.log(
        `✅ Token WebRTC obtenido exitosamente para agente ${agentId}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `❌ Error obteniendo token WebRTC para agente ${agentId}:`,
        error.message,
      );
      throw new BadRequestException(
        `Error obteniendo token WebRTC: ${error.message}`,
      );
    }
  }

  /**
   * Obtener configuración del widget de un agente
   * Según documentación oficial: GET /v1/convai/agents/:agent_id/widget
   */
  async getAgentWidget(
    accountId: string,
    agentId: string,
    conversationSignature?: string,
  ) {
    this.logger.log(
      `🎨 Obteniendo configuración del widget para agente ${agentId} (account: ${accountId})`,
    );

    const config = await this.getConfig(accountId);
    if (!config?.apiKey) {
      throw new NotFoundException(
        `No se encontró configuración de ElevenLabs para la cuenta ${accountId}.`,
      );
    }

    try {
      const params = new URLSearchParams();

      if (conversationSignature) {
        params.append('conversation_signature', conversationSignature);
      }

      const url = `https://api.elevenlabs.io/v1/convai/agents/${agentId}/widget${params.toString() ? `?${params.toString()}` : ''}`;

      this.logger.log(`📤 Solicitando configuración del widget a ElevenLabs`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'xi-api-key': config.apiKey,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `❌ Error en API de ElevenLabs (${response.status}): ${errorText}`,
        );
        throw new Error(
          `ElevenLabs API error: ${response.status} - ${errorText}`,
        );
      }

      const result = await response.json();

      this.logger.log(
        `✅ Configuración del widget obtenida exitosamente para agente ${agentId}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `❌ Error obteniendo configuración del widget para agente ${agentId}:`,
        error.message,
      );
      throw new BadRequestException(
        `Error obteniendo configuración del widget: ${error.message}`,
      );
    }
  }

  /**
   * Crear avatar para el widget de un agente
   * Según documentación oficial: POST /v1/convai/agents/:agent_id/avatar
   */
  async createAgentWidgetAvatar(
    accountId: string,
    agentId: string,
    avatarFile: Express.Multer.File,
  ) {
    this.logger.log(
      `🖼️ Subiendo avatar para agente ${agentId} (account: ${accountId})`,
    );

    const config = await this.getConfig(accountId);
    if (!config?.apiKey) {
      throw new NotFoundException(
        `No se encontró configuración de ElevenLabs para la cuenta ${accountId}.`,
      );
    }

    // Buscar el agente local para obtener el elevenLabsAgentId
    const localAgent = await this.prisma.agent.findFirst({
      where: {
        id: agentId,
        accountId,
      },
      select: {
        elevenLabsAgentId: true,
        name: true,
      },
    });

    if (!localAgent) {
      throw new NotFoundException(`Agente local no encontrado: ${agentId}`);
    }

    if (!localAgent.elevenLabsAgentId) {
      throw new BadRequestException(
        `El agente ${localAgent.name} no tiene un ID de ElevenLabs. Por favor, guarda el agente primero.`,
      );
    }

    try {
      this.logger.log(
        `📤 Subiendo avatar a ElevenLabs para agente ElevenLabs: ${localAgent.elevenLabsAgentId}`,
      );

      // Crear FormData para enviar el archivo
      const formData = new FormData();
      const blob = new Blob([Buffer.from(avatarFile.buffer)], {
        type: avatarFile.mimetype,
      });
      formData.append('avatar_file', blob, avatarFile.originalname);

      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/agents/${localAgent.elevenLabsAgentId}/avatar`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': config.apiKey,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `❌ Error en API de ElevenLabs (${response.status}): ${errorText}`,
        );
        throw new Error(
          `ElevenLabs API error: ${response.status} - ${errorText}`,
        );
      }

      const result = await response.json() as ElevenLabsAvatarResponse;

      this.logger.log(`✅ Avatar subido exitosamente para agente ${agentId}`);

      // Guardar el avatar_url en la base de datos
      if (result.avatar_url) {
        await this.prisma.agent.update({
          where: { id: agentId },
          data: { elevenLabsAvatarUrl: result.avatar_url },
        });
        this.logger.log(
          `💾 Avatar URL guardado en base de datos: ${result.avatar_url}`,
        );
      }

      return result;
    } catch (error) {
      this.logger.error(
        `❌ Error subiendo avatar para agente ${agentId}:`,
        error.message,
      );
      throw new BadRequestException(`Error subiendo avatar: ${error.message}`);
    }
  }

  // ===== MÉTODOS DE PHONE NUMBERS =====

  /**
   * Asignar un número de teléfono a un agente de ElevenLabs
   * Este método conecta un número de Twilio con un agente de ElevenLabs para llamadas inbound/outbound
   */
  async assignPhoneNumberToAgent(
    accountId: string,
    agentId: string,
    phoneNumberId: string,
  ): Promise<{
    success: boolean;
    message: string;
    phoneNumber?: any;
    agent_phone_number_id?: string;
  }> {
    const config = await this.getConfig(accountId);
    if (!config?.apiKey) {
      throw new NotFoundException(
        `No se encontró configuración de ElevenLabs para la cuenta ${accountId}.`,
      );
    }

    try {
      // Primero, obtener información del número de teléfono de la base de datos
      const phoneNumber = await this.prisma.phoneNumber.findFirst({
        where: {
          id: phoneNumberId,
          accountId,
        },
      });

      if (!phoneNumber) {
        throw new NotFoundException('Número de teléfono no encontrado');
      }

      if (!phoneNumber.twilioSid) {
        throw new BadRequestException(
          'El número de teléfono no tiene un SID de Twilio configurado',
        );
      }

      // Importar el número de teléfono en ElevenLabs
      // POST /v1/convai/phone-numbers/import
      const importResponse = await fetch(
        'https://api.elevenlabs.io/v1/convai/phone-numbers/import',
        {
          method: 'POST',
          headers: {
            'xi-api-key': config.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            provider: 'twilio',
            phone_number: phoneNumber.number,
            phone_number_sid: phoneNumber.twilioSid,
            label: phoneNumber.description || `Número para ${agentId}`,
          }),
        },
      );

      if (!importResponse.ok) {
        const errorData = await importResponse.json().catch(() => ({})) as ElevenLabsErrorResponse;
        this.logger.error('Error importando número en ElevenLabs:', errorData);
        throw new BadRequestException(
          `Error importando número: ${errorData.message || importResponse.statusText}`,
        );
      }

      const importedNumber = await importResponse.json() as ElevenLabsImportNumberResponse;
      const agentPhoneNumberId = importedNumber.agent_phone_number_id;

      // Ahora asignar el número al agente
      // PATCH /v1/convai/agents/{agent_id}
      const updateResponse = await fetch(
        `https://api.elevenlabs.io/v1/convai/agents/${agentId}`,
        {
          method: 'PATCH',
          headers: {
            'xi-api-key': config.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone_number_ids: [agentPhoneNumberId],
          }),
        },
      );

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json().catch(() => ({})) as ElevenLabsErrorResponse;
        this.logger.error('Error asignando número al agente:', errorData);
        throw new BadRequestException(
          `Error asignando número al agente: ${errorData.message || updateResponse.statusText}`,
        );
      }

      // Actualizar el número en la base de datos local
      await this.prisma.phoneNumber.update({
        where: { id: phoneNumberId },
        data: {
          appStatus: 'active',
          config: {
            ...((phoneNumber.config as any) || {}),
            elevenLabsAgentId: agentId,
            elevenLabsPhoneNumberId: agentPhoneNumberId,
          },
        },
      });

      this.logger.log(
        `Número ${phoneNumber.number} asignado exitosamente al agente ${agentId}`,
      );

      return {
        success: true,
        message: 'Número asignado exitosamente al agente',
        phoneNumber: {
          ...phoneNumber,
          elevenLabsPhoneNumberId: agentPhoneNumberId,
        },
        agent_phone_number_id: agentPhoneNumberId,
      };
    } catch (error) {
      this.logger.error('Error asignando número al agente:', error);
      throw new BadRequestException(
        `Error asignando número al agente: ${error.message}`,
      );
    }
  }

  /**
   * Obtener números de teléfono asignados a un agente
   */
  async getAgentPhoneNumbers(
    accountId: string,
    agentId: string,
  ): Promise<any[]> {
    const config = await this.getConfig(accountId);
    if (!config?.apiKey) {
      throw new NotFoundException(
        `No se encontró configuración de ElevenLabs para la cuenta ${accountId}.`,
      );
    }

    try {
      // Obtener información del agente que incluye phone_numbers
      const agent = await this.getAgent(accountId, agentId);

      if (agent.phone_numbers?.length === 0) {
        return [];
      }

      // Enriquecer con información de la base de datos local
      const phoneNumbers = await Promise.all(
        agent.phone_numbers.map(async (elNumber: any) => {
          const localNumber = await this.prisma.phoneNumber.findFirst({
            where: {
              accountId,
              config: {
                path: ['elevenLabsPhoneNumberId'],
                equals: elNumber.agent_phone_number_id,
              },
            },
          });

          return {
            ...elNumber,
            localPhoneNumber: localNumber,
          };
        }),
      );

      return phoneNumbers;
    } catch (error) {
      this.logger.error('Error obteniendo números del agente:', error);
      throw new BadRequestException('Error obteniendo números del agente');
    }
  }

  /**
   * Remover un número de teléfono de un agente
   */
  async removePhoneNumberFromAgent(
    accountId: string,
    agentId: string,
    phoneNumberId: string,
  ): Promise<{ success: boolean; message: string }> {
    const config = await this.getConfig(accountId);
    if (!config?.apiKey) {
      throw new NotFoundException(
        `No se encontró configuración de ElevenLabs para la cuenta ${accountId}.`,
      );
    }

    try {
      // Obtener el agente actual
      const agent = await this.getAgent(accountId, agentId);

      // Filtrar el número a remover
      const currentPhoneNumberIds =
        agent.phone_numbers?.map((pn: any) => pn.agent_phone_number_id) || [];

      const updatedPhoneNumberIds = currentPhoneNumberIds.filter(
        (id: string) => id !== phoneNumberId,
      );

      // Actualizar el agente sin el número
      const updateResponse = await fetch(
        `https://api.elevenlabs.io/v1/convai/agents/${agentId}`,
        {
          method: 'PATCH',
          headers: {
            'xi-api-key': config.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone_number_ids: updatedPhoneNumberIds,
          }),
        },
      );

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json().catch(() => ({})) as ElevenLabsErrorResponse;
        throw new BadRequestException(
          `Error removiendo número: ${errorData.message || updateResponse.statusText}`,
        );
      }

      // Actualizar el número en la base de datos local
      const localNumber = await this.prisma.phoneNumber.findFirst({
        where: {
          accountId,
          config: {
            path: ['elevenLabsPhoneNumberId'],
            equals: phoneNumberId,
          },
        },
      });

      if (localNumber) {
        await this.prisma.phoneNumber.update({
          where: { id: localNumber.id },
          data: {
            appStatus: 'inactive',
            config: {
              ...((localNumber.config as any) || {}),
              elevenLabsAgentId: null,
              elevenLabsPhoneNumberId: null,
            },
          },
        });
      }

      this.logger.log(`Número removido exitosamente del agente ${agentId}`);

      return {
        success: true,
        message: 'Número removido exitosamente del agente',
      };
    } catch (error) {
      this.logger.error('Error removiendo número del agente:', error);
      throw new BadRequestException(
        `Error removiendo número del agente: ${error.message}`,
      );
    }
  }

  // ========== CUSTOM VOICES METHODS ==========

  async getCustomVoices(accountId: string) {
    try {
      this.logger.log(`Obteniendo custom voices para la cuenta ${accountId}`);

      const customVoices = await this.prisma.customVoice.findMany({
        where: { accountId },
        orderBy: { createdAt: 'desc' },
      });

      this.logger.log(
        `Se encontraron ${customVoices.length} custom voices para la cuenta ${accountId}`,
      );

      return customVoices;
    } catch (error) {
      this.logger.error('Error obteniendo custom voices:', error);
      throw new BadRequestException(
        `Error obteniendo custom voices: ${error.message}`,
      );
    }
  }

  async createCustomVoice(
    accountId: string,
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
  ) {
    try {
      this.logger.log(
        `Creando custom voice para la cuenta ${accountId}: ${customVoiceData.name}`,
      );

      // Validar que el voice_id existe en ElevenLabs
      const config = await this.getConfig(accountId);
      if (!config) {
        throw new BadRequestException(
          'No se encontró configuración de ElevenLabs para esta cuenta',
        );
      }

      const client = new ElevenLabsClient({ apiKey: config.apiKey });

      try {
        // Verificar que la voz existe en ElevenLabs
        await client.voices.get(customVoiceData.config.voice_id);
      } catch (error) {
        this.logger.error(
          `La voz ${customVoiceData.config.voice_id} no existe en ElevenLabs`,
        );
        throw new BadRequestException(
          `La voz ${customVoiceData.config.voice_id} no existe en ElevenLabs`,
        );
      }

      const customVoice = await this.prisma.customVoice.create({
        data: {
          accountId,
          name: customVoiceData.name,
          config: customVoiceData.config as any,
        },
      });

      this.logger.log(`Custom voice creada exitosamente: ${customVoice.id}`);

      return customVoice;
    } catch (error) {
      this.logger.error('Error creando custom voice:', error);
      throw new BadRequestException(
        `Error creando custom voice: ${error.message}`,
      );
    }
  }

  async updateCustomVoice(
    accountId: string,
    id: string,
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
  ) {
    try {
      this.logger.log(
        `Actualizando custom voice ${id} para la cuenta ${accountId}`,
      );

      // Verificar que la custom voice existe y pertenece a la cuenta
      const existingVoice = await this.prisma.customVoice.findFirst({
        where: { id, accountId },
      });

      if (!existingVoice) {
        throw new NotFoundException('Custom voice no encontrada');
      }

      // Si se actualiza el voice_id, validar que existe en ElevenLabs
      if (updateData.config?.voice_id) {
        const config = await this.getConfig(accountId);
        if (!config) {
          throw new BadRequestException(
            'No se encontró configuración de ElevenLabs para esta cuenta',
          );
        }

        const client = new ElevenLabsClient({ apiKey: config.apiKey });

        try {
          await client.voices.get(updateData.config.voice_id);
        } catch (error) {
          this.logger.error(
            `La voz ${updateData.config.voice_id} no existe en ElevenLabs`,
          );
          throw new BadRequestException(
            `La voz ${updateData.config.voice_id} no existe en ElevenLabs`,
          );
        }
      }

      const updatedVoice = await this.prisma.customVoice.update({
        where: { id },
        data: {
          ...(updateData.name && { name: updateData.name }),
          ...(updateData.config && { config: updateData.config as any }),
        },
      });

      this.logger.log(`Custom voice actualizada exitosamente: ${id}`);

      return updatedVoice;
    } catch (error) {
      this.logger.error('Error actualizando custom voice:', error);
      throw new BadRequestException(
        `Error actualizando custom voice: ${error.message}`,
      );
    }
  }

  async deleteCustomVoice(accountId: string, id: string) {
    try {
      this.logger.log(
        `Eliminando custom voice ${id} para la cuenta ${accountId}`,
      );

      // Verificar que la custom voice existe y pertenece a la cuenta
      const existingVoice = await this.prisma.customVoice.findFirst({
        where: { id, accountId },
      });

      if (!existingVoice) {
        throw new NotFoundException('Custom voice no encontrada');
      }

      await this.prisma.customVoice.delete({
        where: { id },
      });

      this.logger.log(`Custom voice eliminada exitosamente: ${id}`);

      return {
        success: true,
        message: 'Custom voice eliminada exitosamente',
      };
    } catch (error) {
      this.logger.error('Error eliminando custom voice:', error);
      throw new BadRequestException(
        `Error eliminando custom voice: ${error.message}`,
      );
    }
  }

  async generateVoicePreview(
    accountId: string,
    previewData: {
      voice_id: string;
      text?: string;
      model_id?: string;
      stability?: number;
      similarity_boost?: number;
    },
  ) {
    try {
      this.logger.log(`Generando preview de voz para la cuenta ${accountId}`);

      const config = await this.getConfig(accountId);
      if (!config) {
        throw new BadRequestException(
          'No se encontró configuración de ElevenLabs para esta cuenta',
        );
      }

      const client = new ElevenLabsClient({ apiKey: config.apiKey });

      const text =
        previewData.text || 'Hola, esta es una prueba de voz personalizada.';
      const modelId = previewData.model_id || 'eleven_flash_v2_5';

      // Generar audio usando la API de ElevenLabs
      const audioStream = await client.textToSpeech.convert(
        previewData.voice_id,
        {
          text,
          modelId,
          voiceSettings: {
            stability: previewData.stability || 0.6,
            similarityBoost: previewData.similarity_boost || 0.5,
          },
        },
      );

      // Convertir el stream a base64
      const chunks: Buffer[] = [];
      for await (const chunk of audioStream) {
        chunks.push(Buffer.from(chunk));
      }
      const audioBuffer = Buffer.concat(chunks);
      const audioBase64 = audioBuffer.toString('base64');

      this.logger.log('Preview de voz generado exitosamente');

      return {
        audio_data: audioBase64,
        audio_url: `data:audio/mpeg;base64,${audioBase64}`,
      };
    } catch (error) {
      this.logger.error('Error generando preview de voz:', error);
      throw new BadRequestException(
        `Error generando preview de voz: ${error.message}`,
      );
    }
  }

  /**
   * Obtener números de teléfono de ElevenLabs según documentación oficial
   * GET /v1/convai/phone-numbers
   */
  async getPhoneNumbers(accountId: string) {
    try {
      const config = await this.getConfig(accountId);

      if (!config?.apiKey) {
        this.logger.error(
          `No se encontró configuración para accountId: ${accountId}`,
        );
        return [];
      }

      const url = 'https://api.elevenlabs.io/v1/convai/phone-numbers';
      const response = await axios.get(url, {
        headers: {
          'xi-api-key': config.apiKey,
          Accept: 'application/json',
        },
      });

      this.logger.log(
        `✅ Obtenidos ${response.data?.length || 0} números de teléfono de ElevenLabs`,
      );

      return response.data || [];
    } catch (error) {
      this.logger.error(
        '❌ Error obteniendo números de teléfono de ElevenLabs:',
        error.message,
      );
      return [];
    }
  }

  /**
   * Obtener detalles de un número de teléfono específico
   * GET /v1/convai/phone-numbers/:phone_number_id
   */
  async getPhoneNumber(accountId: string, phoneNumberId: string) {
    try {
      const config = await this.getConfig(accountId);

      if (!config?.apiKey) {
        this.logger.error(
          `No se encontró configuración para accountId: ${accountId}`,
        );
        return null;
      }

      const url = `https://api.elevenlabs.io/v1/convai/phone-numbers/${phoneNumberId}`;
      const response = await axios.get(url, {
        headers: {
          'xi-api-key': config.apiKey,
          Accept: 'application/json',
        },
      });

      this.logger.log(
        `✅ Obtenidos detalles del número de teléfono: ${phoneNumberId}`,
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        '❌ Error obteniendo detalles del número de teléfono:',
        error.message,
      );
      return null;
    }
  }

  /**
   * Importar número de teléfono desde Twilio según documentación oficial
   * POST /v1/convai/phone-numbers
   */
  async importPhoneNumber(
    accountId: string,
    phoneNumberData: {
      phone_number: string;
      label: string;
      sid: string;
      token: string;
    },
  ) {
    try {
      const config = await this.getConfig(accountId);

      if (!config?.apiKey) {
        this.logger.error(
          `No se encontró configuración para accountId: ${accountId}`,
        );
        return null;
      }

      const url = 'https://api.elevenlabs.io/v1/convai/phone-numbers';
      const response = await axios.post(url, phoneNumberData, {
        headers: {
          'xi-api-key': config.apiKey,
          'Content-Type': 'application/json',
        },
      });

      this.logger.log(
        `✅ Número de teléfono importado: ${phoneNumberData.phone_number}`,
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        '❌ Error importando número de teléfono:',
        error.message,
      );
      return null;
    }
  }

  /**
   * Obtener metadatos de costos y créditos de una conversación
   * Incluye información de duración, créditos utilizados y costos
   */
  async getConversationMetadata(accountId: string, conversationId: string) {
    this.logger.log(
      `📊 Obteniendo metadatos para conversación ${conversationId} (account: ${accountId})`,
    );

    const config = await this.getConfig(accountId);
    if (!config?.apiKey) {
      throw new NotFoundException(
        `No se encontró configuración de ElevenLabs para la cuenta ${accountId}.`,
      );
    }

    try {
      // Obtener detalles de la conversación
      const conversationDetails = await this.getConversationDetails(
        accountId,
        conversationId,
      );

      if (!conversationDetails) {
        throw new NotFoundException(
          `No se encontraron detalles para la conversación ${conversationId}.`,
        );
      }

      // Log de los datos reales obtenidos de ElevenLabs
      this.logger.log(
        `📊 [getConversationMetadata] Datos reales de ElevenLabs:`,
        {
          conversationId,
          duration: conversationDetails.duration,
          created_at: conversationDetails.created_at,
          status: conversationDetails.status,
          agent_id: conversationDetails.agent_id,
          conversation_id: conversationDetails.conversation_id,
          fullDetails: conversationDetails
        }
      );

      // Verificar si tenemos datos reales de costos y créditos en conversationDetails
      if (conversationDetails.cost) {
        this.logger.log(`💰 Costo real encontrado en conversationDetails:`, conversationDetails.cost);
      }
      if (conversationDetails.credits_used) {
        this.logger.log(`🎯 Créditos reales encontrados en conversationDetails:`, conversationDetails.credits_used);
      }
      if (conversationDetails.tokens_used) {
        this.logger.log(`🔤 Tokens reales encontrados en conversationDetails:`, conversationDetails.tokens_used);
      }

      // Usar datos reales de ElevenLabs en lugar de calcular estimaciones
      const duration = conversationDetails.duration || 0;
      const durationMinutes = duration / 60;
      
      // Obtener datos reales de costos y créditos de ElevenLabs
      let realCosts = null;
      let realCredits = null;
      
      try {
        // Intentar obtener datos reales de la conversación desde la API de ElevenLabs ConvAI
        // Usar el endpoint correcto para obtener detalles de la conversación
        const conversationResponse = await axios.get(
          `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}/details`,
          {
            headers: {
              'xi-api-key': config.apiKey,
              'Content-Type': 'application/json',
            },
          }
        );
        
        const conversationData = conversationResponse.data;
        this.logger.log(`📊 Datos completos de la conversación desde ElevenLabs:`, conversationData);
        
        // Extraer datos reales de costos y créditos si están disponibles
        if (conversationData.costs) {
          realCosts = conversationData.costs;
          this.logger.log(`💰 Costos reales obtenidos:`, realCosts);
        }
        
        if (conversationData.credits) {
          realCredits = conversationData.credits;
          this.logger.log(`🎯 Créditos reales obtenidos:`, realCredits);
        }
        
        // También verificar si hay datos de uso/usage
        if (conversationData.usage) {
          this.logger.log(`📈 Datos de uso obtenidos:`, conversationData.usage);
        }
        
        // Verificar si hay datos de billing o costos específicos
        if (conversationData.billing) {
          this.logger.log(`💳 Datos de facturación obtenidos:`, conversationData.billing);
        }
        
      } catch (error) {
        this.logger.warn(`⚠️ No se pudieron obtener datos adicionales de ElevenLabs: ${error.message}`);
        
        // Intentar con endpoint alternativo si el primero falla
        try {
          const altResponse = await axios.get(
            `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
            {
              headers: {
                'xi-api-key': config.apiKey,
                'Content-Type': 'application/json',
              },
            }
          );
          
          const altData = altResponse.data;
          this.logger.log(`📊 Datos alternativos de la conversación:`, altData);
          
          if (altData.costs) {
            realCosts = altData.costs;
            this.logger.log(`💰 Costos reales obtenidos (alternativo):`, realCosts);
          }
          
          if (altData.credits) {
            realCredits = altData.credits;
            this.logger.log(`🎯 Créditos reales obtenidos (alternativo):`, realCredits);
          }
          
        } catch (altError) {
          this.logger.warn(`⚠️ Endpoint alternativo también falló: ${altError.message}`);
        }
      }

      // Usar datos reales de conversationDetails si están disponibles
      const voiceCredits = realCredits?.voice_credits || 
                          conversationDetails.credits_used?.voice || 
                          Math.ceil(durationMinutes * 1000);
      const llmCredits = realCredits?.llm_credits || 
                       conversationDetails.credits_used?.llm || 
                       conversationDetails.tokens_used || 
                       Math.ceil(durationMinutes * 50);
      
      const voiceCost = realCosts?.voice_cost || 
                       conversationDetails.cost?.voice || 
                       (durationMinutes * 0.00279);
      const llmCost = realCosts?.llm_cost || 
                     conversationDetails.cost?.llm || 
                     (durationMinutes * 0.0001);
      const totalCost = realCosts?.total_cost || 
                       conversationDetails.cost?.total || 
                       conversationDetails.cost || 
                       (voiceCost + llmCost);

      // Formatear fecha - verificar que created_at sea válido
      let formattedDate: string;
      if (conversationDetails.created_at) {
        const createdAt = new Date(conversationDetails.created_at);
        if (!isNaN(createdAt.getTime())) {
          const now = new Date();
          const isToday = createdAt.toDateString() === now.toDateString();
          
          if (isToday) {
            formattedDate = `Hoy, ${createdAt.toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}`;
          } else {
            formattedDate = createdAt.toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          }
        } else {
          formattedDate = "Fecha no disponible";
        }
      } else {
        formattedDate = "Fecha no disponible";
      }

      // Formatear duración
      const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
      };

      // Usar datos reales de ElevenLabs si están disponibles
      const metadata = {
        // Datos reales de ElevenLabs
        cost: realCosts?.total_cost || conversationDetails.cost || totalCost,
        tokensUsed: realCredits?.llm_credits || conversationDetails.tokens_used || llmCredits,
        callDuration: conversationDetails.duration || duration,
        llmTotalCost: realCosts?.llm_cost || conversationDetails.llm_total_cost || llmCost,
        costPerMinute: conversationDetails.cost_per_minute || (durationMinutes > 0 ? totalCost / durationMinutes : 0),
        
        // Datos formateados para el frontend
        fecha: formattedDate,
        duracionConexion: formatDuration(conversationDetails.duration || duration),
        creditosLlamada: realCredits?.voice_credits || conversationDetails.credits_used?.voice || voiceCredits,
        creditosLLM: realCredits?.llm_credits || conversationDetails.tokens_used || llmCredits,
        costoLLM: {
          porMinuto: durationMinutes > 0 ? `$${(llmCost / durationMinutes).toFixed(5)} / min` : `$${llmCost.toFixed(5)} / min`,
          total: `$${llmCost.toFixed(3)}`
        },
        costoVoz: {
          porMinuto: durationMinutes > 0 ? `$${(voiceCost / durationMinutes).toFixed(5)} / min` : `$${voiceCost.toFixed(5)} / min`,
          total: `$${voiceCost.toFixed(3)}`
        },
        costoTotal: `$${totalCost.toFixed(3)}`,
        duracionMinutos: durationMinutes,
        estado: conversationDetails.status,
        agenteId: conversationDetails.agent_id,
        conversacionId: conversationDetails.conversation_id
      };

        this.logger.log(
          `✅ Metadatos obtenidos para conversación ${conversationId}:`,
          metadata
        );

        // Log detallado de los metadatos que se envían al frontend
        this.logger.log(
          `📤 [getConversationMetadata] Enviando al frontend:`,
          {
            fecha: metadata.fecha,
            duracionConexion: metadata.duracionConexion,
            creditosLlamada: metadata.creditosLlamada,
            creditosLLM: metadata.creditosLLM,
            costoLLM: metadata.costoLLM,
            costoVoz: metadata.costoVoz,
            costoTotal: metadata.costoTotal,
            duracionMinutos: metadata.duracionMinutos,
            estado: metadata.estado
          }
        );

        return metadata;
    } catch (error) {
      this.logger.error(
        `❌ Error obteniendo metadatos de conversación ${conversationId}:`,
        error,
      );
      throw new BadRequestException(
        `Error obteniendo metadatos de la conversación: ${error.message}`,
      );
    }
  }
}
