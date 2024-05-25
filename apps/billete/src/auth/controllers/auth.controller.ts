import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
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
  @Post('accept-terms-and-conditions')
  async acceptTermsAndConditions(@Body('userId') userId: string) {
    if (!userId) {
      throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
    }
    console.log('llega?');
    return this.authService.acceptTermsAndConditions(userId);
  }

  @Post('update-personal-information')
  async updatePersonalInformation(
    @Body('userId') userId: string,
    @Body('completeName') completeName: string,
    @Body('dateOfBirth') dateOfBirth: string,
  ) {
    if (!userId) {
      throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
    }
    if (!completeName) {
      throw new HttpException('First name is required', HttpStatus.BAD_REQUEST);
    }
    if (!dateOfBirth) {
      throw new HttpException(
        'Date of birth is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
    const match = dateOfBirth.match(dateRegex);
    if (!match) {
      throw new HttpException('Invalid date format', HttpStatus.BAD_REQUEST);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, day, month, year] = match;
    const date = new Date(`${year}-${month}-${day}`);
    if (isNaN(date.getTime())) {
      throw new HttpException('Invalid date', HttpStatus.BAD_REQUEST);
    }

    console.log('Updating personal information for user:', userId);

    return this.authService.updatePersonalInformation(userId, {
      completeName,
      dateOfBirth: date,
    });
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
