import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '../../components/DashboardLayout'
import { catalogApi, type CatalogCategory, type CatalogVisibility } from '@/features/catalog/api/catalog.api'
import { CATALOG_CATEGORIES } from '@/shared/catalogCategories'
import { getApiErrorMessage } from '@/shared/utils/apiError'

export default function CollectionsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<CatalogVisibility>('PRIVATE')
  const [category, setCategory] = useState<CatalogCategory>('jewelry')
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
        category,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['catalog-collections'] })
      setTitle('')
      setDescription('')
      setVisibility('PRIVATE')
      setCategory('jewelry')
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

  const totalItems = collections.reduce((sum, c) => sum + (c.itemCount || 0), 0)
  const publicCount = collections.filter((c) => c.visibility === 'PUBLIC').length

  return (
    <DashboardLayout titleKey="collections">
      <div className="collections-hub">
        <header className="collections-hub-hero">
          <div className="collections-hub-hero-copy">
            <p className="dash-label">{t('collections.kicker', { defaultValue: 'STAR JEWELRY HOUSE' })}</p>
            <h2>{t('collections.title', { defaultValue: 'My collections & catalogs' })}</h2>
            <p>
              {t('collections.subtitle', {
                defaultValue: 'Create catalogs to showcase your products. Each collection can hold multiple items.',
              })}
            </p>
          </div>
          <div className="collections-hub-hero-aside">
            {!isLoading && collections.length > 0 && (
              <div className="collections-hub-stats">
                <div>
                  <strong>{collections.length}</strong>
                  <span>{t('collections.statCatalogs', { defaultValue: 'Catalogs' })}</span>
                </div>
                <div>
                  <strong>{totalItems}</strong>
                  <span>{t('collections.statDesigns', { defaultValue: 'Designs' })}</span>
                </div>
                <div>
                  <strong>{publicCount}</strong>
                  <span>{t('collections.statPublic', { defaultValue: 'Public' })}</span>
                </div>
              </div>
            )}
            <button type="button" className="luxury-btn-glass" onClick={() => setShowForm((v) => !v)}>
              {showForm
                ? t('collections.cancel', { defaultValue: 'Cancel' })
                : t('collections.new', { defaultValue: '+ New collection' })}
            </button>
          </div>
        </header>

        {showForm && (
          <form onSubmit={handleCreate} className="collections-hub-create">
            <p className="dash-label">{t('collections.createTitle', { defaultValue: 'Create collection' })}</p>
            <div className="collections-hub-create-grid">
              <div className="collections-hub-create-wide">
                <label className="auth-field-label">{t('collections.name', { defaultValue: 'Collection name' })}</label>
                <input
                  className="gold-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={120}
                />
              </div>
              <div>
                <label className="auth-field-label">{t('collections.category', { defaultValue: 'Category' })}</label>
                <select
                  className="gold-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CatalogCategory)}
                >
                  {CATALOG_CATEGORIES.map((key) => (
                    <option key={key} value={key}>
                      {t(`landing.categories.${key}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="auth-field-label">{t('collections.visibility', { defaultValue: 'Visibility' })}</label>
                <select
                  className="gold-input"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as CatalogVisibility)}
                >
                  <option value="PRIVATE">
                    {t('collections.private', { defaultValue: 'Private — only you' })}
                  </option>
                  <option value="PUBLIC">
                    {t('collections.public', { defaultValue: 'Public — visible in catalog' })}
                  </option>
                </select>
              </div>
              <div className="collections-hub-create-wide">
                <label className="auth-field-label">{t('collections.description', { defaultValue: 'Description' })}</label>
                <textarea
                  className="gold-input"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
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
          <div className="collections-hub-empty">
            <span aria-hidden>◆</span>
            <h3>{t('collections.emptyTitle', { defaultValue: 'No collections yet' })}</h3>
            <p>
              {t('collections.emptyHint', {
                defaultValue: 'Create your first catalog to start adding products.',
              })}
            </p>
            <button type="button" className="luxury-btn-glass" onClick={() => setShowForm(true)}>
              {t('collections.new', { defaultValue: '+ New collection' })}
            </button>
          </div>
        ) : (
          <div className="collections-hub-grid">
            {collections.map((c) => (
              <Link key={c.id} to={`/dashboard/collections/${c.id}`} className="collections-hub-card">
                <div className="collections-hub-card-visual" aria-hidden>
                  <span>{c.title.slice(0, 1).toUpperCase()}</span>
                  <div className="collections-hub-card-badges">
                    <em className={c.visibility === 'PUBLIC' ? 'is-public' : 'is-private'}>
                      {c.visibility}
                    </em>
                    {c.category && <em>{t(`landing.categories.${c.category}`)}</em>}
                  </div>
                </div>
                <div className="collections-hub-card-body">
                  <h3>{c.title}</h3>
                  {c.description ? (
                    <p>{c.description}</p>
                  ) : (
                    <p className="is-muted">
                      {t('collections.noDescription', { defaultValue: 'No description yet.' })}
                    </p>
                  )}
                  <div className="collections-hub-card-foot">
                    <span>
                      {c.itemCount} {t('collections.items', { defaultValue: 'items' })}
                    </span>
                    <strong>{t('collections.manage', { defaultValue: 'Manage →' })}</strong>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="collections-hub-footer">
          <Link to="/collections">{t('collections.browsePublic', { defaultValue: 'Browse public collections →' })}</Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
