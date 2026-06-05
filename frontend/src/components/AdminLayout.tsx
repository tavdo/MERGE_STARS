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

interface Props { children: React.ReactNode; title?: string; subtitle?: string }

export default function AdminLayout({ children, title, subtitle }: Props) {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const headerTitle = title ?? t('admin.panel')

  return (
    <div className="flex min-h-screen" style={{ background: '#080808' }}>
      <aside
        style={{
          width: '200px', flexShrink: 0,
          background: '#0a0a0a',
          borderRight: '1px solid rgba(201,168,76,0.12)',
          minHeight: '100vh',
          position: 'sticky', top: 0, height: '100vh',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '18px 16px', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
          <SiteLogo size="sm" />
          <div>
            <p style={{ fontSize: '8px', fontWeight: 900, letterSpacing: '0.35em', color: '#c9a84c' }}>MERGE</p>
            <p style={{ fontSize: '8px', fontWeight: 900, letterSpacing: '0.35em', color: '#fff' }}>ADMIN</p>
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', padding: '8px', overflowY: 'auto' }}>
          {NAV.map((item) => {
            const active = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 10px', borderRadius: '4px', textDecoration: 'none',
                  background: active ? 'rgba(201,168,76,0.12)' : 'transparent',
                  color: active ? '#c9a84c' : 'rgba(255,255,255,0.4)',
                  borderLeft: active ? '2px solid #c9a84c' : '2px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: '14px', width: '18px', textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>{t(item.labelKey)}</span>
              </Link>
            )
          })}
        </nav>

        <button
          onClick={() => navigate('/login')}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px',
            color: 'rgba(255,255,255,0.3)', background: 'none', cursor: 'pointer', border: 'none',
            borderTop: '1px solid rgba(201,168,76,0.1)',
          }}
        >
          <span style={{ fontSize: '14px' }}>🚪</span>
          <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em' }}>{t('admin.logout')}</span>
        </button>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ background: '#0a0a0a', borderBottom: '1px solid rgba(201,168,76,0.1)', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', fontWeight: 600 }}>{headerTitle}</p>
            {subtitle && <h2 style={{ fontSize: '16px', fontWeight: 900, color: '#fff', letterSpacing: '0.1em', marginTop: '2px' }}>{subtitle}</h2>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LanguageSwitcher variant="compact" />
            <span style={{ fontSize: '10px', fontWeight: 700, padding: '4px 10px', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', letterSpacing: '0.1em' }}>ADMIN</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#ef4444,#f87171)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900, color: '#fff' }}>A</div>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          <div className="admin-inner w-full mx-auto" style={{ maxWidth: '1400px', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
