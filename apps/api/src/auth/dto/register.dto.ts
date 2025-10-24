import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Debe ser un email válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @IsString({ message: 'La contraseña debe ser una cadena' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;

  @IsString({ message: 'El nombre debe ser una cadena' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  firstName: string;

  @IsString({ message: 'El apellido debe ser una cadena' })
  @IsOptional()
  lastName?: string;

  @IsUUID('4', { message: 'El accountId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El accountId es requerido' })
  accountId: string;

  @IsString({ message: 'El rol debe ser una cadena' })
  @IsOptional()
  role?: string;
}
