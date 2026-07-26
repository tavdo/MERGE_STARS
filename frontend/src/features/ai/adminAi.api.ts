import { api } from '@/lib/axios'
import type { ApiResponse } from '@/shared/types/api.types'

export type AiTrainingStatus = 'pending' | 'trained' | 'dismissed'

export interface AiTrainingItem {
  id: string
  question: string
  answer: string | null
  status: AiTrainingStatus
  askCount: number
  userId: string | null
  language: string | null
  trainedByUserId: string | null
  createdAt: string
  updatedAt: string
}

export const adminAiApi = {
  listPending: () =>
    api.get<ApiResponse<AiTrainingItem[]>>('/admin/ai/pending'),

  listKnowledge: () =>
    api.get<ApiResponse<AiTrainingItem[]>>('/admin/ai/knowledge'),

  teach: (id: string, answer: string) =>
    api.post<ApiResponse<AiTrainingItem>>(`/admin/ai/pending/${id}/teach`, { answer }),

  dismiss: (id: string) =>
    api.post<ApiResponse<AiTrainingItem>>(`/admin/ai/pending/${id}/dismiss`),

  createKnowledge: (question: string, answer: string) =>
    api.post<ApiResponse<AiTrainingItem>>('/admin/ai/knowledge', { question, answer }),

  updateKnowledge: (id: string, body: { question?: string; answer?: string }) =>
    api.patch<ApiResponse<AiTrainingItem>>(`/admin/ai/knowledge/${id}`, body),

  removeKnowledge: (id: string) =>
    api.delete<ApiResponse<{ ok: boolean }>>(`/admin/ai/knowledge/${id}`),
}
