import { useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { catalogApi } from '@/features/catalog/api/catalog.api'
import { CoreObject } from './CoreExperience'
import { exhibits, type Language } from './content'

export default function MuseumObjectEngine({ language, category = 'all' }: { language: Language; category?: string }) {
  const t = (ka: string, en: string) => language === 'ka' ? ka : en
  const [params, setParams] = useSearchParams()
  const hall = params.get('hall') || '', selectedId = params.get('object')
  const [opened, setOpened] = useState(false)
  const touch = useRef<{x: number; y: number} | null>(null)
  const collection = useQuery({ queryKey: ['core-collection', hall], queryFn: () => catalogApi.getPublic(hall).then(r => r.data.data), enabled: !!hall, retry: false })
  const concepts = exhibits.filter(e => category === 'all' || e.category === category)
  const products = collection.data?.items.filter(e => e.status === 'ACTIVE') || []
  const entries = hall ? products : concepts
  const found = entries.findIndex(e => e.id === selectedId)
  const index = selectedId ? found : 0
  const selected = entries[index]
  function move(direction: number) {
    if (index < 0 || !entries.length) return
    const next = index + direction
    if (next < 0 || next >= entries.length) return
    const updated = new URLSearchParams(params)
    updated.set('object', entries[next].id)
    setParams(updated, { preventScrollReset: true })
    setOpened(false)
  }
  return <section className="mo-engine" tabIndex={0} aria-label={t('მუზეუმის ინტერაქტიული დარბაზი', 'Interactive museum hall')} onKeyDown={e => { if ((e.target as HTMLElement).closest('input,textarea,select,button,a,canvas')) return; if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); move(e.key === 'ArrowRight' ? 1 : -1) } }} onTouchStart={e => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }} onTouchEnd={e => {
    const start = touch.current; touch.current = null
    if (!start || (e.target as HTMLElement).closest('input,textarea,select,button,a,canvas')) return
    const dx = e.changedTouches[0].clientX - start.x, dy = e.changedTouches[0].clientY - start.y
    if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1)
  }}>
    <div className="mo-heading"><span className="lx-eyebrow">LIVING MUSEUM / {hall ? 'CORE OBJECTS' : 'CONCEPT STUDIES'}</span><h2>{collection.data?.title || t('ერთი ნივთი. შენი არჩევანი.', 'One object. Your choice.')}</h2>{hall && <Link to="/museum#mx-museum-collection">← {t('დარბაზების არჩევა', 'Choose a hall')}</Link>}</div>
    {hall && collection.isLoading && <p role="status">{t('დარბაზი იტვირთება…', 'Loading hall…')}</p>}
    {hall && collection.isError && <div role="alert"><p>{t('CORE დარბაზი ვერ ჩაიტვირთა. კონცეფციებს რეალურ პროდუქტებად არ ვანაცვლებთ.', 'CORE hall could not load. Concepts will not replace real product records.')}</p><button className="mx-button" onClick={() => collection.refetch()}>{t('ხელახლა ცდა', 'Retry')}</button></div>}
    {!selected && (!hall || collection.data) && <p role="status">{selectedId ? t('არჩეული ობიექტი ამ დარბაზში მიუწვდომელია.', 'Selected object unavailable in this hall.') : t('ამ დარბაზში აქტიური ობიექტი ჯერ არ არის.', 'No active object in this hall yet.')}</p>}
    {selected && <>
      <nav className="mo-navigation" aria-label={t('ობიექტებს შორის მოძრაობა', 'Object navigation')}><button className="mx-button mx-secondary" disabled={index <= 0} onClick={() => move(-1)} aria-label={t('წინა ობიექტი', 'Previous object')}>←</button><span>{index + 1} / {entries.length}</span><button className="mx-button mx-secondary" disabled={index >= entries.length - 1} onClick={() => move(1)} aria-label={t('შემდეგი ობიექტი', 'Next object')}>→</button></nav>
      {hall ? <CoreObject key={selected.id} language={language} museumSlug={hall} museumId={selected.id} /> : (() => {
        const concept = concepts[index]
        return <><button className="mo-hero" aria-expanded={opened} aria-controls="mo-concept-panel" onClick={() => setOpened(v => !v)}>{'image' in concept && <img src={concept.image} alt={concept.name[language]} />}<span><small>CONCEPT / {concept.category.toUpperCase()}</small><strong>{concept.name[language]}</strong><em>{t('შეეხე ნივთს · გახსენი', 'Touch the object · Open')} ↗</em></span></button>
          {opened && <div id="mo-concept-panel" className="mo-panel"><h3>{concept.name[language]}</h3><p>{concept.description[language]}</p><dl><div><dt>{t('ვიზუალური წყარო', 'Visual reference')}</dt><dd>{concept.id}</dd></div><div><dt>CORE Product ID</dt><dd>{t('ჯერ არ არის დაკავშირებული', 'Not linked yet')}</dd></div><div><dt>{t('წონა / ფასი / უფლებები', 'Weight / price / rights')}</dt><dd>{t('დაუდასტურებელია', 'Unverified')}</dd></div><div><dt>Passport</dt><dd>{t('ჯერ არ გაცემულა', 'Not yet issued')}</dd></div></dl><p>{t('ეს ვიზუალური კონცეფციაა. რეალურ მორგებას, გამოთვლასა და ანგარიშში ახალი ვერსიის შექმნას ნებადართული CORE პროდუქტი სჭირდება.', 'This is a visual concept. Actual fit, calculation and a new account version require an eligible CORE product.')}</p><Link className="mx-button" to={`/create?reference=${concept.id}`}>{t('კონცეფციის მონახაზი', 'Concept draft')} ↗</Link><Link className="mx-text-link" to={`/exhibit/${concept.id}`}>{t('წყაროს სრული აღწერა', 'Full reference description')} ↗</Link></div>}</>
      })()}
    </>}
  </section>
}
