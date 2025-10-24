import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import 'reflect-metadata';

export const TENANT_PERMISSIONS_KEY = 'account_permissions';

export const RequireTenantPermission = (resource: string, action: string) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(
      TENANT_PERMISSIONS_KEY,
      { resource, action },
      descriptor.value,
    );
    return descriptor;
  };
};

@Injectable()
export class AccountPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const accountId = request.accountId;

    if (!user || !accountId) {
      return false;
    }

    // Obtener permisos requeridos del decorador
    const permissions = this.reflector.get<{
      resource: string;
      action: string;
    }>(TENANT_PERMISSIONS_KEY, context.getHandler());

    if (!permissions) {
      return true; // No hay permisos específicos requeridos
    }

    // Verificar permisos del usuario
    const hasPermission = await this.checkUserPermission(
      user.id,
      accountId,
      permissions.resource,
      permissions.action,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `No tienes permisos para ${permissions.action} en ${permissions.resource}`,
      );
    }

    return true;
  }

  private async checkUserPermission(
    userId: string,
    accountId: string,
    resource: string,
    action: string,
  ): Promise<boolean> {
    try {
      // Verificar si el usuario tiene permisos granulares
      const permission = await this.prisma.userPermission.findFirst({
        where: {
          userId,
          resource,
          action,
          accountId,
        },
      });

      if (permission) {
        return permission.allowed;
      }

      // Si no hay permisos granulares, verificar por rol
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!user) {
        return false;
      }

      // Permisos por rol (configuración básica)
      return this.checkRolePermission(user.role, resource, action);
    } catch {
      return false;
    }
  }

  private checkRolePermission(
    role: string,
    resource: string,
    action: string,
  ): boolean {
    const rolePermissions: Record<string, Record<string, string[]>> = {
      admin: {
        agents: ['create', 'read', 'update', 'delete'],
        campaigns: ['create', 'read', 'update', 'delete'],
        contacts: ['create', 'read', 'update', 'delete'],
        users: ['create', 'read', 'update', 'delete'],
        accounts: ['read', 'update'],
      },
      user: {
        agents: ['read', 'update'],
        campaigns: ['create', 'read', 'update'],
        contacts: ['create', 'read', 'update'],
        users: ['read'],
      },
      viewer: {
        agents: ['read'],
        campaigns: ['read'],
        contacts: ['read'],
        users: ['read'],
      },
    };

    const roleResourcePermissions = rolePermissions[role]?.[resource] || [];
    return roleResourcePermissions.includes(action);
  }
}
