import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '../../components/DashboardLayout'
import { brandApi } from '@/features/brand/api/brand.api'
import { useAuthAssetUrl } from '@/features/catalog/hooks/useAuthAssetUrl'
import { getApiErrorMessage } from '@/shared/utils/apiError'

export default function BrandLinePage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: brand, isLoading } = useQuery({
    queryKey: ['brand-me'],
    queryFn: () => brandApi.getMine().then((r) => r.data.data),
  })

  const logoSrc = useAuthAssetUrl(brand?.logoUrl ? brandApi.logoFileUrl() : null)

  useEffect(() => {
    if (!brand) return
    setName(brand.name ?? '')
    setDesc(brand.description ?? '')
  }, [brand])

  const save = useMutation({
    mutationFn: () => brandApi.update({ name: name.trim(), description: desc.trim() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['brand-me'] })
      setSaved(true)
      setError(null)
      setTimeout(() => setSaved(false), 2500)
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Could not save')),
  })

  const uploadLogo = useMutation({
    mutationFn: (file: File) => brandApi.uploadLogo(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['brand-me'] }),
    onError: (err) => setError(getApiErrorMessage(err, 'Logo upload failed')),
  })

  const stats = [
    { label: t('brandLine.profileViews'), value: String(brand?.profileViews ?? 0) },
    { label: t('brandLine.qrScans'), value: String(brand?.qrScans ?? 0) },
    { label: t('brandLine.activeProducts'), value: String(brand?.activeProducts ?? 0) },
    { label: t('brandLine.brandStatus'), value: t('brandLine.active'), color: '#22c55e' },
  ]

  if (isLoading) {
    return (
      <DashboardLayout titleKey="brandLine">
        <p className="text-neutral-500 text-sm">{t('common.loading')}</p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout titleKey="brandLine">
      <div className="max-w-3xl space-y-8">
        <div>
          <p className="landing-sans-head mb-2">{t('brandLine.title')}</p>
          <p className="apply-lead">{t('brandLine.identity')}</p>
          {brand?.brandLineId && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p className="text-xs text-neutral-500 tracking-wide">{brand.brandLineId}</p>
              <Link
                to={`/b/${encodeURIComponent(brand.brandLineId)}`}
                className="text-xs text-[#c9a84c] hover:underline no-underline"
                target="_blank"
                rel="noreferrer"
              >
                {t('brandLine.viewPublic', { defaultValue: 'View public profile' })} →
              </Link>
              <button
                type="button"
                className="text-xs text-neutral-400 hover:text-[#c9a84c]"
                onClick={() => {
                  const url = `${window.location.origin}/b/${encodeURIComponent(brand.brandLineId!)}`
                  void navigator.clipboard.writeText(url)
                  setSaved(true)
                  setTimeout(() => setSaved(false), 2000)
                }}
              >
                {t('brandLine.copyPublicLink', { defaultValue: 'Copy public link' })}
              </button>
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="dash-panel py-4 px-5">
              <p className="text-[10px] text-neutral-500 tracking-wider mb-1">{s.label}</p>
              <p className="text-2xl font-bold tracking-wide" style={{ color: s.color ?? '#c9a84c' }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="apply-surface p-8 space-y-6">
          <p className="text-xs font-bold tracking-[0.2em] text-[#c9a84c]">{t('brandLine.details')}</p>

          <div>
            <label className="apply-label">{t('brandLine.brandName')}</label>
            <input
              className="apply-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('brandLine.brandNamePlaceholder')}
            />
          </div>

          <div>
            <label className="apply-label">{t('brandLine.description')}</label>
            <textarea
              className="apply-field"
              rows={4}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder={t('brandLine.descriptionPlaceholder')}
            />
          </div>

          <div>
            <label className="apply-label">{t('brandLine.logo')}</label>
            <button
              type="button"
              className="mt-2 flex items-center justify-center w-28 h-28 rounded-lg border border-dashed border-[rgba(201,168,76,0.35)] bg-black/30 overflow-hidden"
              onClick={() => logoInputRef.current?.click()}
            >
              {logoSrc ? (
                <img src={logoSrc} alt="" className="w-full h-full object-contain p-2" />
              ) : (
                <span className="text-xs text-neutral-500 text-center px-2">{t('brandLine.uploadLogo')}</span>
              )}
            </button>
            <p className="text-[11px] text-neutral-500 mt-2">{t('brandLine.logoHint')}</p>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) uploadLogo.mutate(file)
                e.target.value = ''
              }}
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {saved && <p className="text-sm text-emerald-400">{t('brandLine.savedBtn')}</p>}

          <div className="flex flex-wrap gap-3">
            <button type="button" className="luxury-btn-glass" disabled={save.isPending} onClick={() => save.mutate()}>
              {save.isPending ? '…' : t('brandLine.save')}
            </button>
            <Link to="/dashboard/collections" className="luxury-btn-ghost">
              {t('dashboard.nav.collections')}
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
