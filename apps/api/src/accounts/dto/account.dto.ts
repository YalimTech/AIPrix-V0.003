import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';

export class AccountDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  timezone: string;

  @IsEnum(['active', 'suspended', 'cancelled'])
  status: string;

  @IsEnum(['basic', 'pro', 'enterprise'])
  subscriptionPlan: string;

  @IsOptional()
  @IsEmail()
  billingEmail?: string;

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  updatedAt: Date;
}
