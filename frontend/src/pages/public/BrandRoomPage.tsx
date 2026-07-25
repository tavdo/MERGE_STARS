import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import SiteLayout from '../../components/SiteLayout'
import CategoryExploreGrid from '@/components/CategoryExploreGrid'
import { brandApi, type BrandRoomCard } from '@/features/brand/api/brand.api'
import { catalogApi } from '@/features/catalog/api/catalog.api'
import { isCatalogCategory, type CatalogCategory } from '@/shared/catalogCategories'

function brandVisual(b: BrandRoomCard) {
  if (b.logoUrl) return { src: b.logoUrl, cover: false }
  if (b.avatarUrl) return { src: b.avatarUrl, cover: true }
  return null
}

function BrandTile({ b }: { b: BrandRoomCard }) {
  const { t } = useTranslation()
  const profileTo = `/u/${encodeURIComponent(b.mergeId)}`
  const visual = brandVisual(b)
  const title = b.name?.trim() || b.ownerName
  const showOwner = b.ownerName && b.ownerName.toLowerCase() !== title.toLowerCase()
  const cover = b.previewProducts.find((p) => p.imageUrl)?.imageUrl
  const hasContent = b.collectionCount > 0 || b.activeProducts > 0

  return (
    <Link to={profileTo} className="br-tile no-underline group">
      <div className="br-tile-media">
        {cover ? (
          <img src={cover} alt="" className="br-tile-cover" />
        ) : (
          <div className="br-tile-cover br-tile-cover--empty" />
        )}
        <div className="br-tile-avatar">
          {visual ? (
            <img src={visual.src} alt="" className={visual.cover ? 'object-cover' : 'object-contain p-1.5'} />
          ) : (
            <span>{title.slice(0, 1).toUpperCase()}</span>
          )}
        </div>
      </div>

      <div className="br-tile-body">
        <h2 className="br-tile-title">{title}</h2>
        {showOwner && <p className="br-tile-owner">{b.ownerName}</p>}
        {b.brandLineId && <p className="br-tile-id">{b.brandLineId}</p>}

        <div className="br-tile-stats">
          <span>
            {b.collectionCount} {t('brandRoom.statCatalogs', { defaultValue: 'catalogs' })}
          </span>
          <span className="br-dot" aria-hidden>
            ·
          </span>
          <span>
            {b.activeProducts} {t('brandRoom.statProducts', { defaultValue: 'designs' })}
          </span>
          <span className="br-dot" aria-hidden>
            ·
          </span>
          <span>
            {b.profileViews} {t('brandRoom.statViews', { defaultValue: 'views' })}
          </span>
        </div>

        {hasContent && b.collections[0] && (
          <p className="br-tile-catalog">
            {b.collections[0].title}
            {b.collections.length > 1 ? ` +${b.collections.length - 1}` : ''}
          </p>
        )}

        <span className="br-tile-cta">
          {t('brandRoom.viewProfile', { defaultValue: 'Open profile' })}
        </span>
      </div>
    </Link>
  )
}

export default function BrandRoomPage() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const raw = params.get('category')
  const activeCategory: CatalogCategory | null = isCatalogCategory(raw) ? raw : null

  const setCategory = (key: CatalogCategory | null) => {
    const next = new URLSearchParams(params)
    if (key) next.set('category', key)
    else next.delete('category')
    setParams(next, { replace: true })
  }

  const { data: stats = [] } = useQuery({
    queryKey: ['catalog-category-stats'],
    queryFn: () => catalogApi.categoryStats().then((r) => r.data.data),
  })

  const counts = Object.fromEntries(stats.map((s) => [s.key, s.count])) as Partial<
    Record<CatalogCategory, number>
  >

  const { data: brands = [], isLoading: brandsLoading } = useQuery({
    queryKey: ['brand-room'],
    queryFn: () => brandApi.listPublic().then((r) => r.data.data),
    enabled: !activeCategory,
  })

  const { data: catalogs = [], isLoading: catalogsLoading } = useQuery({
    queryKey: ['catalog-public', activeCategory],
    queryFn: () => catalogApi.listPublic(activeCategory!).then((r) => r.data.data),
    enabled: !!activeCategory,
  })

  const featured = brands.filter((b) => b.collectionCount > 0 || b.activeProducts > 0)
  const directory = brands.filter((b) => b.collectionCount === 0 && b.activeProducts === 0)
  const isLoading = activeCategory ? catalogsLoading : brandsLoading

  return (
    <SiteLayout>
      <div className="br-page">
        <header className="br-hero">
          <p className="landing-sans-head mb-3">{t('brandRoom.kicker', { defaultValue: 'BRAND ROOM' })}</p>
          <h1 className="br-hero-title">{t('brandRoom.title', { defaultValue: 'Brand Room' })}</h1>
          <p className="br-hero-sub">
            {t('brandRoom.subtitle', {
              defaultValue: 'Explore by category, then open brands, catalogs, and designs.',
            })}
          </p>
        </header>

        <CategoryExploreGrid active={activeCategory} counts={counts} onSelect={setCategory} />

        {activeCategory && (
          <div className="br-filter-bar">
            <p>
              {t('brandRoom.filteredBy', { defaultValue: 'Category' })}:{' '}
              <strong>{t(`landing.categories.${activeCategory}`)}</strong>
            </p>
            <button type="button" onClick={() => setCategory(null)}>
              {t('brandRoom.clearFilter', { defaultValue: 'Show all brands' })}
            </button>
          </div>
        )}

        {isLoading ? (
          <p className="text-neutral-500">{t('common.loading')}</p>
        ) : activeCategory ? (
          catalogs.length === 0 ? (
            <p className="text-neutral-500">
              {t('brandRoom.emptyCategory', {
                defaultValue: 'No public catalogs in this category yet.',
              })}
            </p>
          ) : (
            <section className="br-section">
              <div className="br-catalog-grid">
                {catalogs.map((c) => {
                  const brandVisual = c.logoUrl
                    ? { src: c.logoUrl, cover: false }
                    : c.avatarUrl
                      ? { src: c.avatarUrl, cover: true }
                      : null
                  const brandLabel =
                    c.brandName?.trim() || c.ownerName || c.title.slice(0, 1)
                  return (
                    <article key={c.id} className="br-catalog-card">
                      <Link
                        to={
                          c.mergeId
                            ? `/u/${encodeURIComponent(c.mergeId)}`
                            : `/collections/${c.slug}`
                        }
                        className="br-catalog-logo no-underline"
                        aria-label={brandLabel}
                      >
                        {brandVisual ? (
                          <img
                            src={brandVisual.src}
                            alt=""
                            className={brandVisual.cover ? 'object-cover' : 'object-contain p-1.5'}
                          />
                        ) : (
                          <span>{brandLabel.slice(0, 1).toUpperCase()}</span>
                        )}
                      </Link>
                      <div className="br-catalog-body">
                        <Link to={`/collections/${c.slug}`} className="no-underline">
                          <h3>{c.title}</h3>
                        </Link>
                        {c.ownerName && (
                          <p>
                            {c.mergeId ? (
                              <Link
                                to={`/u/${encodeURIComponent(c.mergeId)}`}
                                className="text-[#D4AF37] no-underline hover:underline"
                              >
                                {c.ownerName}
                              </Link>
                            ) : (
                              c.ownerName
                            )}
                          </p>
                        )}
                        {c.description && (
                          <p className="br-catalog-desc line-clamp-2">{c.description}</p>
                        )}
                        <Link
                          to={`/collections/${c.slug}`}
                          className="br-catalog-meta no-underline"
                        >
                          {c.itemCount}{' '}
                          {t('brandRoom.statProducts', { defaultValue: 'designs' })} →
                        </Link>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          )
        ) : brands.length === 0 ? (
          <p className="text-neutral-500">
            {t('brandRoom.empty', { defaultValue: 'No public brands yet.' })}
          </p>
        ) : (
          <>
            {featured.length > 0 && (
              <section className="br-section">
                <div className="br-grid">
                  {featured.map((b) => (
                    <BrandTile key={b.mergeId} b={b} />
                  ))}
                </div>
              </section>
            )}

            {directory.length > 0 && (
              <section className="br-section br-section--dir">
                <h2 className="br-section-label">
                  {t('brandRoom.directory', { defaultValue: 'Members' })}
                </h2>
                <div className="br-dir">
                  {directory.map((b) => {
                    const visual = brandVisual(b)
                    const title = b.name?.trim() || b.ownerName
                    return (
                      <Link
                        key={b.mergeId}
                        to={`/u/${encodeURIComponent(b.mergeId)}`}
                        className="br-dir-row no-underline"
                      >
                        <div className="br-dir-avatar">
                          {visual ? (
                            <img
                              src={visual.src}
                              alt=""
                              className={visual.cover ? 'object-cover' : 'object-contain p-1'}
                            />
                          ) : (
                            <span>{title.slice(0, 1).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="br-dir-name">{title}</p>
                          {b.brandLineId && <p className="br-dir-id">{b.brandLineId}</p>}
                        </div>
                        <span className="br-dir-meta">
                          {b.profileViews} {t('brandRoom.statViews', { defaultValue: 'views' })}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </SiteLayout>
  )
}
