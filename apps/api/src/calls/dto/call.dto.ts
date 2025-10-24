import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export enum CallStatus {
  INITIATED = 'initiated',
  RINGING = 'ringing',
  ANSWERED = 'answered',
  COMPLETED = 'completed',
  FAILED = 'failed',
  BUSY = 'busy',
  NO_ANSWER = 'no_answer',
  CANCELLED = 'cancelled',
}

export enum CallDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

export enum CallType {
  CAMPAIGN = 'campaign',
  MANUAL = 'manual',
  FOLLOW_UP = 'follow_up',
  TEST = 'test',
}

export class CallDto {
  id: string;
  accountId: string;
  campaignId?: string;
  agentId: string;
  contactId?: string;
  phoneNumberId?: string;
  phoneNumber: string;
  contactPhoneNumber?: string; // Número de teléfono del contacto obtenido desde ElevenLabs
  status: CallStatus;
  direction: CallDirection;
  type: CallType;
  duration?: number;
  success?: boolean;
  recordingUrl?: string;
  transcript?: string;
  notes?: string;
  config?: Record<string, any>;
  initiatedAt?: Date;
  answeredAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Relaciones
  agent?: {
    id: string;
    name: string;
    voiceName: string;
  };
  contact?: {
    id: string;
    name: string;
    lastName: string;
    phone: string;
  };
  campaign?: {
    id: string;
    name: string;
    status: string;
  };
  phoneNumberRef?: {
    id: string;
    number: string;
  };
  conversationAnalyses?: ConversationAnalysisDto[];
}

export class ConversationAnalysisDto {
  id: string;
  accountId: string;
  callId: string;
  transcript: string;
  sentiment: string;
  sentimentScore?: number;
  intent: string;
  keyTopics?: string[];
  actionItems?: string[];
  summary?: string;
  createdAt: Date;
}

export class CallStatsDto {
  totalCalls: number;
  completedCalls: number;
  successfulCalls: number;
  failedCalls: number;
  averageDuration: number;
  successRate: number;
  completionRate: number;
  callsByStatus: Record<string, number>;
  callsByType: Record<string, number>;
  callsByDirection: Record<string, number>;
}

export class CallFilterDto {
  @IsOptional()
  @IsEnum(CallStatus)
  status?: CallStatus;

  @IsOptional()
  @IsEnum(CallType)
  type?: CallType;

  @IsOptional()
  @IsEnum(CallDirection)
  direction?: CallDirection;

  @IsOptional()
  @IsString()
  agentId?: string;

  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsOptional()
  @IsString()
  contactId?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsBoolean()
  success?: boolean;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;
}

export class CallNotesDto {
  @IsString()
  notes: string;
}
