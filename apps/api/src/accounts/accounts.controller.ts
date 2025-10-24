import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private readonly _accountsService: AccountsService) {}

  @Post()
  @UseGuards(AdminAuthGuard)
  create(@Body() createTenantDto: CreateAccountDto) {
    return this._accountsService.create(createTenantDto);
  }

  @Get()
  @UseGuards(AdminAuthGuard)
  findAll() {
    return this._accountsService.findAll();
  }

  @Get('stats')
  @UseGuards(AdminAuthGuard)
  getGlobalStats() {
    return this._accountsService.findAll();
  }

  @Get(':id')
  @UseGuards(AdminAuthGuard)
  findOne(@Param('id') id: string) {
    return this._accountsService.findOne(id);
  }

  @Get('slug/:slug')
  @UseGuards(AdminAuthGuard)
  findBySlug(@Param('slug') slug: string) {
    return this._accountsService.findBySlug(slug);
  }

  @Get(':id/stats')
  @UseGuards(AdminAuthGuard)
  getStats(@Param('id') id: string) {
    return this._accountsService.getStats(id);
  }

  @Patch(':id')
  @UseGuards(AdminAuthGuard)
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateAccountDto) {
    return this._accountsService.update(id, updateTenantDto);
  }

  @Patch(':id/suspend')
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.OK)
  suspend(@Param('id') id: string) {
    return this._accountsService.suspend(id);
  }

  @Patch(':id/activate')
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.OK)
  activate(@Param('id') id: string) {
    return this._accountsService.activate(id);
  }

  @Patch(':id/cancel')
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.OK)
  cancel(@Param('id') id: string) {
    return this._accountsService.cancel(id);
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  remove(@Param('id') id: string) {
    return this._accountsService.remove(id);
  }
}
