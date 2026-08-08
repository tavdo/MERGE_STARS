import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import SiteLayout from '../../components/SiteLayout'
import BrandIcon from '@/components/BrandIcon'
import { CATEGORY_ICONS, type CategoryIconKey } from '@/assets/brandIcons'
import { brandApi, type BrandRoomCard } from '@/features/brand/api/brand.api'
import { catalogApi } from '@/features/catalog/api/catalog.api'
import { CATALOG_CATEGORIES, isCatalogCategory, type CatalogCategory } from '@/shared/catalogCategories'

function brandVisual(b: BrandRoomCard) {
  if (b.logoUrl) return { src: b.logoUrl, cover: false }
  if (b.avatarUrl) return { src: b.avatarUrl, cover: true }
  return null
}

function coverOf(b: BrandRoomCard) {
  return b.previewProducts.find((p) => p.imageUrl)?.imageUrl ?? null
}

function SafeImg({
  src,
  alt = '',
  className,
}: {
  src: string
  alt?: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />
}

function AvatarMark({
  visual,
  title,
  className,
}: {
  visual: { src: string; cover: boolean } | null
  title: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const showImg = visual && !failed

  return (
    <div className={className ?? 'br-avatar'}>
      {showImg ? (
        <img
          src={visual.src}
          alt=""
          className={visual.cover ? 'object-cover' : 'object-contain p-1.5'}
          onError={() => setFailed(true)}
        />
      ) : (
        <span>{title.slice(0, 1).toUpperCase()}</span>
      )}
    </div>
  )
}

function BrandPanel({ b, featured }: { b: BrandRoomCard; featured?: boolean }) {
  const { t } = useTranslation()
  const profileTo = `/u/${encodeURIComponent(b.mergeId)}`
  const visual = brandVisual(b)
  const title = b.name?.trim() || b.ownerName
  const cover = coverOf(b)
  const catalog = b.collections[0]

  return (
    <Link
      to={profileTo}
      className={`br-panel no-underline${featured ? ' br-panel--featured' : ''}`}
    >
      <div className="br-panel-visual">
        {cover ? (
          <SafeImg src={cover} className="br-panel-cover" />
        ) : (
          <div className="br-panel-cover br-panel-cover--empty" aria-hidden />
        )}
        <div className="br-panel-veil" aria-hidden />
      </div>

      <div className="br-panel-meta">
        <AvatarMark visual={visual} title={title} className="br-panel-avatar" />
        <div className="br-panel-copy">
          <h2>{title}</h2>
          {b.brandLineId && <p className="br-panel-id">{b.brandLineId}</p>}
          <p className="br-panel-stats">
            <span>
              {t('brandRoom.statCatalogsCount', {
                count: b.collectionCount,
                defaultValue: '{{count}} catalogs',
              })}
            </span>
            <span aria-hidden>·</span>
            <span>
              {t('brandRoom.statDesignsCount', {
                count: b.activeProducts,
                defaultValue: '{{count}} designs',
              })}
            </span>
            <span aria-hidden>·</span>
            <span>
              {t('brandRoom.statViewsCount', {
                count: b.profileViews,
                defaultValue: '{{count}} views',
              })}
            </span>
          </p>
          {catalog && (
            <p className="br-panel-catalog">
              {catalog.title}
              {b.collections.length > 1 ? ` +${b.collections.length - 1}` : ''}
            </p>
          )}
        </div>
        <span className="br-panel-cta">
          {t('brandRoom.viewProfile', { defaultValue: 'Open profile' })}
        </span>
      </div>
    </Link>
  )
}

function CategoryStrip({
  active,
  counts,
  onSelect,
}: {
  active: CatalogCategory | null
  counts: Partial<Record<CatalogCategory, number>>
  onSelect: (key: CatalogCategory | null) => void
}) {
  const { t } = useTranslation()

  return (
    <nav className="br-cats" aria-label={t('landing.categoriesTitle')}>
      <button
        type="button"
        className={`br-cat${active === null ? ' is-active' : ''}`}
        onClick={() => onSelect(null)}
      >
        <span>{t('brandRoom.allBrands', { defaultValue: 'All brands' })}</span>
      </button>
      {CATALOG_CATEGORIES.map((key) => {
        const count = counts[key] ?? 0
        return (
          <button
            key={key}
            type="button"
            className={`br-cat${active === key ? ' is-active' : ''}`}
            onClick={() => onSelect(active === key ? null : key)}
          >
            <BrandIcon src={CATEGORY_ICONS[key as CategoryIconKey]} className="br-cat-icon" />
            <span>{t(`landing.categories.${key}`)}</span>
            <em>{count}</em>
          </button>
        )
      })}
    </nav>
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
  const spotlight = featured[0]
  const restFeatured = featured.slice(1)
  const isLoading = activeCategory ? catalogsLoading : brandsLoading
  const totalDesigns = featured.reduce((n, b) => n + b.activeProducts, 0)

  return (
    <SiteLayout>
      <div className="br-page">
        <header className="br-hero">
          <div className="br-hero-atmosphere" aria-hidden />
          <div className="br-hero-inner">
            <p className="br-hero-brand">MERGE STARS</p>
            <h1 className="br-hero-title">{t('brandRoom.title', { defaultValue: 'Brand Room' })}</h1>
            <p className="br-hero-sub">
              {t('brandRoom.subtitle', {
                defaultValue: 'Discover makers, open catalogs, and explore designs.',
              })}
            </p>
            <div className="br-hero-actions">
              <a href="#br-directory" className="br-hero-cta">
                {t('brandRoom.browseCta', { defaultValue: 'Browse brands' })}
              </a>
              <Link to="/apply" className="br-hero-link">
                {t('brandRoom.joinCta', { defaultValue: 'Join Brand Room' })}
              </Link>
            </div>
            {!activeCategory && featured.length > 0 && (
              <p className="br-hero-pulse">
                {t('brandRoom.livePulse', {
                  defaultValue: '{{brands}} brands · {{designs}} public designs',
                  brands: featured.length,
                  designs: totalDesigns,
                })}
              </p>
            )}
          </div>
        </header>

        <CategoryStrip active={activeCategory} counts={counts} onSelect={setCategory} />

        <div id="br-directory" className="br-body">
          {isLoading ? (
            <p className="br-empty">{t('common.loading')}</p>
          ) : activeCategory ? (
            catalogs.length === 0 ? (
              <p className="br-empty">
                {t('brandRoom.emptyCategory', {
                  defaultValue: 'No public catalogs in this category yet.',
                })}
              </p>
            ) : (
              <section className="br-section">
                <div className="br-section-head">
                  <h2>
                    {t(`landing.categories.${activeCategory}`)}
                  </h2>
                  <button type="button" className="br-clear" onClick={() => setCategory(null)}>
                    {t('brandRoom.clearFilter', { defaultValue: 'Show all brands' })}
                  </button>
                </div>
                <div className="br-catalog-grid">
                  {catalogs.map((c) => {
                    const logo = c.logoUrl
                      ? { src: c.logoUrl, cover: false }
                      : c.avatarUrl
                        ? { src: c.avatarUrl, cover: true }
                        : null
                    const brandLabel = c.brandName?.trim() || c.ownerName || c.title.slice(0, 1)
                    return (
                      <article key={c.id} className="br-catalog">
                        <Link
                          to={
                            c.mergeId
                              ? `/u/${encodeURIComponent(c.mergeId)}`
                              : `/collections/${c.slug}`
                          }
                          className="br-catalog-logo no-underline"
                          aria-label={brandLabel}
                        >
                          <AvatarMark visual={logo} title={brandLabel} className="br-catalog-avatar" />
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
                                  className="br-catalog-owner no-underline"
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
                          <Link to={`/collections/${c.slug}`} className="br-catalog-meta no-underline">
                            {t('brandRoom.statDesignsCount', {
                              count: c.itemCount,
                              defaultValue: '{{count}} designs',
                            })}{' '}
                            →
                          </Link>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>
            )
          ) : brands.length === 0 ? (
            <p className="br-empty">
              {t('brandRoom.empty', { defaultValue: 'No public brands yet.' })}
            </p>
          ) : (
            <>
              {spotlight && (
                <section className="br-section br-section--spotlight">
                  <BrandPanel b={spotlight} featured />
                </section>
              )}

              {restFeatured.length > 0 && (
                <section className="br-section">
                  <div className="br-section-head">
                    <h2>{t('brandRoom.featured', { defaultValue: 'Active brands' })}</h2>
                    <span>{restFeatured.length}</span>
                  </div>
                  <div className="br-mosaic">
                    {restFeatured.map((b) => (
                      <BrandPanel key={b.mergeId} b={b} />
                    ))}
                  </div>
                </section>
              )}

              {directory.length > 0 && (
                <section className="br-section">
                  <div className="br-section-head">
                    <h2>{t('brandRoom.directory', { defaultValue: 'Members' })}</h2>
                    <span>{directory.length}</span>
                  </div>
                  <div className="br-members">
                    {directory.map((b) => {
                      const visual = brandVisual(b)
                      const title = b.name?.trim() || b.ownerName
                      return (
                        <Link
                          key={b.mergeId}
                          to={`/u/${encodeURIComponent(b.mergeId)}`}
                          className="br-member no-underline"
                        >
                          <AvatarMark visual={visual} title={title} className="br-member-avatar" />
                          <div className="br-member-copy">
                            <p className="br-member-name">{title}</p>
                            {b.brandLineId && <p className="br-member-id">{b.brandLineId}</p>}
                          </div>
                          <span className="br-member-meta">
                            {t('brandRoom.statViewsCount', {
                              count: b.profileViews,
                              defaultValue: '{{count}} views',
                            })}
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
      </div>
    </SiteLayout>
  )
}
