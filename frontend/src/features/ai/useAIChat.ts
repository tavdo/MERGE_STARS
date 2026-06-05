import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { getAIResponse, tryAuditAI } from './aiChat'
import type { ChatMessage } from './aiChat'

export function useAIChat() {
  const { t } = useTranslation()
  const suggested = t('aiPage.suggested', { returnObjects: true }) as string[]
  const responses = t('aiPage.responses', { returnObjects: true }) as Record<string, string>

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { role: 'ai', text: '__WELCOME__', ts: 'Now' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const send = useCallback(
    (text: string, suggestionIndex?: number) => {
      if (!text.trim() || loading) return
      const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      setMessages((m) => [...m, { role: 'user', text, ts }])
      setInput('')
      setLoading(true)
      void tryAuditAI('AI_PROMPT', { prompt: text })
      setTimeout(() => {
        const response = getAIResponse(text, suggested, responses, suggestionIndex)
        setMessages((m) => [...m, { role: 'ai', text: response, ts }])
        void tryAuditAI('AI_RESPONSE', { prompt: text, response })
        setLoading(false)
      }, 900)
    },
    [loading, suggested, responses],
  )

  const showSuggestions = messages.length === 1 && !loading

  return {
    messages,
    input,
    setInput,
    loading,
    send,
    showSuggestions,
    suggested,
  }
}
