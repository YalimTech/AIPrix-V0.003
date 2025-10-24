import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminStrategy extends PassportStrategy(Strategy, 'admin') {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    // Verificar credenciales de administrador desde variables de entorno
    const adminEmail = this.configService.get<string>('admin.email');
    const adminPassword = this.configService.get<string>('admin.password');
    const adminSecretKey = this.configService.get<string>('admin.secret');

    if (!adminEmail || !adminPassword || !adminSecretKey) {
      throw new UnauthorizedException(
        'Configuración de administrador no encontrada',
      );
    }

    // Validar credenciales
    if (email !== adminEmail || password !== adminPassword) {
      throw new UnauthorizedException(
        'Credenciales de administrador inválidas',
      );
    }

    // Crear objeto de usuario administrador
    const adminUser = {
      id: 'admin',
      email: adminEmail,
      role: 'admin',
      isSystemAdmin: true,
      permissions: ['*'], // Todos los permisos
    };

    return adminUser;
  }
}
