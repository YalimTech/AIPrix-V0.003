import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ExportImportService } from './export-import.service';

describe('ExportImportService', () => {
  let service: ExportImportService;
  let _prismaService: PrismaService;
  let _configService: ConfigService;

  const mockPrismaService = {
    contact: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    call: {
      findMany: jest.fn(),
    },
    campaign: {
      findMany: jest.fn(),
    },
    agent: {
      findMany: jest.fn(),
    },
    account: {
      findUnique: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportImportService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ExportImportService>(ExportImportService);
    _prismaService = module.get<PrismaService>(PrismaService);
    _configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('exportContacts', () => {
    it('should export contacts in CSV format', async () => {
      const mockContacts = [
        {
          id: 'contact-1',
          name: 'John',
          lastName: 'Doe',
          phone: '+1234567890',
          email: 'john@example.com',
          company: 'Test Company',
          position: 'Manager',
          status: 'active',
          source: 'import',
          tags: ['tag1', 'tag2'],
          notes: 'Test notes',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        },
      ];

      mockPrismaService.contact.findMany.mockResolvedValue(mockContacts);

      const result = await service.exportContacts('account-id', {
        format: 'csv',
        includeHeaders: true,
      });

      expect(result).toBeInstanceOf(Buffer);
      expect(mockPrismaService.contact.findMany).toHaveBeenCalledWith({
        where: { accountId: 'account-id' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should apply date range filters', async () => {
      const dateFrom = new Date('2023-01-01');
      const dateTo = new Date('2023-12-31');

      mockPrismaService.contact.findMany.mockResolvedValue([]);

      await service.exportContacts('account-id', {
        format: 'csv',
        dateRange: { from: dateFrom, to: dateTo },
      });

      expect(mockPrismaService.contact.findMany).toHaveBeenCalledWith({
        where: {
          accountId: 'account-id',
          createdAt: {
            gte: dateFrom,
            lte: dateTo,
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should apply additional filters', async () => {
      mockPrismaService.contact.findMany.mockResolvedValue([]);

      await service.exportContacts('account-id', {
        format: 'csv',
        filters: { status: 'active', source: 'import' },
      });

      expect(mockPrismaService.contact.findMany).toHaveBeenCalledWith({
        where: {
          accountId: 'account-id',
          status: 'active',
          source: 'import',
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('importContacts', () => {
    it('should import contacts successfully', async () => {
      const mockFileBuffer = Buffer.from(
        'nombre,teléfono,email\nJohn,+1234567890,john@example.com',
      );

      mockPrismaService.contact.findFirst.mockResolvedValue(null);
      mockPrismaService.contact.create.mockResolvedValue({});

      const result = await service.importContacts(
        'account-id',
        mockFileBuffer,
        'test.csv',
        'Test List',
      );

      expect(result.success).toBe(1);
      expect(result.errors).toBe(0);
      expect(result.total).toBe(1);
      expect(mockPrismaService.contact.create).toHaveBeenCalledWith({
        data: {
          accountId: 'account-id',
          name: 'John',
          lastName: null,
          phone: '+1234567890',
          email: 'john@example.com',
          company: null,
          position: null,
          status: 'active',
          source: 'import',
          tags: [],
          notes: null,
        },
      });
    });

    it('should update existing contact', async () => {
      const mockFileBuffer = Buffer.from(
        'nombre,teléfono,email\nJohn,+1234567890,john@example.com',
      );
      const existingContact = { id: 'existing-id' };

      mockPrismaService.contact.findFirst.mockResolvedValue(existingContact);
      mockPrismaService.contact.update.mockResolvedValue({});

      const result = await service.importContacts(
        'account-id',
        mockFileBuffer,
        'test.csv',
        'Test List',
      );

      expect(result.success).toBe(1);
      expect(result.errors).toBe(0);
      expect(mockPrismaService.contact.update).toHaveBeenCalledWith({
        where: { id: 'existing-id' },
        data: expect.objectContaining({
          name: 'John',
          phone: '+1234567890',
          email: 'john@example.com',
        }),
      });
    });

    it('should handle validation errors', async () => {
      const mockFileBuffer = Buffer.from(
        'nombre,teléfono,email\n,+1234567890,john@example.com',
      );

      mockPrismaService.contact.findFirst.mockResolvedValue(null);

      const result = await service.importContacts(
        'account-id',
        mockFileBuffer,
        'test.csv',
        'Test List',
      );

      expect(result.success).toBe(0);
      expect(result.errors).toBe(1);
      expect(result.errorsList[0].error).toContain(
        'Nombre y teléfono son requeridos',
      );
    });
  });

  describe('createBackup', () => {
    it('should create backup successfully', async () => {
      const mockTenantData = {
        id: 'account-id',
        name: 'Test Tenant',
        users: [],
        agents: [],
        campaigns: [],
        contacts: [],
        contactLists: [],
        phoneNumbers: [],
        calls: [],
        knowledgeBase: [],
      };

      mockPrismaService.account.findUnique.mockResolvedValue(mockTenantData);

      const result = await service.createBackup('account-id');

      expect(result).toBeInstanceOf(Buffer);
      const backupData = JSON.parse(result.toString());
      expect(backupData.account.id).toBe('account-id');
      expect(backupData.exportDate).toBeDefined();
      expect(backupData.version).toBe('1.0');
    });
  });
});
