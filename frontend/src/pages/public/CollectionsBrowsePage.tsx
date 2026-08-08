import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import SiteLayout from '../../components/SiteLayout'
import Model3DViewer from '@/components/catalog/Model3DViewer'
import {
  catalogApi,
  catalogItemPublicImageUrl,
  catalogItemPublicModelUrl,
  type CatalogItem,
} from '@/features/catalog/api/catalog.api'
import { useAuthStore } from '@/features/auth/store/auth.store'

function PublicDesignCard({
  item,
  onOrder,
}: {
  item: CatalogItem
  onOrder: () => void
}) {
  const { t } = useTranslation()
  const modelUrl = catalogItemPublicModelUrl(item)
  const imageUrl = catalogItemPublicImageUrl(item)

  return (
    <article className="pub-design">
      <div className="pub-design-copy">
        <h3>{item.title}</h3>
        {item.metalType && <p className="pub-design-metal">{item.metalType}</p>}
        {item.description && <p className="pub-design-desc">{item.description}</p>}
        <button type="button" className="gold-btn pub-design-cta" onClick={onOrder}>
          {t('collections.orderWithDesign', { defaultValue: 'Order with this design' })}
        </button>
      </div>

      <div className="pub-design-preview">
        {modelUrl ? (
          <Model3DViewer
            modelUrl={modelUrl}
            emptyLabel={t('collections.preview3d', { defaultValue: '3D design preview' })}
            className="pub-design-viewer"
          />
        ) : imageUrl ? (
          <div className="pub-design-image-wrap">
            <img src={imageUrl} alt="" />
            <p className="pub-design-image-note">
              {t('collections.previewImage', { defaultValue: 'Design preview' })}
            </p>
          </div>
        ) : (
          <Model3DViewer
            modelUrl={null}
            emptyLabel={t('collections.preview3d', { defaultValue: '3D design preview' })}
            className="pub-design-viewer"
          />
        )}
      </div>
    </article>
  )
}

export default function CollectionsBrowsePage() {
  const { t } = useTranslation()
  const { slug } = useParams()
  const navigate = useNavigate()
  const accessToken = useAuthStore((s) => s.accessToken)

  const { data: list = [], isLoading: listLoading } = useQuery({
    queryKey: ['catalog-public'],
    queryFn: () => catalogApi.listPublic().then((r) => r.data.data),
    enabled: !slug,
  })

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['catalog-public', slug],
    queryFn: () => catalogApi.getPublic(slug!).then((r) => r.data.data),
    enabled: !!slug,
  })

  const onOrderWithDesign = (itemId: string) => {
    const target = `/apply?catalogItemId=${itemId}`
    if (!accessToken) {
      navigate(`/login?next=${encodeURIComponent(target)}`)
      return
    }
    navigate(target)
  }

  return (
    <SiteLayout>
      <div className="pub-catalog-page">
        {!slug ? (
          <>
            <header className="pub-catalog-hero">
              <p className="landing-sans-head">
                {t('collections.browseKicker', { defaultValue: 'COMMUNITY CATALOG' })}
              </p>
              <h1>{t('collections.browseTitle', { defaultValue: 'Public collections' })}</h1>
              <p>
                {t('collections.browseSubtitle', {
                  defaultValue: 'Explore catalogs created by MERGE STARS members.',
                })}
              </p>
            </header>

            {listLoading ? (
              <p className="pub-catalog-status">{t('common.loading')}</p>
            ) : list.length === 0 ? (
              <p className="pub-catalog-status">
                {t('collections.browseEmpty', { defaultValue: 'No public collections yet.' })}
              </p>
            ) : (
              <div className="pub-catalog-grid">
                {list.map((c) => {
                  const profileTo = c.mergeId
                    ? `/u/${encodeURIComponent(c.mergeId)}`
                    : c.brandLineId
                      ? `/b/${encodeURIComponent(c.brandLineId)}`
                      : null
                  const visual = c.logoUrl || c.avatarUrl
                  return (
                    <article key={c.id} className="pub-catalog-card">
                      <Link to={`/collections/${c.slug}`} className="pub-catalog-card-media">
                        {visual ? (
                          <img
                            src={visual}
                            alt=""
                            className={c.logoUrl ? 'is-logo' : 'is-avatar'}
                          />
                        ) : (
                          <span>{(c.brandName || c.ownerName || c.title).slice(0, 1).toUpperCase()}</span>
                        )}
                        {c.category && (
                          <em>{t(`landing.categories.${c.category}`, { defaultValue: c.category })}</em>
                        )}
                      </Link>
                      <div className="pub-catalog-card-body">
                        <Link to={`/collections/${c.slug}`} className="pub-catalog-card-title">
                          {c.title}
                        </Link>
                        {profileTo ? (
                          <Link to={profileTo} className="pub-catalog-card-owner">
                            {c.brandName?.trim() || c.ownerName}
                          </Link>
                        ) : (
                          <p className="pub-catalog-card-owner is-plain">{c.ownerName}</p>
                        )}
                        {c.description && <p className="pub-catalog-card-desc">{c.description}</p>}
                        <Link to={`/collections/${c.slug}`} className="pub-catalog-card-cta">
                          <span>
                            {c.itemCount} {t('collections.items', { defaultValue: 'items' })}
                          </span>
                          <strong>{t('collections.openCatalog', { defaultValue: 'Open catalog' })}</strong>
                        </Link>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </>
        ) : detailLoading || !detail ? (
          <p className="pub-catalog-status">{t('common.loading')}</p>
        ) : (
          <div className="pub-catalog-detail">
            <Link to="/collections" className="pub-catalog-back">
              ← {t('collections.browseTitle', { defaultValue: 'Public collections' })}
            </Link>
            <header className="pub-catalog-detail-hero">
              <div>
                <h1>{detail.title}</h1>
                <p className="pub-catalog-detail-owner">
                  {detail.mergeId || detail.brandLineId ? (
                    <Link
                      to={
                        detail.mergeId
                          ? `/u/${encodeURIComponent(detail.mergeId)}`
                          : `/b/${encodeURIComponent(detail.brandLineId!)}`
                      }
                    >
                      {detail.brandName?.trim() || detail.ownerName}
                    </Link>
                  ) : (
                    detail.ownerName
                  )}
                </p>
                {detail.description && <p className="pub-catalog-detail-desc">{detail.description}</p>}
              </div>
              <div className="pub-catalog-detail-meta">
                <strong>{detail.items.length}</strong>
                <span>{t('collections.designs', { defaultValue: 'Designs' })}</span>
              </div>
            </header>

            <div className="pub-design-list">
              {detail.items.map((item) => (
                <PublicDesignCard
                  key={item.id}
                  item={item}
                  onOrder={() => onOrderWithDesign(item.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  )
}
