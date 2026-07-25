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
      <div className="max-w-5xl mx-auto px-6 py-16">
        {!slug ? (
          <>
            <p className="landing-sans-head mb-3">
              {t('collections.browseKicker', { defaultValue: 'COMMUNITY CATALOG' })}
            </p>
            <h1 className="landing-section-title mb-4">
              {t('collections.browseTitle', { defaultValue: 'Public collections' })}
            </h1>
            <p className="landing-body mb-10 max-w-2xl">
              {t('collections.browseSubtitle', {
                defaultValue: 'Explore catalogs created by MERGE STARS members.',
              })}
            </p>
            {listLoading ? (
              <p className="text-neutral-500">{t('common.loading')}</p>
            ) : list.length === 0 ? (
              <p className="text-neutral-500">
                {t('collections.browseEmpty', { defaultValue: 'No public collections yet.' })}
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-5">
                {list.map((c) => (
                  <div key={c.id} className="gold-card p-6">
                    <Link to={`/collections/${c.slug}`} className="block no-underline hover:opacity-90">
                      <h2 className="text-lg font-bold text-white mb-2">{c.title}</h2>
                    </Link>
                    <p className="text-sm text-neutral-500 mb-3">
                      {c.mergeId || c.brandLineId ? (
                        <Link
                          to={
                            c.mergeId
                              ? `/u/${encodeURIComponent(c.mergeId)}`
                              : `/b/${encodeURIComponent(c.brandLineId!)}`
                          }
                          className="text-[#D4AF37] hover:underline no-underline"
                        >
                          {c.ownerName}
                        </Link>
                      ) : (
                        c.ownerName
                      )}
                    </p>
                    {c.description && (
                      <Link to={`/collections/${c.slug}`} className="block no-underline">
                        <p className="text-sm text-neutral-400 line-clamp-2 mb-4">{c.description}</p>
                      </Link>
                    )}
                    <Link to={`/collections/${c.slug}`} className="text-xs text-[#D4AF37] no-underline">
                      {c.itemCount} items →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : detailLoading || !detail ? (
          <p className="text-neutral-500">{t('common.loading')}</p>
        ) : (
          <>
            <Link to="/collections" className="text-sm text-neutral-500 hover:text-[#D4AF37] no-underline">
              ← {t('collections.browseTitle', { defaultValue: 'Public collections' })}
            </Link>
            <h1 className="landing-section-title mt-6 mb-2">{detail.title}</h1>
            <p className="text-sm text-[#D4AF37] mb-2">
              {detail.mergeId || detail.brandLineId ? (
                <Link
                  to={
                    detail.mergeId
                      ? `/u/${encodeURIComponent(detail.mergeId)}`
                      : `/b/${encodeURIComponent(detail.brandLineId!)}`
                  }
                  className="text-[#D4AF37] hover:underline no-underline"
                >
                  {detail.ownerName}
                </Link>
              ) : (
                detail.ownerName
              )}
            </p>
            {detail.description && <p className="landing-body mb-8">{detail.description}</p>}

            <div className="pub-design-list">
              {detail.items.map((item) => (
                <PublicDesignCard
                  key={item.id}
                  item={item}
                  onOrder={() => onOrderWithDesign(item.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </SiteLayout>
  )
}
