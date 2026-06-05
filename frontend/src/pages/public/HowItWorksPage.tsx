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
    <div style={{ background: '#080808', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: '110px' }}>
        <section style={{ textAlign: 'center', padding: '80px 32px 60px', maxWidth: '800px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.3em', color: '#c9a84c', marginBottom: '16px' }}>{t('howItWorks.kicker')}</p>
          <h1 style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: 900, color: '#fff', marginBottom: '20px', lineHeight: 1.1 }}>
            {t('howItWorks.title')}<br /><span className="gold-text">{t('howItWorks.titleGold')}</span>
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>
            {t('howItWorks.subtitle')}
          </p>
        </section>

        <section style={{ maxWidth: '900px', margin: '0 auto', padding: '0 32px 80px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '40px', top: '40px', bottom: '40px', width: '1px', background: 'linear-gradient(180deg, #c9a84c, rgba(201,168,76,0.1))', display: 'block' }} className="hidden md:block" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {steps.map((s, i) => (
                <div key={s.n} style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
                  <div style={{ flexShrink: 0, width: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '60px', height: '60px', borderRadius: '50%',
                      background: i < 2 ? 'linear-gradient(135deg,#c9a84c,#f5d78e)' : 'rgba(201,168,76,0.1)',
                      border: i >= 2 ? '1px solid rgba(201,168,76,0.25)' : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '22px', zIndex: 1, position: 'relative',
                    }}>
                      <span style={{ color: i < 2 ? '#000' : '#c9a84c' }}>{s.icon}</span>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>{s.n}</span>
                  </div>
                  <div className="gold-card" style={{ flex: 1, padding: '24px', borderRadius: '4px' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.2em', color: '#c9a84c', marginBottom: '10px' }}>{s.title}</h3>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ textAlign: 'center', padding: '60px 32px 80px', borderTop: '1px solid rgba(201,168,76,0.08)' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', marginBottom: '16px' }}>
            {t('howItWorks.ctaTitle')} <span className="gold-text">{t('howItWorks.ctaGold')}</span>
          </h2>
          <a href="/login" className="gold-btn inline-flex mt-4">
            {t('howItWorks.ctaButton')}
          </a>
        </section>
      </div>
      <Footer />
    </div>
  )
}
