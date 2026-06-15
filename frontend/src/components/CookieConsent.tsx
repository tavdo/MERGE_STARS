import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  getCookieConsent,
  initAnalyticsIfConsented,
  setCookieConsent,
  type CookieConsentChoice,
} from '@/utils/cookieConsent'

export default function CookieConsent() {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const existing = getCookieConsent()
    if (existing) {
      initAnalyticsIfConsented()
      return
    }
    const id = window.setTimeout(() => setVisible(true), 400)
    return () => window.clearTimeout(id)
  }, [])

  const choose = (choice: CookieConsentChoice) => {
    setCookieConsent(choice)
    if (choice === 'all') initAnalyticsIfConsented()
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="cookie-consent"
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      aria-live="polite"
    >
      <div className="cookie-consent-inner">
        <div className="cookie-consent-text">
          <p id="cookie-consent-title" className="cookie-consent-title">
            {t('cookies.title', { defaultValue: 'We use cookies' })}
          </p>
          <p id="cookie-consent-desc" className="cookie-consent-desc">
            {t('cookies.message', {
              defaultValue:
                'We use essential cookies for login and security. With your consent we may also use analytics cookies to improve the platform.',
            })}{' '}
            <Link to="/privacy" className="cookie-consent-link">
              {t('cookies.privacyLink', { defaultValue: 'Privacy Policy' })}
            </Link>
          </p>
        </div>
        <div className="cookie-consent-actions">
          <button
            type="button"
            className="cookie-consent-btn cookie-consent-btn--ghost"
            onClick={() => choose('essential')}
          >
            {t('cookies.essentialOnly', { defaultValue: 'Essential only' })}
          </button>
          <button
            type="button"
            className="cookie-consent-btn cookie-consent-btn--primary"
            onClick={() => choose('all')}
          >
            {t('cookies.acceptAll', { defaultValue: 'Accept all' })}
          </button>
        </div>
      </div>
    </div>
  )
}
