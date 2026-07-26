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
  const [linkCopied, setLinkCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draggingLogo, setDraggingLogo] = useState(false)

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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['brand-me'] })
      setError(null)
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Logo upload failed')),
  })

  const pickLogo = (file: File | undefined) => {
    if (file) uploadLogo.mutate(file)
  }

  const copyPublicLink = () => {
    if (!brand?.brandLineId) return
    const url = `${window.location.origin}/b/${encodeURIComponent(brand.brandLineId)}`
    void navigator.clipboard.writeText(url)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const stats = [
    { label: t('brandLine.profileViews'), value: String(brand?.profileViews ?? 0) },
    { label: t('brandLine.qrScans'), value: String(brand?.qrScans ?? 0) },
    { label: t('brandLine.activeProducts'), value: String(brand?.activeProducts ?? 0) },
    {
      label: t('brandLine.brandStatus'),
      value: t('brandLine.active'),
      tone: 'ok' as const,
    },
  ]

  return (
    <DashboardLayout titleKey="brandLine">
      <div className="profile-page brand-page">
        <header className="profile-page-head">
          <p className="profile-kicker">{t('brandLine.title')}</p>
          <h1 className="profile-title">{t('brandLine.identity')}</h1>
        </header>

        {isLoading ? (
          <p className="profile-muted">{t('common.loading')}</p>
        ) : (
          <>
            <section className="profile-identity brand-identity">
              <button
                type="button"
                className={`brand-logo-tile${logoSrc ? ' has-logo' : ''}${draggingLogo ? ' is-dragging' : ''}`}
                disabled={uploadLogo.isPending}
                onClick={() => logoInputRef.current?.click()}
                onDragEnter={(e) => {
                  e.preventDefault()
                  setDraggingLogo(true)
                }}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={() => setDraggingLogo(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDraggingLogo(false)
                  pickLogo(e.dataTransfer.files?.[0])
                }}
                aria-label={t('brandLine.uploadLogo')}
              >
                {logoSrc ? (
                  <img src={logoSrc} alt="" />
                ) : (
                  <span>
                    {uploadLogo.isPending
                      ? '…'
                      : t('brandLine.uploadLogo')}
                  </span>
                )}
              </button>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                className="sr-only"
                onChange={(e) => {
                  pickLogo(e.target.files?.[0])
                  e.target.value = ''
                }}
              />

              <div className="profile-identity-meta">
                <p className="brand-identity-name">{name.trim() || t('brandLine.brandNamePlaceholder')}</p>
                {brand?.brandLineId && (
                  <p className="profile-identity-email brand-line-id">{brand.brandLineId}</p>
                )}
                <div className="brand-identity-actions">
                  {brand?.brandLineId && (
                    <>
                      <Link
                        to={`/b/${encodeURIComponent(brand.brandLineId)}`}
                        className="profile-btn-ghost brand-link-btn"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t('brandLine.viewPublic', { defaultValue: 'View public profile' })}
                      </Link>
                      <button type="button" className="profile-btn-ghost brand-link-btn" onClick={copyPublicLink}>
                        {linkCopied
                          ? t('brandLine.linkCopied', { defaultValue: 'Link copied' })
                          : t('brandLine.copyPublicLink', { defaultValue: 'Copy public link' })}
                      </button>
                    </>
                  )}
                </div>
                <p className="brand-logo-hint">{t('brandLine.logoHint')}</p>
              </div>
            </section>

            <div className="brand-stats">
              {stats.map((s) => (
                <div key={s.label} className="brand-stat">
                  <span>{s.label}</span>
                  <strong className={'tone' in s && s.tone === 'ok' ? 'brand-stat--ok' : undefined}>
                    {s.value}
                  </strong>
                </div>
              ))}
            </div>

            <div className="profile-shell">
              <section className="profile-section">
                <div className="profile-section-head">
                  <h2>{t('brandLine.details')}</h2>
                  <p>
                    {t('brandLine.detailsHint', {
                      defaultValue: 'This name, description, and logo appear on your public brand profile.',
                    })}
                  </p>
                </div>

                <form
                  className="profile-form"
                  onSubmit={(e) => {
                    e.preventDefault()
                    save.mutate()
                  }}
                >
                  <div className="profile-field">
                    <label htmlFor="brand-name">{t('brandLine.brandName')}</label>
                    <input
                      id="brand-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('brandLine.brandNamePlaceholder')}
                    />
                  </div>

                  <div className="profile-field">
                    <label htmlFor="brand-desc">{t('brandLine.description')}</label>
                    <textarea
                      id="brand-desc"
                      rows={5}
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      placeholder={t('brandLine.descriptionPlaceholder')}
                    />
                  </div>

                  {error && <p className="profile-msg profile-msg--err">{error}</p>}
                  {saved && <p className="profile-msg profile-msg--ok">{t('brandLine.savedBtn')}</p>}

                  <div className="profile-actions">
                    <button type="submit" className="profile-btn-primary" disabled={save.isPending}>
                      {save.isPending ? '…' : t('brandLine.save')}
                    </button>
                    <Link to="/dashboard/collections" className="profile-btn-secondary">
                      {t('dashboard.nav.collections')}
                    </Link>
                  </div>
                </form>
              </section>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
