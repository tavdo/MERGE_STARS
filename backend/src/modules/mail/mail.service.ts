import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly log = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  private getTransporter(): Transporter | null {
    if (this.transporter) return this.transporter;

    const host = process.env.SMTP_HOST?.trim();
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim();

    if (!host || !user || !pass) {
      this.log.warn('SMTP not configured — emails will be logged only');
      return null;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    return this.transporter;
  }

  private fromAddress() {
    return process.env.MAIL_FROM ?? 'MERGE STARS <noreply@mergestars.com>';
  }

  async send(to: string, subject: string, html: string, text: string) {
    const transport = this.getTransporter();
    if (!transport) {
      this.log.log(`[MAIL-DEV] To: ${to} | ${subject}\n${text}`);
      return;
    }
    await transport.sendMail({
      from: this.fromAddress(),
      to,
      subject,
      html,
      text,
    });
  }

  async sendVerificationCode(email: string, code: string) {
    const subject = 'MERGE STARS — Email verification code';
    const text = `Your verification code is: ${code}\n\nValid for 15 minutes.`;
    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#080808;color:#fff;border:1px solid #c9a84c">
        <h2 style="color:#c9a84c;letter-spacing:0.2em;font-size:14px">MERGE STARS</h2>
        <p>Your email verification code:</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:0.3em;color:#f5d78e">${code}</p>
        <p style="color:#888;font-size:12px">Valid for 15 minutes.</p>
      </div>`;
    await this.send(email, subject, html, text);
  }

  async sendPasswordReset(email: string, resetUrl: string) {
    const subject = 'MERGE STARS — Reset your password';
    const text = `Reset your password: ${resetUrl}\n\nValid for 1 hour. If you did not request this, ignore this email.`;
    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#080808;color:#fff;border:1px solid #c9a84c">
        <h2 style="color:#c9a84c;letter-spacing:0.2em;font-size:14px">MERGE STARS</h2>
        <p>Click to reset your password:</p>
        <p><a href="${resetUrl}" style="color:#f5d78e">${resetUrl}</a></p>
        <p style="color:#888;font-size:12px">Valid for 1 hour.</p>
      </div>`;
    await this.send(email, subject, html, text);
  }
}
