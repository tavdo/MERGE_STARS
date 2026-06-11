import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SiteLogo from './SiteLogo'
import {
  IconFacebook,
  IconInstagram,
  IconLinkedIn,
  IconX,
  IconYouTube,
} from './SocialIcons'

const COMPANY = [
  { labelKey: 'nav.howItWorks', to: '/how-it-works' },
  { labelKey: 'nav.mergeCoin', to: '/merge-coin' },
  { labelKey: 'nav.prices', to: '/price-indicator' },
  { labelKey: 'nav.apply', to: '/apply' },
] as const

const SUPPORT = [
  { labelKey: 'nav.faq', to: '/faq' },
  { labelKey: 'nav.contact', to: '/contact' },
  { labelKey: 'nav.trust', to: '/trust' },
  { labelKey: 'nav.legalClassification', to: '/legal-classification' },
  { labelKey: 'footer.terms', to: '/terms' },
  { labelKey: 'footer.privacy', to: '/privacy' },
] as const

const SOCIAL = [
  { label: 'Facebook', Icon: IconFacebook, href: '#' },
  { label: 'LinkedIn', Icon: IconLinkedIn, href: '#' },
  { label: 'YouTube', Icon: IconYouTube, href: '#' },
  { label: 'Instagram', Icon: IconInstagram, href: '#' },
  { label: 'X', Icon: IconX, href: '#' },
] as const

export default function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  const highlights = [
    { title: 'footer.secure', sub: 'footer.secureSub', icon: '🔒' },
    { title: 'footer.fast', sub: 'footer.fastSub', icon: '⚡' },
    { title: 'footer.global', sub: 'footer.globalSub', icon: '🌍' },
    { title: 'footer.supportTitle', sub: 'footer.supportSub', icon: '💬' },
  ] as const

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-grid">
          <div className="site-footer-brand">
            <Link to="/" className="site-footer-logo">
              <SiteLogo size="md" />
              <span className="site-footer-logo-text">MERGE STARS</span>
            </Link>
            <p className="site-footer-tagline">{t('footer.tagline')}</p>
            <div className="site-footer-social">
              {SOCIAL.map(({ label, Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="site-footer-social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <nav className="site-footer-col" aria-label={t('footer.company')}>
            <h3 className="site-footer-heading">{t('footer.company')}</h3>
            <ul className="site-footer-links">
              {COMPANY.map((item) => (
                <li key={item.to}>
                  <Link to={item.to}>{t(item.labelKey)}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="site-footer-col" aria-label={t('footer.support')}>
            <h3 className="site-footer-heading">{t('footer.support')}</h3>
            <ul className="site-footer-links">
              {SUPPORT.map((item) => (
                <li key={item.to}>
                  <Link to={item.to}>{t(item.labelKey)}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="site-footer-col">
            <h3 className="site-footer-heading">{t('footer.contact')}</h3>
            <ul className="site-footer-contact">
              <li>
                <span className="site-footer-contact-label">Email</span>
                <a href={`mailto:${t('footer.contactEmail')}`}>{t('footer.contactEmail')}</a>
              </li>
              <li>
                <span className="site-footer-contact-label">Phone</span>
                <a href={`tel:${t('footer.contactPhone').replace(/\s/g, '')}`}>{t('footer.contactPhone')}</a>
              </li>
              <li>
                <span className="site-footer-contact-label">Address</span>
                <span>{t('footer.contactAddress')}</span>
              </li>
              <li>
                <span className="site-footer-contact-label">ID</span>
                <span>{t('footer.companyId')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="site-footer-highlights">
          {highlights.map((item) => (
            <div key={item.title} className="site-footer-highlight">
              <span className="site-footer-highlight-icon" aria-hidden>{item.icon}</span>
              <div>
                <p className="site-footer-highlight-title">{t(item.title)}</p>
                <p className="site-footer-highlight-sub">{t(item.sub)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="site-footer-bar">
          <p className="site-footer-copy">
            © {year} {t('footer.legalName')}. {t('footer.rights')}
          </p>
          <p className="site-footer-slogan">{t('footer.slogan')}</p>
        </div>
      </div>
    </footer>
  )
}
