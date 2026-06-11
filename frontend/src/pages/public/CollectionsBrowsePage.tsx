import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import SiteLayout from '../../components/SiteLayout'
import { catalogApi } from '@/features/catalog/api/catalog.api'

export default function CollectionsBrowsePage() {
  const { t } = useTranslation()
  const { slug } = useParams()

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

  return (
    <SiteLayout>
      <div className="max-w-5xl mx-auto px-6 py-16">
        {!slug ? (
          <>
            <p className="landing-sans-head mb-3">{t('collections.browseKicker', { defaultValue: 'COMMUNITY CATALOG' })}</p>
            <h1 className="landing-section-title mb-4">{t('collections.browseTitle', { defaultValue: 'Public collections' })}</h1>
            <p className="landing-body mb-10 max-w-2xl">
              {t('collections.browseSubtitle', { defaultValue: 'Explore catalogs created by MERGE STARS members.' })}
            </p>
            {listLoading ? (
              <p className="text-neutral-500">Loading…</p>
            ) : list.length === 0 ? (
              <p className="text-neutral-500">{t('collections.browseEmpty', { defaultValue: 'No public collections yet.' })}</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-5">
                {list.map((c) => (
                  <Link
                    key={c.id}
                    to={`/collections/${c.slug}`}
                    className="gold-card p-6 block no-underline hover:border-[#D4AF37]/40 transition-colors"
                  >
                    <h2 className="text-lg font-bold text-white mb-2">{c.title}</h2>
                    <p className="text-sm text-neutral-500 mb-3">{c.ownerName}</p>
                    {c.description && <p className="text-sm text-neutral-400 line-clamp-2 mb-4">{c.description}</p>}
                    <span className="text-xs text-[#D4AF37]">{c.itemCount} items →</span>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : detailLoading || !detail ? (
          <p className="text-neutral-500">Loading…</p>
        ) : (
          <>
            <Link to="/collections" className="text-sm text-neutral-500 hover:text-[#D4AF37] no-underline">
              ← {t('collections.browseTitle', { defaultValue: 'Public collections' })}
            </Link>
            <h1 className="landing-section-title mt-6 mb-2">{detail.title}</h1>
            <p className="text-sm text-[#D4AF37] mb-2">{detail.ownerName}</p>
            {detail.description && <p className="landing-body mb-10">{detail.description}</p>}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {detail.items.map((item) => (
                <article key={item.id} className="gold-card p-4">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt="" className="w-full h-40 object-cover rounded mb-3" />
                  )}
                  <h3 className="font-bold text-white">{item.title}</h3>
                  {item.metalType && <p className="text-xs text-[#D4AF37] mt-1">{item.metalType}</p>}
                  {item.description && <p className="text-sm text-neutral-500 mt-2">{item.description}</p>}
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </SiteLayout>
  )
}
