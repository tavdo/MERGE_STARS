import { api } from '@/lib/axios'
import type { LoginPayload, RegisterPayload, AuthTokens } from '../types'
import type { ApiResponse } from '@/shared/types/api.types'
import type { AuthUser } from '../types'

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<ApiResponse<AuthTokens>>('/auth/login', {
      identifier: payload.identifier,
      password: payload.password,
    }),

  register: (payload: RegisterPayload) =>
    api.post<ApiResponse<AuthTokens>>('/auth/register', payload),

  me: () => api.get<ApiResponse<AuthUser>>('/users/me'),

  sendVerificationCode: (phone: string) =>
    api.post('/auth/send-code', { phone }),

  refresh: () =>
    api.post<ApiResponse<AuthTokens>>('/auth/refresh'),

  logout: () =>
    api.post('/auth/logout'),
}
