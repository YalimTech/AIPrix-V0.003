import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { WebSocketGateway } from './websocket.gateway';
import { WebSocketService } from './websocket.service';
import { WebSocketController } from './websocket.controller';
import { TenancyModule } from '../tenancy/tenancy.module';

@Module({
  imports: [TenancyModule, JwtModule.register({}), ConfigModule],
  controllers: [WebSocketController],
  providers: [WebSocketGateway, WebSocketService],
  exports: [WebSocketService, WebSocketGateway],
})
export class WebSocketModule {}
