import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SiteLogo from './SiteLogo'
import LanguageSwitcher from './LanguageSwitcher'

export default function BankReviewLayout({
  title = 'BANK REVIEW CENTER',
  children,
}: {
  title?: string
  children: React.ReactNode
}) {
  const { t } = useTranslation()

  return (
    <div style={{ minHeight: '100vh', background: '#080808' }}>
      <header
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          borderBottom: '1px solid rgba(201,168,76,0.14)',
          background: 'rgba(10,10,10,0.96)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <SiteLogo size="sm" />
          <div style={{ lineHeight: 1 }}>
            <p style={{ margin: 0, fontSize: 9, fontWeight: 900, letterSpacing: '0.35em', color: '#c9a84c' }}>
              MERGE
            </p>
            <p style={{ margin: 0, fontSize: 9, fontWeight: 900, letterSpacing: '0.35em', color: '#fff' }}>
              BANK REVIEW
            </p>
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <p
            style={{
              margin: 0,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.22em',
              color: 'rgba(255,255,255,0.6)',
              textTransform: 'uppercase',
            }}
          >
            {title}
          </p>
          <LanguageSwitcher variant="compact" />
          <span className="sr-only">{t('lang.label')}</span>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '26px 18px 44px' }}>{children}</main>
    </div>
  )
}

