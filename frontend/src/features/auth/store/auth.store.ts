import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Role } from '@/shared/types/api.types'

interface AuthUser {
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
  setSession: (token: string, user: AuthUser, rememberMe?: boolean) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setSession: (accessToken, user, rememberMe) => {
        if (rememberMe !== undefined) localStorage.setItem('merge-stars-remember', String(rememberMe))
        set({ accessToken, user })
      },
      clearSession: () => set({ accessToken: null, user: null }),
    }),
    {
      name: 'merge-stars-auth',
      storage: createJSONStorage(() => ({
        getItem: (name) => sessionStorage.getItem(name) ?? localStorage.getItem(name),
        setItem: (name, value) => {
          const persistent = localStorage.getItem('merge-stars-remember') === 'true'
          const storage = persistent ? localStorage : sessionStorage
          const other = persistent ? sessionStorage : localStorage
          storage.setItem(name, value)
          other.removeItem(name)
        },
        removeItem: (name) => { localStorage.removeItem(name); sessionStorage.removeItem(name) },
      })),
    },
  ),
)
