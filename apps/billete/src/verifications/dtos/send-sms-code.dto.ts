import { IsNotEmpty, IsString, IsPhoneNumber } from 'class-validator';

export class SendVerificationDto {
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber()
  to: string;

  @IsNotEmpty()
  @IsString()
  body: string;
}
