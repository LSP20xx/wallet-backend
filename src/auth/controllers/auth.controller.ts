import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SignUpDTO } from 'src/auth/dtos/sign-up.dto';
import { AuthService } from 'src/auth/services/auth.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { SignInDTO } from '../dtos/sign-in.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-up')
  async signUp(@Body() signUpDTO: SignUpDTO) {
    return this.authService.signUpUser(signUpDTO);
  }

  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  async signIn(@Body() signInDTO: SignInDTO) {
    return this.authService.signInUser(signInDTO);
  }

  // @UseGuards(LocalAuthGuard)
  // @Post('login')
  // login(@Body() authDto: AuthDTO) {
  //   return this.authService.login(authDto);
  // }
}
