import { useTranslation } from 'react-i18next'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

type Section = { title: string; body: string }

export default function ReferralPolicyPage() {
  const { t } = useTranslation()
  const sections = t('referralPolicy.sections', { returnObjects: true }) as Section[]
  const distribution = [
    { label: t('referralPolicy.platformOps'), pct: '1/2', color: '#c9a84c' },
    { label: t('referralPolicy.brandOwner'), pct: '1/4', color: '#f5d78e' },
    { label: t('referralPolicy.directReferrer'), pct: '1/4', color: '#a78bfa' },
  ]

  return (
    <div style={{ background: '#080808', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: '110px' }}>
        <section style={{ textAlign: 'center', padding: '80px 32px 60px', maxWidth: '700px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.3em', color: '#c9a84c', marginBottom: '16px' }}>{t('legal.legal')}</p>
          <h1 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>{t('legal.referralPolicyTitle')}</h1>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '16px' }}>{t('legal.lastUpdated')}</p>
        </section>

        <section style={{ maxWidth: '800px', margin: '0 auto', padding: '0 32px 80px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="gold-card" style={{ padding: '32px', borderRadius: '4px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.2em', color: '#c9a84c', marginBottom: '24px' }}>{t('referralPolicy.distributionTitle')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '16px' }}>
              {distribution.map((r) => (
                <div key={r.label} style={{ textAlign: 'center', padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px' }}>
                  <p style={{ fontSize: '36px', fontWeight: 900, color: r.color, marginBottom: '8px' }}>{r.pct}</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{r.label}</p>
                </div>
              ))}
            </div>
          </div>

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
