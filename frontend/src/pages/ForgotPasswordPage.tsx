import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authApi } from '@/features/auth/api/auth.api'
import { getApiErrorMessage } from '@/shared/utils/apiError'

type Step = 1 | 2

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await authApi.forgotPassword(email.trim().toLowerCase())
      setCodeSent(true)
      setStep(2)
    } catch (err) {
      setError(getApiErrorMessage(err, t('authPanel.forgotFailed', { defaultValue: 'Could not send reset code' })))
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      setError(t('authPanel.passwordTooShort', { defaultValue: 'Password must be at least 8 characters' }))
      return
    }
    if (password !== confirm) {
      setError(t('authPanel.passwordMismatch', { defaultValue: 'Passwords do not match' }))
      return
    }
    if (!/^\d{6}$/.test(code.trim())) {
      setError(t('authPanel.codeRequired', { defaultValue: 'Enter the 6-digit code sent to your email' }))
      return
    }

    setError(null)
    setLoading(true)
    try {
      await authApi.resetPassword(code.trim(), password, email.trim().toLowerCase())
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
          {t('authPanel.forgotTitle', { defaultValue: 'RESET PASSWORD' })}
        </h1>

        {step === 1 ? (
          <form onSubmit={handleSendCode} className="flex flex-col gap-5">
            <p className="text-center text-[12px] leading-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {t('authPanel.forgotHint', { defaultValue: 'Enter your email and we will send a 6-digit reset code.' })}
            </p>
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
              {loading ? '…' : t('authPanel.sendResetCode', { defaultValue: 'SEND RESET CODE' })}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="flex flex-col gap-5">
            {codeSent && (
              <p className="text-center text-[12px] leading-6" style={{ color: '#86efac' }}>
                {t('authPanel.resetCodeSent', { defaultValue: 'Reset code sent — check your inbox (and spam folder).' })}
              </p>
            )}
            <div>
              <label className="text-[11px] font-semibold tracking-[0.12em] block mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {t('authPanel.resetCode', { defaultValue: 'Reset code' })}
              </label>
              <input
                className="gold-input"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={t('authPanel.codePlaceholder')}
                required
              />
            </div>
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
            <button
              type="button"
              onClick={() => { setStep(1); setCodeSent(false); setCode(''); setError(null) }}
              className="text-[11px] tracking-widest text-center"
              style={{ color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {t('authPanel.resendResetCode', { defaultValue: '← Use a different email' })}
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
