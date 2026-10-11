import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const QUICK_LINKS = [
  { to: '/how-it-works', labelKey: 'nav.howItWorks' },
  { to: '/merge-coin', labelKey: 'nav.mergeCoin' },
  { to: '/filament', labelKey: 'nav.filament' },
  { to: '/brand-room', labelKey: 'nav.brandRoom' },
  { to: '/living-museum', labelKey: 'nav.livingMuseum' },
  { to: '/price-indicator', labelKey: 'nav.prices' },
  { to: '/faq', labelKey: 'nav.faq' },
  { to: '/contact', labelKey: 'nav.contact' },
  { to: '/login?tab=register', labelKey: 'seo.registerCta' },
] as const

export default function LandingSeoSection() {
  const { t } = useTranslation()

  return (
    <section className="ld-seo-section" aria-labelledby="landing-seo-title">
      <div className="ld-seo-inner max-w-1440 mx-auto w-full">
        <p className="ld-seo-kicker">{t('landing.seoSection.kicker', { defaultValue: 'Official platform' })}</p>
        <h2 id="landing-seo-title" className="ld-seo-title">
          {t('landing.seoSection.title', { defaultValue: 'MERGE STARS — luxury brand & precious-metal manufacturing' })}
        </h2>
        <p className="ld-seo-lead">
          {t('landing.seoSection.lead', {
            defaultValue:
              'MERGE STARS at mergestars.com is the official luxury platform by MERGE STARS LLC in Tbilisi, Georgia. We combine patented 3D precious-metal filament, MERGE Coin physical products with QR digital passport, brand catalogs, and global production — not a mobile game, not a Dart package, and not cryptocurrency.',
          })}
        </p>
        <p className="ld-seo-sub">
          {t('landing.seoSection.sub', {
            defaultValue:
              'Create your brand line, configure your MERGE Coin, verify identity (KYC), and order luxury pieces infused with real silver and gold.',
          })}
        </p>
        <nav className="ld-seo-nav" aria-label={t('landing.seoSection.navLabel', { defaultValue: 'Explore MERGE STARS' })}>
          <ul className="ld-seo-links">
            {QUICK_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{t(link.labelKey)}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  )
}
