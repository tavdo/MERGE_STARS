import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import SiteLogo from './SiteLogo'
import { SUPPORTED_LANGUAGES, type LanguageCode } from '../i18n'

const NAV_LINKS = [
  { labelKey: 'nav.home', href: '/' },
  { labelKey: 'nav.howItWorks', href: '/how-it-works' },
  { labelKey: 'nav.mergeCoin', href: '/merge-coin' },
  { labelKey: 'nav.prices', href: '/price-indicator' },
  { labelKey: 'nav.apply', href: '/apply' },
  { labelKey: 'nav.faq', href: '/faq' },
  { labelKey: 'nav.contact', href: '/contact' },
  { labelKey: 'nav.trust', href: '/trust' },
  { labelKey: 'nav.legalClassification', href: '/legal-classification' },
] as const

interface NavbarProps {
  variant?: 'landing' | 'dashboard' | 'admin'
}

export default function Navbar({ variant = 'landing' }: NavbarProps) {
  const { t, i18n } = useTranslation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const isLoggedIn = variant === 'dashboard' || variant === 'admin'
  const isLanding = variant === 'landing'
  const currentLang = (i18n.language?.slice(0, 2) || 'en') as LanguageCode

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const closeOnDesktop = () => {
      if (mq.matches) setMobileOpen(false)
    }
    closeOnDesktop()
    mq.addEventListener('change', closeOnDesktop)
    return () => mq.removeEventListener('change', closeOnDesktop)
  }, [])

  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileOpen])

  const closeMobile = () => setMobileOpen(false)

  const authLinkClass = isLanding
    ? 'luxury-btn-glass !py-2.5 !px-5 !min-h-0 !text-[10px]'
    : 'gold-btn'

  return (
    <nav
      className={`site-nav fixed top-0 left-0 right-0 transition-all duration-300 ease-in-out ${
        mobileOpen ? 'z-[10000]' : 'z-[100]'
      } ${mobileOpen ? 'site-nav--open' : ''} ${isLanding ? 'site-nav--landing' : 'site-nav--solid'}`}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-10 h-16 max-w-1440 mx-auto w-full min-w-0">
        <Link
          to="/"
          className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0 transition-opacity duration-300 hover:opacity-90"
          onClick={closeMobile}
        >
          <SiteLogo size="md" />
          <div className="flex flex-col leading-none font-serif-display">
            <span className="text-[9px] font-medium tracking-[0.4em] text-[#D4AF37]">MERGE</span>
            <span className="text-[9px] font-medium tracking-[0.4em] text-neutral-300">STARS</span>
          </div>
        </Link>

        <div className="site-nav-links hidden lg:flex items-center">
          {NAV_LINKS.map((link) => {
            const active = location.pathname === link.href
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`site-nav-link text-[10px] font-medium tracking-[0.18em] uppercase transition-all duration-300 ease-in-out pb-0.5 border-b ${
                  active
                    ? 'text-[#D4AF37] border-[#D4AF37]'
                    : 'text-neutral-400 border-transparent hover:text-neutral-200 hover:border-neutral-600'
                }`}
                style={{ textDecoration: 'none' }}
              >
                {t(link.labelKey)}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-3">
            <LanguageSwitcher variant="navbar" />
            {isLoggedIn ? (
              <Link to="/dashboard" className={authLinkClass} style={isLanding ? undefined : { borderRadius: '4px' }}>
                {t('nav.dashboard')}
              </Link>
            ) : (
              <Link to="/login" className={authLinkClass} style={isLanding ? undefined : { borderRadius: '4px' }}>
                {t('nav.login')}
              </Link>
            )}
          </div>

          <button
            type="button"
            className={`nav-burger lg:hidden ${mobileOpen ? 'nav-burger--open' : ''}`}
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? t('nav.closeMenu') : t('nav.menu')}
            aria-expanded={mobileOpen}
            aria-controls="site-mobile-menu"
          >
            <span className="nav-burger-line" />
            <span className="nav-burger-line" />
            <span className="nav-burger-line" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <>
          <button
            type="button"
            className="nav-mobile-backdrop"
            onClick={closeMobile}
            aria-label={t('nav.closeMenu')}
          />
          <div id="site-mobile-menu" className="nav-mobile-panel lg:hidden">
            <div className="nav-mobile-links">
              {NAV_LINKS.map((link) => {
                const active = location.pathname === link.href
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={closeMobile}
                    className={`nav-mobile-link ${active ? 'nav-mobile-link--active' : ''}`}
                  >
                    {t(link.labelKey)}
                  </Link>
                )
              })}
            </div>

            <div className="nav-mobile-footer">
              <p className="nav-mobile-footer-label">{t('lang.label')}</p>
              <div className="nav-mobile-langs">
                {SUPPORTED_LANGUAGES.map(({ code, labelKey }) => (
                  <button
                    key={code}
                    type="button"
                    className={`nav-mobile-lang ${code === currentLang ? 'nav-mobile-lang--active' : ''}`}
                    onClick={() => {
                      void i18n.changeLanguage(code)
                    }}
                  >
                    {t(labelKey)}
                  </button>
                ))}
              </div>

              {isLoggedIn ? (
                <Link
                  to="/dashboard"
                  onClick={closeMobile}
                  className={`nav-mobile-auth ${isLanding ? 'luxury-btn-glass' : 'gold-btn'}`}
                >
                  {t('nav.dashboard')}
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={closeMobile}
                  className={`nav-mobile-auth ${isLanding ? 'luxury-btn-glass' : 'gold-btn'}`}
                >
                  {t('nav.login')}
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  )
}
