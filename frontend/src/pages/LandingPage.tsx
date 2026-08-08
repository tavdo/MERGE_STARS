import { Suspense } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Hero3DCoin, { landingCoinModelUrl } from '../components/Hero3DCoin'
import { useGLTF } from '@react-three/drei'
import { useLiveMetalPrices } from '@/features/coins/hooks/useLiveMetalPrice'
import RegistrationGoalBanner from '../components/RegistrationGoalBanner'
import {
  IconFilament3D,
  IconGlobal,
  IconLimitless,
  IconPreciousMetals,
  IconSustainable,
} from '../components/LandingFeatureIcons'
import BrandIcon from '../components/BrandIcon'
import { CATEGORY_ICONS, type CategoryIconKey } from '@/assets/brandIcons'

useGLTF.preload(landingCoinModelUrl)

const FEATURES = [
  { id: 'filament' as const, Icon: IconFilament3D },
  { id: 'metals' as const, Icon: IconPreciousMetals },
  { id: 'limitless' as const, Icon: IconLimitless },
  { id: 'sustainable' as const, Icon: IconSustainable },
  { id: 'global' as const, Icon: IconGlobal },
]

const CATEGORIES = [
  { key: 'jewelry', to: '/brand-room?category=jewelry' },
  { key: 'accessories', to: '/brand-room?category=accessories' },
  { key: 'souvenirs', to: '/brand-room?category=souvenirs' },
  { key: 'sanitaryware', to: '/brand-room?category=sanitaryware' },
  { key: 'stationery', to: '/brand-room?category=stationery' },
  { key: 'construction', to: '/brand-room?category=construction' },
  { key: 'more', to: '/brand-room?category=more' },
] as const

const TECH_POINT_KEYS = ['metals', 'composite', 'lightweight'] as const
const INVEST_POINT_KEYS = ['growth', 'tech', 'partner', 'impact'] as const

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

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="shrink-0">
      <circle cx="7" cy="7" r="6.25" stroke="currentColor" strokeWidth="0.75" />
      <path d="M6 5.2v3.6l3.2-1.8L6 5.2z" fill="currentColor" />
    </svg>
  )
}

export default function LandingPage() {
  const { t } = useTranslation()
  const metals = useLiveMetalPrices()

  const metalCards = METAL_KEYS.map(({ metal, nameKey }) => {
    const live = metals?.find((m) => m.metal === metal)
    const pricePerKgUsd = live?.pricePerKgUsd ?? 0
    const changePct = live?.changePct ?? 0
    return { nameKey, pricePerKgUsd, changePct, up: changePct >= 0 }
  })

  return (
    <div className="landing-page ld-page">
      <Navbar variant="landing" />

      {/* Hero — copy | 3D coin | metals (coin stays center) */}
      <section className="ld-hero">
        <div className="ld-hero-atmosphere" aria-hidden />

        <div className="ld-hero-copy ld-glass">
          <p className="ld-brand">MERGE STARS</p>
          <p className="ld-kicker">{t('landing.heroKicker')}</p>
          <h1 className="ld-hero-title">
            <span className="ld-hero-gold">{t('landing.heroTitleGold')}</span>
            <br />
            {t('landing.heroTitleRest')}
          </h1>
          <p className="ld-tagline">{t('landing.tagline')}</p>
          <p className="ld-body">{t('landing.heroBody')}</p>

          <RegistrationGoalBanner variant="hero" className="ld-goal" />

          <div className="ld-hero-actions">
            <Link to="/apply" className="luxury-btn-glass">
              {t('landing.exploreCollection')}
            </Link>
            <Link to="/how-it-works" className="luxury-btn-ghost">
              <PlayIcon />
              {t('landing.watchVideo')}
            </Link>
          </div>

          <a href="#technology" className="ld-jump">
            {t('landing.exploreTech')}
          </a>
        </div>

        <div className="ld-hero-coin">
          <div className="ld-hero-coin-glow" aria-hidden />
          <Suspense fallback={null}>
            <Hero3DCoin
              className="ld-coin-canvas"
              aria-label={t('landing.coinEmblem', { defaultValue: 'Merge Coin' })}
            />
          </Suspense>
        </div>

        <aside className="ld-hero-metals">
          {metalCards.map((m, i) => (
            <Link
              key={m.nameKey}
              to="/price-indicator"
              className={`ld-metal-stat ld-glass no-underline${i === 0 ? ' is-primary' : ''}`}
            >
              <IconPreciousMetals className="ld-metal-icon" />
              <div>
                <p className="ld-metal-name">{t(m.nameKey)}</p>
                <p className="ld-metal-price">
                  {m.pricePerKgUsd > 0 ? formatUsd(m.pricePerKgUsd) : '—'}{' '}
                  <span>{t('landing.perKg')}</span>
                </p>
                {m.pricePerKgUsd > 0 && (
                  <p className="ld-metal-change" style={{ color: m.up ? '#6ee7b7' : '#f87171' }}>
                    {m.changePct > 0 ? '+' : ''}
                    {m.changePct.toFixed(2)}%
                  </p>
                )}
              </div>
            </Link>
          ))}
        </aside>
      </section>

      {/* Mobile metals */}
      <section className="ld-metal-strip" aria-label={t('landing.metalPrices', { defaultValue: 'Live metal prices' })}>
        {metalCards.map((m, i) => (
          <Link
            key={m.nameKey}
            to="/price-indicator"
            className={`ld-metal-stat ld-glass no-underline${i === 0 ? ' is-primary' : ''}`}
          >
            <p className="ld-metal-name">{t(m.nameKey)}</p>
            <p className="ld-metal-price">
              {m.pricePerKgUsd > 0 ? formatUsd(m.pricePerKgUsd) : '—'} <span>{t('landing.perKg')}</span>
            </p>
            {m.pricePerKgUsd > 0 && (
              <p className="ld-metal-change" style={{ color: m.up ? '#6ee7b7' : '#f87171' }}>
                {m.changePct > 0 ? '+' : ''}
                {m.changePct.toFixed(2)}%
              </p>
            )}
          </Link>
        ))}
      </section>

      {/* Features */}
      {/* Features — original strip design */}
      <div className="section-divider max-w-1440 mx-auto w-full" />
      <section className="landing-features-bar max-w-1440 mx-auto w-full">
        {FEATURES.map((f, i) => (
          <div
            key={f.id}
            className={`landing-feature-cell${i === FEATURES.length - 1 ? ' landing-feature-cell--last' : ''}`}
          >
            <f.Icon className="landing-feature-icon" />
            <p className="landing-feature-title">{t(`landing.features.${f.id}.title`)}</p>
            <p className="landing-feature-sub">{t(`landing.features.${f.id}.sub`)}</p>
          </div>
        ))}
      </section>
      <div className="section-divider max-w-1440 mx-auto w-full" />

      {/* Categories — original grid design */}
      <section className="landing-categories-section max-w-1440 mx-auto w-full">
        <h2 className="landing-categories-heading">{t('landing.categoriesTitle')}</h2>
        <div className="landing-categories-grid">
          {CATEGORIES.map((c, i) => (
            <Link
              key={c.key}
              to={c.to}
              className={`landing-category-card group${i === CATEGORIES.length - 1 ? ' landing-category-card--last' : ''}`}
            >
              <BrandIcon
                src={CATEGORY_ICONS[c.key as CategoryIconKey]}
                className="landing-category-icon"
              />
              <span className="landing-category-label">{t(`landing.categories.${c.key}`)}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Technology */}
      <section id="technology" className="ld-section ld-tech">
        <div className="ld-tech-panel ld-glass">
          <div className="ld-tech-visual ld-glass-inset">
            <div className="ld-tech-glow" aria-hidden />
            <IconFilament3D className="ld-tech-icon" />
            <p>{t('landing.techPanel')}</p>
          </div>
          <div className="ld-tech-copy">
            <p className="ld-kicker">{t('landing.techKicker', { defaultValue: 'Technology' })}</p>
            <h2>
              {t('landing.techTitle1')}{' '}
              <span className="ld-hero-gold">{t('landing.techTitle2')}</span>{' '}
              {t('landing.techTitle3')}
            </h2>
            <p className="ld-body">{t('landing.techBody')}</p>
            <Link to="/filament" className="luxury-btn-glass">
              {t('landing.discoverTech')}
            </Link>
            <div className="ld-tech-points">
              {TECH_POINT_KEYS.map((key) => (
                <div key={key} className="ld-tech-point ld-glass-inset">
                  <strong>{t(`landing.techPoints.${key}.title`)}</strong>
                  <span>{t(`landing.techPoints.${key}.sub`)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Invest */}
      <section className="ld-section">
        <div className="ld-invest-panel ld-glass">
          <div className="ld-invest-copy">
            <p className="ld-kicker">{t('landing.investKicker', { defaultValue: 'Opportunity' })}</p>
            <h2>
              {t('landing.investTitle1')} {t('landing.investTitle2')}{' '}
              <span className="ld-hero-gold">{t('landing.investTitleGold')}</span>
            </h2>
            <p className="ld-body">{t('landing.investBody')}</p>
            <Link to="/merge-coin" className="luxury-btn-glass">
              {t('landing.learnMore')}
            </Link>
          </div>
          <div className="ld-invest-grid">
            {INVEST_POINT_KEYS.map((key) => (
              <div key={key} className="ld-invest-point ld-glass-inset">
                <p>{t(`landing.investPoints.${key}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
