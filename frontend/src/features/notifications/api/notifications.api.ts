import { api } from '@/lib/axios'
import type { ApiResponse } from '@/shared/types/api.types'

export interface NotificationItem {
  id: string
  type: string
  title: string
  body: string
  meta: Record<string, unknown> | null
  read: boolean
  createdAt: string
}

export const notificationsApi = {
  list: (limit?: number) =>
    api.get<ApiResponse<NotificationItem[]>>('/notifications', { params: limit ? { limit } : undefined }),

  unreadCount: () =>
    api.get<ApiResponse<number>>('/notifications/unread-count'),

  markRead: (id: string) =>
    api.patch<ApiResponse<NotificationItem>>(`/notifications/${id}/read`),

  markAllRead: () =>
    api.patch<ApiResponse<{ ok: boolean }>>('/notifications/read-all'),
}
