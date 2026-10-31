import { useTranslation } from 'react-i18next'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

type BrandCard = { title: string; subtitle: string }
type MegapolisCard = { badge: string; title: string; visualLabel: string; body: string }
type StructuralLayer = {
  title: string
  subtitle: string
  footer: string
  items?: { title: string; desc?: string; label?: string }[]
  riskTitle?: string
  risks?: string[]
}
type FlowStep = { title: string; desc: string }
type PhaseText = {
  label: string
  title: string
  firstLimit?: string
  firstLimitValue?: string
  priceMetric: string
  priceValue: string
  checks?: string[]
  inactive?: string[]
}
type HouseContainItem = { title: string; value: string }
type CatalogCategory = { label: string }
type ComplianceItem = { title: string; desc: string }

const MEGAPOLIS_ICONS = ['🏙️', '🌐', ['⌚', '🛥️', '🏎️', '💍']] as const
const STRUCTURAL_ICONS = [
  ['★', '🌌', '🏠', '💎'],
  ['🔒', '⚙️', '👥', '⚖️', '📋', '🤖', '📜'],
  [],
] as const
const HOUSE_BULLET_KEYS = ['brandOwner', 'productPassport', 'livingCatalog', 'legacyRegistry'] as const
const CATALOG_ICONS = ['⌚', '🕶️', '💍', '🛋️', '🏺', '👜', '👕', '🗿', '🎁', '💎'] as const
const COMPLIANCE_ICONS = ['🤝', '🔍', '⚙️', '⚖️', '🤖', '📜'] as const

export default function MergeCoinPage() {
  const { t } = useTranslation()
  const tr = <T,>(key: string) => t(`mergeCoinFull.${key}`, { returnObjects: true }) as unknown as T

  const brandCards = tr<BrandCard[]>('header.brandCards')
  const megapolisCards = tr<MegapolisCard[]>('megapolis.cards')
  const structuralLayers = tr<StructuralLayer[]>('structural.layers')
  const formulaSteps = tr<FlowStep[]>('formula.steps')
  const houseBullets = tr<Record<(typeof HOUSE_BULLET_KEYS)[number], string>>('formula.houseBullets')
  const phase1 = tr<PhaseText>('phases.phase1')
  const phase2 = tr<PhaseText>('phases.phase2')
  const firstAllocationTags = tr<string[]>('phases.allocations.firstTags')
  const secondAllocationTags = tr<string[]>('phases.allocations.secondTags')
  const containsItems = tr<HouseContainItem[]>('house.contains.items')
  const catalogCategories = tr<CatalogCategory[]>('house.catalogs.categories')
  const finalNoLonger = tr<string[]>('final.noLonger')
  const complianceItems = tr<ComplianceItem[]>('compliance.items')

  return (
    <div style={{ background: '#050505', minHeight: '100vh', color: '#fff', fontFamily: 'var(--font-sans)', overflowX: 'hidden' }}>
      <Navbar />

      {/* Embedded inline CSS for animations and custom visual properties */}
      <style>{`
        @keyframes pulse-gold {
          0%, 100% { box-shadow: 0 0 15px rgba(201,168,76,0.15); border-color: rgba(201,168,76,0.3); }
          50% { box-shadow: 0 0 25px rgba(201,168,76,0.35); border-color: rgba(201,168,76,0.6); }
        }
        @keyframes rotate-coin {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        @keyframes float-light {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
        }
        .animate-pulse-gold {
          animation: pulse-gold 3s infinite ease-in-out;
        }
        .animate-rotate-coin {
          animation: rotate-coin 12s infinite linear;
          transform-style: preserve-3d;
        }
        .animate-float {
          animation: float-light 6s infinite ease-in-out;
        }
        .glass-card-premium {
          background: rgba(10, 10, 10, 0.75);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(201,168,76,0.12);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.87);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .glass-card-premium:hover {
          border-color: rgba(201,168,76,0.35);
          box-shadow: 0 12px 40px 0 rgba(201, 168, 76, 0.08);
          transform: translateY(-2px);
        }
        .gold-glow-text {
          color: #f5d78e;
          text-shadow: 0 0 10px rgba(245,215,142,0.3);
        }
        .gold-border-linear {
          border-image: linear-gradient(to right, rgba(201,168,76,0.05), rgba(201,168,76,0.3), rgba(201,168,76,0.05)) 1;
        }
      `}</style>

      <div style={{ paddingTop: '100px', paddingBottom: '40px' }}>
        <div className="admin-inner merge-page-inner w-full mx-auto" style={{ maxWidth: '1320px', padding: '0 20px' }}>
          <header style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'center', marginBottom: '40px' }}>
            <div className="glass-card-premium" style={{ padding: '20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative', width: '56px', height: '56px', borderRadius: '50%', background: 'radial-gradient(circle, #f5d78e 0%, #c9a84c 50%, #1f1908 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0, boxShadow: '0 4px 15px rgba(201,168,76,0.3)' }}>
                <span style={{ fontSize: '26px', color: '#050505', fontWeight: 900 }}>★</span>
              </div>
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '0.12em', color: '#c9a84c', margin: 0, textTransform: 'uppercase' }}>{brandCards[0].title}</h4>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{brandCards[0].subtitle}</p>
              </div>
            </div>

            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ width: '40px', height: '40px', margin: '0 auto 12px', borderRadius: '50%', border: '1px solid #c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(201,168,76,0.05)' }}>
                <span style={{ fontSize: '18px', color: '#c9a84c' }}>★</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontWeight: 600, letterSpacing: '0.22em', color: '#fff', margin: '0 0 4px', textTransform: 'uppercase' }}>
                {t('mergeCoinFull.header.title')}
              </h1>
              <p style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.35em', color: '#c9a84c', margin: '0 0 8px', textTransform: 'uppercase' }}>
                {t('mergeCoinFull.header.subtitle')}
              </p>
              <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', margin: 0, textTransform: 'uppercase' }}>
                {t('mergeCoinFull.header.system')}
              </p>
            </div>

            <div className="glass-card-premium" style={{ padding: '20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative', width: '56px', height: '56px', borderRadius: '6px', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '26px' }}>🏰</span>
              </div>
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '0.12em', color: '#c9a84c', margin: 0, textTransform: 'uppercase' }}>{brandCards[1].title}</h4>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{brandCards[1].subtitle}</p>
              </div>
            </div>
          </header>

          <hr style={{ border: 'none', height: '1px', background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.15), transparent)', marginBottom: '40px' }} />

          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '48px' }}>
            {megapolisCards.map((card, idx) => (
              <div key={card.badge} className="glass-card-premium" style={{ padding: '24px', borderRadius: '8px', borderLeft: '3px solid #c9a84c' }}>
                <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', color: '#c9a84c', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                  {card.badge}
                </span>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: '0 0 12px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {card.title}
                </h3>
                <div style={{ height: '90px', background: 'radial-gradient(circle at center, rgba(201,168,76,0.06) 0%, transparent 80%)', border: '1px solid rgba(201,168,76,0.06)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', position: 'relative', overflow: 'hidden' }}>
                  {Array.isArray(MEGAPOLIS_ICONS[idx]) ? (
                    <div style={{ display: 'flex', gap: '8px', fontSize: '20px', filter: 'drop-shadow(0 0 8px rgba(201,168,76,0.3))' }}>
                      {(MEGAPOLIS_ICONS[idx] as readonly string[]).map((icon) => (
                        <span key={icon}>{icon}</span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '32px', filter: 'drop-shadow(0 0 8px rgba(201,168,76,0.4))' }}>{MEGAPOLIS_ICONS[idx]}</div>
                  )}
                  <div style={{ position: 'absolute', bottom: '10px', fontSize: '9px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontWeight: 700 }}>{card.visualLabel}</div>
                </div>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: 0 }}>
                  {card.body}
                </p>
              </div>
            ))}
          </section>

          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '56px' }}>
            {structuralLayers.map((layer, layerIdx) => (
              <div key={layer.title} className="glass-card-premium" style={{ padding: '28px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#c9a84c', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900 }}>{layerIdx + 1}</span>
                    <h4 style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '0.12em', color: '#c9a84c', margin: 0, textTransform: 'uppercase' }}>{layer.title}</h4>
                  </div>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px', fontWeight: 700 }}>{layer.subtitle}</p>

                  {layerIdx === 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {layer.items?.map((item, idx) => (
                        <div key={item.title} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <span style={{ fontSize: '14px', color: '#c9a84c' }}>{STRUCTURAL_ICONS[layerIdx][idx]}</span>
                          <div>
                            <p style={{ fontSize: '11px', fontWeight: 700, color: '#fff', margin: 0 }}>{item.title}</p>
                            <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {layerIdx === 1 && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                        {layer.items?.map((item, idx) => (
                          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.03)' }}>
                            <span style={{ fontSize: '11px' }}>{STRUCTURAL_ICONS[layerIdx][idx]}</span>
                            <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.05em' }}>{item.label}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.12)', padding: '12px', borderRadius: '4px' }}>
                        <p style={{ fontSize: '8px', fontWeight: 900, letterSpacing: '0.15em', color: '#f87171', margin: '0 0 8px', textTransform: 'uppercase' }}>✓ {layer.riskTitle}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {layer.risks?.map((risk) => (
                            <div key={risk} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: 'bold' }}>✓</span>
                              <span style={{ fontSize: '8.5px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em' }}>{risk}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {layerIdx === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {layer.items?.map((item) => (
                        <div key={item.title} style={{ padding: '6px 10px', background: 'rgba(201,168,76,0.02)', border: '1px solid rgba(201,168,76,0.05)', borderRadius: '4px' }}>
                          <p style={{ fontSize: '9px', fontWeight: 900, color: '#fff', margin: '0 0 2px', letterSpacing: '0.05em' }}>{item.title}</p>
                          <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ marginTop: '24px', borderTop: '1px solid rgba(201,168,76,0.15)', paddingTop: '14px', textAlign: 'center' }}>
                  <span style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.2em', color: '#fff', textTransform: 'uppercase' }}>{layer.footer}</span>
                </div>
              </div>
            ))}
          </section>

          <section className="glass-card-premium" style={{ padding: '32px', borderRadius: '8px', marginBottom: '56px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(201,168,76,0.03) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <p style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', color: '#c9a84c', textAlign: 'center', marginBottom: '28px', textTransform: 'uppercase' }}>
              {t('mergeCoinFull.formula.title')}
            </p>

            <div className="merge-ecology-flow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              {formulaSteps.map((step, idx) => (
                <div key={step.title} style={{ display: 'contents' }}>
                  {idx > 0 && <div className="merge-ecology-arrow" style={{ color: '#c9a84c', fontSize: '18px', fontWeight: 900 }}>➔</div>}
                  {idx === 2 ? (
                    <div className="animate-pulse-gold" style={{ flex: '1 2 240px', padding: '16px', background: 'rgba(201,168,76,0.03)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏰</div>
                      <p style={{ fontSize: '11px', fontWeight: 900, color: '#c9a84c', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{step.title}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '8px', color: 'rgba(255,255,255,0.5)', textAlign: 'left' }}>
                        {HOUSE_BULLET_KEYS.map((key) => (
                          <div key={key}>• {houseBullets[key]}</div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ flex: '1 1 140px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: idx === 1 ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.02)', border: idx === 1 ? '1px solid rgba(201,168,76,0.3)' : '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: idx === 1 ? '#c9a84c' : undefined }}>
                        {['👨‍💼', '★', '🏰', '🌌', '💎'][idx]}
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', fontWeight: 900, color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{step.title}</p>
                        <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{step.desc}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: '56px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <p style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.3em', color: '#c9a84c', margin: '0 0 6px', textTransform: 'uppercase' }}>{t('mergeCoinFull.phases.kicker')}</p>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 600, color: '#fff', margin: 0, letterSpacing: '0.05em' }}>{t('mergeCoinFull.phases.title')}</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '8px' }}>
                <span style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.15em', color: '#c9a84c', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>{phase1.label}</span>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '0 0 16px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{phase1.title}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', marginBottom: '14px' }}>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{phase1.firstLimit}</span>
                  <span style={{ fontSize: '11px', color: '#c9a84c', fontWeight: 900 }}>{phase1.firstLimitValue}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', marginBottom: '18px' }}>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{phase1.priceMetric}</span>
                  <span style={{ fontSize: '11px', color: '#fff', fontWeight: 900 }}>{phase1.priceValue}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {phase1.checks?.map((check) => (
                    <div key={check} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#22c55e', fontSize: '11px', fontWeight: 'bold' }}>✓</span>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>{check}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card-premium animate-pulse-gold" style={{ padding: '24px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyItems: 'space-between', justifyContent: 'space-between', background: 'rgba(201,168,76,0.02)', borderColor: 'rgba(201,168,76,0.2)' }}>
                <div>
                  <span style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.15em', color: '#c9a84c', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>{phase2.label}</span>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '0 0 16px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{phase2.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', marginBottom: '14px' }}>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{phase2.priceMetric}</span>
                    <span style={{ fontSize: '11px', color: '#c9a84c', fontWeight: 900 }}>{phase2.priceValue}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    {phase2.inactive?.map((item) => (
                      <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#ef4444', fontSize: '10px', fontWeight: 'bold' }}>✕</span>
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
                  <div className="animate-rotate-coin" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle, #ffe293 0%, #c9a84c 40%, #5e460e 85%, #000 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 25px rgba(201,168,76,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{ fontSize: '36px', color: '#000', fontWeight: 900, textShadow: '0 2px 4px rgba(255,255,255,0.4)' }}>★</span>
                  </div>
                </div>
              </div>

              <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '14px' }}>
                  <p style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.1em', color: '#c9a84c', margin: '0 0 6px', textTransform: 'uppercase' }}>{t('mergeCoinFull.phases.allocations.firstTitle')}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {firstAllocationTags.map((tag) => (
                      <span key={tag} style={{ fontSize: '8.5px', fontWeight: 700, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '3px', color: 'rgba(255,255,255,0.75)' }}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.1em', color: '#c9a84c', margin: '0 0 6px', textTransform: 'uppercase' }}>{t('mergeCoinFull.phases.allocations.secondTitle')}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {secondAllocationTags.map((tag) => (
                      <span key={tag} style={{ fontSize: '8.5px', fontWeight: 700, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '3px', color: 'rgba(255,255,255,0.75)' }}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="glass-card-premium animate-pulse-gold" style={{ padding: '32px', borderRadius: '8px', marginBottom: '56px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <p style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.25em', color: '#c9a84c', margin: '0 0 4px', textTransform: 'uppercase' }}>{t('mergeCoinFull.qr.title')}</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('mergeCoinFull.qr.subtitle')}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '20px', borderRadius: '6px' }}>
                <span style={{ fontSize: '10px', fontWeight: 900, color: '#c9a84c', letterSpacing: '0.1em', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>{t('mergeCoinFull.qr.direct.title')}</span>
                <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', margin: '0 0 16px', textTransform: 'uppercase' }}>{t('mergeCoinFull.qr.direct.condition')}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                  <div style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', textAlign: 'center' }}>
                    <p style={{ fontSize: '11px', fontWeight: 900, color: '#fff', margin: 0 }}>{t('mergeCoinFull.qr.direct.order')}</p>
                  </div>
                  <div style={{ color: '#c9a84c' }}>➔</div>
                  <div style={{ padding: '6px 12px', background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '4px', textAlign: 'center' }}>
                    <p style={{ fontSize: '9px', fontWeight: 900, color: '#c9a84c', margin: 0 }}>{t('mergeCoinFull.qr.direct.production')}</p>
                    <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{t('mergeCoinFull.qr.direct.physicalBase')}</p>
                  </div>
                  <div style={{ color: '#c9a84c' }}>➔</div>
                  <div style={{ padding: '6px 12px', background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '4px', textAlign: 'center' }}>
                    <p style={{ fontSize: '9px', fontWeight: 900, color: '#c9a84c', margin: 0 }}>{t('mergeCoinFull.qr.direct.owner')}</p>
                    <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{t('mergeCoinFull.qr.direct.platformShare')}</p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '8px', background: '#050505', border: '2px dashed #c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(201,168,76,0.2)', position: 'relative' }}>
                  <span style={{ fontSize: '42px', filter: 'invert(1) opacity(0.85)' }}>🔳</span>
                </div>
                <span style={{ fontSize: '9px', fontWeight: 900, color: '#c9a84c', letterSpacing: '0.12em', marginTop: '10px', textTransform: 'uppercase' }}>{t('mergeCoinFull.qr.core')}</span>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '20px', borderRadius: '6px' }}>
                <span style={{ fontSize: '10px', fontWeight: 900, color: '#c9a84c', letterSpacing: '0.1em', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>{t('mergeCoinFull.qr.split.title')}</span>
                <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', margin: '0 0 16px', textTransform: 'uppercase' }}>{t('mergeCoinFull.qr.split.condition')}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <div style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', textAlign: 'center' }}>
                    <p style={{ fontSize: '10px', fontWeight: 900, color: '#fff', margin: 0 }}>{t('mergeCoinFull.qr.split.order')}</p>
                  </div>
                  <div style={{ color: '#c9a84c' }}>➔</div>
                  <div style={{ padding: '6px 10px', background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '4px', textAlign: 'center' }}>
                    <p style={{ fontSize: '8.5px', fontWeight: 900, color: '#fff', margin: 0 }}>{t('mergeCoinFull.qr.split.production')}</p>
                  </div>
                  <div style={{ color: '#c9a84c' }}>+</div>
                  <div style={{ padding: '6px 10px', background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '4px', textAlign: 'center' }}>
                    <p style={{ fontSize: '8.5px', fontWeight: 900, color: '#c9a84c', margin: 0 }}>{t('mergeCoinFull.qr.split.traffic')}</p>
                    <p style={{ fontSize: '7.5px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>{t('mergeCoinFull.qr.split.referrer')}</p>
                  </div>
                  <div style={{ color: '#c9a84c' }}>+</div>
                  <div style={{ padding: '6px 10px', background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '4px', textAlign: 'center' }}>
                    <p style={{ fontSize: '8.5px', fontWeight: 900, color: '#c9a84c', margin: 0 }}>{t('mergeCoinFull.qr.split.house')}</p>
                    <p style={{ fontSize: '7.5px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>{t('mergeCoinFull.qr.split.owner')}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '56px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '8px' }}>
                <span style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.2em', color: '#c9a84c', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>{t('mergeCoinFull.house.info.kicker')}</span>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#fff', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('mergeCoinFull.house.info.title')}</h3>
                <div style={{ height: '90px', background: 'radial-gradient(circle at center, rgba(201,168,76,0.08) 0%, transparent 80%)', border: '1px solid rgba(201,168,76,0.08)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <span style={{ fontSize: '36px', filter: 'drop-shadow(0 0 10px rgba(201,168,76,0.3))' }}>🏠</span>
                </div>
              </div>

              <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '8px' }}>
                <span style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.15em', color: '#c9a84c', display: 'block', marginBottom: '14px', textTransform: 'uppercase' }}>{t('mergeCoinFull.house.contains.title')}</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {containsItems.map((item) => (
                    <div key={item.title} style={{ padding: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                      <p style={{ fontSize: '9.5px', fontWeight: 800, color: '#fff', margin: 0 }}>{item.title}</p>
                      <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass-card-premium" style={{ padding: '28px', borderRadius: '8px' }}>
              <span style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.2em', color: '#c9a84c', display: 'block', marginBottom: '6px', textTransform: 'uppercase', textAlign: 'center' }}>{t('mergeCoinFull.house.catalogs.kicker')}</span>
              <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#fff', margin: '0 0 24px', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>{t('mergeCoinFull.house.catalogs.title')}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '12px' }}>
                {catalogCategories.map((item, idx) => (
                  <div
                    key={item.label}
                    style={{ padding: '14px 10px', background: 'rgba(201,168,76,0.02)', border: '1px solid rgba(201,168,76,0.08)', borderRadius: '6px', textAlign: 'center', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#c9a84c'
                      e.currentTarget.style.background = 'rgba(201,168,76,0.05)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(201,168,76,0.08)'
                      e.currentTarget.style.background = 'rgba(201,168,76,0.02)'
                    }}
                  >
                    <span style={{ fontSize: '22px', display: 'block', marginBottom: '8px' }}>{CATALOG_ICONS[idx]}</span>
                    <span style={{ fontSize: '9px', fontWeight: 800, color: '#fff', display: 'block', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '56px' }}>
            <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '8px', borderLeft: '3px solid #ef4444' }}>
              <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', color: '#f87171', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>{t('mergeCoinFull.rules.main.kicker')}</span>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#fff', margin: '0 0 14px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{t('mergeCoinFull.rules.main.title')}</h3>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, marginBottom: '14px' }}>{t('mergeCoinFull.rules.main.body')}</p>
              <div style={{ padding: '10px', background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.12)', borderRadius: '4px', textAlign: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: 900, color: '#f87171', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{t('mergeCoinFull.rules.main.packageUnit')}</span>
              </div>
            </div>

            <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '8px' }}>
              <span style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.15em', color: '#c9a84c', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>{t('mergeCoinFull.rules.why.kicker')}</span>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: '0 0 16px', textTransform: 'uppercase' }}>{t('mergeCoinFull.rules.why.receive')}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {(['physical', 'infrastructure'] as const).map((section) => (
                  <div key={section}>
                    <p style={{ fontSize: '9px', fontWeight: 900, color: '#fff', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>{t(`mergeCoinFull.rules.why.${section}.title`)}</p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '8px', color: 'rgba(255,255,255,0.5)' }}>
                      {tr<string[]>(`rules.why.${section}.items`).map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyItems: 'center', justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(circle at center, rgba(201,168,76,0.04) 0%, transparent 80%)' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>📦</div>
              <p style={{ fontSize: '11px', fontWeight: 900, color: '#fff', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('mergeCoinFull.rules.package.title')}</p>
              <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', margin: 0, textAlign: 'center' }}>{t('mergeCoinFull.rules.package.subtitle')}</p>
            </div>
          </section>

          <section className="glass-card-premium animate-pulse-gold" style={{ padding: '40px', borderRadius: '8px', marginBottom: '40px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(201,168,76,0.05) 0%, transparent 85%)', pointerEvents: 'none' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.2em', color: '#c9a84c', margin: '0 0 8px', textTransform: 'uppercase' }}>{t('mergeCoinFull.final.biggestIdea')}</p>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, color: '#fff', margin: '0 0 18px', letterSpacing: '0.05em' }}>{t('mergeCoinFull.final.noLongerTitle')}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                  {finalNoLonger.map((item) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#ef4444', fontSize: '10px' }}>✕</span>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item}</span>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('mergeCoinFull.final.becomesLabel')}</p>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: '#c9a84c', margin: 0, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>
                  {t('mergeCoinFull.final.becomesValue')}
                </p>
              </div>

              <div style={{ borderLeft: '1px solid rgba(201,168,76,0.15)', paddingLeft: '32px' }}>
                <p style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.2em', color: '#c9a84c', margin: '0 0 8px', textTransform: 'uppercase' }}>{t('mergeCoinFull.final.truthKicker')}</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.75, margin: 0 }}>
                  {t('mergeCoinFull.final.truthLead')} <strong>{t('mergeCoinFull.final.truthCoin')}</strong> {t('mergeCoinFull.final.truthHouseLead')} <strong>{t('mergeCoinFull.final.truthHouse')}</strong>, {t('mergeCoinFull.final.truthHousesLead')} <strong>{t('mergeCoinFull.final.truthHouses')}</strong> {t('mergeCoinFull.final.truthWorldLead')} <strong>{t('mergeCoinFull.final.truthWorld')}</strong>.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(201,168,76,0.05)' }}>
                    <span style={{ fontSize: '12px', color: '#c9a84c' }}>★</span>
                  </div>
                  <span style={{ fontSize: '8.5px', fontWeight: 900, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{t('mergeCoinFull.final.badge')}</span>
                </div>
              </div>
            </div>
          </section>

          <footer style={{ background: 'rgba(10,10,10,0.5)', border: '1px solid rgba(201,168,76,0.1)', padding: '20px 24px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '14px' }}>
              {complianceItems.map((item, idx) => (
                <div key={item.title} style={{ padding: '6px', textAlign: 'center' }}>
                  <span style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>{COMPLIANCE_ICONS[idx]}</span>
                  <span style={{ fontSize: '9px', fontWeight: 900, color: '#c9a84c', display: 'block', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{item.title}</span>
                  <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', display: 'block', marginTop: '2px' }}>{item.desc}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', margin: 0, textTransform: 'uppercase' }}>
              {t('mergeCoinFull.compliance.tagline')}
            </p>
          </footer>
        </div>
      </div>

      <Footer />
    </div>
  )
}
