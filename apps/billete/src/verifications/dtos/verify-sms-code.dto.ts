import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyCodeDto {
  @IsNotEmpty()
  @IsString()
  to: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  code: string;
}
