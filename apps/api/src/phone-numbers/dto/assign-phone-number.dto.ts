import { IsString, IsNotEmpty } from 'class-validator';

export class AssignPhoneNumberDto {
  @IsString()
  @IsNotEmpty()
  agentId: string;
}
