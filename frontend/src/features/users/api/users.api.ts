import { api } from '@/lib/axios'
import type { ApiResponse, Role } from '@/shared/types/api.types'

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
  createdAt: string
}

export interface UpdateProfilePayload {
  firstName?: string
  lastName?: string
  phone?: string
}

export const usersApi = {
  getMe: () => api.get<ApiResponse<UserProfile>>('/users/me'),

  updateMe: (payload: UpdateProfilePayload) =>
    api.patch<ApiResponse<UserProfile>>('/users/me', payload),
}
