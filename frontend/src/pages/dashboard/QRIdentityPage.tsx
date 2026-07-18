import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '../../components/DashboardLayout'
import QrCodeImage, { downloadQrPng, shareReferralLink } from '../../components/QrCodeImage'
import ReferralShareButtons, { type SocialPlatform } from '../../components/referral/ReferralShareButtons'
import { dashboardApi } from '@/features/dashboard/api/dashboard.api'
import { brandApi } from '@/features/brand/api/brand.api'

const KYC_COLORS: Record<string, { bg: string; color: string }> = {
  verified: { bg: 'rgba(34,197,94,0.1)', color: '#22c55e' },
  pending: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  rejected: { bg: 'rgba(239,68,68,0.1)', color: '#f87171' },
}

export default function QRIdentityPage() {
  const { t } = useTranslation()
  const [toast, setToast] = useState<string | null>(null)

  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => dashboardApi.getSummary().then((r) => r.data.data),
  })

  const user = summary?.user
  const kyc = (user?.kycStatus ?? 'pending').toLowerCase()
  const kycStyle = KYC_COLORS[kyc] ?? KYC_COLORS.pending
  const universalLink = user
    ? `${window.location.origin}/login?tab=register&ref=${encodeURIComponent(user.mergeId)}&src=qr`
    : `${window.location.origin}/login`
  const qrId = user ? `QR-${user.mergeId.replace(/^MERGE-/, '')}` : 'QR-—'

  const showToast = useCallback((message: string) => setToast(message), [])

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(null), 2800)
    return () => window.clearTimeout(id)
  }, [toast])

  const handleSocialShare = (_platform: SocialPlatform, result: 'opened' | 'copied') => {
    void brandApi.trackQrScan()
    showToast(
      result === 'copied'
        ? t('referral.toastInstagramCopied', { defaultValue: 'Link copied — paste in Instagram Story or DM' })
        : t('referral.toastShared', { defaultValue: 'Shared' }),
    )
  }

  return (
    <DashboardLayout titleKey="qrIdentity">
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 100, padding: '12px 18px', background: '#111', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '4px', color: '#c9a84c', fontSize: '12px' }}>
          {toast}
        </div>
      )}

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

            <div className="gold-card" style={{ padding: '28px', borderRadius: '4px' }}>
              <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
                <QrCodeImage value={universalLink} size={140} />
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>{qrId}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', wordBreak: 'break-all', marginBottom: '16px' }}>{universalLink}</p>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button type="button" className="gold-btn" onClick={() => { void navigator.clipboard.writeText(universalLink); showToast(t('referral.toastCopied')) }}>{t('qrIdentity.link', { defaultValue: 'Copy link' })}</button>
                    <button type="button" className="gold-btn-outline" onClick={() => { void shareReferralLink(universalLink); void brandApi.trackQrScan() }}>{t('qrIdentity.share')}</button>
                    <button type="button" className="gold-btn-outline" onClick={() => { void downloadQrPng(universalLink, `${qrId}.png`); void brandApi.trackQrScan() }}>{t('qrIdentity.download')}</button>
                  </div>
                </div>
              </div>
              <ReferralShareButtons link={universalLink} onAction={handleSocialShare} />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
