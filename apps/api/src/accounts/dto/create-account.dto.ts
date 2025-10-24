import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateAccountDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  slug: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  timezone?: string = 'UTC';

  @IsOptional()
  @IsEnum(['active', 'suspended', 'cancelled'])
  status?: string = 'active';

  @IsOptional()
  @IsEnum(['basic', 'pro', 'enterprise'])
  subscriptionPlan?: string = 'basic';

  @IsOptional()
  @IsEmail()
  billingEmail?: string;
}
