import { api } from '@/lib/axios'
import type { ApiResponse } from '@/shared/types/api.types'

export interface CoinApplication {
  id: string
  coinType: string
  quantity: number
  metalPurity: number
  coinValue: number
  status: string
  submittedAt: string
  updatedAt?: string
  user?: string
  crystal?: string
}

export const coinsApi = {
  getApplications: () =>
    api.get<ApiResponse<CoinApplication[]>>('/coins/applications'),

  getLatestApplication: () =>
    api.get<ApiResponse<CoinApplication | null>>('/coins/applications/latest'),

  getApplication: (id: string) =>
    api.get<ApiResponse<CoinApplication>>(`/coins/applications/${id}`),

  submitApplication: (payload: Omit<CoinApplication, 'id' | 'status' | 'submittedAt'>) =>
    api.post<ApiResponse<CoinApplication>>('/coins/applications', payload),
}
