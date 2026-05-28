import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../../components/DashboardLayout'
import { api } from '@/lib/axios'

type Message = { role: 'user' | 'ai'; text: string; ts: string }

const SUGGESTED = [
  'What is MERGE COIN?',
  'How does the ordering process work?',
  'What is the QR Identity system?',
  'How does bank financing work?',
  'What is the referral policy?',
  'How do I check my application status?',
]

const AI_RESPONSES: Record<string, string> = {
  default:
    'Thank you for your question. I can help you with information about MERGE STARS platform, MERGE COIN, ordering, KYC, QR Identity, and general platform guidance. Please note: I cannot provide financial advice, investment recommendations, or guarantee any returns.',
  'What is MERGE COIN?':
    'MERGE COIN is your Product Reference Unit and Brand Identity on the MERGE STARS platform. It is a physical luxury product made from precious metal composite (3D filament with real gold, silver, or platinum). It is NOT a cryptocurrency, token, or financial instrument. Each coin has a unique QR code and Digital Passport.',
  'How does the ordering process work?':
    'The order flow is: DRAFT → SUBMITTED → INVOICE → PAYMENT or BANK APPROVAL → PRODUCTION → QC → READY → DELIVERED → COMPLETED. Production begins ONLY after your payment is confirmed (payment_status = PAID) or bank financing is approved (bank_status = APPROVED).',
  'What is the QR Identity system?':
    'Each user receives 3 QR codes: (1) Brand QR — links to your brand catalog, (2) Core QR — links to your account profile, (3) Referral QR — used for referral attribution. All QR codes have unique IDs and track scan statistics.',
  'How does bank financing work?':
    'Bank financing is provided by our partner Crystal. You pay a 20% down payment and finance the remaining 80% over 12 or 24 months. Financing is subject to approval — it is NOT guaranteed. Production begins only after bank_status = APPROVED.',
  'What is the referral policy?':
    'MERGE STARS uses a single-level referral system only. Revenue distribution: Platform 50%, Brand Owner 25%, Direct Referrer 25%. No MLM or multi-level structures. Only direct referrals are attributed. A 2% platform service fee applies to actual received revenue.',
  'How do I check my application status?':
    "Go to My Applications in your dashboard, or visit the Status page directly. Your application follows this timeline: Submitted → Under Review → Sent to Crystal → Approved → Funds Received → In Production → Delivered. You'll receive notifications at each stage.",
}

function getAIResponse(msg: string): string {
  if (AI_RESPONSES[msg]) return AI_RESPONSES[msg]

  const lower = msg.toLowerCase()
  if (lower.includes('investment') || lower.includes('return') || lower.includes('profit') || lower.includes('earn'))
    return '⚠ I cannot provide financial advice or discuss investment returns. MERGE STARS is not an investment platform. Please consult a qualified financial advisor for investment guidance.'
  if (lower.includes('crypto') || lower.includes('token') || lower.includes('blockchain'))
    return 'MERGE COIN is not a cryptocurrency or blockchain token. It is a physical luxury product. MERGE STARS does not operate any cryptocurrency or token system.'
  if (
    lower.includes('guarantee') ||
    lower.includes('guaranteed') ||
    lower.includes('risk free') ||
    lower.includes('risk-free') ||
    lower.includes('impossible') ||
    lower.includes('approved') ||
    lower.includes('100%')
  ) {
    return 'I cannot claim guarantees, approvals, or risk-free outcomes. I can provide evidence-based guidance and explain the review / verification steps required.'
  }

  const match = SUGGESTED.find((q) => lower.includes(q.toLowerCase().slice(0, 12)))
  if (match && AI_RESPONSES[match]) return AI_RESPONSES[match]

  return AI_RESPONSES.default
}

async function tryAudit(action: string, meta?: Record<string, unknown>) {
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

export default function AIAssistantPage() {
  const { t, i18n } = useTranslation()
  const [messages, setMessages] = useState<Message[]>(() => [
    { role: 'ai', text: t('ai.welcome'), ts: 'Now' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    setMessages((m) =>
      m.length === 1 && m[0].role === 'ai'
        ? [{ role: 'ai', text: t('ai.welcome'), ts: m[0].ts }]
        : m,
    )
  }, [i18n.language, t])

  const send = (text: string) => {
    if (!text.trim() || loading) return
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages((m) => [...m, { role: 'user', text, ts }])
    setInput('')
    setLoading(true)
    void tryAudit('AI_PROMPT', { prompt: text })
    setTimeout(() => {
      const response = getAIResponse(text)
      setMessages((m) => [...m, { role: 'ai', text: response, ts }])
      void tryAudit('AI_RESPONSE', { prompt: text, response })
      setLoading(false)
    }, 900)
  }

  const showSuggestions = messages.length === 1 && !loading

  return (
    <DashboardLayout titleKey="aiAssistant">
      <div className="ai-chat-wrap">
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.3em', color: '#c9a84c', marginBottom: '8px' }}>{t('ai.kicker')}</p>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', margin: 0 }}>{t('ai.title')}</h1>
        </div>

        <div
          className="gold-card"
          style={{
            padding: '12px 14px',
            borderRadius: '6px',
            marginBottom: '12px',
            borderColor: 'rgba(201,168,76,0.20)',
            background: 'rgba(201,168,76,0.04)',
          }}
        >
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.60)', lineHeight: 1.65, margin: 0 }}>
            <strong style={{ color: '#c9a84c' }}>MERGE AI provides operational guidance only.</strong> It does not provide financial,
            legal, tax, investment, lending, or approval decisions. <strong>AI supports; authorized humans decide.</strong>
          </p>
        </div>

        <details className="gold-card" style={{ padding: '16px 18px', borderRadius: '6px', marginBottom: '14px' }}>
          <summary style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em' }}>
            {t('ai.coreTrainingTitle')}
          </summary>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: '12px', color: 'rgba(255,255,255,0.6)', fontSize: '11px', lineHeight: 1.7 }}>
            {t('ai.coreTraining')}
          </pre>
        </details>

        <div className="ai-chat-panel">
          <div className="ai-chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`ai-chat-row${m.role === 'user' ? ' ai-chat-row--user' : ''}`}>
                <div className={`ai-chat-avatar ai-chat-avatar--${m.role}`}>{m.role === 'ai' ? '★' : 'U'}</div>
                <div>
                  <div className={`ai-chat-bubble ai-chat-bubble--${m.role}`}>{m.text}</div>
                  <p className={`ai-chat-time${m.role === 'user' ? ' ai-chat-time--right' : ''}`}>{m.ts}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="ai-chat-row">
                <div className="ai-chat-avatar ai-chat-avatar--ai">★</div>
                <div className="ai-typing-dots" aria-label="Assistant is typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {showSuggestions && (
            <div className="ai-suggested">
              <p className="ai-suggested-label">{t('ai.suggestedLabel')}</p>
              <div className="ai-suggested-chips">
                {SUGGESTED.map((s) => (
                  <button key={s} type="button" className="ai-chip" onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form
            className="ai-chat-input-row"
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
          >
            <input
              className="gold-input"
              placeholder={t('ai.placeholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="gold-btn ai-chat-send" disabled={loading || !input.trim()}>
              {t('common.send')}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
