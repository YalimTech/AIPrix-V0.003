import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsEnum } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsEnum(['active', 'inactive'], {
    message: 'El estado debe ser active o inactive',
  })
  @IsOptional()
  status?: string;
}
