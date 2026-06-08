import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authApi } from '@/features/auth/api/auth.api'
import { getApiErrorMessage } from '@/shared/utils/apiError'

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await authApi.forgotPassword(email.trim().toLowerCase())
      setSent(true)
    } catch (err) {
      setError(getApiErrorMessage(err, t('authPanel.forgotFailed', { defaultValue: 'Could not send reset email' })))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#080808' }}>
      <div className="w-full max-w-md">
        <h1 className="text-center text-[11px] font-bold tracking-[0.3em] mb-8" style={{ color: '#c9a84c' }}>
          {t('authPanel.forgotTitle', { defaultValue: 'RESET PASSWORD' })}
        </h1>

        {sent ? (
          <p className="text-center text-[13px] leading-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {t('authPanel.forgotSent', { defaultValue: 'If that email is registered, we sent a reset link. Check your inbox.' })}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="text-[11px] font-semibold tracking-[0.12em] block mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {t('auth.email')}
              </label>
              <input
                className="gold-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('authPanel.emailPlaceholder')}
                required
              />
            </div>
            {error && <p className="text-[12px] text-center" style={{ color: '#f87171' }}>{error}</p>}
            <button type="submit" disabled={loading} className="gold-btn w-full justify-center">
              {loading ? '…' : t('authPanel.sendResetLink', { defaultValue: 'SEND RESET LINK' })}
            </button>
          </form>
        )}

        <Link to="/login" className="block text-center mt-8 text-[11px] tracking-widest" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
          {t('authPanel.backToLogin', { defaultValue: '← BACK TO LOGIN' })}
        </Link>
      </div>
    </div>
  )
}
