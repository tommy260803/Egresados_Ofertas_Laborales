import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST'),
      port: this.config.get('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASS'),
      },
    });
  }

  async enviarCorreo(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Sistema Egresados" <${this.config.get('SMTP_USER')}>`,
        to,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error(`Error enviando email a ${to}: ${error.message}`);
    }
  }
}