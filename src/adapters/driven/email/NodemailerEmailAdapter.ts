import { IEmailService } from '../../../application/ports/IEmailService';
import { injectable } from 'tsyringe';
import nodemailer from 'nodemailer';
import { EmailConfig, MailOptions } from '../../../types/email';
import { EmailServiceError } from '../../../utils/errors';

@injectable()
export class NodemailerEmailAdapter implements IEmailService {
  private transporter;

  constructor() {
    const emailConfig: EmailConfig = {
      host: process.env.EMAIL_HOST || '',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
      },
    };
    this.transporter = nodemailer.createTransport(emailConfig);
  }

  async sendToKindle(title: string, content: string, theme: string, recipientEmail: string): Promise<boolean> {
    try {
      const mailOptions: MailOptions = {
        from: process.env.EMAIL_USER || '',
        to: recipientEmail,
        subject: `[${theme}] - ${title}`,
        html: content,
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully to Kindle.');
      return true;
    } catch (error: any) {
      console.error('Error sending email to Kindle:', error);
      throw new EmailServiceError('Failed to send email to Kindle', error);
    }
  }
}
