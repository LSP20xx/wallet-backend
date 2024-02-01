import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { SignUpDTO } from 'apps/billete/src/auth/dtos/sign-up.dto';
import { AuthService } from 'apps/billete/src/auth/services/auth.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { SignInDTO } from '../dtos/sign-in.dto';
import { AuthGuard } from '@nestjs/passport';
import { CheckAuthDataDTO } from '../dtos/check-auth-data.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-up')
  async signUp(@Body() signUpDTO: SignUpDTO) {
    return this.authService.signUpUser(signUpDTO);
  }

  @Post('check-auth-data')
  async checkAuthData(@Body() authData: CheckAuthDataDTO) {
    return this.authService.checkAuthData(authData);
  }

  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  async signIn(@Body() signInDTO: SignInDTO) {
    return this.authService.signInUser(signInDTO);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async googleAuth(@Req() _req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req) {
    return this.authService.googleLogin(req);
  }

  // @UseGuards(LocalAuthGuard)
  // @Post('login')
  // login(@Body() authDto: AuthDTO) {
  //   return this.authService.login(authDto);
  // }
}
