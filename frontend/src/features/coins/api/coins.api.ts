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
  notes?: string | null
  metalType?: string | null
  financingPreference?: string | null
  financingTermMonths?: number | null
  deliveryAddress?: string | null
  additionalNotes?: string | null
}

export interface SubmitApplicationPayload {
  coinType: string
  quantity: number
  metalPurity?: number
  metalType?: string
  coinValue: number
  notes?: string
  firstName?: string
  lastName?: string
  personalId?: string
  phone?: string
  contactEmail?: string
  financingPreference?: string
  financingTermMonths?: number
  deliveryAddress?: string
  additionalNotes?: string
}

export const coinsApi = {
  getApplications: () =>
    api.get<ApiResponse<CoinApplication[]>>('/coins/applications'),

  getLatestApplication: () =>
    api.get<ApiResponse<CoinApplication | null>>('/coins/applications/latest'),

  getApplication: (id: string) =>
    api.get<ApiResponse<CoinApplication>>(`/coins/applications/${id}`),

  submitApplication: (payload: SubmitApplicationPayload) =>
    api.post<ApiResponse<CoinApplication>>('/coins/applications', payload),
}
