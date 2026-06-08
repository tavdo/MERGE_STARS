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
    <div className="bank-review-shell min-h-screen">
      <header className="bank-review-header">
        <Link to="/" className="bank-review-brand">
          <SiteLogo size="sm" />
          <div>
            <p className="bank-review-brand-merge">MERGE</p>
            <p className="bank-review-brand-sub">BANK REVIEW</p>
          </div>
        </Link>

        <div className="bank-review-header-actions">
          <p className="bank-review-title">{title}</p>
          <LanguageSwitcher variant="compact" />
          <span className="sr-only">{t('lang.label')}</span>
        </div>
      </header>

      <main className="bank-review-main">{children}</main>
    </div>
  )
}
