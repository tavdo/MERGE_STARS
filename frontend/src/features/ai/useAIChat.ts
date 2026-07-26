import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { aiApi } from './ai.api'
import { getAIResponse, tryAuditAI } from './aiChat'
import { clarificationReply } from './aiLanguage'
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
  const [provider, setProvider] = useState<string | null>(null)

  const send = useCallback(
    async (text: string, suggestionIndex?: number) => {
      if (!text.trim() || loading) return
      const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      setMessages((m) => [...m, { role: 'user', text, ts }])
      setInput('')
      setLoading(true)
      void tryAuditAI('AI_PROMPT', { prompt: text })

      const history = messages
        .filter((m) => m.text !== '__WELCOME__')
        .map((m) => ({
          role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: m.text,
        }))

      try {
        const { data } = await aiApi.chat(text, history)
        const response = data.data.text
        setProvider(data.data.provider)
        setMessages((m) => [...m, { role: 'ai', text: response, ts }])
        void tryAuditAI('AI_RESPONSE', {
          prompt: text,
          response,
          provider: data.data.provider,
          needsClarification: data.data.needsClarification,
        })
      } catch {
        const response =
          suggestionIndex !== undefined
            ? getAIResponse(text, suggested, responses, suggestionIndex)
            : clarificationReply(text)
        setProvider(suggestionIndex !== undefined ? 'fallback' : 'pending')
        setMessages((m) => [...m, { role: 'ai', text: response, ts }])
        void tryAuditAI('AI_RESPONSE', { prompt: text, response, provider: 'offline' })
      } finally {
        setLoading(false)
      }
    },
    [loading, messages, suggested, responses],
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
    provider,
  }
}
