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
  awaitingEarnings?: boolean
  createdAt: string
}

export const ordersApi = {
  list: () => api.get<ApiResponse<Order[]>>('/orders'),

  latestDelivery: () => api.get<ApiResponse<Order>>('/orders/delivery/latest'),

  awaitingEarnings: () => api.get<ApiResponse<Order[]>>('/orders/awaiting-earnings'),

  create: (applicationId: string, paymentMethod: 'full' | 'bank' | 'earnings') =>
    api.post<ApiResponse<Order>>('/orders', { applicationId, paymentMethod }),

  payWithEarnings: (orderId: string) =>
    api.post<ApiResponse<Order>>(`/orders/${encodeURIComponent(orderId)}/pay-earnings`),
}
