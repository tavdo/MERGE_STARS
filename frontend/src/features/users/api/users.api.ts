import { api } from '@/lib/axios'
import type { ApiResponse, Role } from '@/shared/types/api.types'

export const SOCIAL_LINK_KEYS = [
  'tiktok',
  'facebook',
  'instagram',
  'linkedin',
  'whatsapp',
  'youtube',
  'x',
  'telegram',
  'website',
] as const

export type SocialLinkKey = (typeof SOCIAL_LINK_KEYS)[number]

export type SocialLinks = Partial<Record<SocialLinkKey, string>>

export interface UserProfile {
  id: string
  email: string
  phone: string | null
  firstName: string
  lastName: string
  mergeId: string
  founderId: string | null
  brandLineId: string | null
  roles: Role[]
  status: string
  kycStatus: string
  avatarUrl: string | null
  socialLinks?: SocialLinks
  createdAt: string
}

export interface UpdateProfilePayload {
  firstName?: string
  lastName?: string
  phone?: string
  socialLinks?: Partial<Record<SocialLinkKey, string | null>>
}

const apiBase = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export const usersApi = {
  getMe: () => api.get<ApiResponse<UserProfile>>('/users/me'),

  updateMe: (payload: UpdateProfilePayload) =>
    api.patch<ApiResponse<UserProfile>>('/users/me', payload),

  uploadAvatar: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<ApiResponse<UserProfile>>('/users/me/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  avatarFileUrl: () => `${apiBase}/users/me/avatar/file`,

  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch<ApiResponse<{ ok: boolean; message: string }>>('/users/me/password', {
      currentPassword,
      newPassword,
    }),

  requestEmailChange: (newEmail: string) =>
    api.post<ApiResponse<{ ok: boolean; message: string }>>('/users/me/email/request', {
      newEmail,
    }),

  confirmEmailChange: (newEmail: string, code: string, currentPassword: string) =>
    api.patch<ApiResponse<UserProfile>>('/users/me/email', {
      newEmail,
      code,
      currentPassword,
    }),
}
