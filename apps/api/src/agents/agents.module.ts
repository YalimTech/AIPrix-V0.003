import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ElevenLabsModule } from '../integrations/elevenlabs/elevenlabs.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { BidirectionalSyncService } from './bidirectional-sync.service';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const jwtSecret = process.env.JWT_SECRET || configService.get<string>('JWT_SECRET');
        const expiresIn = process.env.JWT_EXPIRES_IN || configService.get<string>('JWT_EXPIRES_IN') || '7d';
        
        console.log('🔑 AgentsModule JWT Configuration:', {
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
    forwardRef(() => ElevenLabsModule)
  ],
  controllers: [AgentsController],
  providers: [AgentsService, BidirectionalSyncService],
  exports: [AgentsService, BidirectionalSyncService],
})
export class AgentsModule {}
