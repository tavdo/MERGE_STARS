import { api } from '@/lib/axios'

export type ChatMessage = { role: 'user' | 'ai'; text: string; ts: string }

const RESPONSE_KEYS = ['mergeCoin', 'ordering', 'qr', 'financing', 'referral', 'status'] as const

export function getAIResponse(
  msg: string,
  suggested: string[],
  responses: Record<string, string>,
  suggestionIndex?: number,
): string {
  if (
    suggestionIndex !== undefined &&
    suggestionIndex >= 0 &&
    suggestionIndex < RESPONSE_KEYS.length
  ) {
    const key = RESPONSE_KEYS[suggestionIndex]
    return responses[key] ?? responses.default
  }

  const idx = suggested.indexOf(msg)
  if (idx >= 0 && RESPONSE_KEYS[idx]) {
    return responses[RESPONSE_KEYS[idx]] ?? responses.default
  }

  const lower = msg.toLowerCase()
  if (
    lower.includes('investment') ||
    lower.includes('return') ||
    lower.includes('profit') ||
    lower.includes('earn')
  ) {
    return responses.default
  }

  const matchIdx = suggested.findIndex((q) => lower.includes(q.toLowerCase().slice(0, 12)))
  if (matchIdx >= 0 && RESPONSE_KEYS[matchIdx]) {
    return responses[RESPONSE_KEYS[matchIdx]] ?? responses.default
  }

  return responses.default
}

export async function tryAuditAI(action: string, meta?: Record<string, unknown>) {
  try {
    await api.post('/audit/events', {
      actor_role: 'CUSTOMER',
      action,
      object_id: null,
      owner: 'system',
      result: 'SUCCESS',
      meta,
    })
  } catch {
    // best-effort
  }
}
