import { api } from '@/lib/axios'
import type { ApiResponse } from '@/shared/types/api.types'

export interface ReferralRow {
  id: string
  user: string
  date: string
  status: string
  order: string
}

export interface ReferralStats {
  total: number
  verified: number
  pending: number
  shareLink: string
  qrRef: string
  platformShare: string
}

export const referralsApi = {
  list: () =>
    api.get<ApiResponse<ReferralRow[]>>('/referrals'),

  stats: () =>
    api.get<ApiResponse<ReferralStats>>('/referrals/stats'),
}
