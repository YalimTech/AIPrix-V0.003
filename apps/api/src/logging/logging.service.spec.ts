import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LoggingService } from './logging.service';

describe('LoggingService', () => {
  let service: LoggingService;
  let _configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggingService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<LoggingService>(LoggingService);
    _configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('basic logging methods', () => {
    it('should log info message', () => {
      const logSpy = jest
        .spyOn(service as any, 'logger', 'get')
        .mockReturnValue({
          info: jest.fn(),
        });

      service.log('Test message', 'TestContext');

      expect(logSpy).toHaveBeenCalled();
    });

    it('should log error message with trace', () => {
      const logSpy = jest
        .spyOn(service as any, 'logger', 'get')
        .mockReturnValue({
          error: jest.fn(),
        });

      service.error('Test error', 'Error trace', 'TestContext');

      expect(logSpy).toHaveBeenCalled();
    });

    it('should log warning message', () => {
      const logSpy = jest
        .spyOn(service as any, 'logger', 'get')
        .mockReturnValue({
          warn: jest.fn(),
        });

      service.warn('Test warning', 'TestContext');

      expect(logSpy).toHaveBeenCalled();
    });

    it('should log debug message', () => {
      const logSpy = jest
        .spyOn(service as any, 'logger', 'get')
        .mockReturnValue({
          debug: jest.fn(),
        });

      service.debug('Test debug', 'TestContext');

      expect(logSpy).toHaveBeenCalled();
    });
  });

  describe('specialized logging methods', () => {
    it('should log HTTP request', () => {
      const logSpy = jest
        .spyOn(service as any, 'logger', 'get')
        .mockReturnValue({
          info: jest.fn(),
        });

      service.logRequest('GET', '/api/test', 200, 150, {
        requestId: 'req-123',
        accountId: 'account-123',
      });

      expect(logSpy).toHaveBeenCalled();
    });

    it('should log database query', () => {
      const logSpy = jest
        .spyOn(service as any, 'logger', 'get')
        .mockReturnValue({
          debug: jest.fn(),
        });

      service.logDatabaseQuery('SELECT * FROM users', 50, {
        operation: 'findMany',
        model: 'User',
      });

      expect(logSpy).toHaveBeenCalled();
    });

    it('should log call event', () => {
      const logSpy = jest
        .spyOn(service as any, 'logger', 'get')
        .mockReturnValue({
          info: jest.fn(),
        });

      service.logCallEvent('call_started', 'call-123', {
        accountId: 'account-123',
        agentId: 'agent-123',
      });

      expect(logSpy).toHaveBeenCalled();
    });

    it('should log campaign event', () => {
      const logSpy = jest
        .spyOn(service as any, 'logger', 'get')
        .mockReturnValue({
          info: jest.fn(),
        });

      service.logCampaignEvent('campaign_started', 'campaign-123', {
        accountId: 'account-123',
      });

      expect(logSpy).toHaveBeenCalled();
    });

    it('should log agent event', () => {
      const logSpy = jest
        .spyOn(service as any, 'logger', 'get')
        .mockReturnValue({
          info: jest.fn(),
        });

      service.logAgentEvent('agent_updated', 'agent-123', {
        accountId: 'account-123',
      });

      expect(logSpy).toHaveBeenCalled();
    });

    it('should log WebSocket event', () => {
      const logSpy = jest
        .spyOn(service as any, 'logger', 'get')
        .mockReturnValue({
          debug: jest.fn(),
        });

      service.logWebSocketEvent('client_connected', 'client-123', {
        accountId: 'account-123',
      });

      expect(logSpy).toHaveBeenCalled();
    });

    it('should log external service call', () => {
      const logSpy = jest
        .spyOn(service as any, 'logger', 'get')
        .mockReturnValue({
          info: jest.fn(),
        });

      service.logExternalServiceCall(
        'openai',
        '/v1/chat/completions',
        200,
        1000,
        {
          accountId: 'account-123',
        },
      );

      expect(logSpy).toHaveBeenCalled();
    });

    it('should log security event', () => {
      const logSpy = jest
        .spyOn(service as any, 'logger', 'get')
        .mockReturnValue({
          warn: jest.fn(),
        });

      service.logSecurityEvent(
        'invalid_token',
        { ip: '192.168.1.1' },
        {
          accountId: 'account-123',
        },
      );

      expect(logSpy).toHaveBeenCalled();
    });

    it('should log performance metric', () => {
      const logSpy = jest
        .spyOn(service as any, 'logger', 'get')
        .mockReturnValue({
          info: jest.fn(),
        });

      service.logPerformanceMetric('response_time', 150, 'ms', {
        endpoint: '/api/test',
      });

      expect(logSpy).toHaveBeenCalled();
    });

    it('should log business event', () => {
      const logSpy = jest
        .spyOn(service as any, 'logger', 'get')
        .mockReturnValue({
          info: jest.fn(),
        });

      service.logBusinessEvent(
        'user_registered',
        { userId: 'user-123' },
        {
          accountId: 'account-123',
        },
      );

      expect(logSpy).toHaveBeenCalled();
    });
  });

  describe('utility methods', () => {
    it('should create child logger with context', () => {
      const childLogger = service.child({ accountId: 'account-123' });

      expect(childLogger).toBeInstanceOf(LoggingService);
    });

    it('should get current log level', () => {
      const logLevel = service.getLogLevel();

      expect(typeof logLevel).toBe('string');
    });

    it('should set log level', () => {
      service.setLogLevel('debug');

      // This would be tested by checking the internal logger level
      expect(service.getLogLevel()).toBe('debug');
    });

    it('should flush logs', async () => {
      const flushPromise = service.flush();

      expect(flushPromise).toBeInstanceOf(Promise);
      await expect(flushPromise).resolves.toBeUndefined();
    });
  });
});
