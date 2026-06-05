import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import SiteLogo from './SiteLogo'

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
  const { t } = useTranslation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const isLoggedIn = variant === 'dashboard' || variant === 'admin'
  const isLanding = variant === 'landing'

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isLanding
          ? 'bg-black/40 backdrop-blur-md border-b border-[rgba(212,175,55,0.12)]'
          : ''
      }`}
      style={
        isLanding
          ? undefined
          : {
              background: 'rgba(8,8,8,0.96)',
              backdropFilter: 'blur(12px)',
              borderBottom: '1px solid rgba(201,168,76,0.15)',
            }
      }
    >
      <div className="flex items-center justify-between px-6 lg:px-10 h-16 max-w-1440 mx-auto w-full">
        <Link to="/" className="flex items-center gap-3 shrink-0 transition-opacity duration-300 hover:opacity-90">
          <SiteLogo size="md" />
          <div className="flex flex-col leading-none font-serif-display">
            <span className="text-[9px] font-medium tracking-[0.4em] text-[#D4AF37]">MERGE</span>
            <span className="text-[9px] font-medium tracking-[0.4em] text-neutral-300">STARS</span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const active = location.pathname === link.href
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`text-[10px] font-medium tracking-[0.18em] uppercase transition-all duration-300 ease-in-out pb-0.5 border-b ${
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

        <div className="flex items-center gap-3">
          <LanguageSwitcher variant="navbar" />

          {isLoggedIn ? (
            <Link
              to="/dashboard"
              className={isLanding ? 'luxury-btn-glass !py-2.5 !px-5 !min-h-0 !text-[10px]' : 'gold-btn'}
              style={isLanding ? undefined : { borderRadius: '4px' }}
            >
              {t('nav.dashboard')}
            </Link>
          ) : (
            <Link
              to="/login"
              className={isLanding ? 'luxury-btn-glass !py-2.5 !px-5 !min-h-0 !text-[10px]' : 'gold-btn'}
              style={isLanding ? undefined : { borderRadius: '4px' }}
            >
              {t('nav.login')}
            </Link>
          )}

          <button
            type="button"
            className="lg:hidden flex flex-col gap-1.5 p-1 transition-opacity duration-300"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t('nav.menu')}
          >
            {[0, 1, 2].map((i) => (
              <span key={i} className="block w-5 h-px bg-[#D4AF37]" />
            ))}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden px-6 pb-5 flex flex-col gap-3 border-t border-[rgba(212,175,55,0.08)] bg-black/60 backdrop-blur-md">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-[10px] font-medium tracking-[0.18em] uppercase py-2 text-neutral-400 hover:text-[#D4AF37] transition-all duration-300"
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
