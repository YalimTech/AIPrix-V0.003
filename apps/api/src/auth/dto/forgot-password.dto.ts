import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Email debe ser válido' })
  @IsNotEmpty({ message: 'Email es requerido' })
  email: string;
}
