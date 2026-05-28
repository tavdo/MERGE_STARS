import AdminLayout from '../../components/AdminLayout'

const SECTIONS = [
  'Server Failure',
  'Backup Recovery',
  'QR Registry Failure',
  'Payment Confirmation Delay',
  'Manual Review Process',
  'Incident Escalation',
  'Recovery Testing',
] as const

export default function BusinessContinuityPage() {
  return (
    <AdminLayout title="COMPLIANCE" subtitle="BUSINESS CONTINUITY">
      <div className="gold-card" style={{ padding: '18px 20px', borderRadius: '4px', marginBottom: '18px' }}>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.55)', fontSize: '12px', lineHeight: 1.7 }}>
          Business continuity is documented as operational controls and recovery procedures (not guarantees).
        </p>
      </div>

      <div className="gold-card" style={{ borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(201,168,76,0.10)' }}>
          <p style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.18em', color: '#c9a84c', margin: 0 }}>
            CONTINUITY & RECOVERY
          </p>
        </div>
        <div style={{ padding: '18px 20px', display: 'grid', gap: '10px' }}>
          {SECTIONS.map((s) => (
            <div key={s} style={{ padding: '14px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
              <p style={{ margin: 0, color: '#fff', fontSize: '13px', fontWeight: 700 }}>{s}</p>
              <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.45)', fontSize: '12px', lineHeight: 1.6 }}>
                Prepared for review. Evidence includes runbooks, tests, and logs.
              </p>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}

