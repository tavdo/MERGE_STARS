import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { exhibits, type Language } from '../experience/content'
import { calculateProduct } from '@/shared/utils/productCalculation'
import GeometryEstimatePanel from './GeometryEstimatePanel'

const illustratedExhibits = exhibits.filter((item): item is Extract<(typeof exhibits)[number], { image: string }> => 'image' in item)
const collection = ['silver-travel-case', 'grand-travel-wardrobe', 'black-gold-wardrobe'].flatMap(id => illustratedExhibits.filter(item => item.id === id))

export default function ProductCalculationFlow({ language = 'ka' }: { language?: Language }) {
  const text = (ka: string, en: string) => language === 'ka' ? ka : en
  const [params] = useSearchParams()
  const [selectedId, setSelectedId] = useState(() => collection.find(item => item.id === params.get('reference'))?.id ?? collection[0].id)
  const [material, setMaterial] = useState('silver')
  const [signature, setSignature] = useState('')
  const [saved, setSaved] = useState(false)
  const [notice, setNotice] = useState('')
  const selected = collection.find(item => item.id === selectedId) ?? collection[0]
  // Museum concepts have no approved geometry/material inputs yet.
  const result = useMemo(() => calculateProduct({ productId: selected.id, productVersion: 'design-draft', material }), [selected.id, material])
  function saveVersion() {
    try {
      const draft = JSON.parse(localStorage.getItem('merge.design') ?? '{}')
      localStorage.setItem('merge.design', JSON.stringify({ ...draft, reference: selected.id, type: selected.shape, material, signature, name: selected.name[language] }))
      setSaved(true)
      setNotice(text('შენი ვერსიის მონახაზი შენახულია ამ ბრაუზერში.', 'Your version draft is saved in this browser.'))
    } catch { setNotice(text('შენახვა ვერ მოხერხდა. სცადე ხელახლა.', 'Could not save. Please try again.')) }
  }
  return <div className="lx-atelier">
    <div className="lx-breadcrumb"><Link to="/museum">{text('ცოცხალი მუზეუმი', 'Living Museum')}</Link><span>/</span><span>{text('პირადი ატელიე', 'Private atelier')}</span></div>
    <div className="lx-atelier-heading"><div><span className="lx-eyebrow">MERGE / PRIVATE ATELIER</span><h1>{text('შენი ხელწერა.', 'Your signature.')}<br /><em>{text('შენი სამყარო.', 'Your world.')}</em></h1></div><p>{text('აირჩიე ნივთი. შემატე შენი ხასიათი. შექმენი ვერსია, რომელიც შენ გეკუთვნის.', 'Choose an object. Give it your character. Create a version that belongs to you.')}</p></div>
    <div className="lx-atelier-layout">
      <figure className="lx-product-stage"><img src={selected.image} alt={selected.name[language]} fetchPriority="high" /><div className="lx-image-shade" /><div className="lx-stage-top"><span>MERGE EDITIONS</span><span>01 / PRIVATE COLLECTION</span></div><figcaption><span className="lx-eyebrow">{text('ვიზუალური კონცეფცია', 'Visual concept')}</span><h2>{selected.name[language]}</h2><Link to={`/exhibit/${selected.id}`}>{text('აღმოაჩინე კოლექცია', 'Discover the collection')} ↗</Link></figcaption></figure>
      <div className="lx-personalize">
        <div className="lx-panel-header"><span className="lx-eyebrow">THE ART OF PERSONALISATION</span><span className="lx-small-star" aria-hidden="true">✧</span></div><h2>{text('შექმენი შენი ვერსია', 'Make it yours')}</h2>
        <fieldset className="lx-options"><legend><span>01</span>{text('კოლექცია', 'Collection')}</legend><div className="lx-product-options">{collection.map(item => <button key={item.id} type="button" aria-pressed={selectedId === item.id} onClick={() => { setSelectedId(item.id); setSaved(false); setNotice('') }}><img src={item.image} alt="" /><span>{item.name[language].split(' / ')[0]}</span></button>)}</div></fieldset>
        <fieldset className="lx-options"><legend><span>02</span>{text('მასალის არჩევანი', 'Material preference')}</legend><div className="lx-material-options">{[['silver', text('ვერცხლი', 'Silver')], ['gold', text('ოქრო', 'Gold')], ['composite', text('კომპოზიტი', 'Composite')]].map(([value, label]) => <button key={value} type="button" aria-pressed={material === value} onClick={() => { setMaterial(value); setSaved(false); setNotice('') }}><span className={`lx-swatch lx-swatch-${value}`} /><span>{label}</span></button>)}</div></fieldset>
        <div className="lx-fit-row"><div><span className="lx-option-label"><span>03</span>FIT TO ME</span><p>{text('შენზე მორგებული', 'Made to fit you')}</p></div><Link to="/digital-twin">{text('ჩემი ზომები', 'My measurements')} ↗</Link></div>
        <label className="lx-signature"><span className="lx-option-label"><span>04</span>{text('პირადი ნიშანი', 'Personal mark')}</span><input value={signature} maxLength={3} placeholder={text('შენი ინიციალები', 'Your initials')} onChange={e => { setSignature(e.target.value.toLocaleUpperCase()); setSaved(false) }} /></label>
        <div className="lx-result"><div><span>{text('გამოთვლილი წონა', 'Calculated weight')}</span><strong>{result.calculatedWeightGrams == null ? '—' : `${result.calculatedWeightGrams} g`}</strong></div><div><span>{text('მიმდინარე ფასი', 'Current price')}</span><strong>{result.calculatedProductPriceMinor == null ? '—' : `$${(result.calculatedProductPriceMinor / 100).toFixed(2)}`}</strong></div></div>
        <p className="lx-availability">{text('წონა და ფასი გამოჩნდება გაზომვადი მოდელისა და მასალის მონაცემების მიღებისას.', 'Weight and price appear when a measurable model and material data are available.')}</p>
        <button className="lx-primary-action" type="button" onClick={saveVersion}>{saved ? text('მონახაზი შენახულია', 'Draft saved') : text('შეინახე შენი ვერსია', 'Save your version')}<span>{saved ? '✓' : '↗'}</span></button><p className="lx-save-notice" role="status">{notice}</p>
        <details className="lx-calculation-details"><summary>{text('გამოთვლის დეტალები', 'View calculation details')}<span>+</span></summary><dl><div><dt>{text('წყაროს ჩანაწერი', 'Source record')}</dt><dd>{selected.id}</dd></div><div><dt>{text('სტატუსი', 'Status')}</dt><dd>CALCULATION PENDING</dd></div><div><dt>{text('გეომეტრია და მასალა', 'Geometry and material')}</dt><dd>{text('მონაცემები მოსაწოდებელია', 'Awaiting data')}</dd></div><div><dt>{text('კურსის წყარო', 'Price source')}</dt><dd>{text('ჯერ არ გამოყენებულა', 'Not applied yet')}</dd></div></dl><p>{text('ვიზუალი კონცეფციაა. მასალის არჩევანი სურვილს აღნიშნავს. მონახაზი შეთავაზების დასამტკიცებლად შეფასებას საჭიროებს.', 'The image is a concept. Material selection records a preference. The draft needs review before an offer can be approved.')}</p></details>
      </div>
    </div>
    <div className="lx-journey-strip"><span className="lx-eyebrow">YOUR JOURNEY</span>{[text('აირჩიე', 'Choose'), text('მოირგე', 'Fit to me'), text('შექმენი', 'Create'), text('შეინახე', 'Save'), text('დაადასტურე', 'Verify')].map((step, index) => <span key={step}><small>0{index + 1}</small>{step}</span>)}</div>
    <GeometryEstimatePanel language={language} />
    <section className="lx-atelier-closing"><span className="lx-eyebrow">ONE WORLD. YOUR OWN SIGNATURE.</span><h2>{text('ნივთიდან — შენს ისტორიამდე.', 'From an object to your story.')}</h2><Link to="/houses">{text('აღმოაჩინე Brand House', 'Discover your Brand House')} ↗</Link></section>
  </div>
}
