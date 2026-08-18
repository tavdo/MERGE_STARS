import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../../components/DashboardLayout'
import { catalogApi } from '@/features/catalog/api/catalog.api'
import { getApiErrorMessage } from '@/shared/utils/apiError'

export default function MasterCatalogPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [q, setQ] = useState('')
  const [cluster, setCluster] = useState('')
  const [house, setHouse] = useState('')
  const [collectionId, setCollectionId] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { data: nav } = useQuery({
    queryKey: ['master-houses'],
    queryFn: () => catalogApi.masterHouses().then((r) => r.data.data),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['master-products', q, cluster, house, collectionId],
    queryFn: () =>
      catalogApi
        .masterProducts({
          q: q.trim() || undefined,
          cluster: cluster || undefined,
          house: house || undefined,
          collectionId: collectionId || undefined,
        })
        .then((r) => r.data.data),
  })

  const { data: mine = [] } = useQuery({
    queryKey: ['brand-room-catalog'],
    queryFn: () => catalogApi.brandRoomCatalog().then((r) => r.data.data),
  })

  const add = useMutation({
    mutationFn: (id: string) => catalogApi.addBrandRoomPick(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['master-products'] })
      qc.invalidateQueries({ queryKey: ['brand-room-catalog'] })
      qc.invalidateQueries({ queryKey: ['brand-me'] })
      setError(null)
    },
    onError: (err) => setError(getApiErrorMessage(err, 'Could not add product')),
  })

  const houses = useMemo(() => {
    if (!nav) return []
    if (cluster) return nav.houses.filter((h) => h.cluster === cluster)
    return nav.houses
  }, [nav, cluster])

  const products = data?.products ?? []
  const collections = data?.collections ?? []

  return (
    <DashboardLayout titleKey="masterCatalog">
      <div className="collections-hub master-catalog-page">
        <header className="collections-hub-hero">
          <div className="collections-hub-hero-copy">
            <p className="dash-label">
              {t('masterCatalog.kicker', { defaultValue: 'ACCESS FIRST. CREATE LATER.' })}
            </p>
            <h2>{t('masterCatalog.title', { defaultValue: 'Master Catalog' })}</h2>
            <p>
              {t('masterCatalog.subtitle', {
                defaultValue:
                  'Select products from the central catalog and add them to your Brand Room. Products are linked, not copied.',
              })}
            </p>
          </div>
          <div className="collections-hub-hero-aside">
            <div className="collections-hub-stats">
              <div>
                <strong>{products.length}</strong>
                <span>{t('masterCatalog.products', { defaultValue: 'Products' })}</span>
              </div>
              <div>
                <strong>{mine.length}</strong>
                <span>{t('masterCatalog.inBrandRoom', { defaultValue: 'In Brand Room' })}</span>
              </div>
              <div>
                <strong>{nav?.houses.length ?? 30}</strong>
                <span>{t('masterCatalog.houses', { defaultValue: 'Houses' })}</span>
              </div>
            </div>
            <Link to="/dashboard/brand" className="profile-btn-secondary">
              {t('masterCatalog.backBrand', { defaultValue: 'Brand Room catalog' })}
            </Link>
          </div>
        </header>

        <section className="master-filters">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('masterCatalog.search', { defaultValue: 'Search products…' })}
          />
          <select
            value={cluster}
            onChange={(e) => {
              setCluster(e.target.value)
              setHouse('')
            }}
          >
            <option value="">{t('masterCatalog.allClusters', { defaultValue: 'All clusters' })}</option>
            {(nav?.clusters ?? []).map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
          <select value={house} onChange={(e) => setHouse(e.target.value)}>
            <option value="">{t('masterCatalog.allHouses', { defaultValue: 'All houses' })}</option>
            {houses.map((h) => (
              <option key={h.key} value={h.key}>
                {h.label}
              </option>
            ))}
          </select>
          <select value={collectionId} onChange={(e) => setCollectionId(e.target.value)}>
            <option value="">{t('masterCatalog.allCollections', { defaultValue: 'All collections' })}</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </section>

        {nav && (
          <div className="master-house-chips">
            {houses.slice(0, 30).map((h) => (
              <button
                key={h.key}
                type="button"
                className={house === h.key ? 'is-on' : undefined}
                onClick={() => setHouse(house === h.key ? '' : h.key)}
              >
                {h.label}
              </button>
            ))}
          </div>
        )}

        {error && <p className="profile-msg profile-msg--err">{error}</p>}

        {isLoading ? (
          <p className="profile-muted">{t('common.loading')}</p>
        ) : products.length === 0 ? (
          <div className="collections-hub-empty">
            <span>★</span>
            <h3>{t('masterCatalog.empty', { defaultValue: 'No Master Catalog products yet' })}</h3>
            <p>
              {t('masterCatalog.emptyHint', {
                defaultValue: 'MERGE will publish products here. You can still create original designs later.',
              })}
            </p>
            <Link to="/dashboard/collections" className="gold-btn">
              {t('dashboard.nav.collections')}
            </Link>
          </div>
        ) : (
          <div className="collections-hub-grid">
            {products.map((item) => (
              <article key={item.id} className="collections-hub-card master-product-card">
                <div className="collections-hub-card-visual">
                  {item.imageUrl ? <img src={item.imageUrl} alt="" /> : <span>3D</span>}
                </div>
                <div className="master-product-body">
                  <h3>{item.title}</h3>
                  <p>
                    {[item.houseLabel, item.collectionTitle].filter(Boolean).join(' · ')}
                  </p>
                  {item.inBrandRoom ? (
                    <span className="master-in-room">
                      {t('masterCatalog.added', { defaultValue: 'In your Brand Room' })}
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="gold-btn w-full justify-center"
                      disabled={add.isPending}
                      onClick={() => add.mutate(item.id)}
                    >
                      {t('masterCatalog.add', { defaultValue: 'Add to Brand Room' })}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
