import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '../store/auth.store'
import { connectSocket } from '@/lib/socket'
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

export function useLogout() {
  const clearSession = useAuthStore((s) => s.clearSession)
  const navigate = useNavigate()

  return () => {
    authApi.logout().finally(() => {
      clearSession()
      navigate(ROUTES.LOGIN)
    })
  }
}
