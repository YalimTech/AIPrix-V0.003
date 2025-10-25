import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PhoneAssignmentService {
  private readonly logger = new Logger(PhoneAssignmentService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Asignar un número de teléfono a un agente inbound
   */
  async assignPhoneToAgent(
    accountId: string,
    agentId: string,
    phoneNumber: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Verificar que el agente existe y pertenece a la cuenta
      const agent = await this.prisma.agent.findFirst({
        where: {
          id: agentId,
          accountId: accountId,
          type: 'inbound', // Solo agentes inbound pueden tener números asignados
        },
      });

      if (!agent) {
        throw new NotFoundException('Agente inbound no encontrado');
      }

      // Verificar que el número de teléfono existe y está disponible
      const phoneNumberRecord = await this.prisma.phoneNumber.findFirst({
        where: {
          number: phoneNumber,
          accountId: accountId,
        },
      });

      if (!phoneNumberRecord) {
        throw new NotFoundException('Número de teléfono no encontrado');
      }

      // Verificar si el número ya está asignado a otro agente
      const existingAssignment = await this.prisma.agent.findFirst({
        where: {
          phoneNumber: phoneNumber,
          accountId: accountId,
          id: { not: agentId },
        },
      });

      if (existingAssignment) {
        throw new BadRequestException('Este número ya está asignado a otro agente');
      }

      // Asignar el número al agente
      await this.prisma.agent.update({
        where: { id: agentId },
        data: { phoneNumber: phoneNumber },
      });

      this.logger.log(
        `Número ${phoneNumber} asignado al agente ${agentId} en cuenta ${accountId}`,
      );

      return {
        success: true,
        message: 'Número de teléfono asignado exitosamente',
      };
    } catch (error) {
      this.logger.error(
        `Error asignando número ${phoneNumber} al agente ${agentId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Desasignar un número de teléfono de un agente
   */
  async unassignPhoneFromAgent(
    accountId: string,
    agentId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const agent = await this.prisma.agent.findFirst({
        where: {
          id: agentId,
          accountId: accountId,
        },
      });

      if (!agent) {
        throw new NotFoundException('Agente no encontrado');
      }

      await this.prisma.agent.update({
        where: { id: agentId },
        data: { phoneNumber: null },
      });

      this.logger.log(
        `Número desasignado del agente ${agentId} en cuenta ${accountId}`,
      );

      return {
        success: true,
        message: 'Número de teléfono desasignado exitosamente',
      };
    } catch (error) {
      this.logger.error(
        `Error desasignando número del agente ${agentId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Obtener números de teléfono disponibles para asignar
   */
  async getAvailablePhoneNumbers(accountId: string): Promise<any[]> {
    try {
      // Obtener todos los números de teléfono de la cuenta
      const phoneNumbers = await this.prisma.phoneNumber.findMany({
        where: { accountId: accountId },
        select: {
          id: true,
          number: true,
          description: true,
          country: true,
          type: true,
          capabilities: true,
          status: true,
        },
      });

      // Obtener números ya asignados
      const assignedNumbers = await this.prisma.agent.findMany({
        where: {
          accountId: accountId,
          phoneNumber: { not: null },
        },
        select: { phoneNumber: true },
      });

      const assignedNumberSet = new Set(
        assignedNumbers.map((agent) => agent.phoneNumber),
      );

      // Filtrar números disponibles
      const availableNumbers = await Promise.all(
        phoneNumbers.map(async (phone) => ({
          ...phone,
          phoneNumber: phone.number, // Mapear number a phoneNumber para compatibilidad
          friendlyName: phone.description, // Mapear description a friendlyName
          region: phone.type, // Mapear type a region
          isAssigned: assignedNumberSet.has(phone.number),
          assignedTo: assignedNumberSet.has(phone.number)
            ? await this.getAgentAssignedToNumber(accountId, phone.number)
            : null,
        }))
      );

      return availableNumbers;
    } catch (error) {
      this.logger.error(
        `Error obteniendo números disponibles para cuenta ${accountId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Obtener el agente asignado a un número específico
   */
  private async getAgentAssignedToNumber(
    accountId: string,
    phoneNumber: string,
  ): Promise<any> {
    const agent = await this.prisma.agent.findFirst({
      where: {
        accountId: accountId,
        phoneNumber: phoneNumber,
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
    });

    return agent;
  }

  /**
   * Obtener información del agente con su número asignado
   */
  async getAgentWithPhoneNumber(
    accountId: string,
    agentId: string,
  ): Promise<any> {
    try {
      const agent = await this.prisma.agent.findFirst({
        where: {
          id: agentId,
          accountId: accountId,
        },
        select: {
          id: true,
          name: true,
          type: true,
          phoneNumber: true,
          status: true,
          createdAt: true,
        },
      });

      if (!agent) {
        throw new NotFoundException('Agente no encontrado');
      }

      return agent;
    } catch (error) {
      this.logger.error(
        `Error obteniendo agente ${agentId} con número: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Obtener todos los agentes inbound con sus números asignados
   */
  async getInboundAgentsWithPhoneNumbers(accountId: string): Promise<any[]> {
    try {
      const agents = await this.prisma.agent.findMany({
        where: {
          accountId: accountId,
          type: 'inbound',
        },
        select: {
          id: true,
          name: true,
          type: true,
          phoneNumber: true,
          status: true,
          createdAt: true,
          elevenLabsAgentId: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return agents;
    } catch (error) {
      this.logger.error(
        `Error obteniendo agentes inbound para cuenta ${accountId}: ${error.message}`,
      );
      throw error;
    }
  }
}
