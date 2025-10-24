import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminLoginDto {
  @ApiProperty({
    description: 'Email del administrador',
    example: 'admin@prixagent.com',
  })
  @IsEmail({}, { message: 'Debe ser un email válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({
    description: 'Contraseña del administrador',
    example: 'AdminPassword123!',
    minLength: 8,
  })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;
}

export class AdminAuthResponseDto {
  @ApiProperty({
    description: 'Token JWT para el administrador',
  })
  token: string;

  @ApiProperty({
    description: 'Información del administrador',
  })
  admin: {
    id: string;
    email: string;
    role: string;
    isSystemAdmin: boolean;
    permissions: string[];
  };

  @ApiProperty({
    description: 'Fecha de expiración del token',
  })
  expiresAt: Date;
}
