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

  sendEmailVerificationCode: (email: string) =>
    api.post<ApiResponse<{ ok: boolean; message: string }>>('/auth/send-verification-code', { email }),

  sendPhoneVerificationCode: (phone: string) =>
    api.post<ApiResponse<{ ok: boolean; message: string }>>('/auth/send-phone-code', { phone }),

  googleLogin: (idToken: string, opts?: { referralCode?: string; referralSource?: string }) =>
    api.post<ApiResponse<AuthTokens>>('/auth/google', {
      idToken,
      ...(opts?.referralCode ? { referralCode: opts.referralCode } : {}),
      ...(opts?.referralSource ? { referralSource: opts.referralSource } : {}),
    }),

  forgotPassword: (email: string) =>
    api.post<ApiResponse<{ ok: boolean; message: string }>>('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string, email?: string) =>
    api.post<ApiResponse<{ ok: boolean; message: string }>>('/auth/reset-password', {
      token,
      password,
      ...(email ? { email } : {}),
    }),

  refresh: () =>
    api.post<ApiResponse<AuthTokens>>('/auth/refresh'),

  logout: () =>
    api.post('/auth/logout'),
}
