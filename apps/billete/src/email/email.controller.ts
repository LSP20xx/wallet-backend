import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Post('send-email')
  async sendEmail(
    @Body() emailData: { to: string; subject: string; template: string },
  ) {
    await this.emailService.sendMail(
      emailData.to,
      emailData.subject,
      emailData.template,
      {},
    );
  }
}
