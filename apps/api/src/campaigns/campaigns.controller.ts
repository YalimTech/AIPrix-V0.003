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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccountGuard } from '../tenancy/account.guard';

@Controller('campaigns')
@UseGuards(JwtAuthGuard, AccountGuard)
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  create(@Body() createCampaignDto: CreateCampaignDto, @Request() req) {
    return this.campaignsService.create(createCampaignDto, req.user.accountId);
  }

  @Get()
  findAll(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.campaignsService.findAll(req.user.accountId, pageNum, limitNum);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.campaignsService.findOne(id, req.user.accountId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
    @Request() req,
  ) {
    return this.campaignsService.update(
      id,
      updateCampaignDto,
      req.user.accountId,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.campaignsService.remove(id, req.user.accountId);
  }

  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  start(@Param('id') id: string, @Request() req) {
    return this.campaignsService.start(id, req.user.accountId);
  }

  @Post(':id/pause')
  @HttpCode(HttpStatus.OK)
  pause(@Param('id') id: string, @Request() req) {
    return this.campaignsService.pause(id, req.user.accountId);
  }

  @Get(':id/stats')
  getStats(@Param('id') id: string, @Request() req) {
    return this.campaignsService.getStats(id, req.user.accountId);
  }
}
