import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Debe ser un email válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @IsString({ message: 'El nombre completo debe ser una cadena' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name: string;

  @IsString({ message: 'El nombre debe ser una cadena' })
  @IsOptional()
  firstName?: string;

  @IsString({ message: 'El apellido debe ser una cadena' })
  @IsOptional()
  lastName?: string;

  @IsString({ message: 'El accountId debe ser una cadena' })
  @IsNotEmpty({ message: 'El accountId es requerido' })
  accountId: string;

  @IsEnum(['admin', 'user', 'view-only'], {
    message: 'El rol debe ser admin, user o view-only',
  })
  @IsOptional()
  role?: string;

  @IsEnum(['active', 'inactive'], {
    message: 'El status debe ser active o inactive',
  })
  @IsOptional()
  status?: string;

  @IsString({ message: 'La contraseña debe ser una cadena' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;
}
