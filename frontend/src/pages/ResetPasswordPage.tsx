import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authApi } from '@/features/auth/api/auth.api'
import { getApiErrorMessage } from '@/shared/utils/apiError'

export default function ResetPasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      setError(t('authPanel.passwordTooShort', { defaultValue: 'Password must be at least 8 characters' }))
      return
    }
    if (password !== confirm) {
      setError(t('authPanel.passwordMismatch', { defaultValue: 'Passwords do not match' }))
      return
    }
    if (!token) {
      setError(t('authPanel.resetInvalid', { defaultValue: 'Invalid reset link' }))
      return
    }

    setError(null)
    setLoading(true)
    try {
      await authApi.resetPassword(token, password)
      navigate('/login', { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, t('authPanel.resetFailed', { defaultValue: 'Could not reset password' })))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#080808' }}>
      <div className="w-full max-w-md">
        <h1 className="text-center text-[11px] font-bold tracking-[0.3em] mb-8" style={{ color: '#c9a84c' }}>
          {t('authPanel.resetTitle', { defaultValue: 'NEW PASSWORD' })}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="text-[11px] font-semibold tracking-[0.12em] block mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {t('auth.password')}
            </label>
            <input className="gold-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </div>
          <div>
            <label className="text-[11px] font-semibold tracking-[0.12em] block mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {t('auth.confirmPassword')}
            </label>
            <input className="gold-input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} />
          </div>
          {error && <p className="text-[12px] text-center" style={{ color: '#f87171' }}>{error}</p>}
          <button type="submit" disabled={loading} className="gold-btn w-full justify-center">
            {loading ? '…' : t('authPanel.savePassword', { defaultValue: 'SAVE PASSWORD' })}
          </button>
        </form>

        <Link to="/login" className="block text-center mt-8 text-[11px] tracking-widest" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
          {t('authPanel.backToLogin', { defaultValue: '← BACK TO LOGIN' })}
        </Link>
      </div>
    </div>
  )
}
