import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

const FACTS = [
  {
    titleKey: 'mergeCoinPage.factPhysicalTitle',
    bodyKey: 'mergeCoinPage.factPhysicalBody',
    titleDefault: 'Physical mint',
    bodyDefault: 'Struck in precious-metal filament — silver and gold in the material, not plated on top.',
  },
  {
    titleKey: 'mergeCoinPage.factDigitalTitle',
    bodyKey: 'mergeCoinPage.factDigitalBody',
    titleDefault: 'Digital passport',
    bodyDefault: 'Each coin carries a unique serial and QR identity matched to the physical piece.',
  },
  {
    titleKey: 'mergeCoinPage.factBrandTitle',
    bodyKey: 'mergeCoinPage.factBrandBody',
    titleDefault: 'Brand identity',
    bodyDefault: 'Your coin anchors your brand line and catalog presence on MERGE STARS.',
  },
] as const

const STEPS = [
  {
    titleKey: 'mergeCoinPage.step1Title',
    bodyKey: 'mergeCoinPage.step1Body',
    titleDefault: 'Register',
    bodyDefault: 'Join the founding list and verify your account.',
  },
  {
    titleKey: 'mergeCoinPage.step2Title',
    bodyKey: 'mergeCoinPage.step2Body',
    titleDefault: 'Receive your coin',
    bodyDefault: 'A physical Merge Coin with a matched digital record.',
  },
  {
    titleKey: 'mergeCoinPage.step3Title',
    bodyKey: 'mergeCoinPage.step3Body',
    titleDefault: 'Build your house',
    bodyDefault: 'Open catalogs, publish designs, and grow your brand line.',
  },
] as const

const INCLUDES = [
  { key: 'mergeCoinPage.includeCoin', defaultValue: 'Physical Merge Coin' },
  { key: 'mergeCoinPage.includePassport', defaultValue: 'Digital product passport' },
  { key: 'mergeCoinPage.includeQr', defaultValue: 'Unique QR identity' },
  { key: 'mergeCoinPage.includeBrand', defaultValue: 'Brand line access' },
] as const

export default function MergeCoinPage() {
  const { t } = useTranslation()

  return (
    <div className="mc-page">
      <Navbar variant="landing" />

      <header className="mc-hero">
        <div className="mc-hero-copy ld-glass">
          <p className="mc-kicker">{t('mergeCoinPage.kicker', { defaultValue: 'MERGE COIN' })}</p>
          <h1>{t('mergeCoinPage.title', { defaultValue: 'One coin. Physical and digital.' })}</h1>
          <p className="mc-lead">
            {t('mergeCoinPage.lead', {
              defaultValue:
                'Merge Coin is a physical luxury product made with precious-metal filament, paired with a serial-matched digital passport. It is not a cryptocurrency or financial instrument.',
            })}
          </p>
          <div className="mc-hero-actions">
            <Link to="/login?tab=register" className="luxury-btn-glass">
              {t('mergeCoinPage.ctaRegister', { defaultValue: 'Join founding list' })}
            </Link>
            <Link to="/brand-room" className="luxury-btn-ghost">
              {t('mergeCoinPage.ctaBrandRoom', { defaultValue: 'Open Brand Room' })}
            </Link>
          </div>
        </div>

        <aside className="mc-hero-aside ld-glass">
          <div className="mc-coin-mark" aria-hidden>
            <span>★</span>
          </div>
          <dl className="mc-meta">
            <div>
              <dt>{t('mergeCoinPage.metaMetal', { defaultValue: 'Metal' })}</dt>
              <dd>{t('mergeCoinPage.metaMetalValue', { defaultValue: 'Silver & gold' })}</dd>
            </div>
            <div>
              <dt>{t('mergeCoinPage.metaRecord', { defaultValue: 'Record' })}</dt>
              <dd>{t('mergeCoinPage.metaRecordValue', { defaultValue: 'Serial-matched passport' })}</dd>
            </div>
            <div>
              <dt>{t('mergeCoinPage.metaNot', { defaultValue: 'Not' })}</dt>
              <dd>{t('mergeCoinPage.metaNotValue', { defaultValue: 'Crypto or a token' })}</dd>
            </div>
          </dl>
        </aside>
      </header>

      <section className="mc-section">
        <div className="mc-section-head">
          <p className="mc-kicker">{t('mergeCoinPage.factsKicker', { defaultValue: 'What it is' })}</p>
          <h2>{t('mergeCoinPage.factsTitle', { defaultValue: 'Three things to know' })}</h2>
        </div>
        <div className="mc-fact-grid">
          {FACTS.map((fact) => (
            <article key={fact.titleKey} className="mc-card ld-glass">
              <h3>{t(fact.titleKey, { defaultValue: fact.titleDefault })}</h3>
              <p>{t(fact.bodyKey, { defaultValue: fact.bodyDefault })}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mc-section">
        <div className="mc-section-head">
          <p className="mc-kicker">{t('mergeCoinPage.stepsKicker', { defaultValue: 'How it works' })}</p>
          <h2>{t('mergeCoinPage.stepsTitle', { defaultValue: 'From registration to your brand' })}</h2>
        </div>
        <div className="mc-step-grid">
          {STEPS.map((step, i) => (
            <article key={step.titleKey} className="mc-card ld-glass mc-step">
              <span className="mc-step-num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{t(step.titleKey, { defaultValue: step.titleDefault })}</h3>
              <p>{t(step.bodyKey, { defaultValue: step.bodyDefault })}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mc-section">
        <div className="mc-includes ld-glass">
          <div>
            <p className="mc-kicker">{t('mergeCoinPage.includesKicker', { defaultValue: 'Included' })}</p>
            <h2>{t('mergeCoinPage.includesTitle', { defaultValue: 'What comes with Merge Coin' })}</h2>
          </div>
          <ul className="mc-includes-list">
            {INCLUDES.map((item) => (
              <li key={item.key}>{t(item.key, { defaultValue: item.defaultValue })}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mc-section">
        <div className="mc-note ld-glass">
          <h2>{t('mergeCoinPage.noteTitle', { defaultValue: 'Important' })}</h2>
          <p>
            {t('mergeCoinPage.noteBody', {
              defaultValue:
                'Merge Coin’s value is the precious metal in the physical piece and the identity record attached to it. We do not promise investment returns or market price growth.',
            })}
          </p>
        </div>
      </section>

      <section className="mc-close">
        <div className="mc-close-inner ld-glass">
          <h2>{t('mergeCoinPage.closeTitle', { defaultValue: 'Ready to begin?' })}</h2>
          <p>
            {t('mergeCoinPage.closeBody', {
              defaultValue: 'Join the founding list. Verified accounts are fulfilled first.',
            })}
          </p>
          <Link to="/login?tab=register" className="mc-close-btn">
            {t('mergeCoinPage.closeCta', { defaultValue: 'Register free' })}
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
