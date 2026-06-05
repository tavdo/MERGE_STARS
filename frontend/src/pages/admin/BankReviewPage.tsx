import { Navigate } from 'react-router-dom'
import BankReviewLayout from '../../components/BankReviewLayout'
import { useAuthStore } from '@/features/auth/store/auth.store'

const SECTIONS = [
  'Executive Summary',
  'Operational Model',
  'Order-Based Production Flow',
  'No Custody Framework',
  'Payment Verification Flow',
  'Risk Governance',
  'AML / KYC',
  'QR Traceability',
  'Audit Logging',
  'Evidence Layer',
  'AI Governance',
  'Human Oversight',
  'Data Governance',
  'Business Continuity',
  'Legal Classification',
  'Review Status',
] as const

const STATUS = [
  'Prepared for Review',
  'Not Bank Approved',
  'Not Legally Executed',
  'Not Production Live',
] as const

export default function BankReviewPage() {
  const token = useAuthStore((s) => s.accessToken)
  const user = useAuthStore((s) => s.user)
  const allowed = user?.roles?.some((r) => r === 'admin' || r === 'manager' || r === 'developer')
  if (!token) return <Navigate to="/login" replace />
  if (!allowed) return <Navigate to="/dashboard" replace />

  return (
    <BankReviewLayout title="BANK REVIEW CENTER">
      <div
        className="gold-card"
        style={{
          padding: '14px 18px',
          borderRadius: '4px',
          marginBottom: '20px',
          background: 'rgba(201,168,76,0.05)',
          border: '1px solid rgba(201,168,76,0.14)',
        }}
      >
        <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
          <strong style={{ color: '#c9a84c' }}>Status:</strong>{' '}
          {STATUS.map((s, i) => (
            <span key={s} style={{ color: 'rgba(255,255,255,0.55)' }}>
              {s}
              {i < STATUS.length - 1 ? ' · ' : ''}
            </span>
          ))}
        </p>
      </div>

      <div className="gold-card" style={{ borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(201,168,76,0.10)' }}>
          <p style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.18em', color: '#c9a84c', margin: 0 }}>
            CONTENTS
          </p>
        </div>
        <div style={{ padding: '18px 20px', display: 'grid', gap: '10px' }}>
          {SECTIONS.map((s) => (
            <div key={s} style={{ padding: '14px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
              <p style={{ margin: 0, color: '#fff', fontSize: '13px', fontWeight: 700 }}>{s}</p>
              <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.45)', fontSize: '12px', lineHeight: 1.6 }}>
                Prepared for review. Evidence and controls required before any decision.
              </p>
            </div>
          ))}
        </div>
      </div>
    </BankReviewLayout>
  )
}

