import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway as WSGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
// // import { WebSocketService } from './websocket.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@WSGateway({
  cors: {
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://agent.prixcenter.com', 'https://admin.prixcenter.com']
        : [
            `${process.env.API_PROTOCOL || 'http'}://${process.env.API_HOST || 'localhost'}:${process.env.PORT || '3000'}`,
            `${process.env.API_PROTOCOL || 'http'}://${process.env.API_HOST || 'localhost'}:${process.env.CLIENT_PORT || '3001'}`,
            `${process.env.API_PROTOCOL || 'http'}://${process.env.API_HOST || 'localhost'}:${process.env.ADMIN_PORT || '3002'}`,
            `${process.env.API_PROTOCOL || 'http'}://${process.env.API_HOST || 'localhost'}:${process.env.AGENCY_PORT || '3003'}`,
          ],
    credentials: true,
  },
  namespace: '/ws',
})
export class WebSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketGateway.name);
  private connectedClients = new Map<
    string,
    { socket: Socket; userId?: string; accountId?: string }
  >();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    // Verificar autenticación si se proporciona token
    const token =
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization?.replace('Bearer ', '');

    if (token) {
      try {
        const payload = this.jwtService.verify(token);
        this.connectedClients.set(client.id, {
          socket: client,
          userId: payload.sub,
          accountId: payload.accountId,
        });

        // Unir a sala del account si está disponible
        if (payload.accountId) {
          client.join(`account:${payload.accountId}`);
          client.join(`user:${payload.sub}`);
        }

        this.logger.log(
          `Authenticated client ${client.id} for user ${payload.sub} in account ${payload.accountId}`,
        );
      } catch (error) {
        this.logger.warn(
          `Invalid token for client ${client.id}: ${error.message}`,
        );
        client.disconnect();
        return;
      }
    } else {
      this.connectedClients.set(client.id, { socket: client });
    }

    // Enviar mensaje de bienvenida
    client.emit('connected', {
      message: 'Conectado al servidor WebSocket',
      timestamp: new Date().toISOString(),
      authenticated: !!token,
    });

    // Unir al cliente a la sala general
    client.join('general');
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @MessageBody() data: { room: string; accountId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { room, accountId } = data;

    if (accountId) {
      // Unir a sala específica del account
      client.join(`account:${accountId}`);
      this.logger.log(`Client ${client.id} joined account room: ${accountId}`);
    }

    if (room) {
      client.join(room);
      this.logger.log(`Client ${client.id} joined room: ${room}`);
    }

    client.emit('joined_room', { room, accountId });
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @MessageBody() data: { room: string; accountId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { room, accountId } = data;

    if (accountId) {
      client.leave(`account:${accountId}`);
    }

    if (room) {
      client.leave(room);
    }

    client.emit('left_room', { room, accountId });
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  // Métodos para emitir eventos desde otros servicios
  emitToTenant(accountId: string, event: string, data: any) {
    this.server.to(`account:${accountId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
    this.logger.debug(`Emitted ${event} to account ${accountId}`);
  }

  emitToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
    this.logger.debug(`Emitted ${event} to room ${room}`);
  }

  emitToAll(event: string, data: any) {
    this.server.emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
    this.logger.debug(`Emitted ${event} to all clients`);
  }

  emitToClient(clientId: string, event: string, data: any) {
    this.server.to(clientId).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
    this.logger.debug(`Emitted ${event} to client ${clientId}`);
  }

  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
    this.logger.debug(`Emitted ${event} to user ${userId}`);
  }

  // Métodos específicos para notificaciones del sistema
  notifyCallStatus(
    accountId: string,
    callId: string,
    status: string,
    data?: any,
  ) {
    this.emitToTenant(accountId, 'call_status_update', {
      callId,
      status,
      ...data,
    });
  }

  notifyCampaignUpdate(accountId: string, campaignId: string, update: any) {
    this.emitToTenant(accountId, 'campaign_update', {
      campaignId,
      ...update,
    });
  }

  notifyAgentUpdate(accountId: string, agentId: string, update: any) {
    this.emitToTenant(accountId, 'agent_update', {
      agentId,
      ...update,
    });
  }

  notifySystemAlert(accountId: string, alert: any) {
    this.emitToTenant(accountId, 'system_alert', alert);
  }

  notifyNewCall(accountId: string, call: any) {
    this.emitToTenant(accountId, 'new_call', call);
  }

  notifyCallCompleted(accountId: string, call: any) {
    this.emitToTenant(accountId, 'call_completed', call);
  }

  // Métodos para estadísticas en tiempo real
  updateDashboardStats(accountId: string, stats: any) {
    this.emitToTenant(accountId, 'dashboard_stats_update', stats);
  }

  updateCallMetrics(accountId: string, metrics: any) {
    this.emitToTenant(accountId, 'call_metrics_update', metrics);
  }

  // Método para obtener información de clientes conectados
  getConnectedClients() {
    return Array.from(this.connectedClients.entries()).map(([id, client]) => ({
      id,
      userId: client.userId,
      accountId: client.accountId,
      connected: client.socket.connected,
    }));
  }

  getTenantClients(accountId: string) {
    return Array.from(this.connectedClients.entries())
      .filter(([_, client]) => client.accountId === accountId)
      .map(([id, client]) => ({
        id,
        userId: client.userId,
        connected: client.socket.connected,
      }));
  }
}
