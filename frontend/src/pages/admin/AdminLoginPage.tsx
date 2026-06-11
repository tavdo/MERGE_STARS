import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import SiteLogo from '@/components/SiteLogo'
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
    <div className="admin-login-page">
      <div className="admin-login-brand">
        <div className="admin-login-brand-inner">
          <SiteLogo size="lg" />
          <h1 className="admin-login-brand-title">MERGE STARS</h1>
          <p className="admin-login-brand-tagline">
            {t('admin.login.subtitle', { defaultValue: 'Restricted area — authorized personnel only' })}
          </p>
          <ul className="admin-login-features">
            <li>User &amp; KYC management</li>
            <li>Finance &amp; production oversight</li>
            <li>Audit trail &amp; compliance</li>
          </ul>
        </div>
      </div>

      <div className="admin-login-form-panel">
        <div className="admin-login-form-top">
          <LanguageSwitcher variant="compact" />
        </div>

        <div className="admin-login-form-wrap">
          <header className="admin-login-form-header">
            <p className="admin-login-kicker">{t('admin.login.title', { defaultValue: 'ADMIN PORTAL' })}</p>
            <h2 className="admin-login-heading">Sign in</h2>
            <p className="admin-login-desc">Use your admin or manager credentials.</p>
          </header>

          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="admin-field">
              <label className="admin-field-label" htmlFor="admin-email">
                {t('admin.login.emailLabel', { defaultValue: 'EMAIL OR USERNAME' })}
              </label>
              <input
                id="admin-email"
                className="admin-field-input"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={t('authPanel.emailOrPhonePlaceholder')}
                required
              />
            </div>

            <div className="admin-field">
              <label className="admin-field-label" htmlFor="admin-password">
                {t('admin.login.passwordLabel', { defaultValue: 'PASSWORD' })}
              </label>
              <div className="admin-field-password">
                <input
                  id="admin-password"
                  className="admin-field-input"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('authPanel.passwordPlaceholder', { defaultValue: 'Enter your password' })}
                  required
                />
                <button
                  type="button"
                  className="admin-field-toggle"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && <p className="admin-login-error">{error}</p>}

            <button type="submit" disabled={login.isPending} className="admin-login-submit">
              {login.isPending ? 'Signing in…' : t('admin.login.enter', { defaultValue: 'ENTER ADMIN PANEL' })}
            </button>
          </form>

          <p className="admin-login-back">
            <Link to="/">{t('admin.login.backToSite', { defaultValue: '← Back to public site' })}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
