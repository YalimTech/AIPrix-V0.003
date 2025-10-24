import { IsEmail, IsOptional, IsString } from 'class-validator';

export class AuthenticationCredentialsDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class DiagnosticDataDto {
  @IsOptional()
  @IsString()
  test?: string;

  @IsOptional()
  @IsString()
  data?: string;
}
