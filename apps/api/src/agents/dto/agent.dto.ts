import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsObject,
  IsDateString,
} from 'class-validator';

export class AgentDto {
  @IsString()
  id: string;

  @IsString()
  accountId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['inbound', 'outbound'])
  type: string;

  @IsEnum(['active', 'inactive', 'testing'])
  status: string;

  @IsEnum(['openai', 'gemini'])
  llmProvider: string;

  @IsString()
  llmModel: string;

  @IsOptional()
  @IsString()
  fallbackProvider?: string;

  @IsNumber()
  maxTokens: number;

  @IsString()
  voiceName: string;

  @IsNumber()
  initialMessageDelay: number;

  @IsOptional()
  @IsString()
  preMadePrompt?: string;

  @IsBoolean()
  vmDetection: boolean;

  @IsBoolean()
  doubleCall: boolean;

  @IsOptional()
  @IsObject()
  webhookConfig?: Record<string, any>;

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  updatedAt: Date;
}
