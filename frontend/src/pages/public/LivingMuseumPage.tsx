import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SiteLayout from '../../components/SiteLayout'
import { MuseumShowcaseLightbox } from '../../components/MuseumShowcaseLightbox'
import { IconPreciousMetals } from '../../components/LandingFeatureIcons'
import { useLiveMetalPrices } from '@/features/coins/hooks/useLiveMetalPrice'
import {
  MUSEUM_CATEGORY_IMAGES,
  MUSEUM_HERO_SHOWCASE,
  MUSEUM_SECTION_IMAGES,
  MUSEUM_SHOWCASE_EXHIBITS,
  type MuseumCategoryKey,
  type MuseumShowcaseKey,
} from '@/assets/museumAssets'

type MeasurementGroup = { title: string; items: string[] }
type MuseumCategory = { key: string; desc: string; to?: string }
type FitExample = { type: string; line: string }
type CreationHighlight = { title: string; desc: string }
type ScaleTier = { name: string; desc: string }
type PipelineStep = { label: string }
type FlowStep = { label: string }
type LayerItem = { label: string }
type RoomItem = { name: string; desc: string }
type VersionField = { label: string }

const MUSEUM_CATEGORY_LINKS: Record<string, string> = {
  fashion: '/brand-room?category=accessories',
  watchesJewelry: '/brand-room?category=jewelry',
  eyewear: '/brand-room?category=accessories',
  furniture: '/brand-room?category=construction',
  automotive: '/brand-room?category=more',
  coinMuseum: '/merge-coin',
}

const METAL_KEYS = [
  { metal: 'silver', nameKey: 'landing.metalSilver' },
  { metal: 'gold', nameKey: 'landing.metalGold' },
] as const

function formatUsd(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function LivingMuseumPage() {
  const { t } = useTranslation()
  const metals = useLiveMetalPrices()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)
  const showPrev = () =>
    setLightboxIndex((i) =>
      i === null ? null : (i - 1 + MUSEUM_SHOWCASE_EXHIBITS.length) % MUSEUM_SHOWCASE_EXHIBITS.length,
    )
  const showNext = () =>
    setLightboxIndex((i) => (i === null ? null : (i + 1) % MUSEUM_SHOWCASE_EXHIBITS.length))

  const activeExhibit = lightboxIndex !== null ? MUSEUM_SHOWCASE_EXHIBITS[lightboxIndex] : null
  const activeKey = activeExhibit?.key as MuseumShowcaseKey | undefined

  const archLayers = t('museum.architecture.layers', { returnObjects: true }) as LayerItem[]
  const brandSteps = t('museum.brandHouse.steps', { returnObjects: true }) as FlowStep[]
  const rooms = t('museum.rooms.list', { returnObjects: true }) as RoomItem[]
  const roomFlow = t('museum.rooms.flow', { returnObjects: true }) as FlowStep[]
  const roomStyles = t('museum.rooms.styles', { returnObjects: true }) as string[]
  const measurementGroups = t('museum.identity.measurements', { returnObjects: true }) as MeasurementGroup[]
  const categories = t('museum.exhibits.categories', { returnObjects: true }) as MuseumCategory[]
  const experiencePrinciples = t('museum.experience.principles', { returnObjects: true }) as string[]
  const experienceAvoid = t('museum.experience.avoid', { returnObjects: true }) as string[]
  const flowSteps = t('museum.personalization.flow', { returnObjects: true }) as FlowStep[]
  const fitExamples = t('museum.personalization.fitExamples', { returnObjects: true }) as FitExample[]
  const creationHighlights = t('museum.creation.highlights', { returnObjects: true }) as CreationHighlight[]
  const versionFields = t('museum.creation.versionFields', { returnObjects: true }) as VersionField[]
  const scaleTiers = t('museum.designLanguage.tiers', { returnObjects: true }) as ScaleTier[]
  const mosaicShapes = t('museum.designLanguage.shapes', { returnObjects: true }) as string[]
  const pipelineSteps = t('museum.intelligence.pipeline', { returnObjects: true }) as PipelineStep[]
  const aiRoles = t('museum.intelligence.aiRoles', { returnObjects: true }) as string[]
  const aiPrompts = t('museum.intelligence.aiPrompts', { returnObjects: true }) as string[]
  const physicalFlow = t('museum.physical.flow', { returnObjects: true }) as FlowStep[]
  const collectionItems = t('museum.collection.items', { returnObjects: true }) as string[]
  const journeySteps = t('museum.journey.steps', { returnObjects: true }) as FlowStep[]

  const metalCards = METAL_KEYS.map(({ metal, nameKey }) => {
    const live = metals?.find((m) => m.metal === metal)
    const pricePerKgUsd = live?.pricePerKgUsd ?? 0
    const changePct = live?.changePct ?? 0
    return { nameKey, pricePerKgUsd, changePct, up: changePct >= 0 }
  })

  return (
    <SiteLayout>
      <div className="mus-page-wrap">
        <div className="mus-atmosphere" aria-hidden />

        <div className="mus-page max-w-1440 mx-auto w-full">
          {/* Hero */}
          <header className="mus-intro mus-intro--split">
            <div className="mus-intro-copy">
              <p className="mus-kicker">{t('museum.kicker')}</p>
              <p className="mus-subtitle">{t('museum.subtitle')}</p>
              <h1 className="mus-title">
                {t('museum.title')}
                <span className="mus-title-gold">{t('museum.titleGold')}</span>
              </h1>
              <p className="mus-tagline">{t('museum.tagline')}</p>
              <p className="mus-lead">{t('museum.lead')}</p>
              <div className="mus-hero-actions">
                <a href="/living-museum-experience/" className="gold-btn">
                  {t('museum.ctaEnterExperience')}
                </a>
                <Link to="/login?tab=register" className="luxury-btn-ghost">
                  {t('museum.ctaRegister')}
                </Link>
                <Link to="/how-it-works" className="luxury-btn-ghost">
                  {t('museum.ctaHowItWorks')}
                </Link>
                <a href="#mus-showcase" className="luxury-btn-ghost">
                  {t('museum.ctaViewExhibits')}
                </a>
              </div>
            </div>
            <button
              type="button"
              className="mus-hero-visual"
              onClick={() => openLightbox(0)}
              aria-label={t('museum.showcase.zoomLabel')}
            >
              <img
                src={MUSEUM_HERO_SHOWCASE}
                alt={t('museum.heroImageAlt')}
                loading="eager"
                decoding="async"
              />
              <span className="mus-hero-visual-hint">{t('museum.showcase.zoomLabel')}</span>
            </button>
          </header>

          {/* Architecture */}
          <section className="mus-section mus-panel mus-arch" aria-labelledby="mus-arch-title">
            <p className="mus-section-kicker">{t('museum.architecture.kicker')}</p>
            <h2 id="mus-arch-title" className="mus-section-title">
              {t('museum.architecture.title')}
            </h2>
            <p className="mus-section-lead">{t('museum.architecture.lead')}</p>
            <ol className="mus-arch-stack" role="list">
              {Array.isArray(archLayers) &&
                archLayers.map((layer, i) => (
                  <li key={layer.label} className="mus-arch-layer" role="listitem">
                    <span className="mus-arch-num">{String(i + 1).padStart(2, '0')}</span>
                    <span>{layer.label}</span>
                  </li>
                ))}
            </ol>
            <p className="mus-arch-law">{t('museum.architecture.law')}</p>
          </section>

          {/* Foundation Phase */}
          <section className="mus-section mus-panel mus-foundation" aria-labelledby="mus-foundation-title">
            <p className="mus-section-kicker">{t('museum.foundation.kicker')}</p>
            <div className="mus-foundation-grid">
              <article className="mus-foundation-card">
                <h2 id="mus-foundation-title" className="mus-foundation-title">
                  {t('museum.foundation.buildTitle')}
                </h2>
                <p>{t('museum.foundation.buildBody')}</p>
              </article>
              <article className="mus-foundation-card mus-foundation-card--open">
                <h2 className="mus-foundation-title">{t('museum.foundation.openTitle')}</h2>
                <p>{t('museum.foundation.openBody')}</p>
              </article>
            </div>
          </section>

          {/* Brand House */}
          <section className="mus-section mus-panel" aria-labelledby="mus-house-title">
            <p className="mus-section-kicker">{t('museum.brandHouse.kicker')}</p>
            <h2 id="mus-house-title" className="mus-section-title">
              {t('museum.brandHouse.title')}
            </h2>
            <p className="mus-section-lead">{t('museum.brandHouse.lead')}</p>
            <p className="mus-principle">{t('museum.brandHouse.principle')}</p>
            <div className="mus-steps-strip" role="list" aria-label={t('museum.brandHouse.kicker')}>
              {Array.isArray(brandSteps) &&
                brandSteps.map((step, i) => (
                  <div key={step.label} className="mus-step" role="listitem">
                    <span className="mus-step-label">{step.label}</span>
                    {i < brandSteps.length - 1 && <span className="mus-flow-arrow" aria-hidden>→</span>}
                  </div>
                ))}
            </div>
            <p className="mus-section-note">{t('museum.brandHouse.categoriesNote')}</p>
            <p className="mus-section-link">
              <Link to="/brand-room" className="luxury-btn-ghost">
                {t('museum.brandHouse.cta')}
              </Link>
            </p>
          </section>

          {/* Rooms */}
          <section
            className="mus-section mus-panel mus-section--split mus-section--reverse"
            aria-labelledby="mus-rooms-title"
          >
            <figure className="mus-section-visual mus-section-visual--portrait">
              <img
                src={MUSEUM_SECTION_IMAGES.rooms}
                alt={t('museum.rooms.imageAlt')}
                loading="lazy"
                decoding="async"
              />
            </figure>
            <div className="mus-section-copy">
              <p className="mus-section-kicker">{t('museum.rooms.kicker')}</p>
              <h2 id="mus-rooms-title" className="mus-section-title">
                {t('museum.rooms.title')}
              </h2>
              <p className="mus-section-lead">{t('museum.rooms.lead')}</p>
              <div className="mus-rooms-grid">
                {Array.isArray(rooms) &&
                  rooms.map((room) => (
                    <article key={room.name} className="mus-room-card">
                      <h3>{room.name}</h3>
                      <p>{room.desc}</p>
                    </article>
                  ))}
              </div>
              <h3 className="mus-room-flow-title">{t('museum.rooms.flowTitle')}</h3>
              <div className="mus-flow-strip mus-flow-strip--compact" role="list">
                {Array.isArray(roomFlow) &&
                  roomFlow.map((step, i) => (
                    <div key={step.label} className="mus-flow-step" role="listitem">
                      <span className="mus-flow-label">{step.label}</span>
                      {i < roomFlow.length - 1 && <span className="mus-flow-arrow" aria-hidden>→</span>}
                    </div>
                  ))}
              </div>
              <div className="mus-style-chips" role="list" aria-label={t('museum.rooms.flowTitle')}>
                {Array.isArray(roomStyles) &&
                  roomStyles.map((style) => (
                    <span key={style} className="mus-style-chip" role="listitem">
                      {style}
                    </span>
                  ))}
              </div>
              <p className="mus-section-note">{t('museum.rooms.note')}</p>
            </div>
          </section>

          {/* Exhibits */}
          <section className="mus-section mus-panel" aria-labelledby="mus-exhibits-title">
            <p className="mus-section-kicker">{t('museum.exhibits.kicker')}</p>
            <h2 id="mus-exhibits-title" className="mus-section-title">
              {t('museum.exhibits.title')}
            </h2>
            <p className="mus-section-lead">{t('museum.exhibits.lead')}</p>
            <div className="mus-exhibit-grid">
              {Array.isArray(categories) &&
                categories.map((cat) => {
                  const to = cat.to ?? MUSEUM_CATEGORY_LINKS[cat.key] ?? '/brand-room'
                  const image = MUSEUM_CATEGORY_IMAGES[cat.key as MuseumCategoryKey]
                  const label = t(`museum.exhibits.categoryLabels.${cat.key}`)
                  return (
                    <Link
                      key={cat.key}
                      to={to}
                      className={`mus-exhibit-card group${cat.key === 'fashion' ? ' mus-exhibit-card--fashion' : ''}`}
                    >
                      <div className="mus-exhibit-media">
                        <img src={image} alt={label} loading="lazy" decoding="async" />
                      </div>
                      <div className="mus-exhibit-copy">
                        <h3>{label}</h3>
                        <p>{cat.desc}</p>
                      </div>
                    </Link>
                  )
                })}
            </div>
          </section>

          {/* Product Spec Showcase */}
          <section className="mus-section mus-panel mus-showcase" aria-labelledby="mus-showcase-title">
            <p className="mus-section-kicker">{t('museum.showcase.kicker')}</p>
            <h2 id="mus-showcase-title" className="mus-section-title">
              {t('museum.showcase.title')}
            </h2>
            <p className="mus-section-lead">{t('museum.showcase.lead')}</p>
            <div className="mus-showcase-grid" role="list">
              {MUSEUM_SHOWCASE_EXHIBITS.map((exhibit, index) => {
                const key = exhibit.key as MuseumShowcaseKey
                const title = t(`museum.showcase.items.${key}.title`)
                const category = t(`museum.showcase.items.${key}.category`)
                const tagline = t(`museum.showcase.items.${key}.tagline`)
                const alt = t(`museum.showcase.items.${key}.alt`)
                return (
                  <article key={key} className="mus-showcase-card" role="listitem">
                    <button
                      type="button"
                      className="mus-showcase-media"
                      onClick={() => openLightbox(index)}
                      aria-label={`${t('museum.showcase.zoomLabel')}: ${title}`}
                    >
                      <img src={exhibit.image} alt={alt} loading="lazy" decoding="async" />
                      <span className="mus-showcase-zoom">{t('museum.showcase.zoomLabel')}</span>
                    </button>
                    <div className="mus-showcase-copy">
                      <p className="mus-showcase-category">{category}</p>
                      <h3>{title}</h3>
                      <p>{tagline}</p>
                      <Link to={exhibit.to} className="mus-showcase-link">
                        {t('museum.showcase.explore')}
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          {/* 13-Star Experience */}
          <section className="mus-section mus-panel mus-experience" aria-labelledby="mus-exp-title">
            <p className="mus-section-kicker">{t('museum.experience.kicker')}</p>
            <h2 id="mus-exp-title" className="mus-section-title">
              {t('museum.experience.title')}
            </h2>
            <p className="mus-section-lead">{t('museum.experience.lead')}</p>
            <div className="mus-experience-split">
              <ul className="mus-principle-list">
                {Array.isArray(experiencePrinciples) &&
                  experiencePrinciples.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <div className="mus-avoid-block">
                <p className="mus-avoid-label">{t('museum.experience.avoidLabel')}</p>
                <ul className="mus-avoid-list">
                  {Array.isArray(experienceAvoid) &&
                    experienceAvoid.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>
            <p className="mus-design-tagline">{t('museum.experience.tagline')}</p>
          </section>

          {/* Digital Twin */}
          <section className="mus-section mus-panel mus-section--split" aria-labelledby="mus-identity-title">
            <div className="mus-section-copy">
              <p className="mus-section-kicker">{t('museum.identity.kicker')}</p>
              <h2 id="mus-identity-title" className="mus-section-title">
                {t('museum.identity.title')}
              </h2>
              <p className="mus-section-lead">{t('museum.identity.lead')}</p>
              <div className="mus-measure-stack">
                {Array.isArray(measurementGroups) &&
                  measurementGroups.map((group) => (
                    <article key={group.title} className="mus-measure-panel">
                      <h3>{group.title}</h3>
                      <ul>
                        {group.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </article>
                  ))}
              </div>
              <aside className="mus-callout">
                <p className="mus-callout-quote">{t('museum.identity.callout')}</p>
                <p className="mus-callout-tagline">{t('museum.identity.tagline')}</p>
              </aside>
            </div>
            <figure className="mus-section-visual mus-section-visual--portrait">
              <img
                src={MUSEUM_SECTION_IMAGES.identity}
                alt={t('museum.identity.imageAlt')}
                loading="eager"
                decoding="async"
              />
            </figure>
          </section>

          {/* FIT TO ME */}
          <section
            className="mus-section mus-panel mus-section--split mus-section--reverse"
            aria-labelledby="mus-fit-title"
          >
            <figure className="mus-section-visual">
              <img
                src={MUSEUM_SECTION_IMAGES.personalization}
                alt={t('museum.personalization.imageAlt')}
                loading="lazy"
                decoding="async"
              />
            </figure>
            <div className="mus-section-copy">
              <p className="mus-section-kicker">{t('museum.personalization.kicker')}</p>
              <h2 id="mus-fit-title" className="mus-section-title">
                {t('museum.personalization.title')}
              </h2>
              <div className="mus-flow-strip" role="list" aria-label={t('museum.personalization.flowAria')}>
                {Array.isArray(flowSteps) &&
                  flowSteps.map((step, i) => (
                    <div key={step.label} className="mus-flow-step" role="listitem">
                      <span className="mus-flow-label">{step.label}</span>
                      {i < flowSteps.length - 1 && <span className="mus-flow-arrow" aria-hidden>→</span>}
                    </div>
                  ))}
              </div>
              <div className="mus-fit-stack">
                {Array.isArray(fitExamples) &&
                  fitExamples.map((ex) => (
                    <article key={ex.type} className="mus-measure-panel mus-fit-panel">
                      <h3>{ex.type}</h3>
                      <p>{ex.line}</p>
                    </article>
                  ))}
              </div>
            </div>
          </section>

          {/* Create My Version */}
          <section className="mus-section mus-panel mus-section--split" aria-labelledby="mus-creation-title">
            <div className="mus-section-copy">
              <p className="mus-section-kicker">{t('museum.creation.kicker')}</p>
              <h2 id="mus-creation-title" className="mus-section-title">
                {t('museum.creation.title')}
              </h2>
              <p className="mus-section-lead">{t('museum.creation.lead')}</p>
              <div className="mus-creation-flow" aria-label={t('museum.creation.flowAria')}>
                {(['source', 'twin', 'request'] as const).map((key, i) => (
                  <div key={key} className="mus-creation-node">
                    <span>{t(`museum.creation.flow.${key}`)}</span>
                    {i < 2 && <span className="mus-creation-op" aria-hidden>+</span>}
                  </div>
                ))}
                <span className="mus-creation-op" aria-hidden>→</span>
                <div className="mus-creation-node">
                  <span>{t('museum.creation.flow.ai')}</span>
                </div>
                <span className="mus-creation-op" aria-hidden>→</span>
                <div className="mus-creation-node mus-creation-node--result">
                  <span>{t('museum.creation.flow.concept')}</span>
                </div>
              </div>
              <div className="mus-version-fields" role="list">
                {Array.isArray(versionFields) &&
                  versionFields.map((field) => (
                    <code key={field.label} className="mus-version-field" role="listitem">
                      {field.label}
                    </code>
                  ))}
              </div>
              <div className="mus-measure-stack">
                {Array.isArray(creationHighlights) &&
                  creationHighlights.map((h) => (
                    <article key={h.title} className="mus-measure-panel">
                      <h3>{h.title}</h3>
                      <p className="mus-panel-body">{h.desc}</p>
                    </article>
                  ))}
              </div>
            </div>
            <figure className="mus-section-visual mus-section-visual--portrait">
              <img
                src={MUSEUM_SECTION_IMAGES.creation}
                alt={t('museum.creation.imageAlt')}
                loading="lazy"
                decoding="async"
              />
            </figure>
          </section>

          {/* MERGE Mosaic */}
          <section
            className="mus-section mus-panel mus-section--split mus-section--reverse"
            aria-labelledby="mus-design-title"
          >
            <figure className="mus-section-visual mus-section-visual--portrait">
              <img
                src={MUSEUM_SECTION_IMAGES.designLanguage}
                alt={t('museum.designLanguage.imageAlt')}
                loading="lazy"
                decoding="async"
              />
            </figure>
            <div className="mus-section-copy">
              <p className="mus-section-kicker">{t('museum.designLanguage.kicker')}</p>
              <h2 id="mus-design-title" className="mus-section-title">
                {t('museum.designLanguage.title')}
              </h2>
              <p className="mus-section-lead">{t('museum.designLanguage.lead')}</p>
              <p className="mus-design-tagline">{t('museum.designLanguage.tagline')}</p>
              <p className="mus-section-note">{t('museum.designLanguage.note')}</p>
              <p className="mus-shapes-label">{t('museum.designLanguage.shapesLabel')}</p>
              <div className="mus-style-chips">
                {Array.isArray(mosaicShapes) &&
                  mosaicShapes.map((shape) => (
                    <span key={shape} className="mus-style-chip">
                      {shape}
                    </span>
                  ))}
              </div>
              <div className="mus-measure-stack">
                {Array.isArray(scaleTiers) &&
                  scaleTiers.map((tier) => (
                    <article key={tier.name} className="mus-measure-panel">
                      <h3>{tier.name}</h3>
                      <p className="mus-panel-body">{tier.desc}</p>
                    </article>
                  ))}
              </div>
              <p className="mus-section-link">
                <Link to="/filament" className="luxury-btn-ghost">
                  {t('museum.designLanguage.filamentLink')} →
                </Link>
              </p>
            </div>
          </section>

          {/* Intelligence */}
          <section className="mus-section mus-panel mus-section--intelligence" aria-labelledby="mus-intel-title">
            <p className="mus-section-kicker">{t('museum.intelligence.kicker')}</p>
            <h2 id="mus-intel-title" className="mus-section-title">
              {t('museum.intelligence.title')}
            </h2>
            <div className="mus-intel-split">
              <div className="mus-intel-block">
                <h3 className="mus-intel-subtitle">{t('museum.intelligence.fitTitle')}</h3>
                <p className="mus-section-lead">{t('museum.intelligence.fitLead')}</p>
                <div className="mus-estimate-legend">
                  <span className="mus-estimate mus-estimate--estimated">
                    {t('museum.intelligence.estimated')}
                  </span>
                  <span className="mus-estimate mus-estimate--verified">
                    {t('museum.intelligence.verified')}
                  </span>
                  <span className="mus-estimate mus-estimate--live">{t('museum.intelligence.live')}</span>
                </div>
                <ol className="mus-pipeline">
                  {Array.isArray(pipelineSteps) &&
                    pipelineSteps.map((step, i) => (
                      <li key={step.label} className="mus-pipeline-step">
                        <span className="mus-pipeline-num">{String(i + 1).padStart(2, '0')}</span>
                        <span>{step.label}</span>
                      </li>
                    ))}
                </ol>
                <div className="mus-metal-strip">
                  {metalCards.map((m, i) => (
                    <Link
                      key={m.nameKey}
                      to="/price-indicator"
                      className={`ld-metal-stat ld-glass no-underline mus-metal-stat${
                        i === 0 ? ' is-primary' : ''
                      }`}
                    >
                      <IconPreciousMetals className="ld-metal-icon" />
                      <div>
                        <p className="ld-metal-name">{t(m.nameKey)}</p>
                        <p className="ld-metal-price">
                          {m.pricePerKgUsd > 0 ? formatUsd(m.pricePerKgUsd) : '—'}{' '}
                          <span>{t('landing.perKg')}</span>
                        </p>
                        {m.pricePerKgUsd > 0 && (
                          <p
                            className="ld-metal-change"
                            style={{ color: m.up ? '#6ee7b7' : '#f87171' }}
                          >
                            {m.changePct > 0 ? '+' : ''}
                            {m.changePct.toFixed(2)}%
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
                <Link to="/price-indicator" className="mus-prices-link">
                  {t('museum.intelligence.pricesLink')} →
                </Link>
              </div>
              <aside className="mus-intel-block mus-ai-guide">
                <figure className="mus-ai-visual">
                  <img
                    src={MUSEUM_SECTION_IMAGES.intelligence}
                    alt={t('museum.intelligence.imageAlt')}
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
                <h3 className="mus-intel-subtitle">{t('museum.intelligence.aiTitle')}</h3>
                <p className="mus-section-lead">{t('museum.intelligence.aiLead')}</p>
                <div className="mus-style-chips mus-style-chips--roles">
                  {Array.isArray(aiRoles) &&
                    aiRoles.map((role) => (
                      <span key={role} className="mus-style-chip">
                        {role}
                      </span>
                    ))}
                </div>
                <p className="mus-ai-note">{t('museum.intelligence.aiNote')}</p>
                <ul className="mus-ai-prompts">
                  {Array.isArray(aiPrompts) &&
                    aiPrompts.map((prompt) => (
                      <li key={prompt}>
                        <span aria-hidden>“</span>
                        {prompt}
                        <span aria-hidden>”</span>
                      </li>
                    ))}
                </ul>
              </aside>
            </div>
          </section>

          {/* Digital → Physical */}
          <section
            className="mus-section mus-panel mus-section--split"
            aria-labelledby="mus-physical-title"
          >
            <div className="mus-section-copy">
              <p className="mus-section-kicker">{t('museum.physical.kicker')}</p>
              <h2 id="mus-physical-title" className="mus-section-title">
                {t('museum.physical.title')}
              </h2>
              <p className="mus-section-lead">{t('museum.physical.lead')}</p>
              <div className="mus-physical-flow" role="list">
                {Array.isArray(physicalFlow) &&
                  physicalFlow.map((step, i) => (
                    <div key={step.label} className="mus-physical-step" role="listitem">
                      <span>{step.label}</span>
                      {i < physicalFlow.length - 1 && <span className="mus-flow-arrow" aria-hidden>→</span>}
                    </div>
                  ))}
              </div>
              <p className="mus-master-law">{t('museum.physical.masterLaw')}</p>
              <p className="mus-section-note">{t('museum.physical.manufacturer')}</p>
              <p className="mus-section-note">{t('museum.physical.passport')}</p>
              <p className="mus-section-note">{t('museum.physical.qr')}</p>
            </div>
            <figure className="mus-section-visual mus-section-visual--portrait">
              <img
                src={MUSEUM_SECTION_IMAGES.physical}
                alt={t('museum.physical.title')}
                loading="lazy"
                decoding="async"
              />
            </figure>
          </section>

          {/* My Collection */}
          <section className="mus-section mus-panel" aria-labelledby="mus-collection-title">
            <p className="mus-section-kicker">{t('museum.collection.kicker')}</p>
            <h2 id="mus-collection-title" className="mus-section-title">
              {t('museum.collection.title')}
            </h2>
            <p className="mus-section-lead">{t('museum.collection.lead')}</p>
            <div className="mus-collection-grid" role="list">
              {Array.isArray(collectionItems) &&
                collectionItems.map((item) => (
                  <span key={item} className="mus-collection-item" role="listitem">
                    {item}
                  </span>
                ))}
            </div>
            <p className="mus-design-tagline">{t('museum.collection.tagline')}</p>
          </section>

          {/* Journey */}
          <section className="mus-section mus-panel mus-journey" aria-labelledby="mus-journey-title">
            <p className="mus-section-kicker">{t('museum.journey.kicker')}</p>
            <h2 id="mus-journey-title" className="mus-section-title">
              {t('museum.journey.title')}
            </h2>
            <ol className="mus-journey-steps" role="list">
              {Array.isArray(journeySteps) &&
                journeySteps.map((step, i) => (
                  <li key={step.label} className="mus-journey-step" role="listitem">
                    <span className="mus-journey-num">{String(i + 1).padStart(2, '0')}</span>
                    <span>{step.label}</span>
                  </li>
                ))}
            </ol>
          </section>

          {/* CTA */}
          <section className="mus-cta">
            <h2>
              {t('museum.ctaTitle')}{' '}
              <span className="mus-title-gold">{t('museum.ctaGold')}</span>
            </h2>
            <p>{t('museum.ctaBody')}</p>
            <div className="mus-hero-actions">
              <a href="/living-museum-experience/" className="gold-btn">
                {t('museum.ctaEnterExperience')}
              </a>
              <Link to="/login?tab=register" className="luxury-btn-ghost">
                {t('museum.ctaRegister')}
              </Link>
              <Link to="/brand-room" className="luxury-btn-ghost">
                {t('museum.ctaBrandRoom')}
              </Link>
            </div>
          </section>
        </div>

        {activeExhibit && activeKey && (
          <MuseumShowcaseLightbox
            open={lightboxIndex !== null}
            image={activeExhibit.image}
            alt={t(`museum.showcase.items.${activeKey}.alt`)}
            title={t(`museum.showcase.items.${activeKey}.title`)}
            closeLabel={t('museum.showcase.closeLabel')}
            prevLabel={t('museum.showcase.prevLabel')}
            nextLabel={t('museum.showcase.nextLabel')}
            onClose={closeLightbox}
            onPrev={showPrev}
            onNext={showNext}
          />
        )}
      </div>
    </SiteLayout>
  )
}
