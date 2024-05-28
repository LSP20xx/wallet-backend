import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseEnumPipe,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SignUpDTO } from 'apps/billete/src/auth/dtos/sign-up.dto';
import { AuthService } from 'apps/billete/src/auth/services/auth.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { SignInDTO } from '../dtos/sign-in.dto';
import { AuthGuard } from '@nestjs/passport';
import { CheckAuthDataDTO } from '../dtos/check-auth-data.dto';
import { DocumentUploadService } from '../../document-upload/document-upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentType } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(
    private documentUploadService: DocumentUploadService,
    private authService: AuthService,
  ) {}

  @Post('sign-up')
  async signUp(@Body() signUpDTO: SignUpDTO) {
    return this.authService.signUpUser(signUpDTO);
  }

  @Post('check-auth-data')
  async checkAuthData(@Body() authData: CheckAuthDataDTO) {
    return this.authService.checkAuthData(authData);
  }

  @Get('get-kyc-token')
  async getKycToken(@Query('userId') userId: string) {
    try {
      console.log('llega?');
      return await this.authService.getKycToken(userId);
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Unable to get KYC token',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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

  @Post('update-user-document/:userId/:documentType')
  @UseInterceptors(FileInterceptor('file'))
  async updateUserDocument(
    @Param('userId') userId: string,
    @Param('documentType', new ParseEnumPipe(DocumentType))
    documentType: DocumentType,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!userId) {
      throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
    }
    if (!documentType) {
      throw new HttpException(
        'Document type is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!file) {
      throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
    }

    console.log('Updating user document for user:', userId);
    try {
      const fileUrl = await this.documentUploadService.uploadDocument(
        file,
        userId,
        documentType,
      );

      await this.authService.updateDocumentStatus(
        userId,
        documentType,
        fileUrl,
      );

      return {
        message: 'Document uploaded successfully',
        data: fileUrl,
      };
    } catch (error) {
      throw new HttpException(
        'Error updating user document',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
