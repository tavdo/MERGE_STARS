import { api } from '@/lib/axios'
import type { ApiResponse } from '@/shared/types/api.types'

export interface LiveMetalPrice {
  metal: string
  priceUsd: number
  changePct: number
  pricePerKgUsd: number
}

export const metalsApi = {
  getLive: () => api.get<ApiResponse<LiveMetalPrice[]>>('/metals/live'),
}
