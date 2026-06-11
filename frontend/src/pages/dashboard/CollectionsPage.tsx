import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '../../components/DashboardLayout'
import { catalogApi, type CatalogVisibility } from '@/features/catalog/api/catalog.api'
import { getApiErrorMessage } from '@/shared/utils/apiError'

export default function CollectionsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<CatalogVisibility>('PRIVATE')
  const [error, setError] = useState<string | null>(null)

  const { data: collections = [], isLoading } = useQuery({
    queryKey: ['catalog-collections'],
    queryFn: () => catalogApi.listMine().then((r) => r.data.data),
  })

  const create = useMutation({
    mutationFn: () =>
      catalogApi.create({
        title: title.trim(),
        description: description.trim() || undefined,
        visibility,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['catalog-collections'] })
      setTitle('')
      setDescription('')
      setVisibility('PRIVATE')
      setShowForm(false)
      setError(null)
    },
    onError: (err) =>
      setError(getApiErrorMessage(err, t('collections.createFailed', { defaultValue: 'Could not create collection' }))),
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    create.mutate()
  }

  return (
    <DashboardLayout titleKey="collections">
      <div className="max-w-5xl">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <p className="dash-label mb-2">{t('collections.kicker', { defaultValue: 'STAR JEWELRY HOUSE' })}</p>
            <h2 className="text-xl font-bold text-white tracking-wide">
              {t('collections.title', { defaultValue: 'My collections & catalogs' })}
            </h2>
            <p className="text-sm text-neutral-500 mt-2 max-w-xl">
              {t('collections.subtitle', { defaultValue: 'Create catalogs to showcase your products. Each collection can hold multiple items.' })}
            </p>
          </div>
          <button type="button" className="luxury-btn-glass" onClick={() => setShowForm((v) => !v)}>
            {showForm ? t('collections.cancel', { defaultValue: 'Cancel' }) : t('collections.new', { defaultValue: '+ New collection' })}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="dash-panel mb-8 space-y-4">
            <p className="dash-label">{t('collections.createTitle', { defaultValue: 'Create collection' })}</p>
            <div>
              <label className="auth-field-label">{t('collections.name', { defaultValue: 'Collection name' })}</label>
              <input className="gold-input" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} />
            </div>
            <div>
              <label className="auth-field-label">{t('collections.description', { defaultValue: 'Description' })}</label>
              <textarea className="gold-input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <label className="auth-field-label">{t('collections.visibility', { defaultValue: 'Visibility' })}</label>
              <select className="gold-input" value={visibility} onChange={(e) => setVisibility(e.target.value as CatalogVisibility)}>
                <option value="PRIVATE">{t('collections.private', { defaultValue: 'Private — only you' })}</option>
                <option value="PUBLIC">{t('collections.public', { defaultValue: 'Public — visible in catalog' })}</option>
              </select>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={create.isPending} className="luxury-btn-glass">
              {create.isPending ? '…' : t('collections.create', { defaultValue: 'Create collection' })}
            </button>
          </form>
        )}

        {isLoading ? (
          <p className="text-neutral-500 text-sm">{t('common.loading', { defaultValue: 'Loading…' })}</p>
        ) : collections.length === 0 ? (
          <div className="dash-panel text-center py-12">
            <p className="text-4xl mb-4">📚</p>
            <p className="text-white font-semibold mb-2">{t('collections.emptyTitle', { defaultValue: 'No collections yet' })}</p>
            <p className="text-sm text-neutral-500 mb-6">{t('collections.emptyHint', { defaultValue: 'Create your first catalog to start adding products.' })}</p>
            <button type="button" className="luxury-btn-glass" onClick={() => setShowForm(true)}>
              {t('collections.new', { defaultValue: '+ New collection' })}
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {collections.map((c) => (
              <Link key={c.id} to={`/dashboard/collections/${c.id}`} className="dash-panel block hover:border-[#D4AF37]/40 transition-colors no-underline">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-base font-bold text-white">{c.title}</h3>
                  <span className={`text-[10px] font-bold tracking-wider px-2 py-1 rounded ${c.visibility === 'PUBLIC' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-500/10 text-neutral-400'}`}>
                    {c.visibility}
                  </span>
                </div>
                {c.description && (
                  <p className="text-sm text-neutral-500 line-clamp-2 mb-4">{c.description}</p>
                )}
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>{c.itemCount} {t('collections.items', { defaultValue: 'items' })}</span>
                  <span className="text-[#D4AF37]">{t('collections.manage', { defaultValue: 'Manage →' })}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-white/5">
          <Link to="/collections" className="text-sm text-[#D4AF37] hover:underline">
            {t('collections.browsePublic', { defaultValue: 'Browse public collections →' })}
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
