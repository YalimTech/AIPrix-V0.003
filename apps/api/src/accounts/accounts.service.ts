import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(private readonly _prisma: PrismaService) {}

  async create(createTenantDto: CreateAccountDto) {
    // Verificar si el slug ya existe
    const existingTenant = await this._prisma.account.findUnique({
      where: { slug: createTenantDto.slug },
    });

    if (existingTenant) {
      throw new ConflictException('El slug del account ya existe');
    }

    // Verificar si el email ya existe
    const existingEmail = await this._prisma.account.findUnique({
      where: { email: createTenantDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('El email del account ya existe');
    }

    return this._prisma.account.create({
      data: createTenantDto,
      include: {
        _count: {
          select: {
            users: true,
            agents: true,
            campaigns: true,
            contacts: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this._prisma.account.findMany({
      include: {
        _count: {
          select: {
            users: true,
            agents: true,
            campaigns: true,
            contacts: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const account = await this._prisma.account.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            agents: true,
            campaigns: true,
            contacts: true,
          },
        },
      },
    });

    if (!account) {
      throw new NotFoundException('Tenant no encontrado');
    }

    return account;
  }

  async findBySlug(slug: string) {
    const account = await this._prisma.account.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            users: true,
            agents: true,
            campaigns: true,
            contacts: true,
          },
        },
      },
    });

    if (!account) {
      throw new NotFoundException('Tenant no encontrado');
    }

    return account;
  }

  async update(id: string, updateTenantDto: UpdateAccountDto) {
    const account = await this.findOne(id);

    // Verificar si el slug ya existe en otro account
    if (updateTenantDto.slug && updateTenantDto.slug !== account.slug) {
      const existingTenant = await this._prisma.account.findUnique({
        where: { slug: updateTenantDto.slug },
      });

      if (existingTenant) {
        throw new ConflictException('El slug del account ya existe');
      }
    }

    // Verificar si el email ya existe en otro account
    if (updateTenantDto.email && updateTenantDto.email !== account.email) {
      const existingEmail = await this._prisma.account.findUnique({
        where: { email: updateTenantDto.email },
      });

      if (existingEmail) {
        throw new ConflictException('El email del account ya existe');
      }
    }

    return this._prisma.account.update({
      where: { id },
      data: updateTenantDto,
      include: {
        _count: {
          select: {
            users: true,
            agents: true,
            campaigns: true,
            contacts: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Verificar si el account tiene datos asociados
    const counts = await this._prisma.account.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            agents: true,
            campaigns: true,
            contacts: true,
          },
        },
      },
    });

    if (
      counts._count.users > 0 ||
      counts._count.agents > 0 ||
      counts._count.campaigns > 0 ||
      counts._count.contacts > 0
    ) {
      throw new BadRequestException(
        'No se puede eliminar el account porque tiene datos asociados',
      );
    }

    return this._prisma.account.delete({
      where: { id },
    });
  }

  async getStats(id: string) {
    const account = await this.findOne(id);

    const stats = await this._prisma.account.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            agents: true,
            campaigns: true,
            contacts: true,
            calls: true,
          },
        },
      },
    });

    return {
      account: {
        id: account.id,
        name: account.name,
        slug: account.slug,
        status: account.status,
        subscriptionPlan: account.subscriptionPlan,
      },
      stats: stats._count,
    };
  }

  async suspend(id: string) {
    return this.update(id, { status: 'suspended' });
  }

  async activate(id: string) {
    return this.update(id, { status: 'active' });
  }

  async cancel(id: string) {
    return this.update(id, { status: 'cancelled' });
  }
}
