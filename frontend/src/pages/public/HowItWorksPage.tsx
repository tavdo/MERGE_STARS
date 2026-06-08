import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

type Step = { n: string; icon: string; title: string; desc: string }

const STEP_ICONS = ['👤', '🪪', '🏷', '★', '📋', '🏦', '🏭', '📦']

export default function HowItWorksPage() {
  const { t } = useTranslation()
  const steps = (t('howItWorks.steps', { returnObjects: true }) as Omit<Step, 'icon'>[]).map((s, i) => ({
    ...s,
    icon: STEP_ICONS[i] ?? '◦',
  }))

  return (
    <div className="hiw-page-wrap">
      <Navbar />
      <div className="hiw-page">
        <section className="hiw-hero">
          <p className="hiw-kicker">{t('howItWorks.kicker')}</p>
          <h1>
            {t('howItWorks.title')}<br /><span className="gold-text">{t('howItWorks.titleGold')}</span>
          </h1>
          <p className="hiw-subtitle">{t('howItWorks.subtitle')}</p>
        </section>

        <section className="hiw-timeline-wrap">
          <div className="hiw-timeline">
            {steps.map((s, i) => (
              <div key={s.n} className="hiw-step-row">
                <div className="hiw-step-icon-col">
                  <div className={`hiw-step-icon${i < 2 ? ' hiw-step-icon--active' : ''}`}>
                    <span>{s.icon}</span>
                  </div>
                  <span className="hiw-step-num">{s.n}</span>
                </div>
                <div className="gold-card hiw-step-card">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="hiw-cta">
          <h2>
            {t('howItWorks.ctaTitle')} <span className="gold-text">{t('howItWorks.ctaGold')}</span>
          </h2>
          <Link to="/login?tab=register" className="gold-btn inline-flex mt-4">
            {t('howItWorks.ctaButton')}
          </Link>
        </section>
      </div>
      <Footer />
    </div>
  )
}
