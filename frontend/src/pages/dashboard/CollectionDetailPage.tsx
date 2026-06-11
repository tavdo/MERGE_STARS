import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '../../components/DashboardLayout'
import CatalogItemStudio, { type CatalogItemStudioPayload } from '@/components/catalog/CatalogItemStudio'
import Model3DViewer from '@/components/catalog/Model3DViewer'
import { catalogApi, type CatalogVisibility } from '@/features/catalog/api/catalog.api'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import { useState } from 'react'

export default function CollectionDetailPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [pendingModels, setPendingModels] = useState<Record<string, string>>({})

  const { data: collection, isLoading } = useQuery({
    queryKey: ['catalog-collection', id],
    queryFn: () => catalogApi.getOne(id).then((r) => r.data.data),
    enabled: !!id,
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['catalog-collection', id] })
    qc.invalidateQueries({ queryKey: ['catalog-collections'] })
  }

  const updateCollection = useMutation({
    mutationFn: (payload: { title?: string; description?: string; visibility?: CatalogVisibility }) =>
      catalogApi.update(id, payload),
    onSuccess: invalidate,
  })

  const removeCollection = useMutation({
    mutationFn: () => catalogApi.remove(id),
    onSuccess: () => navigate('/dashboard/collections', { replace: true }),
  })

  const addItem = useMutation({
    mutationFn: async (payload: CatalogItemStudioPayload) => {
      let imageUrl = payload.imageUrl
      if (payload.imageFile) {
        imageUrl = URL.createObjectURL(payload.imageFile)
      }
      const item = await catalogApi.addItem(id, {
        title: payload.title,
        description: payload.description,
        metalType: payload.metalType,
        imageUrl,
      })
      if (payload.modelUrl && item.data.data.id) {
        setPendingModels((prev) => ({ ...prev, [item.data.data.id]: payload.modelUrl! }))
      }
      return item
    },
    onSuccess: () => {
      setError(null)
      invalidate()
    },
    onError: (err) =>
      setError(getApiErrorMessage(err, t('collections.itemFailed', { defaultValue: 'Could not add item' }))),
  })

  const removeItem = useMutation({
    mutationFn: (itemId: string) => catalogApi.removeItem(itemId),
    onSuccess: invalidate,
  })

  if (isLoading || !collection) {
    return (
      <DashboardLayout titleKey="collections">
        <p className="text-neutral-500 text-sm">{t('common.loading', { defaultValue: 'Loading…' })}</p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={collection.title}>
      <div className="max-w-6xl">
        <Link to="/dashboard/collections" className="text-sm text-neutral-500 hover:text-[#D4AF37] no-underline">
          ← {t('collections.back', { defaultValue: 'All collections' })}
        </Link>

        <div className="grid lg:grid-cols-5 gap-6 mt-6">
          <div className="dash-panel space-y-4 lg:col-span-2">
            <p className="dash-label">{t('collections.settings', { defaultValue: 'Collection settings' })}</p>
            <div>
              <label className="auth-field-label">{t('collections.name', { defaultValue: 'Name' })}</label>
              <input
                className="gold-input"
                defaultValue={collection.title}
                onBlur={(e) => {
                  const v = e.target.value.trim()
                  if (v && v !== collection.title) updateCollection.mutate({ title: v })
                }}
              />
            </div>
            <div>
              <label className="auth-field-label">{t('collections.description', { defaultValue: 'Description' })}</label>
              <textarea
                className="gold-input"
                rows={3}
                defaultValue={collection.description ?? ''}
                onBlur={(e) => updateCollection.mutate({ description: e.target.value })}
              />
            </div>
            <div>
              <label className="auth-field-label">{t('collections.visibility', { defaultValue: 'Visibility' })}</label>
              <select
                className="gold-input"
                value={collection.visibility}
                onChange={(e) => updateCollection.mutate({ visibility: e.target.value as CatalogVisibility })}
              >
                <option value="PRIVATE">{t('collections.private', { defaultValue: 'Private' })}</option>
                <option value="PUBLIC">{t('collections.public', { defaultValue: 'Public' })}</option>
              </select>
            </div>
            {collection.visibility === 'PUBLIC' && (
              <p className="text-xs text-neutral-500">
                {t('collections.publicLink', { defaultValue: 'Public link:' })}{' '}
                <Link to={`/collections/${collection.slug}`} className="text-[#D4AF37]">
                  /collections/{collection.slug}
                </Link>
              </p>
            )}
            <button
              type="button"
              className="text-sm text-red-400 hover:text-red-300"
              onClick={() => {
                if (confirm(t('collections.deleteConfirm', { defaultValue: 'Delete this collection and all items?' }))) {
                  removeCollection.mutate()
                }
              }}
            >
              {t('collections.delete', { defaultValue: 'Delete collection' })}
            </button>
          </div>

          <div className="lg:col-span-3">
            <CatalogItemStudio
              onSubmit={(payload) => addItem.mutate(payload)}
              submitting={addItem.isPending}
              error={error}
            />
          </div>
        </div>

        <div className="dash-panel mt-8">
          <p className="dash-label mb-4">
            {t('collections.catalogItems', { defaultValue: 'Catalog items' })} ({collection.items.length})
          </p>
          {collection.items.length === 0 ? (
            <p className="text-sm text-neutral-500">{t('collections.noItems', { defaultValue: 'No items in this catalog yet.' })}</p>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {collection.items.map((item) => {
                const modelUrl = pendingModels[item.id]
                return (
                  <article key={item.id} className="catalog-item-card">
                    {modelUrl ? (
                      <Model3DViewer modelUrl={modelUrl} className="catalog-item-card-3d" />
                    ) : item.imageUrl ? (
                      <img src={item.imageUrl} alt="" className="catalog-item-card-img" />
                    ) : (
                      <div className="catalog-item-card-placeholder">◆</div>
                    )}
                    <div className="catalog-item-card-body">
                      <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                      {item.metalType && <p className="text-xs text-[#D4AF37] mb-1">{item.metalType}</p>}
                      {item.description && <p className="text-sm text-neutral-500 line-clamp-2">{item.description}</p>}
                      {modelUrl && (
                        <span className="catalog-item-card-badge">3D</span>
                      )}
                      <button
                        type="button"
                        className="text-xs text-red-400 mt-3 hover:text-red-300"
                        onClick={() => removeItem.mutate(item.id)}
                      >
                        {t('collections.removeItem', { defaultValue: 'Remove' })}
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
