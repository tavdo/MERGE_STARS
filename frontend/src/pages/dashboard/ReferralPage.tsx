import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '../../components/DashboardLayout'
import { referralsApi } from '@/features/referrals/api/referrals.api'
import { downloadReferralQrPng, shareReferralLink, REFERRAL_QR_PATTERN } from '../../utils/referralQr'

function MiniQR({ color = '#1a1a1a' }: { color?: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2px', width: '120px', height: '120px', padding: '8px', background: '#fff', borderRadius: '4px' }}>
      {REFERRAL_QR_PATTERN.slice(0, 144).map((f, i) => (
        <div key={i} style={{ background: f ? color : 'transparent', borderRadius: '1px' }} />
      ))}
    </div>
  )
}

export default function ReferralPage() {
  const { t } = useTranslation()
  const [toast, setToast] = useState<string | null>(null)

  const { data: stats } = useQuery({
    queryKey: ['referral-stats'],
    queryFn: () => referralsApi.stats().then((r) => r.data.data),
  })

  const { data: referrals = [], isLoading } = useQuery({
    queryKey: ['referrals'],
    queryFn: () => referralsApi.list().then((r) => r.data.data),
  })

  const refLink = stats?.shareLink ?? `${window.location.origin}/login?tab=register`
  const qrRef = stats?.qrRef ?? 'QR-REF'

  const showToast = useCallback((message: string) => setToast(message), [])

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(null), 2800)
    return () => window.clearTimeout(id)
  }, [toast])

  const handleDownload = () => {
    downloadReferralQrPng(REFERRAL_QR_PATTERN, { color: '#1a1a1a', filename: `merge-stars-${qrRef}.png` })
    showToast(t('referral.toastDownloaded', { defaultValue: 'QR downloaded' }))
  }

  const handleShare = async () => {
    try {
      const result = await shareReferralLink(refLink)
      showToast(result === 'shared' ? t('referral.toastShared', { defaultValue: 'Shared' }) : t('referral.toastCopiedShare', { defaultValue: 'Link copied' }))
    } catch {
      showToast('Could not share')
    }
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(refLink)
    showToast(t('referral.toastCopiedShare', { defaultValue: 'Link copied' }))
  }

  return (
    <DashboardLayout titleKey="referral">
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 100, padding: '12px 18px', background: '#111', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '4px', color: '#c9a84c', fontSize: '12px' }}>
          {toast}
        </div>
      )}

      <div style={{ maxWidth: '900px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'TOTAL', value: stats?.total ?? 0 },
            { label: 'VERIFIED', value: stats?.verified ?? 0 },
            { label: 'PENDING', value: stats?.pending ?? 0 },
            { label: 'YOUR SHARE', value: stats?.platformShare ?? '1/4' },
          ].map((s) => (
            <div key={s.label} className="gold-card" style={{ padding: '16px 18px', borderRadius: '4px' }}>
              <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', marginBottom: '6px' }}>{s.label}</p>
              <p style={{ fontSize: '22px', fontWeight: 900, color: '#c9a84c' }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="gold-card" style={{ padding: '24px', borderRadius: '4px', marginBottom: '24px', display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
          <MiniQR />
          <div style={{ flex: 1, minWidth: '200px' }}>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>{qrRef}</p>
            <p style={{ fontSize: '12px', color: '#fff', wordBreak: 'break-all', marginBottom: '12px' }}>{refLink}</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button type="button" className="gold-btn" onClick={copyLink}>Copy link</button>
              <button type="button" className="gold-btn-outline" onClick={handleShare}>Share</button>
              <button type="button" className="gold-btn-outline" onClick={handleDownload}>Download QR</button>
            </div>
          </div>
        </div>

        <div className="gold-card" style={{ borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: '#c9a84c' }}>DIRECT REFERRALS</p>
          </div>
          {isLoading ? (
            <p style={{ padding: '24px', color: 'rgba(255,255,255,0.5)' }}>Loading…</p>
          ) : referrals.length === 0 ? (
            <p style={{ padding: '24px', color: 'rgba(255,255,255,0.5)' }}>No referrals yet. Share your link to invite users.</p>
          ) : referrals.map((r) => (
            <div key={r.id} style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{r.user}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{r.date} · {r.order}</p>
              </div>
              <span style={{ fontSize: '10px', fontWeight: 700, padding: '4px 10px', background: 'rgba(201,168,76,0.1)', color: '#c9a84c', borderRadius: '2px', height: 'fit-content' }}>{r.status}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
