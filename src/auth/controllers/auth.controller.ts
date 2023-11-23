import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthDTO } from 'src/auth/dtos/auth.dto';
import { AuthService } from 'src/auth/services/auth.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-up')
  async signUp(@Body() authDto: AuthDTO) {
    return this.authService.signUpUser(authDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  async signIn(@Body() authDto: AuthDTO) {
    return this.authService.signInUser(authDto);
  }

  // @UseGuards(LocalAuthGuard)
  // @Post('login')
  // login(@Body() authDto: AuthDTO) {
  //   return this.authService.login(authDto);
  // }
}
