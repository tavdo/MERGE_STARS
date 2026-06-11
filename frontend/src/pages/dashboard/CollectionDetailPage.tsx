import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '../../components/DashboardLayout'
import { catalogApi, type CatalogVisibility } from '@/features/catalog/api/catalog.api'
import { getApiErrorMessage } from '@/shared/utils/apiError'

export default function CollectionDetailPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [itemTitle, setItemTitle] = useState('')
  const [itemDesc, setItemDesc] = useState('')
  const [itemMetal, setItemMetal] = useState('')
  const [itemImage, setItemImage] = useState('')
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
    mutationFn: () =>
      catalogApi.addItem(id, {
        title: itemTitle.trim(),
        description: itemDesc.trim() || undefined,
        metalType: itemMetal.trim() || undefined,
        imageUrl: itemImage.trim() || undefined,
      }),
    onSuccess: () => {
      setItemTitle('')
      setItemDesc('')
      setItemMetal('')
      setItemImage('')
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
      <div className="max-w-5xl">
        <Link to="/dashboard/collections" className="text-sm text-neutral-500 hover:text-[#D4AF37] no-underline">
          ← {t('collections.back', { defaultValue: 'All collections' })}
        </Link>

        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <div className="dash-panel space-y-4">
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

          <form
            className="dash-panel space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              if (!itemTitle.trim()) return
              addItem.mutate()
            }}
          >
            <p className="dash-label">{t('collections.addItem', { defaultValue: 'Add catalog item' })}</p>
            <div>
              <label className="auth-field-label">{t('collections.itemName', { defaultValue: 'Item title' })}</label>
              <input className="gold-input" value={itemTitle} onChange={(e) => setItemTitle(e.target.value)} required />
            </div>
            <div>
              <label className="auth-field-label">{t('collections.itemDesc', { defaultValue: 'Description' })}</label>
              <textarea className="gold-input" rows={2} value={itemDesc} onChange={(e) => setItemDesc(e.target.value)} />
            </div>
            <div>
              <label className="auth-field-label">{t('collections.metal', { defaultValue: 'Metal / material' })}</label>
              <input className="gold-input" value={itemMetal} onChange={(e) => setItemMetal(e.target.value)} placeholder="Gold, Silver…" />
            </div>
            <div>
              <label className="auth-field-label">{t('collections.imageUrl', { defaultValue: 'Image URL' })}</label>
              <input className="gold-input" value={itemImage} onChange={(e) => setItemImage(e.target.value)} placeholder="https://…" />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={addItem.isPending} className="luxury-btn-glass">
              {addItem.isPending ? '…' : t('collections.addItemBtn', { defaultValue: 'Add item' })}
            </button>
          </form>
        </div>

        <div className="dash-panel mt-8">
          <p className="dash-label mb-4">{t('collections.catalogItems', { defaultValue: 'Catalog items' })} ({collection.items.length})</p>
          {collection.items.length === 0 ? (
            <p className="text-sm text-neutral-500">{t('collections.noItems', { defaultValue: 'No items in this catalog yet.' })}</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {collection.items.map((item) => (
                <div key={item.id} className="border border-white/5 rounded p-4 bg-black/20">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt="" className="w-full h-32 object-cover rounded mb-3 bg-black" />
                  )}
                  <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                  {item.metalType && <p className="text-xs text-[#D4AF37] mb-1">{item.metalType}</p>}
                  {item.description && <p className="text-sm text-neutral-500 line-clamp-2">{item.description}</p>}
                  <button
                    type="button"
                    className="text-xs text-red-400 mt-3 hover:text-red-300"
                    onClick={() => removeItem.mutate(item.id)}
                  >
                    {t('collections.removeItem', { defaultValue: 'Remove' })}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
