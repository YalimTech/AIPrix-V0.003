import { Injectable, Logger } from '@nestjs/common';
import { ElevenLabsService } from '../integrations/elevenlabs/elevenlabs.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BidirectionalSyncService {
  private readonly logger = new Logger(BidirectionalSyncService.name);

  constructor(
    private prisma: PrismaService,
    private elevenLabsService: ElevenLabsService,
  ) {}

  /**
   * Sincroniza un agente local con ElevenLabs
   * @param localAgentId ID del agente local
   * @param elevenLabsAgentId ID del agente en ElevenLabs
   * @param accountId ID de la cuenta
   */
  async syncLocalAgentWithElevenLabs(
    localAgentId: string,
    elevenLabsAgentId: string,
    accountId: string,
  ) {
    try {
      this.logger.log(`🔄 Sincronizando agente local ${localAgentId} con ElevenLabs ${elevenLabsAgentId}`);

      // Obtener agente de ElevenLabs
      const elevenLabsAgent = await this.elevenLabsService.getAgent(accountId, elevenLabsAgentId);

      // Actualizar agente local con datos de ElevenLabs
      const updatedLocalAgent = await this.prisma.agent.update({
        where: { id: localAgentId },
        data: {
          elevenLabsAgentId: elevenLabsAgentId,
          name: elevenLabsAgent.name,
          systemPrompt: elevenLabsAgent.conversation_config?.agent?.prompt?.prompt || '',
          description: elevenLabsAgent.conversation_config?.agent?.first_message || '',
          temperature: elevenLabsAgent.conversation_config?.agent?.prompt?.temperature || 0.7,
          maxTokens: elevenLabsAgent.conversation_config?.agent?.prompt?.max_tokens || 1000,
          voiceName: elevenLabsAgent.conversation_config?.tts?.voice_id,
        },
      });

      this.logger.log(`✅ Agente local sincronizado con ElevenLabs: ${updatedLocalAgent.name}`);
      return updatedLocalAgent;

    } catch (error) {
      this.logger.error(`❌ Error sincronizando agente local: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sincroniza un agente de ElevenLabs con la base de datos local
   * @param elevenLabsAgentId ID del agente en ElevenLabs
   * @param accountId ID de la cuenta
   */
  async syncElevenLabsAgentWithLocal(
    elevenLabsAgentId: string,
    accountId: string,
  ) {
    try {
      this.logger.log(`🔄 Sincronizando agente de ElevenLabs ${elevenLabsAgentId} con local`);

      // Obtener agente de ElevenLabs
      const elevenLabsAgent = await this.elevenLabsService.getAgent(accountId, elevenLabsAgentId);

      // Verificar si ya existe en local
      const existingLocalAgent = await this.prisma.agent.findFirst({
        where: { elevenLabsAgentId: elevenLabsAgentId },
      });

      if (existingLocalAgent) {
        // Actualizar agente existente
        const updatedLocalAgent = await this.prisma.agent.update({
          where: { id: existingLocalAgent.id },
          data: {
            name: elevenLabsAgent.name,
            systemPrompt: elevenLabsAgent.conversation_config?.agent?.prompt?.prompt || '',
            description: elevenLabsAgent.conversation_config?.agent?.first_message || '',
            temperature: elevenLabsAgent.conversation_config?.agent?.prompt?.temperature || 0.7,
            maxTokens: elevenLabsAgent.conversation_config?.agent?.prompt?.max_tokens || 1000,
            voiceName: elevenLabsAgent.conversation_config?.tts?.voice_id,
          },
        });

        this.logger.log(`✅ Agente local existente actualizado: ${updatedLocalAgent.name}`);
        return updatedLocalAgent;

      } else {
        // Crear nuevo agente local
        const newLocalAgent = await this.prisma.agent.create({
          data: {
            name: elevenLabsAgent.name,
            description: elevenLabsAgent.conversation_config?.agent?.first_message || '',
            type: 'inbound',
            status: 'active',
            language: elevenLabsAgent.conversation_config?.agent?.language || 'es',
            llmProvider: 'openai',
            llmModel: elevenLabsAgent.conversation_config?.agent?.prompt?.llm || 'gpt-4-turbo',
            maxTokens: elevenLabsAgent.conversation_config?.agent?.prompt?.max_tokens || 1000,
            voiceName: elevenLabsAgent.conversation_config?.tts?.voice_id,
            temperature: elevenLabsAgent.conversation_config?.agent?.prompt?.temperature || 0.7,
            systemPrompt: elevenLabsAgent.conversation_config?.agent?.prompt?.prompt || '',
            preMadePrompt: elevenLabsAgent.conversation_config?.agent?.prompt?.prompt || '',
            elevenLabsAgentId: elevenLabsAgentId,
            accountId: accountId,
            initialMessageDelay: 2000,
            vmDetection: false,
            doubleCall: false,
            interruptSensitivity: false,
            responseSpeed: true,
          },
        });

        this.logger.log(`✅ Nuevo agente local creado desde ElevenLabs: ${newLocalAgent.name}`);
        return newLocalAgent;
      }

    } catch (error) {
      this.logger.error(`❌ Error sincronizando agente de ElevenLabs: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sincroniza todos los agentes de ElevenLabs con la base de datos local
   * @param accountId ID de la cuenta
   */
  async syncAllElevenLabsAgents(accountId: string) {
    try {
      this.logger.log(`🔄 Sincronizando todos los agentes de ElevenLabs para cuenta ${accountId}`);

      // Obtener todos los agentes de ElevenLabs
      const elevenLabsAgents = await this.elevenLabsService.getAgents(accountId);
      const agents = elevenLabsAgents.agents || [];

      const results = {
        created: 0,
        updated: 0,
        errors: 0,
        errorsList: [] as string[],
      };

      // Sincronizar cada agente
      for (const elevenLabsAgent of agents) {
        try {
          await this.syncElevenLabsAgentWithLocal(elevenLabsAgent.agent_id, accountId);
          
          // Verificar si fue creado o actualizado
          const localAgent = await this.prisma.agent.findFirst({
            where: { elevenLabsAgentId: elevenLabsAgent.agent_id },
          });

          if (localAgent) {
            // Verificar si es nuevo o actualizado
            const isNew = localAgent.createdAt.getTime() === localAgent.updatedAt.getTime();
            if (isNew) {
              results.created++;
            } else {
              results.updated++;
            }
          }

        } catch (error) {
          results.errors++;
          results.errorsList.push(`${elevenLabsAgent.name}: ${error.message}`);
          this.logger.error(`❌ Error sincronizando ${elevenLabsAgent.name}: ${error.message}`);
        }
      }

      this.logger.log(`✅ Sincronización completada: ${results.created} creados, ${results.updated} actualizados, ${results.errors} errores`);
      return results;

    } catch (error) {
      this.logger.error(`❌ Error sincronizando agentes de ElevenLabs: ${error.message}`);
      throw error;
    }
  }

  /**
   * Elimina un agente tanto local como en ElevenLabs
   * @param localAgentId ID del agente local
   * @param accountId ID de la cuenta
   */
  async deleteAgentBidirectional(localAgentId: string, accountId: string) {
    try {
      this.logger.log(`🔄 Eliminando agente bidireccional ${localAgentId}`);

      // Obtener agente local
      const localAgent = await this.prisma.agent.findUnique({
        where: { id: localAgentId },
      });

      if (!localAgent) {
        throw new Error('Agente local no encontrado');
      }

      const results = {
        localDeleted: false,
        elevenLabsDeleted: false,
        elevenLabsError: null as string | null,
      };

      // Eliminar de ElevenLabs si tiene ID
      if (localAgent.elevenLabsAgentId) {
        try {
          await this.elevenLabsService.deleteAgent(accountId, localAgent.elevenLabsAgentId);
          results.elevenLabsDeleted = true;
          this.logger.log(`✅ Agente eliminado de ElevenLabs: ${localAgent.elevenLabsAgentId}`);
        } catch (error) {
          results.elevenLabsError = error.message;
          this.logger.error(`❌ Error eliminando de ElevenLabs: ${error.message}`);
        }
      }

      // Eliminar de base de datos local
      await this.prisma.agent.delete({
        where: { id: localAgentId },
      });
      results.localDeleted = true;

      this.logger.log(`✅ Agente eliminado localmente: ${localAgent.name}`);
      return results;

    } catch (error) {
      this.logger.error(`❌ Error eliminando agente bidireccional: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtiene el estado de sincronización entre agentes locales y ElevenLabs
   * @param accountId ID de la cuenta
   */
  async getSyncStatus(accountId: string) {
    try {
      this.logger.log(`🔍 Obteniendo estado de sincronización para cuenta ${accountId}`);

      // Obtener agentes locales
      const localAgents = await this.prisma.agent.findMany({
        where: { accountId },
        select: {
          id: true,
          name: true,
          elevenLabsAgentId: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Obtener agentes de ElevenLabs
      const elevenLabsAgents = await this.elevenLabsService.getAgents(accountId);
      const agents = elevenLabsAgents.agents || [];

      // Calcular estadísticas
      const syncedAgents = localAgents.filter(agent => agent.elevenLabsAgentId);
      const localOnlyAgents = localAgents.filter(agent => !agent.elevenLabsAgentId);
      const elevenLabsOnlyAgents = agents.filter(elAgent =>
        !localAgents.some(local => local.elevenLabsAgentId === elAgent.agent_id)
      );

      const status = {
        local: {
          total: localAgents.length,
          synced: syncedAgents.length,
          localOnly: localOnlyAgents.length,
        },
        elevenLabs: {
          total: agents.length,
          synced: syncedAgents.length,
          elevenLabsOnly: elevenLabsOnlyAgents.length,
        },
        sync: {
          isFullySynced: localOnlyAgents.length === 0 && elevenLabsOnlyAgents.length === 0,
          needsSync: localOnlyAgents.length > 0 || elevenLabsOnlyAgents.length > 0,
        },
        agents: {
          local: localAgents,
          elevenLabs: agents,
          synced: syncedAgents,
          localOnly: localOnlyAgents,
          elevenLabsOnly: elevenLabsOnlyAgents,
        },
      };

      this.logger.log(`📊 Estado de sincronización: ${status.local.total} locales, ${status.elevenLabs.total} ElevenLabs, ${status.sync.isFullySynced ? 'Sincronizado' : 'Necesita sincronización'}`);
      return status;

    } catch (error) {
      this.logger.error(`❌ Error obteniendo estado de sincronización: ${error.message}`);
      throw error;
    }
  }
}
