import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
// import { DebugAuthController } from './debug-auth.controller';
import { AuthDiagnosticsController } from './auth-diagnostics.controller';
import { AuthTestingController } from './auth-testing.controller';
import { AuthenticationController } from './authentication.controller';
import { PasswordResetService } from './services/password-reset.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { SystemDiagnosticsController } from './system-diagnostics.controller';
import { UserManagementController } from './user-management.controller';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        // Leer JWT_SECRET directamente de process.env (más confiable en Dokploy)
        const jwtSecret =
          process.env.JWT_SECRET || configService.get<string>('JWT_SECRET');

        // Leer JWT_EXPIRES_IN directamente de process.env
        const expiresIn =
          process.env.JWT_EXPIRES_IN ||
          configService.get<string>('JWT_EXPIRES_IN') ||
          '7d'; // Cambiar default a 7 días para consistencia

        console.log('🔑 JWT Configuration:', {
          jwtSecret: jwtSecret ? `${jwtSecret.substring(0, 8)}...` : 'Not found',
          expiresIn: expiresIn,
          source: process.env.JWT_EXPIRES_IN ? 'process.env' : 'configService'
        });

        return {
          secret: jwtSecret || 'default-jwt-secret-for-development',
          signOptions: {
            expiresIn: expiresIn as any,
            algorithm: 'HS256',
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy, LocalStrategy, PasswordResetService],
  controllers: [AuthController, SystemDiagnosticsController, AuthenticationController, UserManagementController, AuthTestingController, AuthDiagnosticsController],
  exports: [AuthService, JwtModule, PasswordResetService],
})
export class AuthModule {}
