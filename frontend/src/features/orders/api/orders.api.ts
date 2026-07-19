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
  trackingCode: string | null
  courier: string | null
  estDeliveryAt: string | null
  deliveryStatus: string
  shippedAt: string | null
  deliveredAt: string | null
  createdAt: string
}

export const ordersApi = {
  list: () => api.get<ApiResponse<Order[]>>('/orders'),

  latestDelivery: () => api.get<ApiResponse<Order>>('/orders/delivery/latest'),

  create: (applicationId: string, paymentMethod: 'full' | 'bank' | 'earnings') =>
    api.post<ApiResponse<Order>>('/orders', { applicationId, paymentMethod }),
}
