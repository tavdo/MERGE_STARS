import { api } from '@/lib/axios'
import type { ApiResponse } from '@/shared/types/api.types'

export interface BrandLineProfile {
  id: string
  userId: string
  name: string | null
  description: string | null
  logoUrl: string | null
  profileViews: number
  qrScans: number
  activeProducts: number
  brandLineId: string | null
}

const apiBase = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export const brandApi = {
  getMine: () => api.get<ApiResponse<BrandLineProfile>>('/brand/me'),

  update: (payload: { name?: string; description?: string }) =>
    api.patch<ApiResponse<BrandLineProfile>>('/brand/me', payload),

  uploadLogo: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<ApiResponse<BrandLineProfile>>('/brand/me/logo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  logoFileUrl: () => `${apiBase}/brand/me/logo/file`,

  trackView: () => api.post<ApiResponse<{ profileViews: number }>>('/brand/me/track-view'),

  trackQrScan: () => api.post<ApiResponse<{ qrScans: number }>>('/brand/me/track-qr-scan'),
}
