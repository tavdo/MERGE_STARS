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
          <div className="admin-alert-success">
            System settings saved successfully.
          </div>
        )}

        <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-6">
          <section className="admin-section-card">
            <h3 className="admin-section-title">Feature flags &amp; capabilities</h3>

            <div className="admin-setting-row">
              <div>
                <h4>Live precious metal ticker</h4>
                <p>Fetch spot gold/silver prices every 30 seconds</p>
              </div>
              <input
                type="checkbox"
                checked={tickerEnabled}
                onChange={(e) => setTickerEnabled(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#c9a84c', cursor: 'pointer' }}
              />
            </div>

            <div className="admin-setting-row">
              <div>
                <h4>AI operational assistant</h4>
                <p>Intelligent user onboarding and chat guidance</p>
              </div>
              <input
                type="checkbox"
                checked={aiEnabled}
                onChange={(e) => setAiEnabled(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#c9a84c', cursor: 'pointer' }}
              />
            </div>

            <div className="admin-setting-row">
              <div>
                <h4>Automatic bank verification</h4>
                <p>Sync with Crystal v2.0 API gateway</p>
              </div>
              <input
                type="checkbox"
                checked={autoVerify}
                onChange={(e) => setAutoVerify(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#c9a84c', cursor: 'pointer' }}
              />
            </div>
          </section>

          <section className="admin-section-card">
            <h3 className="admin-section-title">Operational share configuration</h3>

            <div className="space-y-4">
              <div>
                <label className="admin-field-label">Platform / operations share</label>
                <input className="admin-field-input" value={platformShare} onChange={(e) => setPlatformShare(e.target.value)} />
              </div>
              <div>
                <label className="admin-field-label">Brand owner share</label>
                <input className="admin-field-input" value={brandShare} onChange={(e) => setBrandShare(e.target.value)} />
              </div>
              <div>
                <label className="admin-field-label">Direct referrer share</label>
                <input className="admin-field-input" value={referrerShare} onChange={(e) => setReferrerShare(e.target.value)} />
              </div>
            </div>
          </section>

          <section className="admin-section-card md:col-span-2">
            <h3 className="admin-section-title">Critical system controls</h3>
            <div className="admin-actions-row">
              <button type="button" className="admin-btn-secondary" onClick={() => alert('Rotating JWT secrets... Completed.')}>
                Rotate JWT secrets
              </button>
              <button type="button" className="admin-btn-secondary" onClick={() => alert('Metal price sync triggered.')}>
                Sync metal prices
              </button>
              <button type="button" className="admin-btn-muted" onClick={() => alert('Audit log export started.')}>
                Export audit logs
              </button>
            </div>
          </section>

          <div className="md:col-span-2 flex justify-end pt-2">
            <button type="submit" className="admin-btn-primary">
              Save system settings
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
