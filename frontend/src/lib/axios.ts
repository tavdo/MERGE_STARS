import axios from 'axios'
import { useAuthStore } from '@/features/auth/store/auth.store'

/** Prefer relative /api in production builds; never leave localhost as fallback on live. */
const apiBase =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '/api' : 'http://localhost:3000')

export const api = axios.create({
  baseURL: apiBase,
  withCredentials: true,   // send HttpOnly refresh token cookie
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token on every request; let the browser set multipart boundaries
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

// Auto-refresh on 401
let isRefreshing = false
let queue: Array<(token: string) => void> = []

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }
    original._retry = true

    if (isRefreshing) {
      return new Promise((resolve) => {
        queue.push((token) => {
          original.headers.Authorization = `Bearer ${token}`
          resolve(api(original))
        })
      })
    }

    isRefreshing = true
    try {
      const { data } = await api.post<{ data: { accessToken: string } }>('/auth/refresh')
      const newToken = data.data.accessToken
      useAuthStore.getState().setSession(newToken, useAuthStore.getState().user!)
      queue.forEach((cb) => cb(newToken))
      queue = []
      original.headers.Authorization = `Bearer ${newToken}`
      return api(original)
    } catch {
      useAuthStore.getState().clearSession()
      window.location.href = '/login'
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  }
)
