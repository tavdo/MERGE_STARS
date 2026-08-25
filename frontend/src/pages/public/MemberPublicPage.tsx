import { useEffect, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import SiteLayout from '../../components/SiteLayout'
import Model3DViewer from '@/components/catalog/Model3DViewer'
import { brandApi, type PublicBrandProduct } from '@/features/brand/api/brand.api'
import {
  catalogItemPublicImageUrl,
  catalogItemPublicModelUrl,
} from '@/features/catalog/api/catalog.api'
import { SOCIAL_LINK_KEYS, type SocialLinkKey } from '@/features/users/api/users.api'
import { useAuthStore } from '@/features/auth/store/auth.store'

type Props = {
  mode?: 'brand' | 'member'
}

const SOCIAL_LABELS: Record<SocialLinkKey, string> = {
  tiktok: 'TikTok',
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  whatsapp: 'WhatsApp',
  youtube: 'YouTube',
  x: 'X',
  telegram: 'Telegram',
  website: 'Website',
}

function BrandProductPreview({ item }: { item: PublicBrandProduct }) {
  const { t } = useTranslation()
  const modelUrl = catalogItemPublicModelUrl(item)
  const imageUrl = catalogItemPublicImageUrl(item)

  if (modelUrl) {
    return (
      <Model3DViewer
        modelUrl={modelUrl}
        emptyLabel={t('collections.preview3d', { defaultValue: '3D design preview' })}
        className="mp-product-viewer"
      />
    )
  }

  if (imageUrl) {
    return <img src={imageUrl} alt="" />
  }

  return (
    <div className="mp-product-placeholder">
      <span>{item.title.slice(0, 1).toUpperCase()}</span>
    </div>
  )
}

function socialEntries(links: Partial<Record<SocialLinkKey, string>> | undefined | null) {
  if (!links) return []
  return SOCIAL_LINK_KEYS.filter((k) => typeof links[k] === 'string' && links[k]!.trim()).map(
    (k) => ({ key: k, href: links[k]!.trim(), label: SOCIAL_LABELS[k] }),
  )
}

export default function MemberPublicPage({ mode = 'member' }: Props) {
  const { t } = useTranslation()
  const params = useParams()
  const id = (mode === 'brand' ? params.brandLineId : params.mergeId) ?? ''
  const navigate = useNavigate()
  const accessToken = useAuthStore((s) => s.accessToken)

  const { data: brand, isLoading, isError } = useQuery({
    queryKey: ['brand-public', id],
    queryFn: () => brandApi.getPublic(id).then((r) => r.data.data),
    enabled: !!id,
  })

  useEffect(() => {
    if (!id) return
    brandApi.trackPublicView(id).catch(() => {})
  }, [id])

  const onOrderWithDesign = (itemId: string) => {
    const target = `/apply?catalogItemId=${itemId}`
    if (!accessToken) {
      navigate(`/login?next=${encodeURIComponent(target)}`)
      return
    }
    navigate(target)
  }

  const owner = brand?.owner
  const personName = owner
    ? `${owner.firstName} ${owner.lastName}`.trim()
    : brand?.ownerName ?? ''
  const brandName = brand?.name?.trim() ?? ''
  const sameName =
    !!brandName && !!personName && brandName.toLowerCase() === personName.toLowerCase()
  const headline = sameName ? personName : brandName || personName
  const subline = !sameName && brandName && personName && brandName !== personName ? personName : null

  const heroImage = brand?.logoUrl || owner?.avatarUrl || null
  const heroIsAvatar = !brand?.logoUrl && !!owner?.avatarUrl
  const socials = useMemo(() => socialEntries(owner?.socialLinks), [owner?.socialLinks])

  const catalogCovers = useMemo(() => {
    if (!brand) return new Map<string, string>()
    const map = new Map<string, string>()
    for (const p of brand.products) {
      if (p.collectionSlug && p.imageUrl && !map.has(p.collectionSlug)) {
        map.set(p.collectionSlug, p.imageUrl)
      }
    }
    return map
  }, [brand])

  return (
    <SiteLayout>
      <div className="mp-page">
        <Link to="/brand-room" className="mp-back no-underline">
          ← {t('brandRoom.title', { defaultValue: 'Brand Room' })}
        </Link>

        {isLoading ? (
          <p className="text-neutral-500 mt-10">{t('common.loading')}</p>
        ) : isError || !brand ? (
          <div className="mt-10">
            <h1 className="landing-section-title">
              {t('brandPublic.notFound', { defaultValue: 'Profile not found' })}
            </h1>
          </div>
        ) : (
          <>
            <header className="mp-hero">
              <div className="mp-hero-main">
                <div
                  className={`mp-portrait ${heroIsAvatar ? 'mp-portrait--round' : ''}${
                    heroImage && !heroIsAvatar ? ' mp-portrait--fit' : ''
                  }`}
                >
                  {heroImage ? (
                    <img
                      src={heroImage}
                      alt=""
                      className={heroIsAvatar ? 'object-cover' : 'object-contain'}
                    />
                  ) : (
                    <span>{(headline || 'M').slice(0, 1).toUpperCase()}</span>
                  )}
                </div>

                <div className="mp-hero-copy">
                  <p className="landing-sans-head mb-2">
                    {t('brandPublic.kicker', { defaultValue: 'BRAND PROFILE' })}
                  </p>
                  <h1 className="mp-name">{headline}</h1>
                  {subline && <p className="mp-subname">{subline}</p>}

                  <div className="mp-ids">
                    {brand.brandLineId && <span>{brand.brandLineId}</span>}
                    <span>{brand.mergeId}</span>
                  </div>

                  {brand.description?.trim() ? (
                    <p className="mp-desc">{brand.description}</p>
                  ) : null}

                  <Link
                    to={`/fill-coin?source=${encodeURIComponent(brand.brandLineId || brand.mergeId)}`}
                    className="gold-btn mp-fill-coin-cta no-underline"
                  >
                    {t('configurator.fillCoinCta', { defaultValue: 'Fill your MERGE Coin' })}
                  </Link>

                  {socials.length > 0 ? (
                    <nav className="mp-socials" aria-label={t('brandPublic.socialLinks', { defaultValue: 'Social links' })}>
                      {socials.map((s) => (
                        <a
                          key={s.key}
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mp-social-link"
                        >
                          {t(`pages.profile.social.${s.key}`, { defaultValue: s.label })}
                        </a>
                      ))}
                    </nav>
                  ) : null}

                  <div className="mp-stats">
                    <div>
                      <strong>{brand.profileViews}</strong>
                      <span>{t('brandRoom.statViews', { defaultValue: 'views' })}</span>
                    </div>
                    <div>
                      <strong>{brand.collections.length}</strong>
                      <span>{t('brandRoom.statCatalogs', { defaultValue: 'catalogs' })}</span>
                    </div>
                    <div>
                      <strong>{brand.activeProducts}</strong>
                      <span>{t('brandRoom.statProducts', { defaultValue: 'designs' })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            <section className="mp-section">
              <div className="mp-section-head">
                <h2>{t('brandPublic.collections', { defaultValue: 'Catalogs' })}</h2>
              </div>
              {brand.collections.length === 0 ? (
                <p className="mp-empty">
                  {t('brandPublic.noCollections', { defaultValue: 'No public catalogs yet.' })}
                </p>
              ) : (
                <div className="mp-catalog-grid">
                  {brand.collections.map((c) => {
                    const cover = catalogCovers.get(c.slug)
                    return (
                      <Link key={c.id} to={`/collections/${c.slug}`} className="mp-catalog no-underline">
                        <div className="mp-catalog-media">
                          {cover ? (
                            <img src={cover} alt="" />
                          ) : (
                            <div className="mp-catalog-placeholder">
                              <span>{c.title.slice(0, 1).toUpperCase()}</span>
                            </div>
                          )}
                        </div>
                        <div className="mp-catalog-meta">
                          <h3>{c.title}</h3>
                          {c.description?.trim() ? (
                            <p className="line-clamp-2">{c.description}</p>
                          ) : null}
                          <span>
                            {c.itemCount} {t('brandRoom.statProducts', { defaultValue: 'designs' })}
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </section>

            <section className="mp-section">
              <div className="mp-section-head">
                <h2>{t('brandRoom.productsTitle', { defaultValue: 'Designs' })}</h2>
              </div>
              {brand.products.length === 0 ? (
                <p className="mp-empty">
                  {t('brandRoom.noProducts', { defaultValue: 'No public designs yet.' })}
                </p>
              ) : (
                <div className="mp-product-grid">
                  {brand.products.map((item) => (
                    <article key={item.id} className="mp-product">
                      <div className="mp-product-media">
                        <BrandProductPreview item={item} />
                      </div>
                      <div className="mp-product-body">
                        <h3>{item.title}</h3>
                        <div className="mp-product-tags">
                          {item.metalType && <span>{item.metalType}</span>}
                          {item.collectionTitle && <span>{item.collectionTitle}</span>}
                        </div>
                        {item.description?.trim() ? (
                          <p className="line-clamp-2">{item.description}</p>
                        ) : null}
                        <button
                          type="button"
                          className="gold-btn w-full justify-center mt-3"
                          onClick={() => onOrderWithDesign(item.id)}
                        >
                          {t('collections.orderWithDesign', { defaultValue: 'Order with this design' })}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </SiteLayout>
  )
}
