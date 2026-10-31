import { api } from '@/lib/axios'
import type { ApiResponse } from '@/shared/types/api.types'

export interface LiveMetalPrice {
  metal: string
  priceUsd: number
  changePct: number
  source: string
  sourceTimestamp: string
  retrievedAt: string
  validUntil: string
  pricePerKgUsd: number
}

export const metalsApi = {
  getLive: () => api.get<ApiResponse<LiveMetalPrice[]>>('/metals/live'),
}
