export const SOCIAL_LINK_KEYS = [
  'tiktok',
  'facebook',
  'instagram',
  'linkedin',
  'whatsapp',
  'youtube',
  'x',
  'telegram',
  'website',
] as const;

export type SocialLinkKey = (typeof SOCIAL_LINK_KEYS)[number];

export type SocialLinks = Partial<Record<SocialLinkKey, string | null>>;

const MAX_URL_LEN = 500;
const MAX_HANDLE_LEN = 100;

const EMPTY: SocialLinks = {};

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function normalizeHttpUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  if (!isHttpUrl(withScheme) || withScheme.length > MAX_URL_LEN) {
    throw new Error('Invalid URL');
  }
  return withScheme;
}

/** Digits with optional leading +, 8–15 digits (E.164-ish). */
function normalizePhone(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const cleaned = trimmed.replace(/[\s()-]/g, '');
  if (!/^\+?[0-9]{8,15}$/.test(cleaned)) {
    throw new Error('Invalid phone number');
  }
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
}

function normalizeWhatsApp(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed) || /^(wa\.me|api\.whatsapp\.com)\//i.test(trimmed)) {
    return normalizeHttpUrl(trimmed);
  }
  const phone = normalizePhone(trimmed);
  return phone ? `https://wa.me/${phone.replace(/^\+/, '')}` : null;
}

function normalizeTelegram(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed) || /^t\.me\//i.test(trimmed)) {
    return normalizeHttpUrl(trimmed);
  }
  if (trimmed.startsWith('@')) {
    const handle = trimmed.slice(1).trim();
    if (!/^[a-zA-Z0-9_]{5,32}$/.test(handle)) {
      throw new Error('Invalid Telegram username');
    }
    return `https://t.me/${handle}`;
  }
  if (/^[a-zA-Z0-9_]{5,32}$/.test(trimmed)) {
    return `https://t.me/${trimmed}`;
  }
  throw new Error('Invalid Telegram link');
}

function normalizePlatformUrl(key: SocialLinkKey, raw: string): string | null {
  switch (key) {
    case 'whatsapp':
      return normalizeWhatsApp(raw);
    case 'telegram':
      return normalizeTelegram(raw);
    case 'website':
    case 'tiktok':
    case 'facebook':
    case 'instagram':
    case 'linkedin':
    case 'youtube':
    case 'x':
      return normalizeHttpUrl(raw);
    default:
      return normalizeHttpUrl(raw);
  }
}

/** Strip unknown keys, normalize values; empty → null omitted. Throws on invalid. */
export function sanitizeSocialLinks(
  input: unknown,
  fieldErrors: Record<string, string> = {},
): SocialLinks {
  if (input == null) return { ...EMPTY };
  if (typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('socialLinks must be an object');
  }

  const src = input as Record<string, unknown>;
  const out: SocialLinks = {};

  for (const key of SOCIAL_LINK_KEYS) {
    if (!(key in src)) continue;
    const value = src[key];
    if (value == null || value === '') {
      out[key] = null;
      continue;
    }
    if (typeof value !== 'string') {
      fieldErrors[key] = 'Must be a string';
      continue;
    }
    if (value.length > MAX_URL_LEN || value.length > MAX_HANDLE_LEN * 5) {
      fieldErrors[key] = 'Too long';
      continue;
    }
    try {
      out[key] = normalizePlatformUrl(key, value);
    } catch (e) {
      fieldErrors[key] = e instanceof Error ? e.message : 'Invalid value';
    }
  }

  for (const key of Object.keys(src)) {
    if (!(SOCIAL_LINK_KEYS as readonly string[]).includes(key)) {
      // ignore unknown keys (whitelist pipe may already strip)
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    const msg = Object.entries(fieldErrors)
      .map(([k, v]) => `${k}: ${v}`)
      .join('; ');
    throw new Error(msg);
  }

  return out;
}

/** Merge patch into existing links; null/empty clears a key. */
export function mergeSocialLinks(
  existing: SocialLinks | null | undefined,
  patch: SocialLinks,
): SocialLinks {
  const base: SocialLinks = { ...(existing ?? {}) };
  for (const key of SOCIAL_LINK_KEYS) {
    if (!(key in patch)) continue;
    const next = patch[key];
    if (next == null || next === '') {
      delete base[key];
    } else {
      base[key] = next;
    }
  }
  return base;
}

/** Public view: only non-empty https links. */
export function socialLinksPublicView(
  links: SocialLinks | null | undefined,
): Record<SocialLinkKey, string> | Record<string, never> {
  if (!links || typeof links !== 'object') return {};
  const out: Partial<Record<SocialLinkKey, string>> = {};
  for (const key of SOCIAL_LINK_KEYS) {
    const v = links[key];
    if (typeof v === 'string' && v.trim() && isHttpUrl(v.trim())) {
      out[key] = v.trim();
    }
  }
  return out as Record<SocialLinkKey, string>;
}
