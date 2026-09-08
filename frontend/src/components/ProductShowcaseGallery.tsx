import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  SHOWCASE_IMAGES,
  SHOWCASE_ITEM_IDS,
  type ShowcaseItemId,
} from '@/assets/productShowcase'

type Layout = 'grid' | 'mosaic' | 'strip' | 'banner'

type Props = {
  layout?: Layout
  items?: ShowcaseItemId[]
  showHeader?: boolean
  showCta?: boolean
  className?: string
}

function ShowcaseCard({
  id,
  featured,
}: {
  id: ShowcaseItemId
  featured?: boolean
}) {
  const { t } = useTranslation()
  const title = t(`productShowcase.items.${id}.title`)
  const body = t(`productShowcase.items.${id}.body`)

  return (
    <article className={`ps-card${featured ? ' ps-card--featured' : ''}`}>
      <div className="ps-card-media">
        <img src={SHOWCASE_IMAGES[id]} alt={title} loading="lazy" decoding="async" />
      </div>
      <div className="ps-card-copy">
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
    </article>
  )
}

export default function ProductShowcaseGallery({
  layout = 'grid',
  items = SHOWCASE_ITEM_IDS,
  showHeader = true,
  showCta = false,
  className = '',
}: Props) {
  const { t } = useTranslation()

  const header = showHeader ? (
    <header className="ps-head">
      <p className="ps-kicker">{t('productShowcase.kicker')}</p>
      <h2 className="ps-title">
        {t('productShowcase.title')}{' '}
        <span className="gold-text">{t('productShowcase.titleGold')}</span>
      </h2>
      <p className="ps-lead">{t('productShowcase.lead')}</p>
      <p className="ps-tagline">{t('productShowcase.tagline')}</p>
    </header>
  ) : null

  const cta = showCta ? (
    <div className="ps-cta">
      <Link to="/merge-coin" className="luxury-btn-glass">
        {t('productShowcase.cta')}
      </Link>
    </div>
  ) : null

  if (layout === 'banner') {
    const bannerItems = items.slice(0, 3)
    return (
      <section className={`ps-section ps-banner ${className}`.trim()} aria-label={t('productShowcase.kicker')}>
        <div className="ps-banner-inner ld-glass">
          <div className="ps-banner-copy">
            <p className="ps-kicker">{t('productShowcase.kicker')}</p>
            <h2 className="ps-banner-title">{t('productShowcase.tagline')}</h2>
            <p className="ps-banner-body">{t('productShowcase.bannerBody')}</p>
          </div>
          <div className="ps-banner-media">
            {bannerItems.map((id) => (
              <img key={id} src={SHOWCASE_IMAGES[id]} alt={t(`productShowcase.items.${id}.title`)} loading="lazy" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (layout === 'mosaic') {
    const [hero, ...rest] = items
    return (
      <section className={`ps-section ps-mosaic ${className}`.trim()}>
        {header}
        <div className="ps-mosaic-grid">
          {hero && <ShowcaseCard id={hero} featured />}
          <div className="ps-mosaic-side">
            {rest.map((id) => (
              <ShowcaseCard key={id} id={id} />
            ))}
          </div>
        </div>
        {cta}
      </section>
    )
  }

  if (layout === 'strip') {
    return (
      <section className={`ps-section ps-strip ${className}`.trim()}>
        {header}
        <div className="ps-strip-track">
          {items.map((id) => (
            <ShowcaseCard key={id} id={id} />
          ))}
        </div>
        {cta}
      </section>
    )
  }

  return (
    <section className={`ps-section ps-grid-wrap ${className}`.trim()}>
      {header}
      <div className="ps-grid">
        {items.map((id) => (
          <ShowcaseCard key={id} id={id} />
        ))}
      </div>
      {cta}
    </section>
  )
}
