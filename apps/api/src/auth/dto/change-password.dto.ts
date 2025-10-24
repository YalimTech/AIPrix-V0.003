import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString({ message: 'La contraseña actual debe ser una cadena de texto' })
  currentPassword: string;

  @IsString({ message: 'La nueva contraseña debe ser una cadena de texto' })
  @MinLength(8, {
    message: 'La nueva contraseña debe tener al menos 8 caracteres',
  })
  newPassword: string;
}
