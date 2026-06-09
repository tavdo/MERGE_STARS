import { useMutation } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '../store/auth.store'
import { connectSocket, disconnectSocket } from '@/lib/socket'
import { ROUTES } from '@/router/routes'
import type { LoginPayload, RegisterPayload } from '../types'
import type { Role } from '@/shared/types/api.types'

function mapUser(u: {
  id: string
  email: string
  firstName: string
  lastName: string
  mergeId: string
  roles: string[]
}) {
  return {
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    mergeId: u.mergeId,
    roles: u.roles as Role[],
  }
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: ({ data }) => {
      const { accessToken, user } = data.data
      setSession(accessToken, mapUser(user))
      connectSocket(accessToken)
      navigate(ROUTES.DASHBOARD)
    },
  })
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: ({ data }) => {
      const { accessToken, user } = data.data
      setSession(accessToken, mapUser(user))
      connectSocket(accessToken)
      navigate(ROUTES.DASHBOARD)
    },
  })
}

export function useAdminLogin() {
  const setSession = useAuthStore((s) => s.setSession)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const res = await authApi.login(payload)
      const user = res.data.data.user
      const allowed = user.roles.some((r) => r === 'admin' || r === 'manager')
      if (!allowed) {
        await authApi.logout()
        const err = new Error('ADMIN_ACCESS_DENIED') as Error & { code: string }
        err.code = 'ADMIN_ACCESS_DENIED'
        throw err
      }
      return res
    },
    onSuccess: ({ data }) => {
      const { accessToken, user } = data.data
      setSession(accessToken, mapUser(user))
      connectSocket(accessToken)
      const next = searchParams.get('next')
      const dest =
        next && next.startsWith('/admin') && next !== '/admin/login' ? next : ROUTES.ADMIN
      navigate(dest, { replace: true })
    },
  })
}

export function useLogout(redirectTo: string = ROUTES.LOGIN) {
  const clearSession = useAuthStore((s) => s.clearSession)
  const navigate = useNavigate()

  return () => {
    disconnectSocket()
    authApi.logout().finally(() => {
      clearSession()
      navigate(redirectTo)
    })
  }
}

export function useAdminLogout() {
  return useLogout('/admin/login')
}
