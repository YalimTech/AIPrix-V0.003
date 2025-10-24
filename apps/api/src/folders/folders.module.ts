import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { FoldersController } from './folders.controller';
import { FoldersService } from './folders.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const jwtSecret = process.env.JWT_SECRET || configService.get<string>('JWT_SECRET');
        const expiresIn = process.env.JWT_EXPIRES_IN || configService.get<string>('JWT_EXPIRES_IN') || '7d';
        
        console.log('🔑 FoldersModule JWT Configuration:', {
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
  controllers: [FoldersController],
  providers: [FoldersService, PrismaService],
  exports: [FoldersService],
})
export class FoldersModule {}
