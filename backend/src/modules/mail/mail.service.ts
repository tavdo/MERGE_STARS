import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly log = new Logger(MailService.name);
  private transporter: Transporter | null = null;
  private readonly sendTimeoutMs = Number(process.env.SMTP_TIMEOUT_MS ?? 30_000);

  async onModuleInit() {
    if (this.useResend()) {
      this.log.log(`Resend API mail transport ready (from: ${this.resendFrom()})`);
      return;
    }
    if (this.useBrevo()) {
      this.log.log('Brevo API mail transport ready (HTTPS — works when VPS blocks SMTP ports)');
      return;
    }
    if (!this.isSmtpConfigured()) {
      this.log.warn('Mail not configured — emails will be logged only');
      return;
    }
    try {
      const transport = this.getTransporter();
      await transport?.verify();
      this.log.log(`SMTP ready (${process.env.SMTP_USER?.trim().toLowerCase()}, port ${process.env.SMTP_PORT ?? 587})`);
    } catch (err) {
      this.transporter = null;
      this.log.error(`SMTP verify failed on startup: ${(err as Error).message}`);
    }
  }

  private useResend() {
    return !!process.env.RESEND_API_KEY?.trim();
  }

  /** Supports BREVO_API_KEY and common typo BREVO_API-KEY in .env */
  private brevoApiKey() {
    return (
      process.env.BREVO_API_KEY?.trim() ||
      process.env['BREVO_API-KEY']?.trim() ||
      ''
    );
  }

  private useBrevo() {
    return !!this.brevoApiKey();
  }

  /** Resend "from" — must be a verified domain/email in Resend dashboard. */
  private resendFrom() {
    const custom = process.env.RESEND_FROM?.trim();
    if (custom) return custom.replace(/^['"]|['"]$/g, '');
    return this.fromAddress();
  }

  private async sendViaResend(to: string, subject: string, html: string, text: string) {
    const key = process.env.RESEND_API_KEY!.trim();
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.resendFrom(),
        to: [to],
        subject,
        html,
        text,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Resend API ${res.status}: ${body.slice(0, 200)}`);
    }
  }

  private isSmtpConfigured() {
    return !!(
      process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim()
    );
  }

  private parseFromAddress(from: string) {
    const m = from.match(/^(.+?)\s*<([^>]+)>$/);
    if (m) return { name: m[1].trim(), email: m[2].trim().toLowerCase() };
    return { name: 'MERGE STARS', email: from.trim().toLowerCase() };
  }

  private async sendViaBrevo(to: string, subject: string, html: string, text: string) {
    const key = this.brevoApiKey();
    const sender = this.parseFromAddress(this.fromAddress());
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender,
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Brevo API ${res.status}: ${body.slice(0, 200)}`);
    }
  }

  private getTransporter(): Transporter | null {
    if (this.transporter) return this.transporter;

    const host = process.env.SMTP_HOST?.trim();
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER?.trim().toLowerCase();
    const pass = process.env.SMTP_PASS?.trim();

    if (!host || !user || !pass) {
      this.log.warn('SMTP not configured — emails will be logged only');
      return null;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      requireTLS: port === 587,
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
    const raw = process.env.MAIL_FROM?.trim().replace(/^['"]|['"]$/g, '') ?? '';
    // Brevo/Resend: use MAIL_FROM or authenticated domain (not Gmail freemail)
    if (this.useBrevo() || this.useResend()) {
      return raw || 'MERGE STARS <noreply@mergestars.com>';
    }
    // Gmail SMTP requires From to match SMTP_USER
    const user = process.env.SMTP_USER?.trim().toLowerCase();
    if (!user) {
      return raw || 'MERGE STARS <noreply@mergestars.com>';
    }
    const nameMatch = raw.match(/^(.+?)\s*</);
    const name = (nameMatch?.[1] ?? raw.replace(/<[^>]+>/g, '')).trim() || 'MERGE STARS';
    return `${name} <${user}>`;
  }

  isConfigured() {
    return this.useResend() || this.useBrevo() || this.isSmtpConfigured();
  }

  mailMode() {
    if (this.useResend()) return 'resend';
    if (this.useBrevo()) return 'brevo';
    if (this.isSmtpConfigured()) return 'smtp';
    return 'dev-log';
  }

  async send(to: string, subject: string, html: string, text: string) {
    if (this.useResend()) {
      try {
        await this.sendViaResend(to, subject, html, text);
        return;
      } catch (err) {
        this.log.error(`Resend mail to ${to} failed: ${(err as Error).message}`);
        throw err;
      }
    }

    if (this.useBrevo()) {
      try {
        await this.sendViaBrevo(to, subject, html, text);
        return;
      } catch (err) {
        this.log.error(`Brevo mail to ${to} failed: ${(err as Error).message}`);
        throw err;
      }
    }

    // DigitalOcean blocks outbound SMTP — do not wait 30s in production
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'BREVO_API_KEY missing in .env — Gmail SMTP is blocked on this server',
      );
    }

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

  private verificationEmailContent(code: string) {
    const subject = 'MERGE STARS — Email verification code';
    const text = `Your verification code is: ${code}\n\nValid for 15 minutes.`;
    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#080808;color:#fff;border:1px solid #c9a84c">
        <h2 style="color:#c9a84c;letter-spacing:0.2em;font-size:14px">MERGE STARS</h2>
        <p>Your email verification code:</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:0.3em;color:#f5d78e">${code}</p>
        <p style="color:#888;font-size:12px">Valid for 15 minutes.</p>
      </div>`;
    return { subject, html, text };
  }

  async sendVerificationCode(email: string, code: string) {
    const { subject, html, text } = this.verificationEmailContent(code);
    await this.send(email, subject, html, text);
  }

  sendVerificationCodeInBackground(email: string, code: string) {
    const { subject, html, text } = this.verificationEmailContent(code);
    this.sendInBackground(email, subject, html, text);
  }

  async sendEmailChangeCode(email: string, code: string) {
    const subject = 'MERGE STARS — Confirm your new email';
    const text = `Your email change verification code is: ${code}\n\nValid for 15 minutes.`;
    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#080808;color:#fff;border:1px solid #c9a84c">
        <h2 style="color:#c9a84c;letter-spacing:0.2em;font-size:14px">MERGE STARS</h2>
        <p>Confirm your new email address with this code:</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:0.3em;color:#f5d78e">${code}</p>
        <p style="color:#888;font-size:12px">Valid for 15 minutes. If you did not request this, ignore this email.</p>
      </div>`;
    await this.send(email, subject, html, text);
  }

  private passwordResetCodeContent(code: string) {
    const subject = 'MERGE STARS — Password reset code';
    const text = `Your password reset code is: ${code}\n\nValid for 15 minutes. If you did not request this, ignore this email.`;
    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#080808;color:#fff;border:1px solid #c9a84c">
        <h2 style="color:#c9a84c;letter-spacing:0.2em;font-size:14px">MERGE STARS</h2>
        <p>Your password reset code:</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:0.3em;color:#f5d78e">${code}</p>
        <p style="color:#888;font-size:12px">Valid for 15 minutes.</p>
      </div>`;
    return { subject, html, text };
  }

  async sendPasswordResetCode(email: string, code: string) {
    const { subject, html, text } = this.passwordResetCodeContent(code);
    await this.send(email, subject, html, text);
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
