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
  { label: 'Facebook', Icon: IconFacebook },
  { label: 'LinkedIn', Icon: IconLinkedIn },
  { label: 'YouTube', Icon: IconYouTube },
  { label: 'Instagram', Icon: IconInstagram },
  { label: 'X', Icon: IconX },
] as const

export default function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  const badges = [
    { title: 'footer.secure', sub: 'footer.secureSub' },
    { title: 'footer.fast', sub: 'footer.fastSub' },
    { title: 'footer.global', sub: 'footer.globalSub' },
    { title: 'footer.supportTitle', sub: 'footer.supportSub' },
  ] as const

  return (
    <footer className="bg-[#030303] border-t border-[rgba(212,175,55,0.1)]">
      <div
        className="footer-badges-grid grid grid-cols-2 lg:grid-cols-4 gap-px"
        style={{ background: 'rgba(212,175,55,0.04)' }}
      >
        {badges.map((b) => (
          <div
            key={b.title}
            className="flex flex-col justify-center px-8 py-8 bg-[#030303] transition-all duration-300 ease-in-out hover:bg-[#050505]"
          >
            <p className="text-[10px] font-medium tracking-[0.22em] text-[#D4AF37] mb-1.5">{t(b.title)}</p>
            <p className="text-[9px] tracking-wide text-neutral-500">{t(b.sub)}</p>
          </div>
        ))}
      </div>

      <div className="footer-main px-8 lg:px-16 py-16 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <SiteLogo size="sm" />
              <div className="flex flex-col leading-none font-serif-display">
                <span className="text-[9px] font-medium tracking-[0.4em] text-[#D4AF37]">MERGE</span>
                <span className="text-[9px] font-medium tracking-[0.4em] text-neutral-400">STARS</span>
              </div>
            </div>
            <p className="landing-body max-w-[280px] !text-[11px]">{t('footer.tagline')}</p>
            <div className="flex flex-wrap gap-2.5 mt-8">
              {SOCIAL.map(({ label, Icon }) => (
                <button
                  key={label}
                  type="button"
                  aria-label={label}
                  className="footer-social-btn w-9 h-9 flex items-center justify-center text-neutral-500 border border-[rgba(212,175,55,0.15)] transition-all duration-300 ease-in-out hover:border-[rgba(212,175,55,0.4)] hover:text-[#D4AF37]"
                  style={{ borderRadius: '2px' }}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          <div className="footer-link-col">
            <h4 className="landing-sans-head mb-6">{t('footer.company')}</h4>
            <ul className="flex flex-col gap-3">
              {COMPANY.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="footer-nav-link">
                    {t(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-link-col">
            <h4 className="landing-sans-head mb-6">{t('footer.support')}</h4>
            <ul className="flex flex-col gap-3">
              {SUPPORT.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="footer-nav-link">
                    {t(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-link-col sm:col-span-2 lg:col-span-1">
            <h4 className="landing-sans-head mb-6">{t('footer.contact')}</h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a href={`mailto:${t('footer.contactEmail')}`} className="footer-nav-link">{t('footer.contactEmail')}</a>
              </li>
              <li>
                <a href={`tel:${t('footer.contactPhone').replace(/\s/g, '')}`} className="footer-nav-link">{t('footer.contactPhone')}</a>
              </li>
              <li>
                <span className="footer-nav-link footer-nav-link--static">{t('footer.contactAddress')}</span>
              </li>
              <li>
                <span className="footer-nav-link footer-nav-link--static">{t('footer.companyId')}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom px-8 lg:px-16 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-[1440px] mx-auto border-t border-[rgba(212,175,55,0.06)]">
        <p className="text-[9px] tracking-[0.12em] text-neutral-600">
          © {year} {t('footer.legalName')}. {t('footer.rights')}
        </p>
        <p className="text-[9px] tracking-[0.12em] text-neutral-600">{t('footer.slogan')}</p>
      </div>
    </footer>
  )
}
