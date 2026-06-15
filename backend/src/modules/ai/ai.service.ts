import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PlatformSettingsService } from '../settings/platform-settings.service';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

const SYSTEM_PROMPT = `You are MERGE AI, the operational assistant for MERGE STARS — a luxury platform for physical MERGE COIN products with precious metals (not cryptocurrency).

Rules:
- Provide operational guidance only about MERGE STARS, applications, orders, KYC, QR identity, delivery, and referrals.
- Do NOT provide financial advice, investment guarantees, or promised returns.
- Single-level referral only; no MLM.
- Be concise, professional, and helpful.
- Reply in the same language the user writes in.`;

@Injectable()
export class AiService {
  private readonly log = new Logger(AiService.name);

  constructor(private readonly settings: PlatformSettingsService) {}

  async chat(message: string, history: ChatMessage[] = []) {
    const enabled = await this.settings.isAiEnabled();
    if (!enabled) {
      throw new ServiceUnavailableException('AI assistant is disabled by platform settings');
    }

    const trimmed = message.trim();
    if (!trimmed) throw new BadRequestException('Message is required');

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (apiKey) {
      try {
        const text = await this.openAiChat(trimmed, history, apiKey);
        return { text, provider: 'openai' as const };
      } catch (err) {
        this.log.warn(`OpenAI failed, using fallback: ${(err as Error).message}`);
      }
    }

    return { text: this.fallbackReply(trimmed), provider: 'fallback' as const };
  }

  async status() {
    const enabled = await this.settings.isAiEnabled();
    const hasKey = !!process.env.OPENAI_API_KEY?.trim();
    return {
      enabled,
      provider: hasKey ? 'openai' : 'fallback',
    };
  }

  private async openAiChat(message: string, history: ChatMessage[], apiKey: string) {
    const model = process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini';
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-8).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.4,
        max_tokens: 600,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`OpenAI ${res.status}: ${body.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = json.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('Empty OpenAI response');
    return text;
  }

  private fallbackReply(message: string) {
    const lower = message.toLowerCase();
    if (lower.includes('merge coin') || lower.includes('coin')) {
      return 'MERGE COIN is a physical luxury product with precious metals. It is not a cryptocurrency. You can start an application from the dashboard or /apply.';
    }
    if (lower.includes('order') || lower.includes('შეკვეთ')) {
      return 'Orders flow: application → review → payment/bank financing → production → QC → delivery. Track status in your dashboard or at /status.';
    }
    if (lower.includes('qr') || lower.includes('referral') || lower.includes('რეფერ')) {
      return 'QR Identity links your MERGE ID to registration and referrals. Share your referral link from Dashboard → Referral. Single-level only — no MLM.';
    }
    if (lower.includes('kyc') || lower.includes('verify')) {
      return 'Upload KYC documents in Dashboard → Profile. Admin reviews verification status. Some flows require verified KYC before production.';
    }
    if (lower.includes('password') || lower.includes('login') || lower.includes('პაროლ')) {
      return 'Use Login for sign-in. Forgot password sends a 6-digit code to your email. Change password anytime under Dashboard → Profile.';
    }
    return 'Thank you for your question. I can help with MERGE STARS applications, orders, KYC, QR identity, delivery, and referrals. I cannot provide financial advice or guaranteed returns.';
  }
}
