import { Controller, Get, UseGuards } from '@nestjs/common';
import { WebSocketService } from './websocket.service';
import { AccountGuard } from '../tenancy/account.guard';

@Controller('websocket')
@UseGuards(AccountGuard)
export class WebSocketController {
  constructor(private readonly webSocketService: WebSocketService) {}

  @Get('stats')
  getConnectionStats() {
    return {
      message: 'WebSocket service is running',
      timestamp: new Date().toISOString(),
    };
  }
}
