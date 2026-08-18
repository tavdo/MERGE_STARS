import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import AdminLayout from '../../components/AdminLayout'
import { catalogApi } from '@/features/catalog/api/catalog.api'
import { getApiErrorMessage } from '@/shared/utils/apiError'

export default function AdminMasterCatalogPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [title, setTitle] = useState('')
  const [house, setHouse] = useState('jewelry')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { data: nav } = useQuery({
    queryKey: ['master-houses'],
    queryFn: () => catalogApi.masterHouses().then((r) => r.data.data),
  })

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-master-products'],
    queryFn: () => catalogApi.adminMasterList().then((r) => r.data.data),
  })

  const refresh = () => qc.invalidateQueries({ queryKey: ['admin-master-products'] })

  const create = useMutation({
    mutationFn: () =>
      catalogApi.adminMasterCreate({
        title: title.trim(),
        house,
        description: description.trim() || undefined,
      }),
    onSuccess: () => {
      refresh()
      setTitle('')
      setDescription('')
      setError(null)
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Could not create product')),
  })

  const patch = useMutation({
    mutationFn: ({ id, lifecycle }: { id: string; lifecycle: string }) =>
      catalogApi.adminMasterUpdate(id, { lifecycle }),
    onSuccess: refresh,
  })

  const uploadImage = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      catalogApi.adminMasterUploadImage(id, file),
    onSuccess: refresh,
    onError: (err) => setError(getApiErrorMessage(err, 'Image upload failed')),
  })

  const uploadModel = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      catalogApi.adminMasterUploadModel3d(id, file),
    onSuccess: refresh,
    onError: (err) => setError(getApiErrorMessage(err, '3D upload failed')),
  })

  return (
    <AdminLayout
      title={t('admin.nav.masterCatalog', { defaultValue: 'MASTER CATALOG' })}
      subtitle={t('admin.masterCatalog.subtitle', {
        defaultValue: 'Upload luxury photo + 3D, then set ACTIVE to show in Brand Room.',
      })}
    >
      <p className="profile-muted" style={{ marginBottom: '1rem', maxWidth: '40rem' }}>
        Auto-generated placeholders are hidden from Brand Room (DRAFT). Upload your design photo
        and GLB, then switch lifecycle to ACTIVE.
      </p>

      <form
        className="admin-section-card"
        style={{ marginBottom: '1.5rem' }}
        onSubmit={(e) => {
          e.preventDefault()
          if (!title.trim()) return
          create.mutate()
        }}
      >
        <h3 className="admin-section-title">
          {t('admin.masterCatalog.add', { defaultValue: 'Add Master Product' })}
        </h3>
        <div className="collections-hub-create-grid">
          <label>
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label>
            House
            <select value={house} onChange={(e) => setHouse(e.target.value)}>
              {(nav?.houses ?? []).map((h) => (
                <option key={h.key} value={h.key}>
                  {h.label}
                </option>
              ))}
            </select>
          </label>
          <label className="collections-hub-create-wide">
            Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </label>
        </div>
        {error && <p className="profile-msg profile-msg--err">{error}</p>}
        <button type="submit" className="gold-btn mt-4" disabled={create.isPending}>
          {create.isPending ? '…' : t('admin.masterCatalog.create', { defaultValue: 'Create as draft' })}
        </button>
      </form>

      {isLoading ? (
        <p>Loading…</p>
      ) : (
        <div className="admin-section-card">
          <h3 className="admin-section-title">{products.length} products</h3>
          <div className="collections-hub-grid">
            {products.map((p) => (
              <article key={p.id} className="collections-hub-card master-product-card">
                <div className="collections-hub-card-visual">
                  {p.imageUrl ? <img src={p.imageUrl} alt="" /> : <span>No photo</span>}
                </div>
                <div className="master-product-body">
                  <h3>{p.title}</h3>
                  <p>
                    {p.houseLabel || p.house} · {p.lifecycle || 'DRAFT'}
                    {p.hasModel3d ? ' · 3D' : ''}
                  </p>
                  <select
                    value={p.lifecycle || 'DRAFT'}
                    onChange={(e) => patch.mutate({ id: p.id, lifecycle: e.target.value })}
                  >
                    {['DRAFT', 'REVIEW', 'APPROVED', 'ACTIVE', 'SUSPENDED', 'ARCHIVED'].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <label className="master-upload">
                    Photo
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) uploadImage.mutate({ id: p.id, file })
                        e.target.value = ''
                      }}
                    />
                  </label>
                  <label className="master-upload">
                    3D (GLB)
                    <input
                      type="file"
                      accept=".glb,.gltf,.usdz"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) uploadModel.mutate({ id: p.id, file })
                        e.target.value = ''
                      }}
                    />
                  </label>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
