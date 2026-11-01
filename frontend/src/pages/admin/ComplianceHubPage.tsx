import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'

type Tab = 'security' | 'data' | 'continuity'

const TABS: { id: Tab; label: string; subtitle: string }[] = [
  { id: 'security', label: 'SECURITY', subtitle: 'SECURITY CENTER' },
  { id: 'data', label: 'DATA GOV', subtitle: 'DATA GOVERNANCE' },
  { id: 'continuity', label: 'CONTINUITY', subtitle: 'BUSINESS CONTINUITY' },
]

const CONTENT: Record<Tab, { intro: string; heading: string; sections: readonly string[]; evidence: string }> = {
  security: {
    intro: 'Prepared for review. Security controls are documented as evidence-based operational measures (not guarantees).',
    heading: 'SECURITY CONTROLS',
    sections: [
      'RBAC',
      '2FA',
      'JWT / Session Security',
      'Encryption',
      'API Rate Limiting',
      'Admin Access Logs',
      'Backup Policy',
      'Incident Response',
      'Data Access Control',
    ],
    evidence: 'Evidence required: configuration, logs, access controls, and incident procedures.',
  },
  data: {
    intro: 'Data governance is documented as auditable controls: classification, retention, access, encryption, and backups.',
    heading: 'DATA GOVERNANCE SECTIONS',
    sections: [
      'Data Classification',
      'Retention Policy',
      'Access Rights',
      'Encryption',
      'Backup',
      'Deletion Request Process',
      'Audit Retention',
      'Privacy Policy Link',
    ],
    evidence: 'Prepared for review. Provide evidence artifacts (policies, configs, logs).',
  },
  continuity: {
    intro: 'Business continuity is documented as operational controls and recovery procedures (not guarantees).',
    heading: 'CONTINUITY & RECOVERY',
    sections: [
      'Server Failure',
      'Backup Recovery',
      'QR Registry Failure',
      'Payment Confirmation Delay',
      'Manual Review Process',
      'Incident Escalation',
      'Recovery Testing',
    ],
    evidence: 'Prepared for review. Evidence includes runbooks, tests, and logs.',
  },
}

function parseTab(value: string | null): Tab {
  if (value === 'data' || value === 'continuity') return value
  return 'security'
}

export default function ComplianceHubPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = parseTab(searchParams.get('tab'))
  const [active, setActive] = useState<Tab>(tab)

  useEffect(() => {
    setActive(tab)
  }, [tab])

  const selectTab = (next: Tab) => {
    setActive(next)
    setSearchParams({ tab: next }, { replace: true })
  }

  const content = CONTENT[active]
  const meta = TABS.find((t) => t.id === active)!

  return (
    <AdminLayout title={t('admin.nav.compliance')} subtitle={meta.subtitle}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={active === t.id ? 'gold-btn' : 'gold-btn-outline'}
            style={{ padding: '8px 12px', fontSize: '10px', letterSpacing: '0.1em' }}
            onClick={() => selectTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="gold-card" style={{ padding: '18px 20px', borderRadius: '4px', marginBottom: '18px' }}>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.55)', fontSize: '12px', lineHeight: 1.7 }}>
          {content.intro}
        </p>
      </div>

      <div className="gold-card" style={{ borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(201,168,76,0.10)' }}>
          <p style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.18em', color: '#c9a84c', margin: 0 }}>
            {content.heading}
          </p>
        </div>
        <div style={{ padding: '18px 20px', display: 'grid', gap: '10px' }}>
          {content.sections.map((s) => (
            <div
              key={s}
              style={{
                padding: '14px',
                borderRadius: '4px',
                border: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <p style={{ margin: 0, color: '#fff', fontSize: '13px', fontWeight: 700 }}>{s}</p>
              <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.45)', fontSize: '12px', lineHeight: 1.6 }}>
                {content.evidence}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
