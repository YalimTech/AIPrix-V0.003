import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
    MinLength,
} from 'class-validator';

export class CreateAgentDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  openingMessage?: string;

  @IsEnum(['inbound', 'outbound'])
  type: string;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'testing'])
  status?: string = 'inactive';

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsEnum(['openai', 'gemini'])
  llmProvider?: string = 'openai';

  @IsOptional()
  @IsString()
  @MaxLength(100)
  llmModel?: string = 'gpt-4';

  @IsOptional()
  @IsString()
  @MaxLength(50)
  fallbackProvider?: string;

  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(8000)
  maxTokens?: number = 1000;

  @IsString()
  @MaxLength(100)
  voiceName: string;

  @IsOptional()
  @IsNumber()
  @Min(1000)
  @Max(10000)
  initialMessageDelay?: number = 2000;

  @IsOptional()
  @IsString()
  @MaxLength(1000000)
  preMadePrompt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000000)
  systemPrompt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  elevenLabsAgentId?: string;

  @IsOptional()
  @IsBoolean()
  vmDetection?: boolean = false;

  @IsOptional()
  @IsBoolean()
  doubleCall?: boolean = false;

  @IsOptional()
  @IsObject()
  webhookConfig?: Record<string, any>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number = 0.7;

  @IsOptional()
  @IsBoolean()
  calendarBookingEnabled?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  calendarBookingProvider?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  calendarBookingId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  calendarBookingTimezone?: string;

  @IsOptional()
  @IsBoolean()
  interruptSensitivity?: boolean = false;

  @IsOptional()
  @IsBoolean()
  responseSpeed?: boolean = true;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  webhookUrl?: string;

  @IsOptional()
  @IsString()
  callTransferType?: string;

  @IsOptional()
  @IsString()
  callTransferPhoneNumber?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  callTransferKeywords?: string[];

  @IsOptional()
  @IsBoolean()
  callTransferBusinessHours?: boolean;
}
