import { Body, Controller, Post } from '@nestjs/common';
import { AuthDTO } from 'src/auth/dtos/auth.dto';
import { AuthService } from 'src/auth/services/auth/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-up')
  async signUp(@Body() authDto: AuthDTO) {
    return this.authService.signUpUser(authDto);
  }

  @Post('sign-in')
  async signIn(@Body() authDto: AuthDTO) {
    return this.authService.signInUser(authDto);
  }
}
