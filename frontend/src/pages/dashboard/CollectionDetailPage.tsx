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
  type CatalogCategory,
  type CatalogCollection,
  type CatalogItem,
  type CatalogVisibility,
} from '@/features/catalog/api/catalog.api'
import { CATALOG_CATEGORIES } from '@/shared/catalogCategories'
import { useAuthAssetUrl } from '@/features/catalog/hooks/useAuthAssetUrl'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type EditDraft = {
  title: string
  description: string
  metalType: string
  imageFile: File | null
  modelFile: File | null
}

function CatalogItemCard({
  item,
  collections,
  currentCollectionId,
  onRemove,
  onMove,
  onEdit,
  moving,
}: {
  item: CatalogItem
  collections: CatalogCollection[]
  currentCollectionId: string
  onRemove: () => void
  onMove: (targetCollectionId: string) => void
  onEdit: () => void
  moving?: boolean
}) {
  const { t } = useTranslation()
  const imageSrc = useAuthAssetUrl(catalogItemImageUrl(item))
  const modelSrc = useAuthAssetUrl(catalogItemModelUrl(item))
  const otherCollections = collections.filter((c) => c.id !== currentCollectionId)

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
        {item.description && <p className="text-sm text-neutral-500 line-clamp-2">{item.description}</p>}
        {item.hasModel3d && <span className="catalog-item-card-badge">3D</span>}

        <div className="catalog-item-actions">
          <button type="button" className="catalog-item-edit-btn" onClick={onEdit}>
            {t('collections.editDesign', { defaultValue: 'Edit' })}
          </button>
          <button type="button" className="catalog-item-remove-btn" onClick={onRemove}>
            {t('collections.removeItem', { defaultValue: 'Remove' })}
          </button>
        </div>

        {otherCollections.length > 0 && (
          <label className="catalog-item-move">
            <span>{t('collections.moveTo', { defaultValue: 'Move to' })}</span>
            <select
              className="gold-input catalog-item-move-select"
              defaultValue=""
              disabled={moving}
              onChange={(e) => {
                const target = e.target.value
                if (!target) return
                onMove(target)
                e.target.value = ''
              }}
            >
              <option value="" disabled>
                {t('collections.chooseCollection', { defaultValue: 'Choose collection…' })}
              </option>
              {otherCollections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </article>
  )
}

function DesignEditModal({
  item,
  open,
  saving,
  error,
  onClose,
  onSave,
}: {
  item: CatalogItem
  open: boolean
  saving?: boolean
  error?: string | null
  onClose: () => void
  onSave: (draft: EditDraft) => void
}) {
  const { t } = useTranslation()
  const imageSrc = useAuthAssetUrl(catalogItemImageUrl(item))
  const [title, setTitle] = useState(item.title)
  const [description, setDescription] = useState(item.description ?? '')
  const [metalType, setMetalType] = useState(item.metalType ?? '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [modelFile, setModelFile] = useState<File | null>(null)

  useEffect(() => {
    if (!open) return
    setTitle(item.title)
    setDescription(item.description ?? '')
    setMetalType(item.metalType ?? '')
    setImageFile(null)
    setModelFile(null)
    setImagePreview(null)
  }, [open, item])

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null)
      return
    }
    const url = URL.createObjectURL(imageFile)
    setImagePreview(url)
    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="design-edit-modal" role="dialog" aria-modal="true" aria-label="Edit design">
      <div className="design-edit-backdrop" onClick={onClose} />
      <form
        className="design-edit-panel"
        onSubmit={(e) => {
          e.preventDefault()
          if (!title.trim()) return
          onSave({
            title: title.trim(),
            description: description.trim(),
            metalType: metalType.trim(),
            imageFile,
            modelFile,
          })
        }}
      >
        <div className="design-edit-head">
          <div>
            <p className="dash-label">{t('collections.editDesignTitle', { defaultValue: 'Edit design' })}</p>
            <h3>{item.title}</h3>
          </div>
          <button type="button" className="design-edit-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="design-edit-grid">
          <div className="design-edit-fields">
            <div>
              <label className="auth-field-label">{t('collections.itemName', { defaultValue: 'Item title' })}</label>
              <input
                className="gold-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={160}
              />
            </div>
            <div>
              <label className="auth-field-label">{t('collections.metal', { defaultValue: 'Metal / material' })}</label>
              <input
                className="gold-input"
                value={metalType}
                onChange={(e) => setMetalType(e.target.value)}
                maxLength={80}
                placeholder="Silver 999, Gold…"
              />
            </div>
            <div>
              <label className="auth-field-label">{t('collections.itemDesc', { defaultValue: 'Description' })}</label>
              <textarea
                className="gold-input"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
              />
            </div>
          </div>

          <div className="design-edit-media">
            <div>
              <label className="auth-field-label">{t('collections.photo', { defaultValue: 'Photo' })}</label>
              <div className="design-edit-photo">
                {(imagePreview || imageSrc) && (
                  <img src={imagePreview || imageSrc || ''} alt="" />
                )}
                {!imagePreview && !imageSrc && (
                  <div className="design-edit-photo-empty">
                    {t('collections.noPhoto', { defaultValue: 'No photo yet' })}
                  </div>
                )}
              </div>
              <label className="design-edit-file-btn">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                />
                {imageFile
                  ? t('collections.changePhotoSelected', { defaultValue: 'New photo selected' })
                  : t('collections.changePhoto', { defaultValue: 'Change / upload photo' })}
              </label>
            </div>

            <div>
              <label className="auth-field-label">{t('collections.model3dOptional', { defaultValue: '3D model (optional replace)' })}</label>
              <label className="design-edit-file-btn">
                <input
                  type="file"
                  accept=".glb,.gltf,.usdz,.usdc,model/gltf-binary"
                  onChange={(e) => setModelFile(e.target.files?.[0] ?? null)}
                />
                {modelFile
                  ? modelFile.name
                  : item.hasModel3d
                    ? t('collections.replaceModel', { defaultValue: 'Replace 3D model' })
                    : t('collections.uploadModel', { defaultValue: 'Upload 3D model' })}
              </label>
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="design-edit-foot">
          <button type="button" className="design-edit-cancel" onClick={onClose} disabled={saving}>
            {t('common.cancel', { defaultValue: 'Cancel' })}
          </button>
          <button type="submit" className="luxury-btn-glass" disabled={saving || !title.trim()}>
            {saving
              ? t('common.loading', { defaultValue: 'Saving…' })
              : t('collections.saveDesign', { defaultValue: 'Save design' })}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  )
}

export default function CollectionDetailPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null)

  const { data: collection, isLoading } = useQuery({
    queryKey: ['catalog-collection', id],
    queryFn: () => catalogApi.getOne(id).then((r) => r.data.data),
    enabled: !!id,
  })

  const { data: allCollections = [] } = useQuery({
    queryKey: ['catalog-collections'],
    queryFn: () => catalogApi.listMine().then((r) => r.data.data),
  })

  const invalidate = async (alsoCollectionId?: string) => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['catalog-collection', id] }),
      alsoCollectionId && alsoCollectionId !== id
        ? qc.invalidateQueries({ queryKey: ['catalog-collection', alsoCollectionId] })
        : Promise.resolve(),
      qc.invalidateQueries({ queryKey: ['catalog-collections'] }),
    ])
  }

  const updateCollection = useMutation({
    mutationFn: (payload: {
      title?: string
      description?: string
      visibility?: CatalogVisibility
      category?: CatalogCategory
    }) => catalogApi.update(id, payload),
    onSuccess: () => invalidate(),
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
        imageUrl: payload.imageUrl?.startsWith('http') ? payload.imageUrl : undefined,
        meshyJobId: payload.meshyJobId || undefined,
      })
      const itemId = data.data.id
      const warnings: string[] = []
      if (payload.imageFile) {
        try {
          await catalogApi.uploadImage(itemId, payload.imageFile)
        } catch (err) {
          warnings.push(
            getApiErrorMessage(err, t('collections.imageUploadFailed', { defaultValue: 'Image upload failed' })),
          )
        }
      }
      if (payload.modelFile && !payload.meshyJobId) {
        try {
          await catalogApi.uploadModel3d(itemId, payload.modelFile)
        } catch (err) {
          warnings.push(
            getApiErrorMessage(err, t('collections.modelUploadFailed', { defaultValue: '3D upload failed' })),
          )
        }
      }
      return { item: data.data, warnings }
    },
    onSuccess: (result) => {
      invalidate()
      setError(result.warnings.length ? result.warnings.join(' · ') : null)
    },
    onError: (err) =>
      setError(getApiErrorMessage(err, t('collections.itemFailed', { defaultValue: 'Could not add item' }))),
  })

  const updateItem = useMutation({
    mutationFn: async ({ itemId, draft }: { itemId: string; draft: EditDraft }) => {
      await catalogApi.updateItem(itemId, {
        title: draft.title,
        description: draft.description,
        metalType: draft.metalType,
      })
      if (draft.imageFile) await catalogApi.uploadImage(itemId, draft.imageFile)
      if (draft.modelFile) await catalogApi.uploadModel3d(itemId, draft.modelFile)
    },
    onSuccess: () => {
      setEditError(null)
      setEditingItem(null)
      invalidate()
    },
    onError: (err) =>
      setEditError(getApiErrorMessage(err, t('collections.editFailed', { defaultValue: 'Could not save design' }))),
  })

  const removeItem = useMutation({
    mutationFn: (itemId: string) => catalogApi.removeItem(itemId),
    onSuccess: () => invalidate(),
  })

  const moveItem = useMutation({
    mutationFn: ({ itemId, collectionId }: { itemId: string; collectionId: string }) =>
      catalogApi.moveItem(itemId, collectionId),
    onSuccess: async (_data, vars) => {
      setError(null)
      await invalidate(vars.collectionId)
      const target = allCollections.find((c) => c.id === vars.collectionId)
      setNotice(
        t('collections.moveSuccess', {
          defaultValue: 'Design moved to "{{name}}".',
          name: target?.title ?? 'collection',
        }),
      )
    },
    onError: (err) => {
      setNotice(null)
      setError(getApiErrorMessage(err, t('collections.moveFailed', { defaultValue: 'Could not move design' })))
    },
  })

  if (isLoading) {
    return (
      <DashboardLayout titleKey="collections">
        <p className="text-neutral-500 text-sm">{t('common.loading', { defaultValue: 'Loading…' })}</p>
      </DashboardLayout>
    )
  }

  if (!collection) {
    return (
      <DashboardLayout titleKey="collections">
        <p className="text-sm text-red-400">
          {t('collections.notFound', { defaultValue: 'Collection not found.' })}
        </p>
        <Link to="/dashboard/collections" className="text-sm text-[#D4AF37] mt-4 inline-block">
          ← {t('collections.back', { defaultValue: 'All collections' })}
        </Link>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={collection.title}>
      <div className="collection-detail-page">
        <div className="collection-detail-top">
          <Link to="/dashboard/collections" className="collection-detail-back">
            ← {t('collections.back', { defaultValue: 'All collections' })}
          </Link>
          {collection.visibility === 'PUBLIC' && (
            <Link to={`/collections/${collection.slug}`} className="collection-detail-public-link">
              {t('collections.viewPublic', { defaultValue: 'View public page' })} →
            </Link>
          )}
        </div>

        <section className="collection-settings-bar">
          <div className="collection-settings-bar-head">
            <div>
              <p className="dash-label">{t('collections.settings', { defaultValue: 'Collection settings' })}</p>
              <p className="collection-settings-hint">
                {t('collections.settingsHint', {
                  defaultValue: 'Edit name, category, visibility, or description — changes save automatically.',
                })}
              </p>
            </div>
            <button
              type="button"
              className="collection-settings-delete"
              onClick={() => {
                if (
                  confirm(
                    t('collections.deleteConfirm', {
                      defaultValue: 'Delete this collection and all items?',
                    }),
                  )
                ) {
                  removeCollection.mutate()
                }
              }}
            >
              {t('collections.delete', { defaultValue: 'Delete collection' })}
            </button>
          </div>

          <div className="collection-settings-grid">
            <div className="collection-settings-field collection-settings-field--wide">
              <label className="auth-field-label">{t('collections.name', { defaultValue: 'Name' })}</label>
              <input
                className="gold-input"
                key={`title-${collection.id}-${collection.updatedAt}`}
                defaultValue={collection.title}
                onBlur={(e) => {
                  const v = e.target.value.trim()
                  if (v && v !== collection.title) updateCollection.mutate({ title: v })
                }}
              />
            </div>
            <div className="collection-settings-field">
              <label className="auth-field-label">{t('collections.category', { defaultValue: 'Category' })}</label>
              <select
                className="gold-input"
                value={collection.category || 'more'}
                onChange={(e) =>
                  updateCollection.mutate({ category: e.target.value as CatalogCategory })
                }
              >
                {CATALOG_CATEGORIES.map((key) => (
                  <option key={key} value={key}>
                    {t(`landing.categories.${key}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="collection-settings-field">
              <label className="auth-field-label">{t('collections.visibility', { defaultValue: 'Visibility' })}</label>
              <select
                className="gold-input"
                value={collection.visibility}
                onChange={(e) =>
                  updateCollection.mutate({ visibility: e.target.value as CatalogVisibility })
                }
              >
                <option value="PRIVATE">{t('collections.private', { defaultValue: 'Private' })}</option>
                <option value="PUBLIC">{t('collections.public', { defaultValue: 'Public' })}</option>
              </select>
            </div>
            <div className="collection-settings-field collection-settings-field--full">
              <label className="auth-field-label">{t('collections.description', { defaultValue: 'Description' })}</label>
              <textarea
                className="gold-input"
                rows={2}
                key={`desc-${collection.id}-${collection.updatedAt}`}
                defaultValue={collection.description ?? ''}
                onBlur={(e) => {
                  if (e.target.value !== (collection.description ?? '')) {
                    updateCollection.mutate({ description: e.target.value })
                  }
                }}
              />
            </div>
          </div>
        </section>

        <section className="collection-studio-section">
          <CatalogItemStudio
            onSubmit={(payload) => addItem.mutate(payload)}
            submitting={addItem.isPending}
            error={error}
          />
        </section>

        <section className="collection-items-section">
          <div className="collection-items-head">
            <p className="dash-label">
              {t('collections.catalogItems', { defaultValue: 'Catalog items' })}
            </p>
            <span className="collection-items-count">{collection.items.length}</span>
          </div>
          {notice && <p className="collection-move-notice">{notice}</p>}
          {error && <p className="text-sm text-red-400 mb-3">{error}</p>}
          {collection.items.length === 0 ? (
            <p className="collection-items-empty">
              {t('collections.noItems', { defaultValue: 'No items in this catalog yet.' })}
            </p>
          ) : (
            <div className="collection-items-grid">
              {collection.items.map((item) => (
                <CatalogItemCard
                  key={item.id}
                  item={item}
                  collections={allCollections}
                  currentCollectionId={id}
                  moving={moveItem.isPending}
                  onEdit={() => {
                    setEditError(null)
                    setEditingItem(item)
                  }}
                  onMove={(targetCollectionId) =>
                    moveItem.mutate({ itemId: item.id, collectionId: targetCollectionId })
                  }
                  onRemove={() => {
                    if (
                      confirm(
                        t('collections.removeItemConfirm', {
                          defaultValue: 'Remove this design from the collection?',
                        }),
                      )
                    ) {
                      removeItem.mutate(item.id)
                    }
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {editingItem && (
        <DesignEditModal
          item={editingItem}
          open
          saving={updateItem.isPending}
          error={editError}
          onClose={() => {
            if (!updateItem.isPending) {
              setEditingItem(null)
              setEditError(null)
            }
          }}
          onSave={(draft) => updateItem.mutate({ itemId: editingItem.id, draft })}
        />
      )}
    </DashboardLayout>
  )
}
