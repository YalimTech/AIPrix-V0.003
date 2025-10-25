import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PhoneAssignmentService } from '../services/phone-assignment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccountGuard } from '../tenancy/account.guard';

@Controller('phone-assignment')
@UseGuards(JwtAuthGuard, AccountGuard)
export class PhoneAssignmentController {
  constructor(
    private readonly phoneAssignmentService: PhoneAssignmentService,
  ) {}

  /**
   * Obtener números de teléfono disponibles para asignar
   */
  @Get('available-numbers')
  @HttpCode(HttpStatus.OK)
  async getAvailablePhoneNumbers(@Request() req) {
    const accountId = req.user.accountId;
    const phoneNumbers = await this.phoneAssignmentService.getAvailablePhoneNumbers(accountId);
    
    return {
      success: true,
      data: phoneNumbers,
    };
  }

  /**
   * Asignar un número de teléfono a un agente inbound
   */
  @Post('assign')
  @HttpCode(HttpStatus.OK)
  async assignPhoneToAgent(
    @Request() req,
    @Body() body: { agentId: string; phoneNumber: string },
  ) {
    const accountId = req.user.accountId;
    const { agentId, phoneNumber } = body;

    if (!agentId || !phoneNumber) {
      throw new Error('agentId y phoneNumber son requeridos');
    }

    const result = await this.phoneAssignmentService.assignPhoneToAgent(
      accountId,
      agentId,
      phoneNumber,
    );

    return result;
  }

  /**
   * Desasignar un número de teléfono de un agente
   */
  @Delete('unassign/:agentId')
  @HttpCode(HttpStatus.OK)
  async unassignPhoneFromAgent(
    @Request() req,
    @Param('agentId') agentId: string,
  ) {
    const accountId = req.user.accountId;
    const result = await this.phoneAssignmentService.unassignPhoneFromAgent(
      accountId,
      agentId,
    );

    return result;
  }

  /**
   * Obtener información del agente con su número asignado
   */
  @Get('agent/:agentId')
  @HttpCode(HttpStatus.OK)
  async getAgentWithPhoneNumber(
    @Request() req,
    @Param('agentId') agentId: string,
  ) {
    const accountId = req.user.accountId;
    const agent = await this.phoneAssignmentService.getAgentWithPhoneNumber(
      accountId,
      agentId,
    );

    return {
      success: true,
      data: agent,
    };
  }

  /**
   * Obtener todos los agentes inbound con sus números asignados
   */
  @Get('inbound-agents')
  @HttpCode(HttpStatus.OK)
  async getInboundAgentsWithPhoneNumbers(@Request() req) {
    const accountId = req.user.accountId;
    
    // Obtener todos los agentes inbound de la cuenta
    const agents = await this.phoneAssignmentService.getInboundAgentsWithPhoneNumbers(accountId);
    
    return {
      success: true,
      data: agents,
    };
  }
}
