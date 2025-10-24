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
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto, @Request() req) {
    // Verificar que solo los Admins pueden crear usuarios
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      throw new BadRequestException(
        'Solo los Administradores pueden crear usuarios',
      );
    }

    return this.usersService.create({
      ...createUserDto,
      accountId: req.user.accountId,
    });
  }

  @Get()
  findAll(@Request() req) {
    return this.usersService.findAll(req.user.accountId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.usersService.findOne(id, req.user.accountId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    // Verificar que solo los Admins pueden editar usuarios
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      throw new BadRequestException(
        'Solo los Administradores pueden editar usuarios',
      );
    }

    return this.usersService.update(id, updateUserDto, req.user.accountId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    // Verificar que solo los Admins pueden eliminar usuarios
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      throw new BadRequestException(
        'Solo los Administradores pueden eliminar usuarios',
      );
    }

    return this.usersService.remove(id, req.user.accountId);
  }
}
