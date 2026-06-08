import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly log = new Logger(MailService.name);
  private transporter: Transporter | null = null;
  private readonly sendTimeoutMs = Number(process.env.SMTP_TIMEOUT_MS ?? 15_000);

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
      connectionTimeout: this.sendTimeoutMs,
      greetingTimeout: this.sendTimeoutMs,
      socketTimeout: this.sendTimeoutMs,
    });
    return this.transporter;
  }

  /** Send without blocking the HTTP response (e.g. password reset). */
  sendInBackground(to: string, subject: string, html: string, text: string) {
    void this.send(to, subject, html, text).catch((err) => {
      this.log.error(`Background mail to ${to} failed: ${(err as Error).message}`);
    });
  }

  private fromAddress() {
    return process.env.MAIL_FROM ?? 'MERGE STARS <noreply@mergestars.com>';
  }

  isConfigured() {
    return !!(
      process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim()
    );
  }

  async send(to: string, subject: string, html: string, text: string) {
    const transport = this.getTransporter();
    if (!transport) {
      this.log.log(`[MAIL-DEV] To: ${to} | ${subject}\n${text}`);
      return;
    }

    const sendPromise = transport.sendMail({
      from: this.fromAddress(),
      to,
      subject,
      html,
      text,
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`SMTP timeout after ${this.sendTimeoutMs}ms`)), this.sendTimeoutMs);
    });

    try {
      await Promise.race([sendPromise, timeoutPromise]);
    } catch (err) {
      this.log.error(`Mail to ${to} failed: ${(err as Error).message}`);
      throw err;
    }
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
    this.sendInBackground(email, subject, html, text);
  }

  async sendApplicationReceived(email: string, name: string, appId: string) {
    const subject = 'MERGE STARS — Application received';
    const text = `Hello ${name},\n\nYour coin application ${appId} has been received and is under review.\n\nTrack status: https://mergestars.com/status`;
    const html = this.statusEmailHtml(
      'Application received',
      `Hello ${name},<br/><br/>Your coin application <strong>${appId}</strong> has been received and is now under review.`,
    );
    await this.send(email, subject, html, text);
  }

  async sendApplicationStatusUpdate(
    email: string,
    name: string,
    appId: string,
    status: string,
    note?: string,
  ) {
    const label = status.replace(/_/g, ' ').toUpperCase();
    const subject = `MERGE STARS — Application ${label}`;
    const noteLine = note ? `\n\nNote: ${note}` : '';
    const text = `Hello ${name},\n\nYour application ${appId} status is now: ${label}.${noteLine}\n\nTrack: https://mergestars.com/status`;
    const html = this.statusEmailHtml(
      `Status: ${label}`,
      `Hello ${name},<br/><br/>Application <strong>${appId}</strong> is now <strong>${label}</strong>.${note ? `<br/><br/>Note: ${note}` : ''}`,
    );
    await this.send(email, subject, html, text);
  }

  async sendKycDecision(email: string, name: string, kycStatus: string) {
    const label = kycStatus.toUpperCase();
    const subject = `MERGE STARS — KYC ${label}`;
    const text = `Hello ${name},\n\nYour KYC verification status is now: ${label}.`;
    const html = this.statusEmailHtml(
      `KYC ${label}`,
      `Hello ${name},<br/><br/>Your identity verification (KYC) status is now <strong>${label}</strong>.`,
    );
    await this.send(email, subject, html, text);
  }

  private statusEmailHtml(title: string, body: string) {
    return `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#080808;color:#fff;border:1px solid #c9a84c">
        <h2 style="color:#c9a84c;letter-spacing:0.2em;font-size:14px">MERGE STARS</h2>
        <h3 style="color:#f5d78e;font-size:16px;margin:16px 0 8px">${title}</h3>
        <p style="color:#ccc;line-height:1.6;font-size:14px">${body}</p>
        <p style="margin-top:24px"><a href="https://mergestars.com/status" style="color:#c9a84c">View status →</a></p>
      </div>`;
  }
}
