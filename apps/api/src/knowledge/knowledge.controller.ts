import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { CreateKnowledgeDto, KnowledgeType } from './dto/create-knowledge.dto';
import { UpdateKnowledgeDto } from './dto/update-knowledge.dto';
import { KnowledgeSearchDto } from './dto/knowledge.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccountGuard } from '../tenancy/account.guard';

@Controller('knowledge')
@UseGuards(JwtAuthGuard, AccountGuard)
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post()
  create(@Body() createKnowledgeDto: CreateKnowledgeDto, @Request() req) {
    return this.knowledgeService.create(createKnowledgeDto, req.user.accountId);
  }

  @Get()
  findAll(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('tags') tags?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const tagsArray = tags ? tags.split(',') : undefined;

    return this.knowledgeService.findAll(
      req.user.accountId,
      pageNum,
      limitNum,
      type as KnowledgeType,
      category,
      tagsArray,
    );
  }

  @Get('stats')
  getStats(@Request() req) {
    return this.knowledgeService.getStats(req.user.accountId);
  }

  @Post('search')
  search(@Body() searchDto: KnowledgeSearchDto, @Request() req) {
    return this.knowledgeService.search(searchDto, req.user.accountId);
  }

  @Get('context')
  generateContext(
    @Query('query') query: string,
    @Request() req,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 3;
    return this.knowledgeService.generateContext(
      query,
      req.user.accountId,
      limitNum,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.knowledgeService.findOne(id, req.user.accountId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateKnowledgeDto: UpdateKnowledgeDto,
    @Request() req,
  ) {
    return this.knowledgeService.update(
      id,
      updateKnowledgeDto,
      req.user.accountId,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.knowledgeService.remove(id, req.user.accountId);
  }
}
