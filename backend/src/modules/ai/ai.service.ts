import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AiTrainingItem,
  aiTrainingItemView,
} from '../../database/entities/ai-training-item.entity';
import { PlatformSettingsService } from '../settings/platform-settings.service';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

const NEED_CLARIFICATION = '[[NEED_CLARIFICATION]]';

const SYSTEM_PROMPT_BASE = `You are MERGE AI, the operational assistant for MERGE STARS — a luxury platform for physical MERGE COIN products with precious metals (not cryptocurrency).

Rules:
- Provide operational guidance only about MERGE STARS, applications, orders, KYC, QR identity, delivery, referrals, brand room, catalogs, and filament technology.
- Use TRAINED KNOWLEDGE below as the primary source of truth when it matches the user's question.
- Do NOT invent company policies, prices, legal terms, or product facts that are not in TRAINED KNOWLEDGE or the basic platform rules above.
- If you do not have enough verified information to answer accurately, reply with EXACTLY this token and nothing else: ${NEED_CLARIFICATION}
- Do NOT provide financial advice, investment guarantees, or promised returns.
- Single-level referral only; no MLM.
- Be concise, professional, and helpful.
- CRITICAL LANGUAGE RULE: Always reply in the same language the USER wrote in for this latest message. Ignore the website UI language. If the user writes in Georgian, reply in Georgian. If English, reply in English. Match the user's message language exactly.`;

const CLARIFICATION: Record<string, string> = {
  ka: 'ამ საკითხთან დაკავშირებით ინფორმაციის დაზუსტება მჭირდება. როგორც კი დავაზუსტებ, გაგცემთ პასუხს.',
  en: 'I need to clarify this information. As soon as I have it confirmed, I will get back to you with an answer.',
  ru: 'По этому вопросу мне нужно уточнить информацию. Как только уточню, дам вам ответ.',
  fr: "J'ai besoin de clarifier cette information. Dès que ce sera confirmé, je vous répondrai.",
  de: 'Dazu muss ich die Information noch klären. Sobald ich sie bestätigt habe, antworte ich Ihnen.',
  tr: 'Bu konuyla ilgili bilgiyi netleştirmem gerekiyor. Netleşir netleşmez size yanıt vereceğim.',
  ar: 'أحتاج إلى توضيح هذه المعلومات. بمجرد التأكد منها سأعود إليك بالإجابة.',
};

@Injectable()
export class AiService {
  private readonly log = new Logger(AiService.name);

  constructor(
    private readonly settings: PlatformSettingsService,
    @InjectRepository(AiTrainingItem)
    private readonly training: Repository<AiTrainingItem>,
  ) {}

  async chat(message: string, history: ChatMessage[] = [], userId?: string) {
    const enabled = await this.settings.isAiEnabled();
    if (!enabled) {
      throw new ServiceUnavailableException('AI assistant is disabled by platform settings');
    }

    const trimmed = message.trim();
    if (!trimmed) throw new BadRequestException('Message is required');

    const lang = detectMessageLanguage(trimmed);
    const trainedMatch = await this.findTrainedMatch(trimmed);
    if (trainedMatch?.answer) {
      await this.bumpAskCount(trainedMatch);
      return {
        text: trainedMatch.answer,
        provider: 'trained' as const,
        needsClarification: false,
      };
    }

    const knowledgeBlock = await this.buildKnowledgeBlock();
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (apiKey) {
      try {
        const text = await this.openAiChat(trimmed, history, apiKey, knowledgeBlock);
        if (isNeedClarification(text)) {
          await this.registerUnknown(trimmed, lang, userId);
          return {
            text: clarificationFor(lang),
            provider: 'pending' as const,
            needsClarification: true,
          };
        }
        return { text, provider: 'openai' as const, needsClarification: false };
      } catch (err) {
        this.log.warn(`OpenAI failed, using fallback: ${(err as Error).message}`);
      }
    }

    const fallback = this.fallbackReply(trimmed, lang);
    if (fallback.needsClarification) {
      await this.registerUnknown(trimmed, lang, userId);
    }
    return fallback;
  }

  async status() {
    const enabled = await this.settings.isAiEnabled();
    const hasKey = !!process.env.OPENAI_API_KEY?.trim();
    return {
      enabled,
      provider: hasKey ? 'openai' : 'fallback',
    };
  }

  async listPending() {
    const rows = await this.training.find({
      where: { status: 'pending' },
      order: { askCount: 'DESC', updatedAt: 'DESC' },
      take: 200,
    });
    return rows.map(aiTrainingItemView);
  }

  async listTrained() {
    const rows = await this.training.find({
      where: { status: 'trained' },
      order: { updatedAt: 'DESC' },
      take: 500,
    });
    return rows.map(aiTrainingItemView);
  }

  async teach(id: string, answer: string, adminId: string) {
    const row = await this.training.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Training item not found');
    const trimmed = answer.trim();
    if (!trimmed) throw new BadRequestException('Answer is required');
    row.answer = trimmed;
    row.status = 'trained';
    row.trainedByUserId = adminId;
    await this.training.save(row);
    return aiTrainingItemView(row);
  }

  async dismiss(id: string) {
    const row = await this.training.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Training item not found');
    row.status = 'dismissed';
    await this.training.save(row);
    return aiTrainingItemView(row);
  }

  async createKnowledge(question: string, answer: string, adminId: string) {
    const q = question.trim();
    const a = answer.trim();
    if (!q || !a) throw new BadRequestException('Question and answer are required');
    const normalized = normalizeQuestion(q);
    let row = await this.training.findOne({
      where: { normalizedQuestion: normalized, status: 'trained' },
    });
    if (!row) {
      row = this.training.create({
        question: q,
        normalizedQuestion: normalized,
        answer: a,
        status: 'trained',
        askCount: 0,
        userId: null,
        language: detectMessageLanguage(q),
        trainedByUserId: adminId,
      });
    } else {
      row.question = q;
      row.answer = a;
      row.trainedByUserId = adminId;
    }
    await this.training.save(row);
    return aiTrainingItemView(row);
  }

  async updateKnowledge(id: string, body: { question?: string; answer?: string }, adminId: string) {
    const row = await this.training.findOne({ where: { id, status: 'trained' } });
    if (!row) throw new NotFoundException('Knowledge item not found');
    if (body.question?.trim()) {
      row.question = body.question.trim();
      row.normalizedQuestion = normalizeQuestion(row.question);
      row.language = detectMessageLanguage(row.question);
    }
    if (body.answer?.trim()) row.answer = body.answer.trim();
    if (!row.answer?.trim()) throw new BadRequestException('Answer is required');
    row.trainedByUserId = adminId;
    await this.training.save(row);
    return aiTrainingItemView(row);
  }

  async removeKnowledge(id: string) {
    const row = await this.training.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Knowledge item not found');
    await this.training.remove(row);
    return { ok: true };
  }

  private async openAiChat(
    message: string,
    history: ChatMessage[],
    apiKey: string,
    knowledgeBlock: string,
  ) {
    const model = process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini';
    const system = `${SYSTEM_PROMPT_BASE}\n\nTRAINED KNOWLEDGE:\n${knowledgeBlock || '(none yet)'}`;
    const messages = [
      { role: 'system', content: system },
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
        temperature: 0.3,
        max_tokens: 700,
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

  private async buildKnowledgeBlock() {
    const rows = await this.training.find({
      where: { status: 'trained' },
      order: { updatedAt: 'DESC' },
      take: 40,
    });
    if (!rows.length) return '';
    return rows
      .map((r, i) => `${i + 1}. Q: ${r.question}\n   A: ${r.answer}`)
      .join('\n');
  }

  private async findTrainedMatch(message: string) {
    const rows = await this.training.find({
      where: { status: 'trained' },
      order: { updatedAt: 'DESC' },
      take: 200,
    });
    if (!rows.length) return null;

    const norm = normalizeQuestion(message);
    const exact = rows.find((r) => r.normalizedQuestion === norm);
    if (exact) return exact;

    let best: AiTrainingItem | null = null;
    let bestScore = 0;
    const msgTokens = tokenize(norm);
    for (const row of rows) {
      if (!row.answer) continue;
      const qTokens = tokenize(row.normalizedQuestion);
      const score = overlapScore(msgTokens, qTokens);
      if (score > bestScore) {
        bestScore = score;
        best = row;
      }
    }
    // Require meaningful overlap
    if (best && bestScore >= 0.45) return best;
    return null;
  }

  private async registerUnknown(question: string, language: string, userId?: string) {
    const normalized = normalizeQuestion(question);
    const trained = await this.training.findOne({
      where: { normalizedQuestion: normalized, status: 'trained' },
    });
    if (trained) return trained;

    const pending = await this.training.findOne({
      where: { normalizedQuestion: normalized, status: 'pending' },
    });
    if (pending) {
      pending.askCount += 1;
      pending.userId = userId ?? pending.userId;
      pending.language = language;
      pending.question = question;
      return this.training.save(pending);
    }

    const row = this.training.create({
      question,
      normalizedQuestion: normalized,
      answer: null,
      status: 'pending',
      askCount: 1,
      userId: userId ?? null,
      language,
      trainedByUserId: null,
    });
    return this.training.save(row);
  }

  private async bumpAskCount(row: AiTrainingItem) {
    row.askCount += 1;
    await this.training.save(row);
  }

  private fallbackReply(message: string, lang: string) {
    const lower = message.toLowerCase();
    const known: Array<{ test: (s: string) => boolean; answers: Record<string, string> }> = [
      {
        test: (s) => s.includes('merge coin') || s.includes('მერჯ') || /\bcoin\b/.test(s),
        answers: {
          en: 'MERGE COIN is a physical luxury product with precious metals. It is not a cryptocurrency. You can start an application from the dashboard or /apply.',
          ka: 'MERGE COIN ფიზიკური ლუქს პროდუქტია ძვირფასი ლითონებით. ეს არ არის კრიპტოვალუტა. განაცხადი შეგიძლიათ დაიწყოთ დაშბორდიდან ან /apply გვერდიდან.',
          ru: 'MERGE COIN — физический люксовый продукт с драгоценными металлами. Это не криптовалюта. Заявку можно начать в кабинете или на /apply.',
        },
      },
      {
        test: (s) => s.includes('order') || s.includes('შეკვეთ') || s.includes('заказ'),
        answers: {
          en: 'Orders flow: application → review → payment/bank financing → production → QC → delivery. Track status in your dashboard or at /status.',
          ka: 'შეკვეთის ნაკადი: განაცხადი → განხილვა → გადახდა/ბანკის დაფინანსება → წარმოება → QC → მიწოდება. სტატუსი იხილეთ დაშბორდში ან /status-ზე.',
          ru: 'Заказ: заявка → проверка → оплата/банковское финансирование → производство → QC → доставка. Статус — в кабинете или на /status.',
        },
      },
      {
        test: (s) => s.includes('qr') || s.includes('referral') || s.includes('რეფერ') || s.includes('рефер'),
        answers: {
          en: 'QR Identity links your MERGE ID to registration and referrals. Share your referral link from Dashboard → Referral. Single-level only — no MLM.',
          ka: 'QR Identity აკავშირებს თქვენს MERGE ID-ს რეგისტრაციასა და რეფერალთან. ბმული: Dashboard → Referral. მხოლოდ ერთ დონე — MLM აკრძალულია.',
          ru: 'QR Identity связывает ваш MERGE ID с регистрацией и рефералами. Ссылка: Dashboard → Referral. Только один уровень — без MLM.',
        },
      },
      {
        test: (s) => s.includes('kyc') || s.includes('verify') || s.includes('ვერიფ'),
        answers: {
          en: 'Upload KYC documents in Dashboard → Profile. Admin reviews verification status. Some flows require verified KYC before production.',
          ka: 'KYC დოკუმენტები ატვირთეთ Dashboard → Profile-ში. ადმინი ამოწმებს სტატუსს. ზოგი პროცესი წარმოებამდე ვერიფიკაციას მოითხოვს.',
          ru: 'Загрузите KYC в Dashboard → Profile. Админ проверяет статус. Для части процессов нужна верификация до производства.',
        },
      },
      {
        test: (s) =>
          s.includes('password') || s.includes('login') || s.includes('პაროლ') || s.includes('парол'),
        answers: {
          en: 'Use Login for sign-in. Forgot password sends a 6-digit code to your email. Change password anytime under Dashboard → Profile.',
          ka: 'შესასვლელად გამოიყენეთ Login. პაროლის აღდგენა აგზავნის 6-ნიშნა კოდს ელფოსტაზე. პაროლის შეცვლა: Dashboard → Profile.',
          ru: 'Вход через Login. Восстановление пароля отправляет 6-значный код на email. Смена пароля: Dashboard → Profile.',
        },
      },
    ];

    for (const item of known) {
      if (item.test(lower)) {
        return {
          text: pickLang(item.answers, lang),
          provider: 'fallback' as const,
          needsClarification: false,
        };
      }
    }

    return {
      text: clarificationFor(lang),
      provider: 'pending' as const,
      needsClarification: true,
    };
  }
}

function isNeedClarification(text: string) {
  const t = text.trim();
  if (t === NEED_CLARIFICATION) return true;
  if (t.includes(NEED_CLARIFICATION) && t.length < 80) return true;
  return false;
}

function clarificationFor(lang: string) {
  return CLARIFICATION[lang] ?? CLARIFICATION.en;
}

function pickLang(map: Record<string, string>, lang: string) {
  return map[lang] ?? map.en ?? Object.values(map)[0];
}

export function detectMessageLanguage(text: string): string {
  if (/[\u10A0-\u10FF]/.test(text)) return 'ka';
  if (/[\u0400-\u04FF]/.test(text)) return 'ru';
  if (/[\u0600-\u06FF]/.test(text)) return 'ar';
  // light heuristics for common European words — default Latin → en
  const lower = text.toLowerCase();
  if (/\b(und|nicht|bitte|danke)\b/.test(lower)) return 'de';
  if (/\b(et|pour|merci|bonjour)\b/.test(lower)) return 'fr';
  if (/\b(ve|için|merhaba|teşekkür)\b/.test(lower)) return 'tr';
  return 'en';
}

function normalizeQuestion(q: string) {
  return q
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);
}

function tokenize(s: string) {
  return s.split(' ').filter((t) => t.length > 1);
}

function overlapScore(a: string[], b: string[]) {
  if (!a.length || !b.length) return 0;
  const setB = new Set(b);
  let hit = 0;
  for (const t of a) if (setB.has(t)) hit += 1;
  return hit / Math.max(a.length, b.length);
}
