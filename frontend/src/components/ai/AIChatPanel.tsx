import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { ChatMessage } from '@/features/ai/aiChat'
import assistantLogo from '@/assets/assistant-logo.png'

type AIChatPanelProps = {
  messages: ChatMessage[]
  input: string
  setInput: (value: string) => void
  loading: boolean
  send: (text: string, suggestionIndex?: number) => void
  showSuggestions: boolean
  suggested: string[]
  compact?: boolean
  showFullPageLink?: boolean
}

function ChatMessages({
  messages,
  loading,
  send,
  showSuggestions,
  suggested,
  bottomRef,
}: {
  messages: ChatMessage[]
  loading: boolean
  send: (text: string, suggestionIndex?: number) => void
  showSuggestions: boolean
  suggested: string[]
  bottomRef: React.RefObject<HTMLDivElement | null>
}) {
  const { t } = useTranslation()

  return (
    <>
      <div className="ai-chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`ai-chat-row${m.role === 'user' ? ' ai-chat-row--user' : ''}`}>
            {m.role === 'ai' ? (
              <img src={assistantLogo} alt="" className="ai-chat-avatar-img" aria-hidden />
            ) : (
              <div className="ai-chat-avatar ai-chat-avatar--user">U</div>
            )}
            <div>
              <div className={`ai-chat-bubble ai-chat-bubble--${m.role}`}>
                {m.text === '__WELCOME__' ? t('ai.welcome') : m.text}
              </div>
              <p className={`ai-chat-time${m.role === 'user' ? ' ai-chat-time--right' : ''}`}>{m.ts}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="ai-chat-row">
            <img src={assistantLogo} alt="" className="ai-chat-avatar-img" aria-hidden />
            <div className="ai-typing-dots" aria-label={t('aiPage.typing')}>
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
              {suggested.map((s, i) => (
                <button key={s} type="button" className="ai-chip" onClick={() => send(s, i)}>
                  {s}
                </button>
              ))}
          </div>
        </div>
      )}
    </>
  )
}

export default function AIChatPanel({
  messages,
  input,
  setInput,
  loading,
  send,
  showSuggestions,
  suggested,
  compact = false,
  showFullPageLink = false,
}: AIChatPanelProps) {
  const { t } = useTranslation()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const inputRow = (
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
  )

  const chatBody = (
    <ChatMessages
      messages={messages}
      loading={loading}
      send={send}
      showSuggestions={showSuggestions}
      suggested={suggested}
      bottomRef={bottomRef}
    />
  )

  if (compact) {
    return (
      <div className="ai-chat-panel ai-chat-panel--compact">
        <div className="ai-chat-panel-header">
          <img src={assistantLogo} alt="" className="ai-chat-panel-header-logo" aria-hidden />
          <div className="ai-chat-panel-header-text">
            <p className="ai-chat-panel-header-kicker">{t('ai.kicker')}</p>
            <p className="ai-chat-panel-header-title">{t('ai.title')}</p>
          </div>
          {showFullPageLink && (
            <Link to="/dashboard/ai" className="ai-chat-panel-full-link">
              {t('ai.widget.fullPage')}
            </Link>
          )}
        </div>
        <div className="ai-chat-panel-body">
          {chatBody}
          {inputRow}
        </div>
      </div>
    )
  }

  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <p
          style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.3em',
            color: '#c9a84c',
            marginBottom: '8px',
          }}
        >
          {t('ai.kicker')}
        </p>
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
          {t('aiPage.disclaimer')}
        </p>
      </div>

      <details className="gold-card" style={{ padding: '16px 18px', borderRadius: '6px', marginBottom: '14px' }}>
        <summary
          style={{
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.12em',
          }}
        >
          {t('ai.coreTrainingTitle')}
        </summary>
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            marginTop: '12px',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '11px',
            lineHeight: 1.7,
          }}
        >
          {t('ai.coreTraining')}
        </pre>
      </details>

      <div className="ai-chat-panel">
        {chatBody}
        {inputRow}
      </div>
    </>
  )
}
