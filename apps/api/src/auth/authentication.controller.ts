import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    try {
      console.log(`🔍 Simple login attempt for: ${body.email}`);
      
      const normalizedEmail = body.email.trim().toLowerCase();
      
      // Buscar usuario en la base de datos
      const user = await this.prisma.user.findFirst({
        where: { email: normalizedEmail },
        include: {
          account: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true,
            },
          },
        },
      });
      
      if (!user) {
        console.log(`❌ User not found: ${normalizedEmail}`);
        return {
          error: 'Credenciales inválidas',
          message: 'Usuario no encontrado'
        };
      }
      
      // if (user.status !== 'active') {
      //   console.log(`❌ User inactive: ${normalizedEmail}`);
      //   return {
      //     error: 'Credenciales inválidas',
      //     message: 'Usuario inactivo'
      //   };
      // }
      
      // Verificar contraseña usando bcrypt
      const bcrypt = require('bcryptjs');
      const passwordMatch = await bcrypt.compare(body.password, user.passwordHash);
      
      if (!passwordMatch) {
        console.log(`❌ Invalid password for: ${normalizedEmail}`);
        return {
          error: 'Credenciales inválidas',
          message: 'Contraseña incorrecta'
        };
      }
      
      console.log(`✅ User login successful for: ${normalizedEmail}`);
      
      const payload = {
        sub: user.id,
        email: user.email,
        accountId: user.accountId,
        role: user.role,
      };
      
      const accessToken = this.jwtService.sign(payload);
      
      return {
        access_token: accessToken,
        user: {
          id: user.id,
          email: user.email,
          accountId: user.accountId,
          firstName: user.firstName || 'User',
          lastName: user.lastName || 'Name',
          role: user.role,
          // account: {
          //   id: user.account.id,
          //   name: user.account.name,
          //   slug: user.account.slug || 'user-account',
          // },
        }
      };
      
    } catch (error) {
      console.error(`❌ Simple login error:`, error);
      return {
        error: 'Error interno del servidor',
        message: error.message
      };
    }
  }
}
