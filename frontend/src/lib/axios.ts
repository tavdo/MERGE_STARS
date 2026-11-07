import axios from 'axios'
import type { AuthUser } from '@/features/auth/types'
import { useAuthStore } from '@/features/auth/store/auth.store'

/** Prefer relative /api in production builds; never leave localhost as fallback on live. */
const apiBase =
  import.meta.env.VITE_API_URL ||
  '/api'

export const api = axios.create({
  baseURL: apiBase,
  withCredentials: true,   // send HttpOnly refresh token cookie
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token on every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token && !config.headers.has('Authorization')) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
let refreshPromise: Promise<string> | null = null

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (!original || error.response?.status !== 401 || original._retry || original.url?.startsWith('/auth/')) {
      return Promise.reject(error)
    }
    original._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = api.post<{ data: { accessToken: string | null; user?: AuthUser } }>('/auth/refresh')
          .then(({ data }) => {
            const { accessToken, user } = data.data
            if (!accessToken || !user) throw new Error('Session expired')
            useAuthStore.getState().setSession(accessToken, user)
            return accessToken
          })
          .finally(() => { refreshPromise = null })
      }
      const newToken = await refreshPromise
      original.headers.Authorization = `Bearer ${newToken}`
      return api(original)
    } catch (refreshError) {
      useAuthStore.getState().clearSession()
      window.location.href = window.location.pathname.startsWith('/admin') ? '/admin/login' : '/login'
      return Promise.reject(refreshError)
    }
  }
)
