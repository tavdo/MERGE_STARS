import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import AdminLayout from '../../components/AdminLayout'
import { adminApi } from '@/features/admin/api/admin.api'
import { api } from '@/lib/axios'

export default function AdminSettingsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [tickerEnabled, setTickerEnabled] = useState(true)
  const [aiEnabled, setAiEnabled] = useState(true)
  const [autoVerify, setAutoVerify] = useState(false)
  const [platformShare, setPlatformShare] = useState('1/2')
  const [brandShare, setBrandShare] = useState('1/4')
  const [referrerShare, setReferrerShare] = useState('1/4')
  const [saveSuccess, setSaveSuccess] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminApi.getSettings().then((r) => r.data.data),
  })

  useEffect(() => {
    if (!data) return
    setTickerEnabled(data.tickerEnabled)
    setAiEnabled(data.aiEnabled)
    setAutoVerify(data.autoVerify)
    setPlatformShare(data.platformShare)
    setBrandShare(data.brandShare)
    setReferrerShare(data.referrerShare)
  }, [data])

  const save = useMutation({
    mutationFn: () =>
      adminApi.updateSettings({
        tickerEnabled,
        aiEnabled,
        autoVerify,
        platformShare,
        brandShare,
        referrerShare,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-settings'] })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    },
  })

  const syncMetals = async () => {
    await api.get('/health')
    alert(t('admin.settings.metalSyncTriggered', { defaultValue: 'Metal price cron will refresh on the next schedule tick.' }))
  }

  const exportAudit = () => {
    window.open('/admin/audit', '_blank')
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    save.mutate()
  }

  return (
    <AdminLayout title="SETTINGS" subtitle="SYSTEM CONFIGURATION">
      <div className="space-y-6">
        {isLoading && <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px' }}>Loading settings…</p>}

        {saveSuccess && (
          <div className="admin-alert-success">
            {t('admin.settings.saved', { defaultValue: 'System settings saved successfully.' })}
          </div>
        )}

        <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-6">
          <section className="admin-section-card">
            <h3 className="admin-section-title">{t('admin.settings.featuresTitle', { defaultValue: 'Feature flags & capabilities' })}</h3>

            <div className="admin-setting-row">
              <div>
                <h4>{t('admin.settings.tickerTitle', { defaultValue: 'Live precious metal ticker' })}</h4>
                <p>{t('admin.settings.tickerDesc', { defaultValue: 'Fetch spot gold/silver prices every minute' })}</p>
              </div>
              <input type="checkbox" checked={tickerEnabled} onChange={(e) => setTickerEnabled(e.target.checked)} style={{ width: 18, height: 18, accentColor: '#c9a84c', cursor: 'pointer' }} />
            </div>

            <div className="admin-setting-row">
              <div>
                <h4>{t('admin.settings.aiTitle', { defaultValue: 'AI operational assistant' })}</h4>
                <p>{t('admin.settings.aiDesc', { defaultValue: 'OpenAI when configured; keyword fallback otherwise' })}</p>
              </div>
              <input type="checkbox" checked={aiEnabled} onChange={(e) => setAiEnabled(e.target.checked)} style={{ width: 18, height: 18, accentColor: '#c9a84c', cursor: 'pointer' }} />
            </div>

            <div className="admin-setting-row">
              <div>
                <h4>{t('admin.settings.autoVerifyTitle', { defaultValue: 'Automatic KYC verify on register' })}</h4>
                <p>{t('admin.settings.autoVerifyDesc', { defaultValue: 'New users start as KYC verified when enabled' })}</p>
              </div>
              <input type="checkbox" checked={autoVerify} onChange={(e) => setAutoVerify(e.target.checked)} style={{ width: 18, height: 18, accentColor: '#c9a84c', cursor: 'pointer' }} />
            </div>
          </section>

          <section className="admin-section-card">
            <h3 className="admin-section-title">{t('admin.settings.sharesTitle', { defaultValue: 'Operational share configuration' })}</h3>
            <div className="space-y-4">
              <div>
                <label className="admin-field-label">{t('admin.settings.platformShare', { defaultValue: 'Platform / operations share' })}</label>
                <input className="admin-field-input" value={platformShare} onChange={(e) => setPlatformShare(e.target.value)} />
              </div>
              <div>
                <label className="admin-field-label">{t('admin.settings.brandShare', { defaultValue: 'Brand owner share' })}</label>
                <input className="admin-field-input" value={brandShare} onChange={(e) => setBrandShare(e.target.value)} />
              </div>
              <div>
                <label className="admin-field-label">{t('admin.settings.referrerShare', { defaultValue: 'Direct referrer share' })}</label>
                <input className="admin-field-input" value={referrerShare} onChange={(e) => setReferrerShare(e.target.value)} />
              </div>
            </div>
          </section>

          <section className="admin-section-card md:col-span-2">
            <h3 className="admin-section-title">{t('admin.settings.controlsTitle', { defaultValue: 'Critical system controls' })}</h3>
            <div className="admin-actions-row">
              <button type="button" className="admin-btn-secondary" onClick={() => void syncMetals()}>
                {t('admin.settings.syncMetals', { defaultValue: 'Sync metal prices' })}
              </button>
              <button type="button" className="admin-btn-muted" onClick={exportAudit}>
                {t('admin.settings.openAudit', { defaultValue: 'Open audit center' })}
              </button>
            </div>
          </section>

          <div className="md:col-span-2 flex justify-end pt-2">
            <button type="submit" className="admin-btn-primary" disabled={save.isPending}>
              {save.isPending ? '…' : t('admin.settings.save', { defaultValue: 'Save system settings' })}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
