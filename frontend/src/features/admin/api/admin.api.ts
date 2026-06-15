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

  updateStatus: (id: string, status: ApplicationStatus, options?: { note?: string; crystalSent?: boolean }) =>
    api.patch<ApiResponse<CoinApplication>>(`/admin/applications/${id}/status`, { status, ...options }),

  getUsers: (params?: { search?: string; kycStatus?: string }) =>
    api.get<ApiResponse<AdminUser[]>>('/admin/users', { params }),

  updateKyc: (id: string, kycStatus: 'pending' | 'verified' | 'rejected') =>
    api.patch<ApiResponse<AdminUser>>(`/admin/users/${id}/kyc`, { kycStatus }),

  getOrders: () =>
    api.get<ApiResponse<AdminOrder[]>>('/admin/orders'),

  getAnalytics: () =>
    api.get<ApiResponse<AdminAnalytics>>('/admin/analytics'),

  getSettings: () =>
    api.get<ApiResponse<PlatformSettings>>('/settings'),

  updateSettings: (body: Partial<PlatformSettings>) =>
    api.patch<ApiResponse<PlatformSettings>>('/settings', body),

  exportCsv: () =>
    api.get('/admin/applications/export', { responseType: 'blob' }),
}

export interface PlatformSettings {
  tickerEnabled: boolean
  aiEnabled: boolean
  autoVerify: boolean
  platformShare: string
  brandShare: string
  referrerShare: string
  updatedAt: string
}

export interface AdminAnalytics {
  stats: { label: string; value: string; change: string; up: boolean; color: string }[]
  monthly: { month: string; orders: number; revenue: number }[]
  countries: { country: string; count: number; pct: number }[]
  funnel: { stage: string; count: number; pct: number }[]
  shares: { platform: string; brand: string; referrer: string }
}

export interface AdminUser {
  id: string
  email: string
  phone: string | null
  firstName: string
  lastName: string
  mergeId: string
  personalId: string | null
  name: string
  joined: string
  roles: string[]
  status: string
  kycStatus: string
}

export interface AdminOrder {
  id: string
  internalId: string
  userId: string
  applicationId: string | null
  amount: number
  paymentMethod: string
  status: string
  createdAt: string
  user: string
  userEmail: string | null
  coinType: string | null
  crystalSent: boolean
  appStatus: string | null
}
