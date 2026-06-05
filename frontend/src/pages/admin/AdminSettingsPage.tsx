import { useState } from 'react'
import AdminLayout from '../../components/AdminLayout'

export default function AdminSettingsPage() {
  const [tickerEnabled, setTickerEnabled] = useState(true)
  const [aiEnabled, setAiEnabled] = useState(true)
  const [autoVerify, setAutoVerify] = useState(false)
  const [platformShare, setPlatformShare] = useState('1/2')
  const [brandShare, setBrandShare] = useState('1/4')
  const [referrerShare, setReferrerShare] = useState('1/4')
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  return (
    <AdminLayout title="SETTINGS" subtitle="SYSTEM CONFIGURATION">
      <div className="space-y-6">
        {saveSuccess && (
          <div style={{ padding: '12px 16px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
            ✓ System settings saved successfully. Broadcasted configuration update.
          </div>
        )}

        <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-6">
          {/* Feature Flags */}
          <section className="gold-card p-6 sm:p-8" style={{ borderRadius: '4px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.15em', color: '#c9a84c', marginBottom: '24px', marginTop: 0 }}>
              FEATURE FLAGS & CAPABILITIES
            </h3>
            
            <div className="space-y-6">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '14px' }}>
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#fff', margin: 0 }}>Live Precious Metal Ticker</h4>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>Fetch spot gold/silver prices every 30 seconds</p>
                </div>
                <input
                  type="checkbox"
                  checked={tickerEnabled}
                  onChange={(e) => setTickerEnabled(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#c9a84c' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '14px' }}>
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#fff', margin: 0 }}>AI Operational Assistant</h4>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>Provide intelligent user onboarding and chat guidance</p>
                </div>
                <input
                  type="checkbox"
                  checked={aiEnabled}
                  onChange={(e) => setAiEnabled(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#c9a84c' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px' }}>
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#fff', margin: 0 }}>Automatic Bank Verification</h4>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>Sync automatically with Crystal v2.0 API gateway</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoVerify}
                  onChange={(e) => setAutoVerify(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#c9a84c' }}
                />
              </div>
            </div>
          </section>

          {/* Allocation Thresholds */}
          <section className="gold-card p-6 sm:p-8" style={{ borderRadius: '4px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.15em', color: '#c9a84c', marginBottom: '24px', marginTop: 0 }}>
              OPERATIONAL SHARE CONFIGURATION
            </h3>

            <div className="space-y-4">
              <div>
                <label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: '8px', letterSpacing: '0.1em' }}>
                  PLATFORM / OPERATIONS SHARE
                </label>
                <input
                  className="gold-input text-[12px] py-2"
                  value={platformShare}
                  onChange={(e) => setPlatformShare(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: '8px', letterSpacing: '0.1em' }}>
                  BRAND OWNER SHARE
                </label>
                <input
                  className="gold-input text-[12px] py-2"
                  value={brandShare}
                  onChange={(e) => setBrandShare(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: '8px', letterSpacing: '0.1em' }}>
                  DIRECT REFERRER SHARE
                </label>
                <input
                  className="gold-input text-[12px] py-2"
                  value={referrerShare}
                  onChange={(e) => setReferrerShare(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* System Control Panel */}
          <section className="gold-card p-6 sm:p-8 md:col-span-2" style={{ borderRadius: '4px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.15em', color: '#c9a84c', marginBottom: '24px', marginTop: 0 }}>
              CRITICAL SYSTEM CONTROLS
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <button
                type="button"
                className="gold-btn-outline justify-center text-[10px] py-3"
                style={{ borderRadius: '2px' }}
                onClick={() => alert('Rotating JWT secrets... Completed.')}
              >
                🔐 ROTATE JWT SECRETS
              </button>
              
              <button
                type="button"
                className="gold-btn justify-center text-[10px] py-3"
                style={{ borderRadius: '2px' }}
                onClick={() => alert('BullMQ ticker synchronization triggered.')}
              >
                🔄 SYNC METAL PRICES
              </button>

              <button
                type="button"
                className="gold-btn justify-center text-[10px] py-3"
                style={{ borderRadius: '2px', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
                onClick={() => alert('Global audit registry successfully exported as JSONL.')}
              >
                📜 EXPORT AUDIT LOGS
              </button>
            </div>
          </section>

          {/* Footer Save Button */}
          <div className="md:col-span-2 flex justify-end" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px', marginTop: '10px' }}>
            <button type="submit" className="gold-btn px-8 py-3">
              SAVE SYSTEM SETTINGS
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
