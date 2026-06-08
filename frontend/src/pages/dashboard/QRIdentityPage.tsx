import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '../../components/DashboardLayout'
import { dashboardApi } from '@/features/dashboard/api/dashboard.api'
import { downloadReferralQrPng, shareReferralLink, REFERRAL_QR_PATTERN } from '../../utils/referralQr'

function QRBox({ size = 140, color = '#000', pattern }: { size?: number; color?: string; pattern: readonly number[] }) {
  const cells = pattern.length >= 49 ? pattern.slice(0, 49) : [...pattern, ...Array(49 - pattern.length).fill(0)]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', width: `${size}px`, height: `${size}px`, padding: '8px', background: '#fff', borderRadius: '4px', flexShrink: 0 }}>
      {cells.map((filled, i) => (
        <div key={i} style={{ background: filled ? color : 'transparent', borderRadius: '1px' }} />
      ))}
    </div>
  )
}

const KYC_COLORS: Record<string, { bg: string; color: string }> = {
  verified: { bg: 'rgba(34,197,94,0.1)', color: '#22c55e' },
  pending: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  rejected: { bg: 'rgba(239,68,68,0.1)', color: '#f87171' },
}

export default function QRIdentityPage() {
  const { t } = useTranslation()

  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => dashboardApi.getSummary().then((r) => r.data.data),
  })

  const user = summary?.user
  const kyc = (user?.kycStatus ?? 'pending').toLowerCase()
  const kycStyle = KYC_COLORS[kyc] ?? KYC_COLORS.pending
  const universalLink = user ? `${window.location.origin}/login?tab=register&ref=${encodeURIComponent(user.mergeId)}` : `${window.location.origin}/login`
  const qrId = user ? `QR-${user.mergeId.replace(/^MERGE-/, '')}` : 'QR-—'

  return (
    <DashboardLayout titleKey="qrIdentity">
      <div style={{ maxWidth: '1000px' }}>
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.3em', color: '#c9a84c', marginBottom: '8px' }}>{t('qrIdentity.title')}</p>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>{t('qrIdentity.subtitle')}</h1>
        </div>

        {isLoading ? (
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>{t('common.loading')}</p>
        ) : (
          <>
            <div className="gold-card" style={{ padding: '20px 28px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', marginBottom: '4px' }}>{t('qrIdentity.mergeId')}</p>
                <p style={{ fontSize: '20px', fontWeight: 900, color: '#c9a84c', letterSpacing: '0.15em' }}>{user?.mergeId ?? '—'}</p>
              </div>
              <div>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', marginBottom: '4px' }}>{t('qrIdentity.founderId')}</p>
                <p style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>{user?.founderId ?? '—'}</p>
              </div>
              <div>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', marginBottom: '4px' }}>{t('qrIdentity.brandLineId')}</p>
                <p style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>{user?.brandLineId ?? '—'}</p>
              </div>
              <span style={{ padding: '6px 14px', background: kycStyle.bg, color: kycStyle.color, border: `1px solid ${kycStyle.color}33`, fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', borderRadius: '2px' }}>
                KYC {kyc.toUpperCase()}
              </span>
            </div>

            <div className="gold-card" style={{ padding: '28px', borderRadius: '4px', display: 'flex', gap: '28px', flexWrap: 'wrap', alignItems: 'center' }}>
              <QRBox pattern={REFERRAL_QR_PATTERN} />
              <div style={{ flex: 1, minWidth: '220px' }}>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>{qrId}</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', wordBreak: 'break-all', marginBottom: '16px' }}>{universalLink}</p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button type="button" className="gold-btn" onClick={() => navigator.clipboard.writeText(universalLink)}>Copy link</button>
                  <button type="button" className="gold-btn-outline" onClick={() => shareReferralLink(universalLink)}>Share</button>
                  <button type="button" className="gold-btn-outline" onClick={() => downloadReferralQrPng(REFERRAL_QR_PATTERN, { filename: `${qrId}.png` })}>Download</button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
