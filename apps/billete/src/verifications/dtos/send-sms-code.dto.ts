import { IsNotEmpty, IsString } from 'class-validator';

export class SendVerificationDto {
  @IsNotEmpty()
  @IsString()
  to: string;
}
