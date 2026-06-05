import { useTranslation } from 'react-i18next'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

type Section = { title: string; body: string }

export default function LegalClassificationPage() {
  const { t } = useTranslation()
  const sections = t('legalClassification.sections', { returnObjects: true }) as Section[]

  return (
    <div style={{ background: '#080808', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: '110px' }}>
        <section style={{ textAlign: 'center', padding: '80px 32px 60px', maxWidth: '700px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.3em', color: '#c9a84c', marginBottom: '16px' }}>{t('legalClassification.kicker')}</p>
          <h1 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>
            {t('legalClassification.title')} <span className="gold-text">{t('legalClassification.titleGold')}</span>
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginTop: '20px', lineHeight: 1.7 }}>{t('legalClassification.subtitle')}</p>
        </section>
        <section style={{ maxWidth: '800px', margin: '0 auto', padding: '0 32px 80px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {sections.map((s) => (
            <div key={s.title} className="gold-card" style={{ padding: '28px', borderRadius: '4px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.15em', color: '#c9a84c', marginBottom: '12px' }}>{s.title}</h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.8 }}>{s.body}</p>
            </div>
          ))}
        </section>
      </div>
      <Footer />
    </div>
  )
}
