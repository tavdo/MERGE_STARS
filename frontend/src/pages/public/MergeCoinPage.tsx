import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

export default function MergeCoinPage() {
  return (
    <div style={{ background: '#050505', minHeight: '100vh', color: '#fff', fontFamily: "var(--font-sans)", overflowX: 'hidden' }}>
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

          {/* ========================================================================= */}
          {/* ZONE 1: HEADER ZONE (STAR CIVILIZATION BRANDING) */}
          {/* ========================================================================= */}
          <header style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'center', marginBottom: '40px' }}>
            
            {/* Left Card: Star Brand Coin */}
            <div className="glass-card-premium" style={{ padding: '20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative', width: '56px', height: '56px', borderRadius: '50%', background: 'radial-gradient(circle, #f5d78e 0%, #c9a84c 50%, #1f1908 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0, boxShadow: '0 4px 15px rgba(201,168,76,0.3)' }}>
                <span style={{ fontSize: '26px', color: '#050505', fontWeight: 900 }}>★</span>
              </div>
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '0.12em', color: '#c9a84c', margin: 0, textTransform: 'uppercase' }}>STAR BRAND COIN</h4>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>The Key to Your Star Path</p>
              </div>
            </div>

            {/* Middle Logo & Title */}
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ width: '40px', height: '40px', margin: '0 auto 12px', borderRadius: '50%', border: '1px solid #c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(201,168,76,0.05)' }}>
                <span style={{ fontSize: '18px', color: '#c9a84c' }}>★</span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontWeight: 600, letterSpacing: '0.22em', color: '#fff', margin: '0 0 4px', textTransform: 'uppercase' }}>
                MERGE STARS
              </h1>
              <p style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.35em', color: '#c9a84c', margin: '0 0 8px', textTransform: 'uppercase' }}>
                STAR CIVILIZATION
              </p>
              <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', margin: 0, textTransform: 'uppercase' }}>
                A Verified Living Jewelry Infrastructure System
              </p>
            </div>

            {/* Right Card: Star Jewelry House */}
            <div className="glass-card-premium" style={{ padding: '20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative', width: '56px', height: '56px', borderRadius: '6px', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '26px' }}>🏰</span>
              </div>
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '0.12em', color: '#c9a84c', margin: 0, textTransform: 'uppercase' }}>STAR JEWELRY HOUSE</h4>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Personal Living Jewelry House</p>
              </div>
            </div>

          </header>

          <hr style={{ border: 'none', height: '1px', background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.15), transparent)', marginBottom: '40px' }} />

          {/* ========================================================================= */}
          {/* ZONE 2: THREE-COLUMN MEGAPOLIS CONSTELLATION ZONE */}
          {/* ========================================================================= */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '48px' }}>
            
            {/* Card 1: Megapolis */}
            <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '8px', borderLeft: '3px solid #c9a84c' }}>
              <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', color: '#c9a84c', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                MERGE STARS MEGAPOLIS
              </span>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: '0 0 12px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                The Living Jewelry Universe
              </h3>
              <div style={{ height: '90px', background: 'radial-gradient(circle at center, rgba(201,168,76,0.06) 0%, transparent 80%)', border: '1px solid rgba(201,168,76,0.06)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontSize: '32px', filter: 'drop-shadow(0 0 8px rgba(201,168,76,0.4))' }}>🏙️</div>
                <div style={{ position: 'absolute', bottom: '10px', fontSize: '9px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontWeight: 700 }}>HIGH-CLASS METROPOLIS CONCEPT</div>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: 0 }}>
                A structural megapolis connecting physical manufacturing facilities, direct distribution pipelines, and high-precision traceability platforms.
              </p>
            </div>

            {/* Card 2: Mega Constellation */}
            <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '8px', borderLeft: '3px solid #c9a84c' }}>
              <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', color: '#c9a84c', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                MEGA CONSTELLATION
              </span>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: '0 0 12px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                All Houses United As One
              </h3>
              <div style={{ height: '90px', background: 'radial-gradient(circle at center, rgba(201,168,76,0.06) 0%, transparent 80%)', border: '1px solid rgba(201,168,76,0.06)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontSize: '32px', filter: 'drop-shadow(0 0 8px rgba(201,168,76,0.4))' }}>🌐</div>
                <div style={{ position: 'absolute', bottom: '10px', fontSize: '9px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontWeight: 700 }}>GLOBAL MESH CONNECTION</div>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: 0 }}>
                Connecting thousands of individual verified Brand Houses under one decentralized global catalog registry with instant peer verification.
              </p>
            </div>

            {/* Card 3: The Jewelry World */}
            <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '8px', borderLeft: '3px solid #c9a84c' }}>
              <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', color: '#c9a84c', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                THE JEWELRY WORLD
              </span>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: '0 0 12px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                A New World of Luxury
              </h3>
              <div style={{ height: '90px', background: 'radial-gradient(circle at center, rgba(201,168,76,0.06) 0%, transparent 80%)', border: '1px solid rgba(201,168,76,0.06)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', gap: '8px', fontSize: '20px', filter: 'drop-shadow(0 0 8px rgba(201,168,76,0.3))' }}>
                  <span>⌚</span><span>🛥️</span><span>🏎️</span><span>💍</span>
                </div>
                <div style={{ position: 'absolute', bottom: '10px', fontSize: '9px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontWeight: 700 }}>ULTIMATE LIFESTYLE UTILITY</div>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: 0 }}>
                Integrating high-end watches, tailor-made luxury vehicles, yachts, custom furniture, fine sculptures, and exclusive physical artifacts.
              </p>
            </div>

          </section>

          {/* ========================================================================= */}
          {/* ZONE 3: THREE-COLUMN STRUCTURAL LAYER ZONE */}
          {/* ========================================================================= */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '56px' }}>
            
            {/* Column 1: Philosophical Layer */}
            <div className="glass-card-premium" style={{ padding: '28px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#c9a84c', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900 }}>1</span>
                  <h4 style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '0.12em', color: '#c9a84c', margin: 0, textTransform: 'uppercase' }}>PHILOSOPHICAL LAYER</h4>
                </div>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px', fontWeight: 700 }}>WHY IT EXISTS</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { title: 'STAR MERGE', icon: '★', desc: 'The universal physical brand core' },
                    { title: 'MEGA CONSTELLATION', icon: '🌌', desc: 'Global integration of luxury houses' },
                    { title: 'STAR JEWELRY HOUSE', icon: '🏠', desc: 'Your personalized catalog showcase' },
                    { title: 'THE JEWELRY WORLD', icon: '💎', desc: 'Materialization of civilizational legacy' }
                  ].map((p, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontSize: '14px', color: '#c9a84c' }}>{p.icon}</span>
                      <div>
                        <p style={{ fontSize: '11px', fontWeight: 700, color: '#fff', margin: 0 }}>{p.title}</p>
                        <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: '24px', borderTop: '1px solid rgba(201,168,76,0.15)', paddingTop: '14px', textAlign: 'center' }}>
                <span style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.2em', color: '#fff', textTransform: 'uppercase' }}>EMOTIONAL & CIVILIZATIONAL CORE</span>
              </div>
            </div>

            {/* Column 2: Institutional Layer (Lock 57) */}
            <div className="glass-card-premium" style={{ padding: '28px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#c9a84c', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900 }}>2</span>
                  <h4 style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '0.12em', color: '#c9a84c', margin: 0, textTransform: 'uppercase' }}>INSTITUTIONAL LAYER</h4>
                </div>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px', fontWeight: 700 }}>HOW IT IS PROTECTED</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                  {[
                    { label: 'LOCK 57', icon: '🔒' },
                    { label: 'TRACEABILITY', icon: '⚙️' },
                    { label: 'HUMAN REVIEW', icon: '👥' },
                    { label: 'GOVERNANCE', icon: '⚖️' },
                    { label: 'AUDIT TRAIL', icon: '📋' },
                    { label: 'AI SUPPORT ONLY', icon: '🤖' },
                    { label: 'PRODUCT PASSPORT', icon: '📜' }
                  ].map((p, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <span style={{ fontSize: '11px' }}>{p.icon}</span>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.05em' }}>{p.label}</span>
                    </div>
                  ))}
                </div>
                {/* Checkboxes: Closing all risks */}
                <div style={{ background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.12)', padding: '12px', borderRadius: '4px' }}>
                  <p style={{ fontSize: '8px', fontWeight: 900, letterSpacing: '0.15em', color: '#f87171', margin: '0 0 8px', textTransform: 'uppercase' }}>✓ CLOSING ALL RISKS</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {[
                      'LEGAL RISK',
                      'SPECULATION RISK',
                      'UNCONTROLLED PAYOUT RISK',
                      'FAKE ECOLOGY RISK',
                      'FAKE MATERIAL CLAIM RISK'
                    ].map((risk, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: 'bold' }}>✓</span>
                        <span style={{ fontSize: '8.5px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em' }}>{risk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '24px', borderTop: '1px solid rgba(201,168,76,0.15)', paddingTop: '14px', textAlign: 'center' }}>
                <span style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.2em', color: '#fff', textTransform: 'uppercase' }}>CLOSING ALL REGULATORY RISKS</span>
              </div>
            </div>

            {/* Column 3: Operational Layer */}
            <div className="glass-card-premium" style={{ padding: '28px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#c9a84c', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900 }}>3</span>
                  <h4 style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '0.12em', color: '#c9a84c', margin: 0, textTransform: 'uppercase' }}>OPERATIONAL LAYER</h4>
                </div>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px', fontWeight: 700 }}>HOW IT WORKS</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { t: 'STAR BRAND COIN', d: 'Base unit of structural representation' },
                    { t: 'STAR JEWELRY HOUSE', d: 'Private visual repository and catalog host' },
                    { t: 'QR ECONOMY', d: 'Transaction attribution routing core' },
                    { t: 'PRODUCTION LAYER', d: 'Physical composite manufacturing & logistics' },
                    { t: 'INFRASTRUCTURE LAYER', d: 'Direct platform operations pipeline' },
                    { t: 'QR ALLOCATION LOGIC', d: 'Bespoke compliant ledger attribution logic' },
                    { t: 'PUBLIC API / GOVERNANCE API', d: 'Traceable secure gateway access keys' }
                  ].map((p, idx) => (
                    <div key={idx} style={{ padding: '6px 10px', background: 'rgba(201,168,76,0.02)', border: '1px solid rgba(201,168,76,0.05)', borderRadius: '4px' }}>
                      <p style={{ fontSize: '9px', fontWeight: 900, color: '#fff', margin: '0 0 2px', letterSpacing: '0.05em' }}>{p.t}</p>
                      <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{p.d}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: '24px', borderTop: '1px solid rgba(201,168,76,0.15)', paddingTop: '14px', textAlign: 'center' }}>
                <span style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.2em', color: '#fff', textTransform: 'uppercase' }}>REAL, BUILDABLE, SCALABLE SYSTEM</span>
              </div>
            </div>

          </section>

          {/* ========================================================================= */}
          {/* ZONE 4: THE CORE FORMULA FLOW DIAGRAM */}
          {/* ========================================================================= */}
          <section className="glass-card-premium" style={{ padding: '32px', borderRadius: '8px', marginBottom: '56px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(201,168,76,0.03) 0%, transparent 70%)', pointerEvents: 'none' }} />
            
            <p style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', color: '#c9a84c', textAlign: 'center', marginBottom: '28px', textTransform: 'uppercase' }}>
              THE CORE FORMULA ECOLOGY
            </p>

            <div className="merge-ecology-flow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              
              {/* Box 1: Human buys */}
              <div style={{ flex: '1 1 140px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👨‍💼</div>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 900, color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>HUMAN</p>
                  <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Buys reference asset</p>
                </div>
              </div>

              {/* Arrow */}
              <div className="merge-ecology-arrow" style={{ color: '#c9a84c', fontSize: '18px', fontWeight: 900 }}>➔</div>

              {/* Box 2: Star Brand Coin */}
              <div style={{ flex: '1 1 140px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#c9a84c' }}>★</div>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 900, color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>STAR BRAND COIN</p>
                  <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Material physical token</p>
                </div>
              </div>

              {/* Arrow */}
              <div className="merge-ecology-arrow" style={{ color: '#c9a84c', fontSize: '18px', fontWeight: 900 }}>➔</div>

              {/* Box 3: Star Jewelry House */}
              <div className="animate-pulse-gold" style={{ flex: '1 2 240px', padding: '16px', background: 'rgba(201,168,76,0.03)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '6px', textAlign: 'center' }}>
                <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏰</div>
                <p style={{ fontSize: '11px', fontWeight: 900, color: '#c9a84c', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>STAR JEWELRY HOUSE</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '8px', color: 'rgba(255,255,255,0.5)', textAlign: 'left' }}>
                  <div>• Brand Owner</div>
                  <div>• Product Passport</div>
                  <div>• Living Catalog</div>
                  <div>• Legacy Registry</div>
                </div>
              </div>

              {/* Arrow */}
              <div className="merge-ecology-arrow" style={{ color: '#c9a84c', fontSize: '18px', fontWeight: 900 }}>➔</div>

              {/* Box 4: Mega Constellation */}
              <div style={{ flex: '1 1 140px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🌌</div>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 900, color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>MEGA CONSTELLATION</p>
                  <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>All houses united globally</p>
                </div>
              </div>

              {/* Arrow */}
              <div className="merge-ecology-arrow" style={{ color: '#c9a84c', fontSize: '18px', fontWeight: 900 }}>➔</div>

              {/* Box 5: The Jewelry World */}
              <div style={{ flex: '1 1 140px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>💎</div>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 900, color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>THE JEWELRY WORLD</p>
                  <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>A new high-end luxury universe</p>
                </div>
              </div>

            </div>
          </section>

          {/* ========================================================================= */}
          {/* ZONE 5: PHASE GRID & SPLIT ALLOCATIONS ("REAL ECONOMIC MODEL") */}
          {/* ========================================================================= */}
          <section style={{ marginBottom: '56px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <p style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.3em', color: '#c9a84c', margin: '0 0 6px', textTransform: 'uppercase' }}>REAL ECONOMIC MODEL</p>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 600, color: '#fff', margin: 0, letterSpacing: '0.05em' }}>PRODUCTION PHASE ARCHITECTURE</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              
              {/* Phase 1: Foundation */}
              <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '8px' }}>
                <span style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.15em', color: '#c9a84c', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>PHASE 1</span>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '0 0 16px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>FOUNDATION PHASE</h3>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', marginBottom: '14px' }}>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>FIRST LIMIT</span>
                  <span style={{ fontSize: '11px', color: '#c9a84c', fontWeight: 900 }}>1000 STAR COINS</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', marginBottom: '18px' }}>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>PRICE METRIC</span>
                  <span style={{ fontSize: '11px', color: '#fff', fontWeight: 900 }}>1KG EQUIVALENT</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    'Foundation is created successfully',
                    'Direct Brand Houses activated',
                    'Immutable registry operations active',
                    'Platform QR Network active and routing',
                    'Physical Product Passport system starts'
                  ].map((x, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#22c55e', fontSize: '11px', fontWeight: 'bold' }}>✓</span>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>{x}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phase 2: Live Infrastructure (Interactive Coin) */}
              <div className="glass-card-premium animate-pulse-gold" style={{ padding: '24px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyItems: 'space-between', justifyContent: 'space-between', background: 'rgba(201,168,76,0.02)', borderColor: 'rgba(201,168,76,0.2)' }}>
                <div>
                  <span style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.15em', color: '#c9a84c', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>PHASE 2</span>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '0 0 16px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>LIVE INFRASTRUCTURE PHASE</h3>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', marginBottom: '14px' }}>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>PRICE METRIC</span>
                    <span style={{ fontSize: '11px', color: '#c9a84c', fontWeight: 900 }}>2KG EQUIVALENT</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#ef4444', fontSize: '10px', fontWeight: 'bold' }}>✕</span>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>Full Brand Expansion Economy is not active yet</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#ef4444', fontSize: '10px', fontWeight: 'bold' }}>✕</span>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>Mass serial infrastructure does not start yet</span>
                    </div>
                  </div>
                </div>

                {/* Rotating Coin Display */}
                <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
                  <div className="animate-rotate-coin" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle, #ffe293 0%, #c9a84c 40%, #5e460e 85%, #000 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 25px rgba(201,168,76,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{ fontSize: '36px', color: '#000', fontWeight: 900, textShadow: '0 2px 4px rgba(255,255,255,0.4)' }}>★</span>
                  </div>
                </div>
              </div>

              {/* Allocation Splits: First and Second 1KG */}
              <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* First 1KG */}
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '14px' }}>
                  <p style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.1em', color: '#c9a84c', margin: '0 0 6px', textTransform: 'uppercase' }}>FIRST 1KG GOES TO:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {['🪙 Silver/Gold base', '🏭 Production', '🔍 Verification QC', '📦 Packaging', '🚛 Secure Logistics'].map((tag) => (
                      <span key={tag} style={{ fontSize: '8.5px', fontWeight: 700, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '3px', color: 'rgba(255,255,255,0.75)' }}>{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Second 1KG */}
                <div>
                  <p style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.1em', color: '#c9a84c', margin: '0 0 6px', textTransform: 'uppercase' }}>SECOND 1KG GOES TO:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {['🏰 Brand House', '🌐 QR Infrastructure', '📜 Product Passport', '📋 Compliance Audit', '⚖️ System Governance', '🌱 Ecology Reserve', '⚙️ Maintenance'].map((tag) => (
                      <span key={tag} style={{ fontSize: '8.5px', fontWeight: 700, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '3px', color: 'rgba(255,255,255,0.75)' }}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* ========================================================================= */}
          {/* ZONE 6: INTERACTIVE FLOW ("QR ECONOMY CORE") */}
          {/* ========================================================================= */}
          <section className="glass-card-premium animate-pulse-gold" style={{ padding: '32px', borderRadius: '8px', marginBottom: '56px' }}>
            
            {/* Title Zone */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <p style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.25em', color: '#c9a84c', margin: '0 0 4px', textTransform: 'uppercase' }}>QR ECONOMY CORE</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>COMPLIANT ATTRIBUTION ROUTING MODEL</p>
            </div>

            {/* Split Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
              
              {/* Left Column: Direct Flow */}
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '20px', borderRadius: '6px' }}>
                <span style={{ fontSize: '10px', fontWeight: 900, color: '#c9a84c', letterSpacing: '0.1em', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>DIRECT FLOW</span>
                <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', margin: '0 0 16px', textTransform: 'uppercase' }}>IF: QR = BRAND LINE (Example: 10KG Order)</p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                  <div style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', textAlign: 'center' }}>
                    <p style={{ fontSize: '11px', fontWeight: 900, color: '#fff', margin: 0 }}>10KG ORDER</p>
                  </div>
                  <div style={{ color: '#c9a84c' }}>➔</div>
                  <div style={{ padding: '6px 12px', background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '4px', textAlign: 'center' }}>
                    <p style={{ fontSize: '9px', fontWeight: 900, color: '#c9a84c', margin: 0 }}>5KG PRODUCTION</p>
                    <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Physical Base</p>
                  </div>
                  <div style={{ color: '#c9a84c' }}>➔</div>
                  <div style={{ padding: '6px 12px', background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '4px', textAlign: 'center' }}>
                    <p style={{ fontSize: '9px', fontWeight: 900, color: '#c9a84c', margin: 0 }}>5KG BRAND OWNER</p>
                    <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Platform Share (1/2)</p>
                  </div>
                </div>
              </div>

              {/* Center Code Core Visual */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '8px', background: '#050505', border: '2px dashed #c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(201,168,76,0.2)', position: 'relative' }}>
                  <span style={{ fontSize: '42px', filter: 'invert(1) opacity(0.85)' }}>🔳</span>
                </div>
                <span style={{ fontSize: '9px', fontWeight: 900, color: '#c9a84c', letterSpacing: '0.12em', marginTop: '10px', textTransform: 'uppercase' }}>QR CORE</span>
              </div>

              {/* Right Column: Split Flow */}
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '20px', borderRadius: '6px' }}>
                <span style={{ fontSize: '10px', fontWeight: 900, color: '#c9a84c', letterSpacing: '0.1em', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>SPLIT FLOW</span>
                <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', margin: '0 0 16px', textTransform: 'uppercase' }}>IF: QR ≠ BRAND LINE (Remaining 5KG Split:)</p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <div style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', textAlign: 'center' }}>
                    <p style={{ fontSize: '10px', fontWeight: 900, color: '#fff', margin: 0 }}>10KG</p>
                  </div>
                  <div style={{ color: '#c9a84c' }}>➔</div>
                  <div style={{ padding: '6px 10px', background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '4px', textAlign: 'center' }}>
                    <p style={{ fontSize: '8.5px', fontWeight: 900, color: '#fff', margin: 0 }}>5KG PROD</p>
                  </div>
                  <div style={{ color: '#c9a84c' }}>+</div>
                  <div style={{ padding: '6px 10px', background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '4px', textAlign: 'center' }}>
                    <p style={{ fontSize: '8.5px', fontWeight: 900, color: '#c9a84c', margin: 0 }}>2.5KG TRAFFIC</p>
                    <p style={{ fontSize: '7.5px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>Referrer (1/4)</p>
                  </div>
                  <div style={{ color: '#c9a84c' }}>+</div>
                  <div style={{ padding: '6px 10px', background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '4px', textAlign: 'center' }}>
                    <p style={{ fontSize: '8.5px', fontWeight: 900, color: '#c9a84c', margin: 0 }}>2.5KG HOUSE</p>
                    <p style={{ fontSize: '7.5px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>Owner (1/4)</p>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* ========================================================================= */}
          {/* ZONE 7: WHAT IS STAR JEWELRY HOUSE & CATALOGS */}
          {/* ========================================================================= */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '56px' }}>
            
            {/* Column 1: Star Jewelry House Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '8px' }}>
                <span style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.2em', color: '#c9a84c', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>WHAT IS STAR JEWELRY HOUSE?</span>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#fff', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>It is NOT a dashboard. It is a Digital Jewelry House.</h3>
                <div style={{ height: '90px', background: 'radial-gradient(circle at center, rgba(201,168,76,0.08) 0%, transparent 80%)', border: '1px solid rgba(201,168,76,0.08)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <span style={{ fontSize: '36px', filter: 'drop-shadow(0 0 10px rgba(201,168,76,0.3))' }}>🏠</span>
                </div>
              </div>

              {/* What it Contains */}
              <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '8px' }}>
                <span style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.15em', color: '#c9a84c', display: 'block', marginBottom: '14px', textTransform: 'uppercase' }}>WHAT IT CONTAINS:</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[
                    { title: 'Brand Identity', val: 'QR Mapping' },
                    { title: 'Living Catalog', val: 'Dynamic Items' },
                    { title: 'Product Passports', val: 'XRF Logs' },
                    { title: 'QR Movement', val: 'Traceable path' },
                    { title: 'Ownership History', val: 'Immutable' },
                    { title: 'Ecology History', val: 'Clean reserve' },
                    { title: 'Audit Archive', val: 'Permanent' },
                    { title: 'Brand Legacy', val: 'Transferable' }
                  ].map((x, idx) => (
                    <div key={idx} style={{ padding: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                      <p style={{ fontSize: '9.5px', fontWeight: 800, color: '#fff', margin: 0 }}>{x.title}</p>
                      <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>{x.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 2: What can be Created in the House? Catalogs */}
            <div className="glass-card-premium" style={{ padding: '28px', borderRadius: '8px' }}>
              <span style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.2em', color: '#c9a84c', display: 'block', marginBottom: '6px', textTransform: 'uppercase', textAlign: 'center' }}>WHAT CAN BE CREATED IN THE HOUSE?</span>
              <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#fff', margin: '0 0 24px', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>CATALOGS ARCHITECTURE</h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '12px' }}>
                {[
                  { label: 'Watches', icon: '⌚' },
                  { label: 'Eyewear', icon: '🕶️' },
                  { label: 'Jewelry', icon: '💍' },
                  { label: 'Furniture', icon: '🛋️' },
                  { label: 'Decor', icon: '🏺' },
                  { label: 'Accessories', icon: '👜' },
                  { label: 'Fashion', icon: '👕' },
                  { label: 'Sculptures', icon: '🗿' },
                  { label: 'Souvenirs', icon: '🎁' },
                  { label: 'Luxury Objects', icon: '💎' }
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: '14px 10px', background: 'rgba(201,168,76,0.02)', border: '1px solid rgba(201,168,76,0.08)', borderRadius: '6px', textAlign: 'center', transition: 'all 0.2s' }}
                       onMouseEnter={(e) => {
                         e.currentTarget.style.borderColor = '#c9a84c'
                         e.currentTarget.style.background = 'rgba(201,168,76,0.05)'
                       }}
                       onMouseLeave={(e) => {
                         e.currentTarget.style.borderColor = 'rgba(201,168,76,0.08)'
                         e.currentTarget.style.background = 'rgba(201,168,76,0.02)'
                       }}>
                    <span style={{ fontSize: '22px', display: 'block', marginBottom: '8px' }}>{item.icon}</span>
                    <span style={{ fontSize: '9px', fontWeight: 800, color: '#fff', display: 'block', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

          </section>

          {/* ========================================================================= */}
          {/* ZONE 8: THREE-COLUMN BOTTOM RULES ZONE */}
          {/* ========================================================================= */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '56px' }}>
            
            {/* Card 1: The Main Rule (1KG Minimum) */}
            <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '8px', borderLeft: '3px solid #ef4444' }}>
              <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', color: '#f87171', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                THE MAIN RULE
              </span>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#fff', margin: '0 0 14px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                NO ORDER BELOW 1KG
              </h3>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, marginBottom: '14px' }}>
                Example: A watch may weigh 100g, but with physical gold/silver composite coin reserve backing, high-grade casing, bespoke catalog passport, and safe logistics, it becomes a:
              </p>
              <div style={{ padding: '10px', background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.12)', borderRadius: '4px', textAlign: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: 900, color: '#f87171', letterSpacing: '0.15em', textTransform: 'uppercase' }}>1KG STAR PACKAGE UNIT</span>
              </div>
            </div>

            {/* Card 2: Why Customer Pays 2KG Equivalent? */}
            <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '8px' }}>
              <span style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.15em', color: '#c9a84c', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                WHY CUSTOMER PAYS 2KG EQUIVALENT?
              </span>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: '0 0 16px', textTransform: 'uppercase' }}>Because you receive:</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <p style={{ fontSize: '9px', fontWeight: 900, color: '#fff', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>1. Physical Layer</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '8px', color: 'rgba(255,255,255,0.5)' }}>
                    <li>• Pure Silver / Gold base</li>
                    <li>• Authentic backing coin</li>
                    <li>• Physical final product</li>
                    <li>• Custom premium packaging</li>
                    <li>• Multi-spectrum QC validation</li>
                  </ul>
                </div>
                <div>
                  <p style={{ fontSize: '9px', fontWeight: 900, color: '#fff', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>2. Infrastructure Layer</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '8px', color: 'rgba(255,255,255,0.5)' }}>
                    <li>• Star Jewelry House key</li>
                    <li>• Active Brand activation</li>
                    <li>• Dynamic QR identity link</li>
                    <li>• Unique Product Passport</li>
                    <li>• Secure audit log listing</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Card 3: Visual Accent Render */}
            <div className="glass-card-premium" style={{ padding: '24px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyItems: 'center', justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(circle at center, rgba(201,168,76,0.04) 0%, transparent 80%)' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>📦</div>
              <p style={{ fontSize: '11px', fontWeight: 900, color: '#fff', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>LUXURY STAR PACKAGE</p>
              <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', margin: 0, textAlign: 'center' }}>High-grade material validation blueprint</p>
            </div>

          </section>

          {/* ========================================================================= */}
          {/* ZONE 9: FINAL BANNER (MERGE BECOMES: STAR CIVILIZATION) */}
          {/* ========================================================================= */}
          <section className="glass-card-premium animate-pulse-gold" style={{ padding: '40px', borderRadius: '8px', marginBottom: '40px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(201,168,76,0.05) 0%, transparent 85%)', pointerEvents: 'none' }} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', alignItems: 'center' }}>
              
              {/* Left Side: The Biggest Idea */}
              <div>
                <p style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.2em', color: '#c9a84c', margin: '0 0 8px', textTransform: 'uppercase' }}>THE BIGGEST IDEA</p>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, color: '#fff', margin: '0 0 18px', letterSpacing: '0.05em' }}>MERGE IS NO LONGER:</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                  {['Just a product', 'Just luxury', 'Just a marketplace'].map((x, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#ef4444', fontSize: '10px' }}>✕</span>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{x}</span>
                    </div>
                  ))}
                </div>

                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>MERGE BECOMES:</p>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: '#c9a84c', margin: 0, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>
                  STAR CIVILIZATION
                </p>
              </div>

              {/* Right Side: The Final Truth */}
              <div style={{ borderLeft: '1px solid rgba(201,168,76,0.15)', paddingLeft: '32px' }}>
                <p style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.2em', color: '#c9a84c', margin: '0 0 8px', textTransform: 'uppercase' }}>THE FINAL TRUTH</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.75, margin: 0 }}>
                  MERGE STARS is a stellar jewelry megapolis, where every <strong>STAR BRAND COIN</strong> opens its own <strong>STAR JEWELRY HOUSE</strong>, and all <strong>HOUSES</strong> together create the living <strong>MEGA CONSTELLATION — THE JEWELRY WORLD</strong>.
                </p>
                
                {/* Visual Star Overlay badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(201,168,76,0.05)' }}>
                    <span style={{ fontSize: '12px', color: '#c9a84c' }}>★</span>
                  </div>
                  <span style={{ fontSize: '8.5px', fontWeight: 900, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>ONE STAR · ONE HOUSE · ONE LEGACY</span>
                </div>
              </div>

            </div>
          </section>

          {/* ========================================================================= */}
          {/* ZONE 10: COMPLIANCE TICKER FOOTER ROW */}
          {/* ========================================================================= */}
          <footer style={{ background: 'rgba(10,10,10,0.5)', border: '1px solid rgba(201,168,76,0.1)', padding: '20px 24px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '14px' }}>
              {[
                { title: 'TRUST', d: 'Our Core', icon: '🤝' },
                { title: 'VERIFICATION', d: 'Our Standard', icon: '🔍' },
                { title: 'TRACEABILITY', d: 'Our Commitment', icon: '⚙️' },
                { title: 'GOVERNANCE', d: 'Our Shield', icon: '⚖️' },
                { title: 'INNOVATION', d: 'Our Engine', icon: '🤖' },
                { title: 'LEGACY', d: 'Our Destination', icon: '📜' }
              ].map((x, idx) => (
                <div key={idx} style={{ padding: '6px', textAlign: 'center' }}>
                  <span style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>{x.icon}</span>
                  <span style={{ fontSize: '9px', fontWeight: 900, color: '#c9a84c', display: 'block', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{x.title}</span>
                  <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', display: 'block', marginTop: '2px' }}>{x.d}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', margin: 0, textTransform: 'uppercase' }}>
              ONE STAR. ONE HOUSE. ONE LEGACY. MERGE STARS MEGAPOLIS
            </p>
          </footer>

        </div>
      </div>

      <Footer />
    </div>
  )
}
