import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { WebSocketGateway } from '../websocket/websocket.gateway';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;
  let _prismaService: PrismaService;
  let _configService: ConfigService;
  let _webSocketGateway: WebSocketGateway;

  const mockPrismaService = {
    $queryRaw: jest.fn(),
    account: {
      count: jest.fn(),
    },
    accountElevenLabsConfig: {
      findMany: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockWebSocketGateway = {
    getConnectedClients: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: WebSocketGateway,
          useValue: mockWebSocketGateway,
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    _prismaService = module.get<PrismaService>(PrismaService);
    _configService = module.get<ConfigService>(ConfigService);
    _webSocketGateway = module.get<WebSocketGateway>(WebSocketGateway);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBasicHealth', () => {
    it('should return basic health information', async () => {
      const result = await service.getBasicHealth();

      expect(result).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
        service: 'prixagent-api',
        version: '1.0.0',
        uptime: expect.any(Number),
      });
    });
  });

  describe('getDatabaseHealth', () => {
    it('should return healthy database status', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
      mockPrismaService.account.count.mockResolvedValue(5);

      const result = await service.getDatabaseHealth();

      expect(result.status).toBe('healthy');
      expect(result.responseTime).toBeDefined();
      expect(result.details).toEqual({
        accountCount: 5,
        connectionPool: 'active',
      });
    });

    it('should return unhealthy database status on error', async () => {
      mockPrismaService.$queryRaw.mockRejectedValue(
        new Error('Connection failed'),
      );

      const result = await service.getDatabaseHealth();

      expect(result.status).toBe('unhealthy');
      expect(result.error).toBe('Connection failed');
    });
  });

  describe('getExternalServicesHealth', () => {
    it('should return healthy status when all services are configured', async () => {
      mockConfigService.get
        .mockReturnValueOnce('openai-key') // OPENAI_API_KEY
        .mockReturnValueOnce('gemini-key') // GEMINI_API_KEY
        .mockReturnValueOnce('twilio-sid') // TWILIO_ACCOUNT_SID
        .mockReturnValueOnce('twilio-token') // TWILIO_AUTH_TOKEN
        .mockReturnValueOnce('deepgram-key'); // DEEPGRAM_API_KEY

      // Mock ElevenLabs configs en la base de datos
      mockPrismaService.accountElevenLabsConfig.findMany.mockResolvedValue([
        { id: '1', accountId: 'test-account', apiKey: 'elevenlabs-key' },
      ]);

      const result = await service.getExternalServicesHealth();

      expect(result.status).toBe('healthy');
      expect(result.details.services).toEqual({
        openai: true,
        gemini: true,
        twilio: true,
        elevenlabs: true,
        deepgram: true,
      });
      expect(result.details.healthyCount).toBe(5);
      expect(result.details.totalCount).toBe(5);
    });

    it('should return degraded status when some services are missing', async () => {
      mockConfigService.get
        .mockReturnValueOnce('openai-key') // OPENAI_API_KEY
        .mockReturnValueOnce(null) // GEMINI_API_KEY
        .mockReturnValueOnce('twilio-sid') // TWILIO_ACCOUNT_SID
        .mockReturnValueOnce('twilio-token') // TWILIO_AUTH_TOKEN
        .mockReturnValueOnce('deepgram-key'); // DEEPGRAM_API_KEY

      // Mock ElevenLabs sin configuraciones (sin API keys)
      mockPrismaService.accountElevenLabsConfig.findMany.mockResolvedValue([]);

      const result = await service.getExternalServicesHealth();

      expect(result.status).toBe('degraded');
      expect(result.details.healthyCount).toBe(3);
      expect(result.details.totalCount).toBe(5);
    });

    it('should return unhealthy status when no services are configured', async () => {
      mockConfigService.get.mockReturnValue(null);

      const result = await service.getExternalServicesHealth();

      expect(result.status).toBe('unhealthy');
      expect(result.details.healthyCount).toBe(0);
    });
  });

  describe('getReadiness', () => {
    it('should return ready status when critical checks pass', async () => {
      // Mock successful database check
      mockPrismaService.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
      mockPrismaService.account.count.mockResolvedValue(5);

      const result = await service.getReadiness();

      expect(result.status).toBe('ready');
      expect(result.checks).toHaveLength(2);
      expect(result.checks.every((check) => check.status === 'healthy')).toBe(
        true,
      );
    });

    it('should return not ready status when critical checks fail', async () => {
      mockPrismaService.$queryRaw.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await service.getReadiness();

      expect(result.status).toBe('not ready');
      expect(result.checks.some((check) => check.status === 'unhealthy')).toBe(
        true,
      );
    });
  });

  describe('getLiveness', () => {
    it('should return alive status with system information', async () => {
      const result = await service.getLiveness();

      expect(result.status).toBe('alive');
      expect(result.uptime).toBeDefined();
      expect(result.memory).toBeDefined();
      expect(result.memory.used).toBeDefined();
      expect(result.memory.total).toBeDefined();
      expect(result.memory.percentage).toBeDefined();
    });
  });

  describe('getSystemMetrics', () => {
    it('should return system metrics', async () => {
      mockWebSocketGateway.getConnectedClients.mockReturnValue([
        { id: 'client-1', connected: true },
        { id: 'client-2', connected: true },
      ]);

      const result = await service.getSystemMetrics();

      expect(result.memory).toBeDefined();
      expect(result.disk).toBeDefined();
      expect(result.connections).toEqual({
        active: 2,
        total: 2,
        websocket: 2,
      });
    });
  });
});
