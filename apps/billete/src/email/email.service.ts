import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
  }

  async sendMail(
    to: string,
    subject: string,
    template: string,
    context: any,
  ): Promise<void> {
    const templatePath = join(
      __dirname,
      '..',
      '..',
      '..',
      'templates',
      `${template}.hbs`,
    );
    const templateSource = readFileSync(templatePath, 'utf-8');
    const compiledTemplate = handlebars.compile(templateSource);

    const html = compiledTemplate(context);

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: to,
      subject: subject,
      html: html,
    };

    console.log('Sending email: ', mailOptions);

    const result = await this.transporter.sendMail(mailOptions);
    console.log('Email sent: ', result);
  }
}
