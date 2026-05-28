import AdminLayout from '../../components/AdminLayout'

const SECTIONS = [
  'RBAC',
  '2FA',
  'JWT / Session Security',
  'Encryption',
  'API Rate Limiting',
  'Admin Access Logs',
  'Backup Policy',
  'Incident Response',
  'Data Access Control',
] as const

export default function SecurityCenterPage() {
  return (
    <AdminLayout title="SECURITY" subtitle="SECURITY CENTER">
      <div className="gold-card" style={{ padding: '18px 20px', borderRadius: '4px', marginBottom: '18px' }}>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.55)', fontSize: '12px', lineHeight: 1.7 }}>
          Prepared for review. Security controls are documented as evidence-based operational measures (not guarantees).
        </p>
      </div>

      <div className="gold-card" style={{ borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(201,168,76,0.10)' }}>
          <p style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.18em', color: '#c9a84c', margin: 0 }}>
            SECURITY CONTROLS
          </p>
        </div>
        <div style={{ padding: '18px 20px', display: 'grid', gap: '10px' }}>
          {SECTIONS.map((s) => (
            <div key={s} style={{ padding: '14px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
              <p style={{ margin: 0, color: '#fff', fontSize: '13px', fontWeight: 700 }}>{s}</p>
              <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.45)', fontSize: '12px', lineHeight: 1.6 }}>
                Evidence required: configuration, logs, access controls, and incident procedures.
              </p>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}

