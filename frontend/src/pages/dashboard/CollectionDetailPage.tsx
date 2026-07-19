import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '../../components/DashboardLayout'
import CatalogItemStudio, { type CatalogItemStudioPayload } from '@/components/catalog/CatalogItemStudio'
import Model3DViewer from '@/components/catalog/Model3DViewer'
import {
  catalogApi,
  catalogItemImageUrl,
  catalogItemModelUrl,
  type CatalogItem,
  type CatalogVisibility,
} from '@/features/catalog/api/catalog.api'
import { useAuthAssetUrl } from '@/features/catalog/hooks/useAuthAssetUrl'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import { useState } from 'react'

function CatalogItemCard({ item, onRemove }: { item: CatalogItem; onRemove: () => void }) {
  const { t } = useTranslation()
  const imageSrc = useAuthAssetUrl(catalogItemImageUrl(item))
  const modelSrc = useAuthAssetUrl(catalogItemModelUrl(item))

  return (
    <article className="catalog-item-card">
      {modelSrc ? (
        <Model3DViewer modelUrl={modelSrc} className="catalog-item-card-3d" />
      ) : imageSrc ? (
        <img src={imageSrc} alt="" className="catalog-item-card-img" />
      ) : (
        <div className="catalog-item-card-placeholder">◆</div>
      )}
      <div className="catalog-item-card-body">
        <h4 className="font-semibold text-white mb-1">{item.title}</h4>
        {item.metalType && <p className="text-xs text-[#D4AF37] mb-1">{item.metalType}</p>}
        {item.priceUsd != null && item.priceUsd > 0 && (
          <p className="text-sm font-bold text-white mb-1">${Number(item.priceUsd).toLocaleString()}</p>
        )}
        {item.description && <p className="text-sm text-neutral-500 line-clamp-2">{item.description}</p>}
        {item.hasModel3d && <span className="catalog-item-card-badge">3D</span>}
        <button type="button" className="text-xs text-red-400 mt-3 hover:text-red-300" onClick={onRemove}>
          {t('collections.removeItem', { defaultValue: 'Remove' })}
        </button>
      </div>
    </article>
  )
}

export default function CollectionDetailPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [error, setError] = useState<string | null>(null)

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
      const { data } = await catalogApi.addItem(id, {
        title: payload.title,
        description: payload.description,
        metalType: payload.metalType,
        priceUsd: payload.priceUsd,
        imageUrl: payload.imageUrl?.startsWith('http') ? payload.imageUrl : undefined,
      })
      const itemId = data.data.id
      if (payload.imageFile) await catalogApi.uploadImage(itemId, payload.imageFile)
      if (payload.modelFile) await catalogApi.uploadModel3d(itemId, payload.modelFile)
      return data.data
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
              {collection.items.map((item) => (
                <CatalogItemCard key={item.id} item={item} onRemove={() => removeItem.mutate(item.id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
