import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateFolderDto {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateFolderDto {
  name?: string;
  description?: string;
  color?: string;
}

@Injectable()
export class FoldersService {
  private readonly logger = new Logger(FoldersService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear una nueva carpeta
   */
  async create(createFolderDto: CreateFolderDto, accountId: string) {
    try {
      this.logger.log(
        `🔍 [FoldersService.create] Iniciando creación de carpeta "${createFolderDto.name}" para cuenta ${accountId}`,
      );

      this.logger.log(
        `🔍 [FoldersService.create] Datos recibidos:`,
        JSON.stringify(createFolderDto, null, 2)
      );

      // Verificar que no existe una carpeta con el mismo nombre en la misma cuenta
      this.logger.log(
        `🔍 [FoldersService.create] Verificando carpeta existente...`
      );

      const existingFolder = await this.prisma.folder.findUnique({
        where: {
          unique_folder_name_per_account: {
            accountId,
            name: createFolderDto.name,
          },
        },
      });

      this.logger.log(
        `🔍 [FoldersService.create] Consulta findUnique completada. Resultado: ${existingFolder ? 'Encontrada' : 'No encontrada'}`
      );

      if (existingFolder) {
        this.logger.warn(
          `⚠️ [FoldersService.create] Carpeta "${createFolderDto.name}" ya existe`
        );
        throw new BadRequestException(
          `Ya existe una carpeta con el nombre "${createFolderDto.name}"`,
        );
      }

      this.logger.log(
        `🔍 [FoldersService.create] Creando nueva carpeta en base de datos...`
      );

      const folder = await this.prisma.folder.create({
        data: {
          ...createFolderDto,
          accountId,
        },
        include: {
          agents: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          _count: {
            select: {
              agents: true,
            },
          },
        },
      });

      this.logger.log(
        `✅ [FoldersService.create] Carpeta "${folder.name}" creada exitosamente con ID ${folder.id}`,
      );

      return folder;
    } catch (error) {
      this.logger.error(
        `❌ [FoldersService.create] Error creando carpeta "${createFolderDto.name}":`,
        error.message,
        error.stack
      );
      
      // Re-lanzar el error para que el controlador lo maneje
      throw error;
    }
  }

  /**
   * Obtener todas las carpetas de una cuenta
   */
  async findAll(accountId: string) {
    try {
      this.logger.log(`Obteniendo carpetas para cuenta ${accountId}`);

      const folders = await this.prisma.folder.findMany({
        where: {
          accountId,
        },
        include: {
          agents: {
            select: {
              id: true,
              name: true,
              status: true,
              type: true,
              voiceName: true,
              language: true,
            },
          },
          _count: {
            select: {
              agents: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      this.logger.log(`✅ Encontradas ${folders.length} carpetas`);

      return folders;
    } catch (error) {
      this.logger.error(`Error obteniendo carpetas:`, error);
      throw error;
    }
  }

  /**
   * Obtener una carpeta por ID
   */
  async findOne(id: string, accountId: string) {
    try {
      this.logger.log(`Obteniendo carpeta ${id} para cuenta ${accountId}`);

      const folder = await this.prisma.folder.findFirst({
        where: {
          id,
          accountId,
        },
        include: {
          agents: {
            select: {
              id: true,
              name: true,
              description: true,
              status: true,
              type: true,
              voiceName: true,
              language: true,
              temperature: true,
              createdAt: true,
              elevenLabsAgentId: true,
            },
          },
          _count: {
            select: {
              agents: true,
            },
          },
        },
      });

      if (!folder) {
        throw new NotFoundException(`Carpeta con ID ${id} no encontrada`);
      }

      this.logger.log(`✅ Carpeta "${folder.name}" encontrada`);

      return folder;
    } catch (error) {
      this.logger.error(`Error obteniendo carpeta ${id}:`, error);
      throw error;
    }
  }

  /**
   * Actualizar una carpeta
   */
  async update(id: string, updateFolderDto: UpdateFolderDto, accountId: string) {
    try {
      this.logger.log(`Actualizando carpeta ${id} para cuenta ${accountId}`);

      // Verificar que la carpeta existe
      const existingFolder = await this.findOne(id, accountId);

      // Si se está cambiando el nombre, verificar que no existe otra carpeta con el mismo nombre
      if (updateFolderDto.name && updateFolderDto.name !== existingFolder.name) {
        const duplicateFolder = await this.prisma.folder.findUnique({
          where: {
            unique_folder_name_per_account: {
              accountId,
              name: updateFolderDto.name,
            },
          },
        });

        if (duplicateFolder) {
          throw new BadRequestException(
            `Ya existe una carpeta con el nombre "${updateFolderDto.name}"`,
          );
        }
      }

      const folder = await this.prisma.folder.update({
        where: { id },
        data: updateFolderDto,
        include: {
          agents: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          _count: {
            select: {
              agents: true,
            },
          },
        },
      });

      this.logger.log(
        `✅ Carpeta "${folder.name}" actualizada exitosamente`,
      );

      return folder;
    } catch (error) {
      this.logger.error(`Error actualizando carpeta ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar una carpeta
   */
  async remove(id: string, accountId: string) {
    try {
      this.logger.log(`Eliminando carpeta ${id} para cuenta ${accountId}`);

      // Verificar que la carpeta existe
      const folder = await this.findOne(id, accountId);

      // Verificar que no tiene agentes asignados
      if (folder.agents.length > 0) {
        throw new BadRequestException(
          `No se puede eliminar la carpeta "${folder.name}" porque contiene ${folder.agents.length} agente(s). Mueve los agentes a otra carpeta antes de eliminar.`,
        );
      }

      await this.prisma.folder.delete({
        where: { id },
      });

      this.logger.log(`✅ Carpeta "${folder.name}" eliminada exitosamente`);

      return {
        success: true,
        message: `Carpeta "${folder.name}" eliminada exitosamente`,
      };
    } catch (error) {
      this.logger.error(`Error eliminando carpeta ${id}:`, error);
      throw error;
    }
  }

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
      const agent = await this.prisma.agent.findFirst({
        where: {
          id: agentId,
          accountId,
        },
      });

      if (!agent) {
        throw new NotFoundException(`Agente con ID ${agentId} no encontrado`);
      }

      // Si se está asignando a una carpeta, verificar que la carpeta existe
      if (folderId) {
        const folder = await this.findOne(folderId, accountId);
        this.logger.log(`Asignando a carpeta "${folder.name}"`);
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
        await this.findOne(folderId, accountId);
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
   * Obtener estadísticas de carpetas
   */
  async getFolderStats(accountId: string) {
    try {
      this.logger.log(`Obteniendo estadísticas de carpetas para cuenta ${accountId}`);

      const stats = await this.prisma.folder.aggregate({
        where: {
          accountId,
        },
        _count: {
          id: true,
        },
      });

      const foldersWithAgents = await this.prisma.folder.count({
        where: {
          accountId,
          agents: {
            some: {},
          },
        },
      });

      const totalAgentsInFolders = await this.prisma.agent.count({
        where: {
          accountId,
          folderId: {
            not: null,
          },
        },
      });

      const totalAgents = await this.prisma.agent.count({
        where: {
          accountId,
        },
      });

      return {
        totalFolders: stats._count.id,
        foldersWithAgents,
        emptyFolders: stats._count.id - foldersWithAgents,
        totalAgentsInFolders,
        totalAgentsWithoutFolders: totalAgents - totalAgentsInFolders,
        totalAgents,
      };
    } catch (error) {
      this.logger.error(`Error obteniendo estadísticas de carpetas:`, error);
      throw error;
    }
  }
}
