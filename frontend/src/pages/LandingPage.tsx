import { Suspense } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Hero3DCoin, { landingCoinModelUrl } from '../components/Hero3DCoin'
import { useGLTF } from '@react-three/drei'
import { useLiveMetalPrices } from '@/features/coins/hooks/useLiveMetalPrice'
import RegistrationGoalBanner from '../components/RegistrationGoalBanner'

useGLTF.preload(landingCoinModelUrl)
import {
  IconFilament3D,
  IconGlobal,
  IconLimitless,
  IconPreciousMetals,
  IconSustainable,
} from '../components/LandingFeatureIcons'
import BrandIcon from '../components/BrandIcon'
import { CATEGORY_ICONS, type CategoryIconKey } from '@/assets/brandIcons'

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
    <div className="landing-page">
      <Navbar variant="landing" />

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="landing-hero-section relative flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-8 min-h-screen pt-32 pb-20 px-8 lg:px-16 overflow-hidden max-w-1440 mx-auto w-full">
        <div
          className="absolute pointer-events-none w-[min(90vw,640px)] h-[min(90vw,640px)] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 68%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-42%, -48%)',
          }}
        />

        {/* Left — editorial headline */}
        <div className="landing-hero-copy relative z-10 flex-1 max-w-[440px] animate-fade-in-up order-2 lg:order-none">
          <p className="landing-hero-kicker mb-6">{t('landing.heroKicker')}</p>
          <h1
            className="landing-hero-title mb-2"
            style={{ fontSize: 'clamp(2.75rem, 5.5vw, 4.5rem)' }}
          >
            <span className="landing-hero-gold">{t('landing.heroTitleGold')}</span>
            <br />
            {t('landing.heroTitleRest')}
          </h1>
          <p className="landing-tagline mt-6 mb-4">{t('landing.tagline')}</p>
          <p className="landing-body max-w-[340px] mb-6">{t('landing.heroBody')}</p>

          <RegistrationGoalBanner variant="hero" className="mb-10 max-w-[400px]" />

          <div className="landing-hero-actions flex flex-wrap items-center gap-4">
            <Link to="/apply" className="luxury-btn-glass">
              {t('landing.exploreCollection')}
            </Link>
            <Link to="/how-it-works" className="luxury-btn-ghost">
              <PlayIcon />
              {t('landing.watchVideo')}
            </Link>
          </div>

          <p className="mt-10">
            <a
              href="#technology"
              className="landing-tagline inline-block opacity-70 hover:opacity-100 transition-all duration-300 ease-in-out no-underline border-b border-[rgba(212,175,55,0.25)] pb-0.5"
            >
              {t('landing.exploreTech')}
            </a>
          </p>
        </div>

        {/* Center — 3D coin */}
        <div className="landing-hero-coin-wrap relative z-10 flex-1 flex justify-center items-center order-first lg:order-none w-full min-h-[min(72vw,420px)] lg:min-h-0">
          <div
            className="relative flex items-center justify-center w-full max-w-[500px] aspect-square"
            style={{
              background:
                'radial-gradient(circle at 50% 50%, rgba(212,175,55,0.07) 0%, transparent 62%)',
            }}
          >
            <Suspense fallback={null}>
              <Hero3DCoin
                className="w-full h-full"
                aria-label={t('landing.coinEmblem')}
              />
            </Suspense>
          </div>
        </div>

        {/* Right — metal spot (desktop) */}
        <div className="hidden xl:flex flex-col gap-5 flex-shrink-0 w-[240px] order-3">
          {metalCards.map((m, i) => (
            <div
              key={m.nameKey}
              className={`flex items-start gap-4 py-4 px-5 border bg-black/30 backdrop-blur-sm transition-all duration-300 ease-in-out ${
                i === 0
                  ? 'border-[rgba(212,175,55,0.35)]'
                  : 'border-[rgba(212,175,55,0.1)] hover:border-[rgba(212,175,55,0.28)]'
              }`}
              style={{ borderRadius: '2px' }}
            >
              <IconPreciousMetals className="w-8 h-8 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-medium tracking-[0.2em] text-[#D4AF37] mb-1.5">
                  {t(m.nameKey)}
                </p>
                <p className="text-[10px] leading-relaxed tracking-wide text-neutral-500">
                  {m.pricePerKgUsd > 0 ? formatUsd(m.pricePerKgUsd) : '—'} {t('landing.perKg')}
                </p>
                {m.pricePerKgUsd > 0 && (
                  <p
                    className="text-[10px] font-medium tracking-wide mt-1"
                    style={{ color: m.up ? '#4ade80' : '#f87171' }}
                  >
                    {m.changePct > 0 ? '+' : ''}
                    {m.changePct.toFixed(2)}%
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mobile / tablet — live metal prices */}
      <section className="landing-metal-strip xl:hidden max-w-1440 mx-auto w-full">
        <div className="landing-metal-grid">
          {metalCards.map((m, i) => (
            <Link
              key={m.nameKey}
              to="/price-indicator"
              className={`landing-metal-card no-underline${
                i === 0 ? ' landing-metal-card--primary' : ''
              }`}
            >
              <p className="landing-metal-name">{t(m.nameKey)}</p>
              <p className="landing-metal-price">
                {m.pricePerKgUsd > 0 ? formatUsd(m.pricePerKgUsd) : '—'}{' '}
                <span>{t('landing.perKg')}</span>
              </p>
              {m.pricePerKgUsd > 0 && (
                <p
                  className="landing-metal-change"
                  style={{ color: m.up ? '#4ade80' : '#f87171' }}
                >
                  {m.changePct > 0 ? '+' : ''}
                  {m.changePct.toFixed(2)}%
                </p>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURES BAR ─────────────────────────────── */}
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

      {/* ── CATEGORIES ───────────────────────────────── */}
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

      {/* ── TECHNOLOGY ───────────────────────────────── */}
      <div className="section-divider max-w-1440 mx-auto w-full" />
      <section id="technology" className="landing-split landing-split--tech scroll-mt-32 max-w-1440 mx-auto w-full">
        <div className="landing-split-visual">
          <div className="landing-split-visual-glow" aria-hidden />
          <IconFilament3D className="landing-split-visual-icon" />
          <p className="landing-split-visual-kicker">{t('landing.techPanel')}</p>
        </div>

        <div className="landing-split-content landing-tech-section">
          <h2 className="landing-section-title landing-split-title">
            {t('landing.techTitle1')}
            <br />
            <span className="landing-hero-gold not-italic font-normal">{t('landing.techTitle2')}</span>
            <br />
            {t('landing.techTitle3')}
          </h2>
          <p className="landing-body landing-split-lead">{t('landing.techBody')}</p>
          <Link to="/filament" className="luxury-btn-glass landing-split-cta">
            {t('landing.discoverTech')}
          </Link>
          <div className="landing-tech-points">
            {TECH_POINT_KEYS.map((key) => (
              <div key={key} className="landing-tech-point">
                <div className="landing-tech-point-bar" aria-hidden />
                <div>
                  <p className="landing-tech-point-title">{t(`landing.techPoints.${key}.title`)}</p>
                  <p className="landing-tech-point-sub">{t(`landing.techPoints.${key}.sub`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="section-divider max-w-1440 mx-auto w-full" />

      {/* ── INVEST ───────────────────────────────────── */}
      <section className="landing-split landing-split--invest max-w-1440 mx-auto w-full">
        <div className="landing-split-content landing-invest-section">
          <h2 className="landing-section-title landing-split-title">
            {t('landing.investTitle1')}
            {t('landing.investTitle2') ? (
              <>
                <br />
                {t('landing.investTitle2')}{' '}
              </>
            ) : (
              <br />
            )}
            <span className="landing-hero-gold not-italic">{t('landing.investTitleGold')}</span>
          </h2>
          <p className="landing-body landing-split-lead">{t('landing.investBody')}</p>
          <Link to="/merge-coin" className="luxury-btn-glass landing-split-cta">
            {t('landing.learnMore')}
          </Link>
        </div>

        <div className="landing-split-aside landing-invest-points">
          <div className="landing-invest-grid">
            {INVEST_POINT_KEYS.map((key) => (
              <div key={key} className="landing-invest-point">
                <p>{t(`landing.investPoints.${key}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="section-divider max-w-1440 mx-auto w-full" />

      <Footer />
    </div>
  )
}
