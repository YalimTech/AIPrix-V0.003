import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateElevenLabsConfigDto {
  @IsString()
  @IsNotEmpty()
  apiKey: string;
}
