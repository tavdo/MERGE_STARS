import type { AxiosError } from 'axios'
import type { ApiError } from '@/shared/types/api.types'

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const axiosErr = error as AxiosError<ApiError>
  const msg = axiosErr.response?.data?.error?.message
  if (msg && typeof msg === 'string') return msg
  if (axiosErr.message) return axiosErr.message
  return fallback
}
