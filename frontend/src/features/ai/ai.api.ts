import { api } from '@/lib/axios'
import type { ApiResponse } from '@/shared/types/api.types'

export interface AiChatResponse {
  text: string
  provider: 'openai' | 'fallback' | 'trained' | 'pending'
  needsClarification?: boolean
}

export const aiApi = {
  status: () =>
    api.get<ApiResponse<{ enabled: boolean; provider: string }>>('/ai/status'),

  chat: (message: string, history: { role: 'user' | 'assistant'; content: string }[] = []) =>
    api.post<ApiResponse<AiChatResponse>>('/ai/chat', { message, history }),
}
