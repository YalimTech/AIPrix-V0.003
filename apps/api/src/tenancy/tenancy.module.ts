import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { AccountPermissionGuard } from './account-permission.guard';
import { AccountGuard } from './account.guard';
import { AccountMiddleware } from './account.middleware';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') as any,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AccountMiddleware, AccountGuard, AccountPermissionGuard],
  exports: [AccountMiddleware, AccountGuard, AccountPermissionGuard, JwtModule],
})
export class TenancyModule {}
