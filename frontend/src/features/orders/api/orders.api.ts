import { api } from '@/lib/axios'
import type { ApiResponse } from '@/shared/types/api.types'

export interface Order {
  id: string
  amount: number
  paymentMethod: string
  status: string
  applicationId: string | null
  coinType: string | null
  quantity: number | null
  createdAt: string
}

export const ordersApi = {
  list: () => api.get<ApiResponse<Order[]>>('/orders'),
  create: (applicationId: string, paymentMethod: 'full' | 'bank') =>
    api.post<ApiResponse<Order>>('/orders', { applicationId, paymentMethod }),
}
