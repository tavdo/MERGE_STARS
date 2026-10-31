import { useTranslation } from 'react-i18next'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

export default function TrustCenterPage() {
  const { t } = useTranslation()
  const points = t('trustPage.points', { returnObjects: true }) as string[]

  return (
    <div style={{ background: '#080808', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: '110px' }}>
        <section style={{ textAlign: 'center', padding: '80px 32px 60px', maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.3em', color: '#c9a84c', marginBottom: '16px' }}>{t('trustPage.kicker')}</p>
          <h1 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, color: '#fff', marginBottom: '16px', lineHeight: 1.1 }}>
            {t('trustPage.title')}<br /><span className="gold-text">{t('trustPage.titleGold')}</span>
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>{t('trustPage.subtitle')}</p>
        </section>
        <section style={{ maxWidth: '900px', margin: '0 auto', padding: '0 32px 80px' }}>
          <div className="gold-card" style={{ padding: '28px', borderRadius: '4px' }}>
            {points.map((point, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: '#c9a84c', flexShrink: 0, fontSize: '12px', marginTop: '2px' }}>•</span>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: 0 }}>{point}</p>
              </div>
            ))}
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '20px' }}>{t('trustPage.contact')}</p>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}
