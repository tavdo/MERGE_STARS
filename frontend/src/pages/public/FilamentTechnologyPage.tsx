import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SiteLayout from '../../components/SiteLayout'
import filamentEcosystemImg from '@/assets/filament-ecosystem.png'

type Layer = { title: string; desc: string }
type MaterialClass = { name: string; structure: string; purpose: string }
type Feature = { title: string; desc: string }
type Pillar = { title: string }

export default function FilamentTechnologyPage() {
  const { t } = useTranslation()
  const layers = t('filament.layers', { returnObjects: true }) as Layer[]
  const classes = t('filament.classes', { returnObjects: true }) as MaterialClass[]
  const features = t('filament.features', { returnObjects: true }) as Feature[]
  const pillars = t('filament.pillars', { returnObjects: true }) as Pillar[]
  const futureItems = t('filament.futureItems', { returnObjects: true }) as string[]

  return (
    <SiteLayout>
      <div className="fil-page">
        <header className="fil-hero">
          <p className="fil-kicker">{t('filament.kicker')}</p>
          <h1 className="fil-title">
            {t('filament.title')}
            <span className="fil-title-gold">{t('filament.titleGold')}</span>
          </h1>
          <p className="fil-lead">{t('filament.lead')}</p>
          <div className="fil-hero-actions">
            <a href="#material-classes" className="gold-btn">
              {t('filament.ctaExplore')}
            </a>
            <Link to="/apply" className="luxury-btn-ghost">
              {t('filament.ctaApply')}
            </Link>
          </div>
        </header>

        <section className="fil-section fil-overview" aria-labelledby="fil-overview-title">
          <div className="fil-overview-copy">
            <h2 id="fil-overview-title">{t('filament.philosophyTitle')}</h2>
            <p>{t('filament.philosophyBody')}</p>
            <ul className="fil-pillars">
              {Array.isArray(pillars) &&
                pillars.map((p) => (
                  <li key={p.title}>{p.title}</li>
                ))}
            </ul>
          </div>
          <figure className="fil-overview-visual">
            <img
              src={filamentEcosystemImg}
              alt={t('filament.diagramAlt')}
              className="fil-diagram"
            />
            <figcaption>{t('filament.diagramCaption')}</figcaption>
          </figure>
        </section>

        <section className="fil-section" aria-labelledby="fil-anatomy-title">
          <p className="fil-section-kicker">{t('filament.anatomyKicker')}</p>
          <h2 id="fil-anatomy-title" className="fil-section-title">
            {t('filament.anatomyTitle')}
          </h2>
          <p className="fil-section-lead">{t('filament.anatomyLead')}</p>
          <ol className="fil-layers">
            {Array.isArray(layers) &&
              layers.map((layer, i) => (
                <li key={layer.title} className="fil-layer">
                  <span className="fil-layer-num">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{layer.title}</h3>
                    <p>{layer.desc}</p>
                  </div>
                </li>
              ))}
          </ol>
        </section>

        <section
          id="material-classes"
          className="fil-section scroll-mt-28"
          aria-labelledby="fil-classes-title"
        >
          <p className="fil-section-kicker">{t('filament.classesKicker')}</p>
          <h2 id="fil-classes-title" className="fil-section-title">
            {t('filament.classesTitle')}
          </h2>
          <p className="fil-section-lead">{t('filament.classesLead')}</p>
          <div className="fil-class-grid">
            {Array.isArray(classes) &&
              classes.map((c) => (
                <article key={c.name} className="fil-class">
                  <h3>{c.name}</h3>
                  <p className="fil-class-label">{t('filament.structureLabel')}</p>
                  <p>{c.structure}</p>
                  <p className="fil-class-label">{t('filament.purposeLabel')}</p>
                  <p>{c.purpose}</p>
                </article>
              ))}
          </div>
        </section>

        <section className="fil-section" aria-labelledby="fil-features-title">
          <p className="fil-section-kicker">{t('filament.featuresKicker')}</p>
          <h2 id="fil-features-title" className="fil-section-title">
            {t('filament.featuresTitle')}
          </h2>
          <div className="fil-feature-grid">
            {Array.isArray(features) &&
              features.map((f) => (
                <article key={f.title} className="fil-feature">
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </article>
              ))}
          </div>
        </section>

        <section className="fil-section fil-future" aria-labelledby="fil-future-title">
          <div>
            <p className="fil-section-kicker">{t('filament.futureKicker')}</p>
            <h2 id="fil-future-title" className="fil-section-title">
              {t('filament.futureTitle')}
            </h2>
            <ul className="fil-future-list">
              {Array.isArray(futureItems) &&
                futureItems.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <aside className="fil-positioning">
            <p className="fil-positioning-lead">{t('filament.positioningLead')}</p>
            <p className="fil-positioning-body">{t('filament.positioningBody')}</p>
          </aside>
        </section>

        <section className="fil-cta">
          <h2>
            {t('filament.ctaTitle')}{' '}
            <span className="fil-title-gold">{t('filament.ctaGold')}</span>
          </h2>
          <p>{t('filament.ctaBody')}</p>
          <div className="fil-hero-actions">
            <Link to="/login?tab=register" className="gold-btn">
              {t('filament.ctaRegister')}
            </Link>
            <Link to="/merge-coin" className="luxury-btn-ghost">
              {t('filament.ctaCoin')}
            </Link>
          </div>
        </section>
      </div>
    </SiteLayout>
  )
}
