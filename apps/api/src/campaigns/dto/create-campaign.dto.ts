import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsUUID,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export enum CampaignType {
  OUTBOUND = 'outbound',
  INBOUND = 'inbound',
  FOLLOW_UP = 'follow_up',
  SURVEY = 'survey',
}

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class CreateCampaignDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  agentId: string;

  @IsUUID()
  contactListId: string;

  @IsEnum(CampaignType)
  type: CampaignType;

  @IsOptional()
  @IsDateString()
  scheduledStartDate?: Date;

  @IsOptional()
  @IsDateString()
  scheduledEndDate?: Date;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  maxRetries?: number = 3;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3600)
  retryDelayMinutes?: number = 30;

  @IsOptional()
  @IsString()
  timezone?: string = 'America/Mexico_City';

  @IsOptional()
  @IsString()
  scheduleConfig?: string; // JSON string con configuración de horarios

  @IsOptional()
  @IsString()
  webhookUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
