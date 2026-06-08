import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useLogin, useRegister } from '@/features/auth/hooks/useAuth'
import { getApiErrorMessage } from '@/shared/utils/apiError'

type Tab = 'login' | 'register'
type Step = 1 | 2 | 3

const TERM_COUNT = 3

export default function LoginPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const login = useLogin()
  const register = useRegister()
  const [tab, setTab] = useState<Tab>(() => (searchParams.get('tab') === 'register' ? 'register' : 'login'))

  useEffect(() => {
    if (searchParams.get('tab') === 'register') setTab('register')
  }, [searchParams])
  const [step, setStep] = useState<Step>(1)
  const [checked, setChecked] = useState<boolean[]>(() => Array(TERM_COUNT).fill(false))
  const [showPw, setShowPw] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [personalId, setPersonalId] = useState('')
  const [phoneCode, setPhoneCode] = useState('+995')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const toggleCheck = (i: number) =>
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)))

  const allChecked = checked.every(Boolean)

  const badges = [
    { icon: '🔒', label: t('authPanel.badgeSecure'), sub: t('authPanel.badgeSecureSub') },
    { icon: '🔐', label: t('authPanel.badgeEncrypted'), sub: t('authPanel.badgeEncryptedSub') },
    { icon: '🤝', label: t('authPanel.badgeTrusted'), sub: t('authPanel.badgeTrustedSub') },
  ]

  const stepLabel = step === 1 ? t('auth.step1') : step === 2 ? t('auth.step2') : t('auth.step3')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    login.mutate(
      { identifier, password },
      {
        onError: (err) =>
          setAuthError(getApiErrorMessage(err, t('authPanel.loginFailed', { defaultValue: 'Invalid email/phone or password' }))),
      },
    )
  }

  const goToRegisterStep2 = () => {
    if (!firstName.trim() || !lastName.trim()) {
      setAuthError(t('authPanel.nameRequired', { defaultValue: 'First and last name are required' }))
      return
    }
    if (!personalId.trim()) {
      setAuthError(t('authPanel.personalIdRequired', { defaultValue: 'Personal ID is required' }))
      return
    }
    setAuthError(null)
    setStep(2)
  }

  const goToRegisterStep3 = () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setAuthError(t('authPanel.emailInvalid', { defaultValue: 'Enter a valid email address' }))
      return
    }
    if (regPassword.length < 8) {
      setAuthError(t('authPanel.passwordTooShort', { defaultValue: 'Password must be at least 8 characters' }))
      return
    }
    if (regPassword !== confirmPassword) {
      setAuthError(t('authPanel.passwordMismatch', { defaultValue: 'Passwords do not match' }))
      return
    }
    setAuthError(null)
    setStep(3)
  }

  const handleRegister = () => {
    if (!allChecked) return
    setAuthError(null)
    register.mutate(
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        personalId: personalId.trim(),
        phone: phone.trim() ? `${phoneCode}${phone.replace(/\D/g, '')}` : undefined,
        email: email.trim().toLowerCase(),
        password: regPassword,
      },
      {
        onError: (err) =>
          setAuthError(getApiErrorMessage(err, t('authPanel.registerFailed', { defaultValue: 'Registration failed. Email may already exist.' }))),
      },
    )
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#080808' }}>
      <div
        className="hidden lg:flex flex-col justify-between w-[45%] relative overflow-hidden px-16 py-12"
        style={{ background: 'linear-gradient(135deg, #080808 0%, #0f0f0f 100%)' }}
      >
        <div
          className="absolute pointer-events-none"
          style={{
            width: '500px', height: '500px',
            background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)',
            top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          }}
        />
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex items-center justify-center text-black font-black text-xl" style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg,#c9a84c,#f5d78e)', borderRadius: '4px' }}>★</div>
          <div>
            <p className="text-[11px] font-black tracking-[0.35em]" style={{ color: '#c9a84c' }}>MERGE</p>
            <p className="text-[11px] font-black tracking-[0.35em] text-white">STARS</p>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="font-black leading-none mb-4" style={{ fontSize: '56px' }}>
            <span className="gold-text">{t('authPanel.theNext')}</span>
            <br /><span className="text-white">{t('authPanel.eraOf')}</span>
            <br /><span className="gold-text">{t('authPanel.luxury')}</span>
          </h1>
          <p className="text-[14px] leading-7" style={{ color: 'rgba(255,255,255,0.4)', maxWidth: '320px' }}>
            {t('authPanel.heroBody')}
          </p>
          <div className="flex gap-6 mt-10">
            {badges.map((b) => (
              <div key={b.label} className="text-center">
                <div className="text-2xl mb-1">{b.icon}</div>
                <p className="text-[9px] font-bold tracking-[0.12em]" style={{ color: '#c9a84c' }}>{b.label}</p>
                <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{b.sub}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] relative z-10" style={{ color: 'rgba(255,255,255,0.2)' }}>
          {t('authPanel.copyright')}
        </p>
      </div>

      <div className="auth-page-panel flex-1 flex flex-col justify-center items-center px-8 lg:px-16 py-12 overflow-y-auto relative" style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div className="absolute top-6 end-6 lg:end-10">
          <LanguageSwitcher variant="compact" />
        </div>

        <header className="auth-hero">
          <h1 className="auth-hero-kicker">{t('authPanel.welcome')}</h1>
          <p className="auth-hero-sub">{t('authPanel.journeyTagline')}</p>
        </header>

        <div className="auth-tabs" role="tablist" aria-label={t('authPanel.welcome')}>
          {(['login', 'register'] as Tab[]).map((tabKey) => (
            <button
              key={tabKey}
              type="button"
              role="tab"
              aria-selected={tab === tabKey}
              onClick={() => { setTab(tabKey); setStep(1); setAuthError(null) }}
              className={`auth-tab${tab === tabKey ? ' auth-tab--active' : ''}`}
            >
              {tabKey === 'login' ? t('authPanel.loginTab') : t('authPanel.registerTab')}
            </button>
          ))}
        </div>

        {authError && (
          <p className="w-full max-w-md text-center text-[12px] mb-4" style={{ color: '#f87171' }}>{authError}</p>
        )}

        {tab === 'login' && (
          <form className="w-full max-w-md flex flex-col gap-5" onSubmit={handleLogin}>
            <div>
              <label className="auth-field-label">{t('authPanel.emailOrPhone')}</label>
              <input className="gold-input" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder={t('authPanel.emailOrPhonePlaceholder')} required />
            </div>
            <div>
              <label className="auth-field-label">{t('authPanel.passwordLabel')}</label>
              <div className="relative">
                <input className="gold-input pr-12" type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('authPanel.passwordPlaceholder')} required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute end-4 top-1/2 -translate-y-1/2 text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-[#c9a84c]" />
                <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('authPanel.rememberMe')}</span>
              </label>
              <Link to="/forgot-password" className="text-[12px]" style={{ color: '#c9a84c', textDecoration: 'none' }}>{t('authPanel.forgotPassword')}</Link>
            </div>
            <button type="submit" disabled={login.isPending} className="gold-btn w-full justify-center mt-2">{login.isPending ? '…' : t('authPanel.enterPlatform')}</button>
            <p className="text-center text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {t('authPanel.noAccount')}{' '}
              <button type="button" onClick={() => setTab('register')} style={{ color: '#c9a84c' }}>{t('authPanel.createAccount')}</button>
            </p>
          </form>
        )}

        {tab === 'register' && (
          <div className="w-full max-w-md">
            <div className="flex items-center mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0" style={{ background: step >= s ? 'linear-gradient(135deg,#c9a84c,#f5d78e)' : '#111', color: step >= s ? '#000' : 'rgba(255,255,255,0.3)', border: step >= s ? 'none' : '1px solid rgba(255,255,255,0.1)' }}>{s}</div>
                  {s < 3 && <div className="flex-1 h-px mx-2" style={{ background: step > s ? '#c9a84c' : 'rgba(255,255,255,0.1)' }} />}
                </div>
              ))}
            </div>
            <p className="auth-field-label mb-6" style={{ color: '#c9a84c', fontSize: '0.8125rem' }}>{stepLabel}</p>

            {step === 1 && (
              <div className="flex flex-col gap-4">
                <div className="auth-name-grid grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="auth-field-label">{t('auth.firstName')}</label>
                    <input className="gold-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder={t('authPanel.firstNamePlaceholder')} required />
                  </div>
                  <div>
                    <label className="auth-field-label">{t('auth.lastName')}</label>
                    <input className="gold-input" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder={t('authPanel.lastNamePlaceholder')} required />
                  </div>
                </div>
                <div>
                  <label className="auth-field-label">{t('auth.personalId')}</label>
                  <input className="gold-input" value={personalId} onChange={(e) => setPersonalId(e.target.value)} placeholder={t('authPanel.personalIdPlaceholder')} required />
                </div>
                <div>
                  <label className="auth-field-label">{t('auth.phone')}</label>
                  <div className="auth-phone-row">
                    <select className="gold-input" value={phoneCode} onChange={(e) => setPhoneCode(e.target.value)} aria-label={t('auth.phone')}>
                      <option value="+995">🇬🇪 +995</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                    </select>
                    <input className="gold-input" type="tel" inputMode="tel" autoComplete="tel-national" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('authPanel.phonePlaceholder')} />
                  </div>
                </div>
                <button type="button" onClick={goToRegisterStep2} className="gold-btn w-full justify-center mt-2" style={{ borderRadius: '2px' }}>{t('auth.nextStep')} ›</button>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="auth-field-label">{t('auth.email')}</label>
                  <input className="gold-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('authPanel.emailPlaceholder')} required />
                </div>
                <div>
                  <label className="auth-field-label">{t('auth.password')}</label>
                  <input className="gold-input" type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder={t('authPanel.passwordCreatePlaceholder')} required minLength={8} />
                </div>
                <div>
                  <label className="auth-field-label">{t('auth.confirmPassword')}</label>
                  <input className="gold-input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t('authPanel.passwordConfirmPlaceholder')} required minLength={8} />
                </div>
                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => setStep(1)} className="gold-btn-outline flex-1 justify-center" style={{ borderRadius: '2px' }}>‹ {t('auth.back')}</button>
                  <button type="button" onClick={goToRegisterStep3} className="gold-btn flex-1 justify-center" style={{ borderRadius: '2px' }}>{t('auth.nextStep')} ›</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-4">
                {[0, 1].map((i) => (
                  <label key={i} className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={checked[i]} onChange={() => toggleCheck(i)} className="mt-0.5 accent-[#c9a84c] shrink-0" />
                    <span className="text-[12px] leading-5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      {t('authPanel.agreeTermsPrefix')}{' '}
                      <Link to={i === 0 ? '/terms' : '/privacy'} className="text-[#c9a84c] hover:underline underline-offset-2" onClick={(e) => e.stopPropagation()}>
                        {i === 0 ? t('auth.termsLink') : t('auth.privacyLink')}
                      </Link>
                    </span>
                  </label>
                ))}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={checked[2]} onChange={() => toggleCheck(2)} className="mt-0.5 accent-[#c9a84c] shrink-0" />
                  <span className="text-[12px] leading-5" style={{ color: 'rgba(255,255,255,0.6)' }}>{t('auth.consentFull')}</span>
                </label>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setStep(2)} className="gold-btn-outline flex-1 justify-center" style={{ borderRadius: '2px' }}>‹ {t('auth.back')}</button>
                  <button type="button" disabled={!allChecked || register.isPending} onClick={handleRegister} className="gold-btn flex-1 justify-center" style={{ borderRadius: '2px', opacity: allChecked && !register.isPending ? 1 : 0.4, cursor: allChecked ? 'pointer' : 'not-allowed' }}>{register.isPending ? '…' : t('auth.activate')}</button>
                </div>
              </div>
            )}

            <p className="text-center text-[12px] mt-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {t('authPanel.hasAccount')}{' '}
              <button onClick={() => setTab('login')} style={{ color: '#c9a84c' }}>{t('authPanel.loginLink')}</button>
            </p>
          </div>
        )}

        <Link to="/" className="mt-10 text-[11px] tracking-widest" style={{ color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}>
          {t('authPanel.backToHome')}
        </Link>
      </div>
    </div>
  )
}
