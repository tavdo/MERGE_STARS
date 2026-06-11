import { useState, useEffect, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import SiteLogo from './SiteLogo'

import { useAdminLogout } from '@/features/auth/hooks/useAuth'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { ROUTES } from '@/router/routes'

type NavItem = { icon: string; labelKey: string; href: string }

const NAV_GROUPS: { titleKey: string; items: NavItem[] }[] = [
  {
    titleKey: 'admin.nav.groupOperations',
    items: [
      { icon: '📋', labelKey: 'admin.nav.applications', href: ROUTES.ADMIN },
      { icon: '👥', labelKey: 'admin.nav.users', href: '/admin/users' },
      { icon: '🪪', labelKey: 'admin.nav.kyc', href: '/admin/kyc' },
      { icon: '🏦', labelKey: 'admin.nav.finance', href: '/admin/finance' },
      { icon: '💎', labelKey: 'admin.nav.crystal', href: '/admin/crystal' },
      { icon: '🏭', labelKey: 'admin.nav.production', href: '/admin/production' },
      { icon: '📊', labelKey: 'admin.nav.analytics', href: '/admin/analytics' },
    ],
  },
  {
    titleKey: 'admin.nav.groupCompliance',
    items: [
      { icon: '📜', labelKey: 'admin.nav.auditLog', href: '/admin/audit' },
      { icon: '🗂', labelKey: 'admin.nav.auditCenter', href: '/admin/audit-center' },
      { icon: '🏛', labelKey: 'admin.nav.bankReview', href: '/admin/bank-review' },
      { icon: '🛡', labelKey: 'admin.nav.security', href: '/admin/security' },
      { icon: '🗄', labelKey: 'admin.nav.dataGov', href: '/admin/data-governance' },
      { icon: '🧯', labelKey: 'admin.nav.continuity', href: '/admin/business-continuity' },
    ],
  },
  {
    titleKey: 'admin.nav.groupSystem',
    items: [{ icon: '⚙', labelKey: 'admin.nav.settings', href: '/admin/settings' }],
  },
]

interface Props {
  children: ReactNode
  title?: string
  subtitle?: string
}

export default function AdminLayout({ children, title, subtitle }: Props) {
  const { t } = useTranslation()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const location = useLocation()
  const logout = useAdminLogout()
  const user = useAuthStore((s) => s.user)
  const headerTitle = title ?? t('admin.panel')
  const displayName = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : 'Admin'
  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'A'
    : 'A'

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
          <Link to={ROUTES.ADMIN} className="admin-sidebar-brand" onClick={closeMobileNav}>
            <SiteLogo size="sm" />
            <div>
              <p className="admin-brand-merge">MERGE STARS</p>
              <p className="admin-brand-sub">Admin Console</p>
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
          {NAV_GROUPS.map((group) => (
            <div key={group.titleKey} className="admin-nav-group">
              <p className="admin-nav-group-title">{t(group.titleKey)}</p>
              {group.items.map((item) => {
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
            </div>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => {
            closeMobileNav()
            logout()
          }}
          className="admin-logout"
        >
          <span>↪</span>
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
            <div className="admin-user-chip">
              <div className="admin-avatar">{initials}</div>
              <div className="admin-user-meta">
                <span className="admin-user-name">{displayName}</span>
                <span className="admin-role-badge">Admin</span>
              </div>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <div className="admin-inner">{children}</div>
        </main>
      </div>
    </div>
  )
}
