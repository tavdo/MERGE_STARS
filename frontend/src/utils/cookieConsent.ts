const STORAGE_KEY = 'merge-stars-cookie-consent'

export type CookieConsentChoice = 'all' | 'essential'

export function getCookieConsent(): CookieConsentChoice | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'all' || v === 'essential') return v
  } catch {
    /* private mode */
  }
  return null
}

export function setCookieConsent(choice: CookieConsentChoice) {
  try {
    localStorage.setItem(STORAGE_KEY, choice)
  } catch {
    /* ignore */
  }
  const maxAge = 60 * 60 * 24 * 365
  document.cookie = `merge_cookie_consent=${choice}; path=/; max-age=${maxAge}; SameSite=Lax`
}

export function hasAnalyticsConsent() {
  return getCookieConsent() === 'all'
}

export function initAnalyticsIfConsented() {
  if (!hasAnalyticsConsent()) return

  const dsn = import.meta.env.VITE_SENTRY_DSN?.trim()
  if (!dsn || (window as unknown as { __mergeSentry?: boolean }).__mergeSentry) return

  void import('@sentry/react').then((Sentry) => {
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    })
    ;(window as unknown as { __mergeSentry?: boolean }).__mergeSentry = true
  })
}
