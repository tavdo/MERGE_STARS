import { Link, useSearchParams } from 'react-router-dom'
import type { Language } from './content'

const references = [
  { id: 'precious-thread-materials', ka: 'ოქროს ძაფი და მასალები', en: 'Precious thread & materials', category: ['materials'], to: '/materials' },
  { id: 'mosaic-couture-mannequins', ka: 'მოზაიკის კუტიური', en: 'Mosaic couture', category: ['fashion'], to: '/digital-twin' },
  { id: 'elita-mosaic-style', ka: 'ELITA — ერთი ხელწერა', en: 'ELITA — one signature', category: ['watches', 'eyewear', 'jewelry', 'fashion'], to: '/museum?category=watches' },
  { id: 'elita-iconic-case', ka: 'ELITA — შენი სამყარო', en: 'ELITA — your world', category: ['accessories', 'fragrance', 'fashion'], to: '/museum?category=accessories' },
  { id: 'mosaic-hat-collection', ka: 'ქუდების კოლექცია', en: 'The hat collection', category: ['fashion', 'accessories'], to: '/museum?category=fashion' },
  { id: 'living-museum-journey', ka: 'ცოცხალი მუზეუმის გზა', en: 'The living museum journey', category: ['journey'], to: '/how-it-works' },
  { id: 'mosaic-fit-studio', ka: 'მოზაიკის მორგების სტუდია', en: 'The mosaic fit studio', category: ['fit', 'fashion'], to: '/digital-twin' },
]

export default function ReferenceGallery({ language, context }: { language: Language; context: string }) {
  const [params] = useSearchParams()
  const category = params.get('category') || 'all'
  const items = references.filter(item => {
    if (context === '/museum') return category === 'all' || item.category.includes(category)
    if (context === '/') return ['elita-mosaic-style', 'elita-iconic-case', 'mosaic-hat-collection'].includes(item.id)
    if (context === '/materials' || context.startsWith('/material-lab')) return item.category.includes('materials')
    if (context === '/how-it-works') return item.category.includes('journey')
    if (context === '/create' || context === '/calculate') return ['mosaic-couture-mannequins', 'elita-mosaic-style', 'elita-iconic-case', 'mosaic-hat-collection'].includes(item.id)
    return false
  })
  if (!items.length) return null
  const text = (ka: string, en: string) => language === 'ka' ? ka : en
  return <section className={`lx-reference-gallery${items.length === 1 ? ' lx-reference-single' : ''}`}>
    <div className="lx-reference-heading"><span className="lx-eyebrow">MERGE / MOSAIC & PRECIOUS THREAD</span><h2>{text('მოზაიკა. ძაფი. ხელწერა.', 'Mosaic. Thread. Signature.')}</h2><p>{text('კოლექციების ვიზუალური კონცეფციები', 'Collection visual concepts')}</p></div>
    <div className="lx-reference-grid">{items.map(item => <article key={item.id}>
      <a className="lx-reference-image" href={`/museum/${item.id}-reference.png`} target="_blank" rel="noreferrer" aria-label={text(`${item.ka} — სრული გამოსახულება`, `${item.en} — full image`)}><img src={`/museum/${item.id}-reference.png`} alt={language === 'ka' ? item.ka : item.en} loading="lazy" decoding="async" /></a>
      <div className="lx-reference-caption"><h3>{language === 'ka' ? item.ka : item.en}</h3><Link to={item.to}>{text('აღმოაჩინე', 'Explore')} ↗</Link></div>
    </article>)}</div>
  </section>
}
