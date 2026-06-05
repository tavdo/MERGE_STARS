import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AIChatPanel from './ai/AIChatPanel'
import { useAIChat } from '@/features/ai/useAIChat'
import assistantLogo from '@/assets/assistant-logo.png'

/** Floating AI assistant — visible on every page except the full dashboard AI route */
export default function AIAssistantWidget() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const chat = useAIChat()

  const hiddenOnRoute = pathname === '/dashboard/ai' || pathname.startsWith('/bank-review')

  useEffect(() => {
    if (hiddenOnRoute) setOpen(false)
  }, [hiddenOnRoute])

  if (hiddenOnRoute) return null

  return (
    <div className={`ai-widget${open ? ' ai-widget--open' : ''}`} aria-live="polite">
      {open && (
        <div className="ai-widget-panel" role="dialog" aria-label={t('ai.title')}>
          <button
            type="button"
            className="ai-widget-panel-close"
            onClick={() => setOpen(false)}
            aria-label={t('ai.widget.close')}
          >
            ×
          </button>
          <AIChatPanel {...chat} compact showFullPageLink />
        </div>
      )}

      <button
        type="button"
        className="ai-widget-fab"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? t('ai.widget.close') : t('ai.widget.open')}
      >
        <img src={assistantLogo} alt="" className="ai-widget-fab-logo" />
      </button>
    </div>
  )
}
