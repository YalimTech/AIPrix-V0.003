import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      throw (
        err || new UnauthorizedException('Token de acceso inválido o expirado')
      );
    }

    // Verificar si es el super admin
    const adminEmail = process.env.SUPER_ADMIN_EMAIL;
    const adminRole = process.env.SUPER_ADMIN_ROLE;
    if (user.sub === adminEmail) {
      // Asegurar que el super admin tenga los datos correctos
      return {
        ...user,
        sub: adminEmail,
        email: adminEmail,
        accountId: adminEmail,
        role: adminRole,
        account: {
          id: adminEmail,
          status: 'active',
          subscriptionPlan: adminRole,
        },
      };
    }

    return user;
  }
}
