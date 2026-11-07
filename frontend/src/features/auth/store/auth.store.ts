import { queryClient } from '@/lib/queryClient'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Role } from '@/shared/types/api.types'

export interface AuthUser {
  id: string
  firstName: string
  lastName: string
  email: string
  mergeId: string
  roles: Role[]
}

interface AuthStore {
  accessToken: string | null
  user: AuthUser | null
  setSession: (token: string, user: AuthUser) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      setSession: (accessToken, user) => {
        if (get().user?.id !== user.id) queryClient.clear()
        set({ accessToken, user })
      },
      clearSession: () => {
        queryClient.clear()
        set({ accessToken: null, user: null })
      },
    }),
    { name: 'merge-stars-auth' },
  ),
)
