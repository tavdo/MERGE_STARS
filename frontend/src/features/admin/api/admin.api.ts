import { api } from '@/lib/axios'
import type { ApiResponse, ApplicationStatus } from '@/shared/types/api.types'
import type { CoinApplication } from '@/features/coins/api/coins.api'

export const adminApi = {
  getApplications: (params?: { status?: ApplicationStatus; page?: number; limit?: number; search?: string }) =>
    api.get<ApiResponse<CoinApplication[]>>('/admin/applications', { params }),

  getStats: () =>
    api.get<ApiResponse<{
      totalApplications: number
      approved: number
      rejected: number
      inProduction: number
      totalFunds: number
    }>>('/admin/applications/stats'),

  getApplication: (id: string) =>
    api.get<ApiResponse<CoinApplication>>(`/admin/applications/${id}`),

  updateStatus: (id: string, status: ApplicationStatus, note?: string) =>
    api.patch<ApiResponse<CoinApplication>>(`/admin/applications/${id}/status`, { status, note }),

  exportCsv: () =>
    api.get('/admin/applications/export', { responseType: 'blob' }),
}
