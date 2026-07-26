import { api } from '@/lib/axios'
import type { ApiResponse } from '@/shared/types/api.types'

export interface WalletTransaction {
  id: string
  type: 'credit' | 'debit'
  amount: number
  balanceAfter: number
  reason: string
  note: string | null
  orderId: string | null
  meta: Record<string, unknown> | null
  createdAt: string
}

export interface WalletMe {
  balance: number
  currency: string
  activated: boolean
  activatedAt: string | null
  totalEarned: number
  totalSpent: number
  transactions: WalletTransaction[]
}

export const walletApi = {
  me: (limit?: number) =>
    api.get<ApiResponse<WalletMe>>('/wallet/me', { params: limit ? { limit } : undefined }),

  activate: () =>
    api.post<ApiResponse<{ activated: boolean; activatedAt: string }>>('/wallet/activate'),
}
