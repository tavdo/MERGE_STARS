import { useState, useEffect, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import SiteLogo from './SiteLogo'

const NAV = [
  { icon: '⊞', labelKey: 'admin.nav.dashboard', href: '/dashboard' },
  { icon: '🏦', labelKey: 'admin.nav.bankReview', href: '/bank-review' },
  { icon: '🗂', labelKey: 'admin.nav.auditCenter', href: '/audit' },
  { icon: '🛡', labelKey: 'admin.nav.security', href: '/security' },
  { icon: '🗄', labelKey: 'admin.nav.dataGov', href: '/data-governance' },
  { icon: '🧯', labelKey: 'admin.nav.continuity', href: '/business-continuity' },
  { icon: '👥', labelKey: 'admin.nav.users', href: '/admin/users' },
  { icon: '🪪', labelKey: 'admin.nav.kyc', href: '/admin/kyc' },
  { icon: '📋', labelKey: 'admin.nav.applications', href: '/admin' },
  { icon: '🏦', labelKey: 'admin.nav.finance', href: '/admin/finance' },
  { icon: '💎', labelKey: 'admin.nav.crystal', href: '/admin/crystal' },
  { icon: '🏭', labelKey: 'admin.nav.production', href: '/admin/production' },
  { icon: '📊', labelKey: 'admin.nav.analytics', href: '/admin/analytics' },
  { icon: '📜', labelKey: 'admin.nav.auditLog', href: '/admin/audit' },
  { icon: '⚙', labelKey: 'admin.nav.settings', href: '/admin/settings' },
] as const

interface Props {
  children: ReactNode
  title?: string
  subtitle?: string
}

export default function AdminLayout({ children, title, subtitle }: Props) {
  const { t } = useTranslation()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const headerTitle = title ?? t('admin.panel')

  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const closeOnDesktop = () => {
      if (mq.matches) setMobileNavOpen(false)
    }
    closeOnDesktop()
    mq.addEventListener('change', closeOnDesktop)
    return () => mq.removeEventListener('change', closeOnDesktop)
  }, [])

  useEffect(() => {
    if (!mobileNavOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileNavOpen])

  const closeMobileNav = () => setMobileNavOpen(false)

  return (
    <div className="admin-shell flex min-h-screen">
      {mobileNavOpen && (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          onClick={closeMobileNav}
          aria-label={t('nav.closeMenu')}
        />
      )}

      <aside className={`admin-sidebar${mobileNavOpen ? ' admin-sidebar--mobile-open' : ''}`}>
        <div className="admin-sidebar-head">
          <Link to="/" className="admin-sidebar-brand" onClick={closeMobileNav}>
            <SiteLogo size="sm" />
            <div>
              <p className="admin-brand-merge">MERGE</p>
              <p className="admin-brand-sub">ADMIN</p>
            </div>
          </Link>
          <button
            type="button"
            className="admin-sidebar-close"
            onClick={closeMobileNav}
            aria-label={t('nav.closeMenu')}
          >
            ×
          </button>
        </div>

        <nav className="admin-nav">
          {NAV.map((item) => {
            const active = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={closeMobileNav}
                className={`admin-nav-link${active ? ' admin-nav-link--active' : ''}`}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                <span className="admin-nav-label">{t(item.labelKey)}</span>
              </Link>
            )
          })}
        </nav>

        <button
          type="button"
          onClick={() => {
            closeMobileNav()
            navigate('/login')
          }}
          className="admin-logout"
        >
          <span>🚪</span>
          <span>{t('admin.logout')}</span>
        </button>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div className="admin-header-start">
            <button
              type="button"
              className="admin-menu-btn"
              onClick={() => setMobileNavOpen(true)}
              aria-label={t('nav.menu')}
              aria-expanded={mobileNavOpen}
            >
              <span className="admin-menu-btn-line" />
              <span className="admin-menu-btn-line" />
              <span className="admin-menu-btn-line" />
            </button>
            <div className="min-w-0">
              <p className="admin-header-kicker">{headerTitle}</p>
              {subtitle && <h2 className="admin-header-title">{subtitle}</h2>}
            </div>
          </div>
          <div className="admin-header-actions">
            <LanguageSwitcher variant="compact" />
            <span className="admin-role-badge">ADMIN</span>
            <div className="admin-avatar">A</div>
          </div>
        </header>

        <main className="admin-content">
          <div className="admin-inner">{children}</div>
        </main>
      </div>
    </div>
  )
}
