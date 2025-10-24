import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WebSocketGateway } from './websocket.gateway';
import { WebSocketService } from './websocket.service';

describe('WebSocketGateway', () => {
  let gateway: WebSocketGateway;
  let _jwtService: JwtService;
  let _configService: ConfigService;

  const mockJwtService = {
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockWebSocketService = {
    // Mock methods as needed
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebSocketGateway,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: WebSocketService,
          useValue: mockWebSocketService,
        },
      ],
    }).compile();

    gateway = module.get<WebSocketGateway>(WebSocketGateway);
    _jwtService = module.get<JwtService>(JwtService);
    _configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should handle connection without token', async () => {
      const mockSocket = {
        id: 'test-id',
        handshake: {
          auth: {},
          headers: {},
        },
        join: jest.fn(),
        emit: jest.fn(),
      } as any;

      await gateway.handleConnection(mockSocket);

      expect(mockSocket.join).toHaveBeenCalledWith('general');
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'connected',
        expect.objectContaining({
          message: 'Conectado al servidor WebSocket',
          authenticated: false,
        }),
      );
    });

    it('should handle connection with valid token', async () => {
      const mockToken = 'valid-token';
      const mockPayload = { sub: 'user-id', accountId: 'account-id' };

      mockJwtService.verify.mockReturnValue(mockPayload);

      const mockSocket = {
        id: 'test-id',
        handshake: {
          auth: { token: mockToken },
          headers: {},
        },
        join: jest.fn(),
        emit: jest.fn(),
      } as any;

      await gateway.handleConnection(mockSocket);

      expect(mockJwtService.verify).toHaveBeenCalledWith(mockToken);
      expect(mockSocket.join).toHaveBeenCalledWith('account:account-id');
      expect(mockSocket.join).toHaveBeenCalledWith('user:user-id');
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'connected',
        expect.objectContaining({
          authenticated: true,
        }),
      );
    });

    it('should disconnect client with invalid token', async () => {
      const mockToken = 'invalid-token';

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const mockSocket = {
        id: 'test-id',
        handshake: {
          auth: { token: mockToken },
          headers: {},
        },
        disconnect: jest.fn(),
      } as any;

      await gateway.handleConnection(mockSocket);

      expect(mockSocket.disconnect).toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should remove client from connected clients', async () => {
      const mockSocket = {
        id: 'test-id',
      } as any;

      // Add client to connected clients
      (gateway as any).connectedClients.set('test-id', { socket: mockSocket });

      await gateway.handleDisconnect(mockSocket);

      expect((gateway as any).connectedClients.has('test-id')).toBe(false);
    });
  });

  describe('notifyCallStatus', () => {
    it('should emit call status update to account', () => {
      const mockServer = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      };
      (gateway as any).server = mockServer;

      gateway.notifyCallStatus('account-id', 'call-id', 'completed', {
        duration: 120,
      });

      expect(mockServer.to).toHaveBeenCalledWith('account:account-id');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'call_status_update',
        expect.objectContaining({
          callId: 'call-id',
          status: 'completed',
          duration: 120,
          timestamp: expect.any(String),
        }),
      );
    });
  });

  describe('getConnectedClients', () => {
    it('should return connected clients information', () => {
      const mockSocket = {
        id: 'test-id',
        connected: true,
      } as any;

      (gateway as any).connectedClients.set('test-id', {
        socket: mockSocket,
        userId: 'user-id',
        accountId: 'account-id',
      });

      const result = gateway.getConnectedClients();

      expect(result).toEqual([
        {
          id: 'test-id',
          userId: 'user-id',
          accountId: 'account-id',
          connected: true,
        },
      ]);
    });
  });
});
