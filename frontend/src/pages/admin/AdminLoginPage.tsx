import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useAdminLogin } from '@/features/auth/hooks/useAuth'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import { ROUTES } from '@/router/routes'

export default function AdminLoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const login = useAdminLogin()
  const token = useAuthStore((s) => s.accessToken)
  const user = useAuthStore((s) => s.user)

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token || !user) return
    const isAdmin = user.roles.some((r) => r === 'admin' || r === 'manager')
    if (!isAdmin) return
    const next = searchParams.get('next')
    const dest = next && next.startsWith('/admin') && next !== ROUTES.ADMIN_LOGIN ? next : ROUTES.ADMIN
    navigate(dest, { replace: true })
  }, [token, user, navigate, searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    login.mutate(
      { identifier: identifier.trim(), password },
      {
        onError: (err) => {
          const code = (err as { code?: string })?.code
          if (code === 'ADMIN_ACCESS_DENIED') {
            setError(t('admin.login.denied'))
            return
          }
          setError(getApiErrorMessage(err, t('admin.login.denied')))
        },
      },
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#050505' }}>
      <div className="absolute top-6 end-6">
        <LanguageSwitcher variant="compact" />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center text-black font-black text-2xl mb-4"
            style={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg,#c9a84c,#f5d78e)',
              borderRadius: 4,
            }}
          >
            ★
          </div>
          <p className="text-[11px] font-bold tracking-[0.35em] mb-2" style={{ color: '#c9a84c' }}>
            MERGE STARS
          </p>
          <h1 className="text-2xl font-black text-white mb-2">
            {t('admin.login.title', { defaultValue: 'ADMIN PORTAL' })}
          </h1>
          <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {t('admin.login.subtitle', {
              defaultValue: 'Restricted area — authorized personnel only',
            })}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="gold-card flex flex-col gap-5 p-8"
          style={{ borderRadius: 4 }}
        >
          <div>
            <label className="auth-field-label">{t('auth.email')}</label>
            <input
              className="gold-input"
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={t('authPanel.emailOrPhonePlaceholder')}
              required
            />
          </div>
          <div>
            <label className="auth-field-label">{t('auth.password')}</label>
            <div className="relative">
              <input
                className="gold-input pr-12"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute end-4 top-1/2 -translate-y-1/2 text-[13px]"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-[12px] text-center" style={{ color: '#f87171' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={login.isPending}
            className="gold-btn w-full justify-center"
            style={{ borderRadius: 2 }}
          >
            {login.isPending
              ? '…'
              : t('admin.login.enter', { defaultValue: 'ENTER ADMIN PANEL' })}
          </button>
        </form>

        <p className="text-center mt-8 text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
          <Link to="/" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
            {t('admin.login.backToSite', { defaultValue: '← Back to public site' })}
          </Link>
        </p>
      </div>
    </div>
  )
}
