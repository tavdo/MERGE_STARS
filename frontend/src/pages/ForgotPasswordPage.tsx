import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authApi } from '@/features/auth/api/auth.api'
import { getApiErrorMessage } from '@/shared/utils/apiError'

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sendingCode, setSendingCode] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSendCode = async () => {
    const addr = email.trim().toLowerCase()
    if (!addr || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) {
      setError(t('authPanel.emailInvalid', { defaultValue: 'Enter a valid email address' }))
      return
    }
    setError(null)
    setSendingCode(true)
    try {
      await authApi.forgotPassword(addr)
      setCodeSent(true)
    } catch (err) {
      setError(getApiErrorMessage(err, t('authPanel.forgotFailed', { defaultValue: 'Could not send reset code' })))
    } finally {
      setSendingCode(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    const addr = email.trim().toLowerCase()
    if (!addr || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) {
      setError(t('authPanel.emailInvalid', { defaultValue: 'Enter a valid email address' }))
      return
    }
    if (!codeSent) {
      setError(t('authPanel.sendResetCodeFirst', { defaultValue: 'Click “Send code” and check your email first' }))
      return
    }
    if (!/^\d{6}$/.test(code.trim())) {
      setError(t('authPanel.codeRequired', { defaultValue: 'Enter the 6-digit code sent to your email' }))
      return
    }
    if (password.length < 8) {
      setError(t('authPanel.passwordTooShort', { defaultValue: 'Password must be at least 8 characters' }))
      return
    }
    if (password !== confirm) {
      setError(t('authPanel.passwordMismatch', { defaultValue: 'Passwords do not match' }))
      return
    }

    setError(null)
    setSaving(true)
    try {
      await authApi.resetPassword(code.trim(), password, addr)
      navigate('/login', { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, t('authPanel.resetFailed', { defaultValue: 'Could not reset password' })))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#080808' }}>
      <div className="w-full max-w-md">
        <h1 className="text-center text-[11px] font-bold tracking-[0.3em] mb-4" style={{ color: '#c9a84c' }}>
          {t('authPanel.forgotTitle', { defaultValue: 'RESET PASSWORD' })}
        </h1>
        <p className="text-center text-[12px] leading-6 mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {t('authPanel.forgotHint', { defaultValue: 'Send a code to your email, then enter it below with your new password.' })}
        </p>

        <form onSubmit={handleReset} className="flex flex-col gap-5">
          <div>
            <label className="text-[11px] font-semibold tracking-[0.12em] block mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {t('auth.email')}
            </label>
            <div className="flex gap-2">
              <input
                className="gold-input flex-1"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setCodeSent(false) }}
                placeholder={t('authPanel.emailPlaceholder')}
                required
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={sendingCode}
                className="gold-btn-outline shrink-0 px-4"
                style={{ borderRadius: '2px', whiteSpace: 'nowrap' }}
              >
                {sendingCode ? '…' : t('authPanel.sendCode', { defaultValue: 'Send code' })}
              </button>
            </div>
            {codeSent && (
              <p className="text-[11px] mt-1" style={{ color: '#86efac' }}>
                {t('authPanel.resetCodeSent', { defaultValue: 'Reset code sent — check your inbox (and spam folder).' })}
              </p>
            )}
          </div>

          <div>
            <label className="text-[11px] font-semibold tracking-[0.12em] block mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {t('authPanel.resetCode', { defaultValue: 'Reset code' })}
            </label>
            <input
              className="gold-input"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder={t('authPanel.codePlaceholder', { defaultValue: 'Enter 6-digit code' })}
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold tracking-[0.12em] block mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {t('auth.password')}
            </label>
            <input
              className="gold-input"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('authPanel.passwordCreatePlaceholder', { defaultValue: 'Create your password' })}
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold tracking-[0.12em] block mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {t('auth.confirmPassword')}
            </label>
            <input
              className="gold-input"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={t('authPanel.passwordConfirmPlaceholder', { defaultValue: 'Confirm your password' })}
              required
              minLength={8}
            />
          </div>

          {error && <p className="text-[12px] text-center" style={{ color: '#f87171' }}>{error}</p>}

          <button type="submit" disabled={saving} className="gold-btn w-full justify-center">
            {saving ? '…' : t('authPanel.savePassword', { defaultValue: 'SAVE PASSWORD' })}
          </button>
        </form>

        <Link to="/login" className="block text-center mt-8 text-[11px] tracking-widest" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
          {t('authPanel.backToLogin', { defaultValue: '← BACK TO LOGIN' })}
        </Link>
      </div>
    </div>
  )
}
