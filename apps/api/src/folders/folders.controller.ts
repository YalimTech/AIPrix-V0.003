import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccountGuard } from '../tenancy/account.guard';
import { FoldersService } from './folders.service';

@Controller('folders')
@UseGuards(JwtAuthGuard, AccountGuard)
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createFolderDto: any, @Request() req) {
    try {
      console.log('🔍 [FoldersController.create] Iniciando creación de carpeta');
      console.log('🔍 [FoldersController.create] Request body:', JSON.stringify(createFolderDto, null, 2));
      console.log('🔍 [FoldersController.create] Request user:', req.user);
      console.log('🔍 [FoldersController.create] Request accountId:', req.accountId);
      console.log('🔍 [FoldersController.create] Request account:', req.account);
      
      if (!req.accountId) {
        console.error('❌ [FoldersController.create] accountId no encontrado en request');
        throw new Error('Account ID not found in request');
      }
      
      console.log('🔍 [FoldersController.create] Llamando al servicio...');
      const result = await this.foldersService.create(createFolderDto, req.accountId);
      console.log('✅ [FoldersController.create] Servicio completado exitosamente');
      return result;
    } catch (error) {
      console.error('❌ [FoldersController.create] Error en controlador:', error.message);
      console.error('❌ [FoldersController.create] Stack trace:', error.stack);
      throw error;
    }
  }

  @Get()
  findAll(@Request() req) {
    return this.foldersService.findAll(req.accountId);
  }

  @Patch('move-agents')
  @HttpCode(HttpStatus.OK)
  moveAgentsToFolder(@Body() body: { agentIds: string[]; folderId: string | null }, @Request() req) {
    return this.foldersService.moveAgentsToFolder(body.agentIds, body.folderId, req.accountId);
  }

  @Patch('assign-agent/:agentId')
  @HttpCode(HttpStatus.OK)
  assignAgentToFolder(@Param('agentId') agentId: string, @Body() body: { folderId: string | null }, @Request() req) {
    return this.foldersService.assignAgentToFolder(agentId, body.folderId, req.accountId);
  }

  @Get('stats/overview')
  getFolderStats(@Request() req) {
    return this.foldersService.getFolderStats(req.accountId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.foldersService.findOne(id, req.accountId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFolderDto: any, @Request() req) {
    return this.foldersService.update(id, updateFolderDto, req.accountId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @Request() req) {
    return this.foldersService.remove(id, req.accountId);
  }
}