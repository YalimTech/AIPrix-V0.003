import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AccountGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    let accountId = request.accountId;

    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    // Si es el super admin, permitir acceso sin validación de tenant
    const adminEmail = '';
    if (user.sub === adminEmail) {
      // Crear un account virtual para el super admin
      request.account = {
        id: adminEmail,
        status: 'active',
        subscriptionPlan: 'super_admin',
      };
      request.accountId = adminEmail; // ✅ CRÍTICO: Asignar accountId para super admin
      return true;
    }

    // Si no hay accountId del middleware, extraerlo del JWT
    if (!accountId && user.accountId) {
      accountId = user.accountId;
    }

    if (!accountId) {
      throw new UnauthorizedException('Tenant no especificado');
    }

    // Verificar que el usuario pertenece al account
    if (user.accountId !== accountId) {
      throw new ForbiddenException(
        'Usuario no pertenece al account especificado',
      );
    }

    // Verificar que el account está activo
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      select: { id: true, status: true, subscriptionPlan: true },
    });

    if (!account) {
      throw new UnauthorizedException('Tenant no encontrado');
    }

    if (account.status !== 'active') {
      throw new ForbiddenException('Tenant inactivo o suspendido');
    }

    // Agregar información del account al request
    request.account = account;
    request.accountId = accountId; // ✅ CRÍTICO: Asignar accountId al request

    return true;
  }
}
