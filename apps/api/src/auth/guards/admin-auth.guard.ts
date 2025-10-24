import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AdminAuthGuard extends AuthGuard('admin') {
  constructor(private configService: ConfigService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Verificar que las credenciales de admin estén configuradas
    const adminEmail = this.configService.get<string>('admin.email');
    const adminPassword = this.configService.get<string>('admin.password');

    if (!adminEmail || !adminPassword) {
      throw new UnauthorizedException(
        'Sistema de administración no configurado',
      );
    }

    return super.canActivate(context);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleRequest(err: any, user: any, _info: any, _context: ExecutionContext) {
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException('Acceso denegado al panel de administración')
      );
    }

    // Verificar que es un administrador del sistema
    // Permitir acceso si es el super admin (usando JWT) o si tiene isSystemAdmin
    const adminEmail = this.configService.get<string>('admin.email');
    const isSuperAdmin = user.sub === adminEmail || user.email === adminEmail;
    const isSystemAdmin = user.isSystemAdmin;

    if (!isSuperAdmin && !isSystemAdmin) {
      throw new UnauthorizedException(
        'Se requieren permisos de administrador del sistema',
      );
    }

    return user;
  }
}
