import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsService {
  private readonly log = new Logger(SmsService.name);

  isConfigured() {
    return !!(
      process.env.TWILIO_ACCOUNT_SID?.trim() &&
      process.env.TWILIO_AUTH_TOKEN?.trim() &&
      process.env.TWILIO_FROM_NUMBER?.trim()
    );
  }

  async sendVerificationCode(phone: string, code: string) {
    const body = `MERGE STARS verification code: ${code}. Valid 15 minutes.`;
    if (!this.isConfigured()) {
      this.log.log(`[SMS-DEV] To: ${phone} | ${body}`);
      return;
    }

    const sid = process.env.TWILIO_ACCOUNT_SID!.trim();
    const token = process.env.TWILIO_AUTH_TOKEN!.trim();
    const from = process.env.TWILIO_FROM_NUMBER!.trim();
    const auth = Buffer.from(`${sid}:${token}`).toString('base64');

    const params = new URLSearchParams({ To: phone, From: from, Body: body });
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      },
    );

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Twilio ${res.status}: ${errBody.slice(0, 200)}`);
    }
  }
}
