import axios from 'axios'
import { useAuthStore, type AuthUser } from '@/features/auth/store/auth.store'

/** Prefer relative /api in production builds; never leave localhost as fallback on live. */
const apiBase =
  import.meta.env.VITE_API_URL ||
  '/api'

export const api = axios.create({
  baseURL: apiBase,
  withCredentials: true,   // send HttpOnly refresh token cookie
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token on every request; let the browser set multipart boundaries
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token && !config.headers.has('Authorization')) config.headers.Authorization = `Bearer ${token}`
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

// Share one refresh request per session, including failures.
let refreshing: { previous: string; promise: Promise<string> } | null = null

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const previous = useAuthStore.getState().accessToken
    if (!original || !previous || error.response?.status !== 401 || original._retry || original.url?.startsWith('/auth/')) {
      throw error
    }
    if (original.headers?.get('Authorization') !== `Bearer ${previous}`) throw error
    original._retry = true
    if (!refreshing || refreshing.previous !== previous) {
      const promise = api.post<{ data: { accessToken: string | null; user?: AuthUser } }>('/auth/refresh')
        .then(({ data: { data } }) => {
          if (useAuthStore.getState().accessToken !== previous) throw new Error('Session changed')
          if (!data.accessToken || !data.user) throw new Error('Session expired')
          useAuthStore.getState().setSession(data.accessToken, data.user)
          return data.accessToken
        })
        .finally(() => {
          if (refreshing?.promise === promise) refreshing = null
        })
      refreshing = { previous, promise }
    }
    try {
      const token = await refreshing.promise
      if (useAuthStore.getState().accessToken !== token) throw new Error('Session changed')
      original.headers.Authorization = `Bearer ${token}`
      return api(original)
    } catch (refreshError) {
      if (useAuthStore.getState().accessToken === previous) {
        useAuthStore.getState().clearSession()
        window.location.href = window.location.pathname.startsWith('/admin') ? '/admin/login' : '/login'
      }
      throw refreshError
    }
  },
)
