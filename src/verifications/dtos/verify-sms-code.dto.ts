import { IsNotEmpty, IsString, IsPhoneNumber } from 'class-validator';

export class VerifySmsCodeDto {
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber()
  phoneNumber: string;
}
