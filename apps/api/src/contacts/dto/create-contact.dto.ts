import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsArray,
  IsObject,
} from 'class-validator';

export enum ContactStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DO_NOT_CALL = 'do_not_call',
  BLOCKED = 'blocked',
}

export enum ContactSource {
  MANUAL = 'manual',
  IMPORT = 'import',
  API = 'api',
  WEBHOOK = 'webhook',
}

export class CreateContactDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus = ContactStatus.ACTIVE;

  @IsOptional()
  @IsEnum(ContactSource)
  source?: ContactSource = ContactSource.MANUAL;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[] = [];

  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;

  @IsOptional()
  @IsString()
  notes?: string;
}
