import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { ROUTES } from '@/router/routes'

const ADMIN_ROLES = ['admin', 'manager'] as const

export default function AdminGuard() {
  const token = useAuthStore((s) => s.accessToken)
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!token) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`${ROUTES.ADMIN_LOGIN}?next=${next}`} replace />
  }

  const allowed = user?.roles.some((r) => ADMIN_ROLES.includes(r as (typeof ADMIN_ROLES)[number]))
  if (!allowed) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return <Outlet />
}
