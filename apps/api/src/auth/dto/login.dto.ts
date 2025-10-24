import { IsEmail, IsString, MinLength, IsNotEmpty, IsOptional } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Debe ser un email válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @IsString({ message: 'La contraseña debe ser una cadena' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;
}
