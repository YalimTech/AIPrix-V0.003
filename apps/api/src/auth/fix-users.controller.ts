import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth/user-management')
export class UserManagementController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('remove-test-user')
  @HttpCode(HttpStatus.OK)
  async removeTestUser() {
    try {
      // Eliminar usuario de prueba
      const deletedUser = await this.prisma.user.deleteMany({
        where: { email: 'test@prixagent.com' }
      });

      return {
        success: true,
        message: 'Usuario de prueba eliminado',
        deletedCount: deletedUser.count,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Post('ensure-yalim-music')
  @HttpCode(HttpStatus.OK)
  async ensureYalimMusic() {
    try {
      // Asegurar que la cuenta existe
      const account = await this.prisma.account.upsert({
        where: { id: 'cmgwz0eou0000tivkwzxldm7t' },
        update: {
          name: 'Yalim Music Account',
          slug: 'yalim-music-account',
          status: 'active'
        },
        create: {
          id: 'cmgwz0eou0000tivkwzxldm7t',
          name: 'Yalim Music Account',
          slug: 'yalim-music-account',
          status: 'active',
          email: 'test@prixagent.com'
        }
      });

      // Crear o actualizar el usuario de prueba
      const user = await this.prisma.user.upsert({
        where: { id: 'cmgwz0ey50002tivk67ld4m1z' },
        update: {
          passwordHash: '$2b$10$eAS6vWew0hywk3OUGjhYPupcm4l3eBkHLwUK2r3UOp0aqwGuuxR2K',
          firstName: 'Yalim',
          lastName: 'Music',
          role: 'admin',
          accountId: 'cmgwz0eou0000tivkwzxldm7t',
          status: 'active'
        },
        create: {
          id: 'cmgwz0ey50002tivk67ld4m1z',
          email: 'test@prixagent.com',
          passwordHash: '$2b$10$eAS6vWew0hywk3OUGjhYPupcm4l3eBkHLwUK2r3UOp0aqwGuuxR2K',
          firstName: 'Yalim',
          lastName: 'Music',
          role: 'admin',
          accountId: 'cmgwz0eou0000tivkwzxldm7t',
          status: 'active'
        }
      });

      return {
        success: true,
        message: 'Usuario de prueba configurado correctamente',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          accountId: user.accountId,
          firstName: user.firstName,
          lastName: user.lastName,
          status: user.status
        },
        account: {
          id: account.id,
          name: account.name,
          slug: account.slug,
          status: account.status
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Post('verify-users')
  @HttpCode(HttpStatus.OK)
  async verifyUsers() {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          email: {
            in: ['test@prixagent.com', 'admin@prixagent.com']
          }
        },
        include: {
          account: true
        }
      });

      return {
        success: true,
        users: users.map(user => ({
          id: user.id,
          email: user.email,
          role: user.role,
          accountId: user.accountId,
          firstName: user.firstName,
          lastName: user.lastName,
          status: user.status,
          account: user.account ? {
            id: user.account.id,
            name: user.account.name,
            slug: user.account.slug,
            status: user.account.status
          } : null
        })),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}
