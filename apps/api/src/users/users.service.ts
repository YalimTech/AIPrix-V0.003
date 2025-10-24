import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Si es el super admin creando un usuario, crear un account real primero
    if (createUserDto.accountId === process.env.SUPER_ADMIN_EMAIL) {
      // Verificar si ya existe un account para el super admin
      let account = await this.prisma.account.findFirst({
        where: { email: process.env.SUPER_ADMIN_EMAIL },
      });

      if (!account) {
        // Crear el account del super admin
        account = await this.prisma.account.create({
          data: {
            name: process.env.SUPER_ADMIN_NAME || 'Super Admin Account',
            email: process.env.SUPER_ADMIN_EMAIL,
            slug: `super-admin-${Date.now()}`,
            status: 'active',
            subscriptionPlan: 'super_admin',
          },
        });
        console.log('✅ Account del super admin creado:', account.id);
      }

      // Usar el account real en lugar del email
      createUserDto.accountId = account.id;
    }

    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: createUserDto.email,
        accountId: createUserDto.accountId,
      },
    });

    if (existingUser) {
      throw new BadRequestException('El usuario ya existe en este account');
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(createUserDto.password, 8);

    // Separar el nombre completo en firstName y lastName
    const nameParts = (createUserDto.name || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        passwordHash,
        firstName,
        lastName,
        accountId: createUserDto.accountId,
        role: createUserDto.role || 'user',
        status: createUserDto.status || 'active',
      },
      include: { account: true },
    });

    // Devolver en el formato esperado por el frontend
    return {
      id: user.id,
      email: user.email,
      name:
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.firstName || user.lastName || 'N/A',
      permissions: user.role,
      // status: user.status,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async findAll(accountId: string) {
    // Si es el super admin, buscar usuarios de su account real
    let realAccountId = accountId;
    if (accountId === process.env.SUPER_ADMIN_EMAIL) {
      const account = await this.prisma.account.findFirst({
        where: { email: process.env.SUPER_ADMIN_EMAIL },
      });
      if (account) {
        realAccountId = account.id;
      } else {
        // Si no existe el account, devolver array vacío
        return [];
      }
    }

    const users = await this.prisma.user.findMany({
      where: { accountId: realAccountId },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Transformar los datos para el frontend
    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name:
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.firstName || user.lastName || 'N/A',
      permissions: user.role,
      // status: user.status,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    }));
  }

  async findOne(id: string, accountId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        accountId,
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, accountId: string) {
    await this.findOne(id, accountId);

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: {
        account: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  async remove(id: string, accountId: string) {
    await this.findOne(id, accountId);

    return this.prisma.user.delete({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email },
      include: { account: true },
    });
  }
}
