import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

const IS = [
  'Physical identity object',
  'Registry-linked product',
  'QR-linked product passport object',
  'Order-based manufactured item',
] as const

const IS_NOT = [
  'Currency',
  'Crypto asset',
  'Security',
  'Deposit',
  'Investment product',
  'Financial instrument',
  'Guaranteed return product',
] as const

export default function LegalClassificationPage() {
  return (
    <div style={{ background: '#080808', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: '110px' }}>
        <section style={{ textAlign: 'center', padding: '80px 32px 60px', maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.3em', color: '#c9a84c', marginBottom: '16px' }}>
            LEGAL CLASSIFICATION
          </p>
          <h1 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, color: '#fff', marginBottom: '16px', lineHeight: 1.1 }}>
            MERGE COIN<br />
            <span className="gold-text">Classification Matrix</span>
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
            Clear statement of what MERGE COIN is and is not. Prepared for review — not an approval statement.
          </p>
        </section>

        <section style={{ maxWidth: '900px', margin: '0 auto', padding: '0 32px 80px' }}>
          <div className="gold-card" style={{ padding: '24px', borderRadius: '4px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '18px' }}>
              <div style={{ padding: '18px', border: '1px solid rgba(34,197,94,0.18)', background: 'rgba(34,197,94,0.06)', borderRadius: '4px' }}>
                <p style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.2em', color: '#22c55e', marginBottom: '12px' }}>
                  MERGE COIN IS
                </p>
                <ul style={{ margin: 0, paddingLeft: '18px' }}>
                  {IS.map((x) => (
                    <li key={x} style={{ color: 'rgba(255,255,255,0.65)', margin: '8px 0', fontSize: '13px' }}>
                      {x}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ padding: '18px', border: '1px solid rgba(239,68,68,0.18)', background: 'rgba(239,68,68,0.06)', borderRadius: '4px' }}>
                <p style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.2em', color: '#f87171', marginBottom: '12px' }}>
                  MERGE COIN IS NOT
                </p>
                <ul style={{ margin: 0, paddingLeft: '18px' }}>
                  {IS_NOT.map((x) => (
                    <li key={x} style={{ color: 'rgba(255,255,255,0.65)', margin: '8px 0', fontSize: '13px' }}>
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ marginTop: '18px', padding: '14px 16px', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.14)', borderRadius: '4px' }}>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, margin: 0 }}>
                Displayed values are indicative only and do not constitute an offer, commitment, investment product, financial instrument, or guaranteed price.
              </p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}

