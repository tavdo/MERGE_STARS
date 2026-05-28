import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

const POINTS = [
  'MERGE COIN is not a financial instrument.',
  'MERGE COIN is not an investment product.',
  'MERGE STARS is not a lender.',
  'Displayed values are indicative only.',
  'Production begins only after payment_status=PAID or bank_status=APPROVED.',
  'AI supports; humans decide.',
  'No guaranteed returns.',
  'Single-level referral only. No multi-level compensation.',
] as const

export default function TrustCenterPage() {
  return (
    <div style={{ background: '#080808', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: '110px' }}>
        <section style={{ textAlign: 'center', padding: '80px 32px 60px', maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.3em', color: '#c9a84c', marginBottom: '16px' }}>
            TRUST CENTER
          </p>
          <h1 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, color: '#fff', marginBottom: '16px', lineHeight: 1.1 }}>
            Platform Trust &<br />
            <span className="gold-text">Governance Disclosures</span>
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
            Evidence-based disclosures for banks, partners, and users. Prepared for review — not an approval statement.
          </p>
        </section>

        <section style={{ maxWidth: '900px', margin: '0 auto', padding: '0 32px 80px' }}>
          <div className="gold-card" style={{ padding: '28px', borderRadius: '4px' }}>
            {POINTS.map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: '#c9a84c', flexShrink: 0, fontSize: '12px', marginTop: '2px' }}>•</span>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: 0 }}>{t}</p>
              </div>
            ))}
            <div style={{ marginTop: '18px', padding: '14px 16px', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.14)', borderRadius: '4px' }}>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, margin: 0 }}>
                This Trust Center is a transparency layer. It is not an offer, commitment, guarantee, approval, or legal execution statement.
              </p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}

