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
  publicUrlPath?: string | null
}

export interface PublicBrandProduct {
  id: string
  title: string
  description: string | null
  metalType: string | null
  imageUrl: string | null
  model3dUrl?: string | null
  model3dFormat?: string | null
  hasImage?: boolean
  hasModel3d?: boolean
  collectionSlug?: string
  collectionTitle?: string
}

export interface PublicBrandCollection {
  id: string
  title: string
  description: string | null
  slug: string
  itemCount: number
  items?: PublicBrandProduct[]
}

export interface PublicBrandOwner {
  firstName: string
  lastName: string
  nickname?: string | null
  displayName: string
  mergeId: string
  brandLineId: string | null
  founderId: string | null
  hasAvatar: boolean
  avatarUrl: string | null
  socialLinks?: Partial<
    Record<
      | 'tiktok'
      | 'facebook'
      | 'instagram'
      | 'linkedin'
      | 'whatsapp'
      | 'youtube'
      | 'x'
      | 'telegram'
      | 'website',
      string
    >
  >
  profilePath: string
  brandPath: string
}

export interface PublicBrandProfile {
  brandLineId: string | null
  mergeId: string
  name: string
  description: string | null
  hasLogo: boolean
  logoUrl: string | null
  profileViews: number
  qrScans: number
  activeProducts: number
  ownerName: string
  owner: PublicBrandOwner
  collections: PublicBrandCollection[]
  products: PublicBrandProduct[]
}

export interface BrandRoomCard {
  brandLineId: string | null
  mergeId: string
  name: string
  description: string | null
  hasLogo: boolean
  logoUrl: string | null
  profileViews: number
  activeProducts: number
  collectionCount: number
  ownerName: string
  hasAvatar: boolean
  avatarUrl: string | null
  collections: Array<{ id: string; title: string; slug: string; itemCount: number }>
  previewProducts: PublicBrandProduct[]
}

const apiBase = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000')).replace(
  /\/$/,
  '',
)

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

  listPublic: (limit = 60) =>
    api.get<ApiResponse<BrandRoomCard[]>>('/brand/public', { params: { limit } }),

  getPublic: (id: string) =>
    api.get<ApiResponse<PublicBrandProfile>>(`/brand/public/${encodeURIComponent(id)}`),

  trackPublicView: (id: string) =>
    api.post<ApiResponse<{ profileViews: number }>>(`/brand/public/${encodeURIComponent(id)}/view`),

  trackPublicScan: (id: string) =>
    api.post<ApiResponse<{ qrScans: number }>>(`/brand/public/${encodeURIComponent(id)}/scan`),
}
