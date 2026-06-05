import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

type Section = { title: string; body?: string; items?: string[] }

export default function TermsPage() {
  const { t } = useTranslation()
  const sections = t('termsSections', { returnObjects: true }) as Section[]

  return (
    <div style={{ background: '#080808', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: '110px' }}>
        <section style={{ textAlign: 'center', padding: '80px 32px 48px', maxWidth: '720px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.3em', color: '#c9a84c', marginBottom: '16px' }}>{t('legal.legal')}</p>
          <h1 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, margin: 0 }}>
            {t('legal.termsTitle')}
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginTop: '20px', lineHeight: 1.7 }}>
            {t('legal.termsIntro')}
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '16px' }}>
            {t('legal.lastUpdated')}
          </p>
          <p style={{ fontSize: '12px', marginTop: '12px' }}>
            <Link to="/privacy" style={{ color: '#c9a84c', textDecoration: 'none', letterSpacing: '0.08em' }}>
              {t('legal.privacyLink')}
            </Link>
            {' · '}
            <Link to="/referral-policy" style={{ color: '#c9a84c', textDecoration: 'none', letterSpacing: '0.08em' }}>
              {t('legal.referralLink')}
            </Link>
          </p>
        </section>

        <section style={{ maxWidth: '800px', margin: '0 auto', padding: '0 32px 80px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {sections.map((s) => (
            <article
              key={s.title}
              style={{ padding: '24px 28px', background: '#0f0f0f', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '4px' }}
            >
              <h2 style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.15em', color: '#c9a84c', marginBottom: '12px', marginTop: 0 }}>
                {s.title}
              </h2>
              {s.body && (
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, margin: 0 }}>{s.body}</p>
              )}
              {s.items && (
                <ul style={{ margin: s.body ? '14px 0 0' : 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {s.items.map((item) => (
                    <li key={item.slice(0, 40)} style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75 }}>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </section>
      </div>
      <Footer />
    </div>
  )
}
