import { api } from '@/lib/axios'
import type { ApiResponse } from '@/shared/types/api.types'
import type { CoinApplication } from '@/features/coins/api/coins.api'

export interface DashboardSummary {
  user: {
    id: string
    email?: string
    phone?: string | null
    firstName: string
    lastName: string
    mergeId: string
    founderId: string | null
    brandLineId: string | null
    kycStatus?: string
  }
  coinBalance: number
  registeredValue: number
  application: CoinApplication | null
  orderCount: number
}

export interface ActivityItem {
  text: string
  time: string
  type: string
}

export const dashboardApi = {
  getSummary: () => api.get<ApiResponse<DashboardSummary>>('/dashboard/summary'),

  getActivity: () => api.get<ApiResponse<ActivityItem[]>>('/dashboard/activity'),
}
