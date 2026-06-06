import { api } from '@/lib/axios'
import type { ApiResponse } from '@/shared/types/api.types'

export const contactApi = {
  sendMessage: (payload: {
    firstName: string
    lastName: string
    email: string
    subject: string
    message: string
  }) => api.post<ApiResponse<{ ok: boolean; id: string }>>('/contact/messages', payload),
}
