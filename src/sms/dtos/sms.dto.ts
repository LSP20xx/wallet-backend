import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSmsDto {
  @IsString()
  @IsNotEmpty()
  to: string;
  @IsString()
  @IsNotEmpty()
  body: string;
}
