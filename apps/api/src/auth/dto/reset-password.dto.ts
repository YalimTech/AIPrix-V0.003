import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  @IsString({ message: 'Token debe ser una cadena' })
  @IsNotEmpty({ message: 'Token es requerido' })
  token: string;

  @IsString({ message: 'Contraseña debe ser una cadena' })
  @IsNotEmpty({ message: 'Contraseña es requerida' })
  @MinLength(8, { message: 'Contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial',
  })
  newPassword: string;
}
