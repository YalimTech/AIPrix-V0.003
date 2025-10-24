import { IsString, IsNotEmpty } from 'class-validator';

export class BuyPhoneNumberDto {
  @IsString()
  @IsNotEmpty()
  number: string;

  @IsString()
  @IsNotEmpty()
  country: string;
}
