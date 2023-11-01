import { IsNotEmpty, IsPhoneNumber, IsString, Length } from 'class-validator';

export class VerifySmsCodeDto {
  @IsPhoneNumber()
  @IsNotEmpty()
  @IsString()
  to: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  code: string;
}
