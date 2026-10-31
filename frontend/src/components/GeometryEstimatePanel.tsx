import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { metalsApi } from '@/features/coins/api/metals.api'
import { estimateWeight, estimatePrice } from '@/shared/utils/geometryEstimate'
import type { Language } from '@/experience/content'

export default function GeometryEstimatePanel({ language }: { language: Language }) {
  const t = (ka: string, en: string) => language === 'ka' ? ka : en
  const [values, setValues] = useState<Record<string, string>>({ circumference: '', width: '', thickness: '', density: '', pricingWeight: '' })
  const [line, setLine] = useState('silver'), [notice, setNotice] = useState(''), [now, setNow] = useState(Date.now)
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id) }, [])
  const quotes = useQuery({ queryKey: ['core-material-quotes'], queryFn: () => metalsApi.getLive().then(r => r.data.data), retry: false, refetchInterval: 30000 })
  const geometry = estimateWeight(Number(values.circumference), Number(values.width), Number(values.thickness), Number(values.density))
  const price = geometry ? estimatePrice(line, Number(values.pricingWeight), quotes.data || [], now) : null
  const field = (key: string, label: string) => <label key={key}>{label}<input type="number" min="0" step="any" value={values[key]} onChange={e => { setValues(v => ({ ...v, [key]: e.target.value })); setNotice('') }} /></label>
  function save() {
    if (!geometry) return
    try { localStorage.setItem('merge.geometry-estimate.v1', JSON.stringify({ inputs: values, geometry, price, line, status: 'ESTIMATED', inputSource: 'USER_ENTERED_UNVERIFIED', calculatedAt: new Date().toISOString(), orderAllowed: false })); setNotice(t('შეფასება შენახულია მხოლოდ ამ ბრაუზერში. CORE-ში დამტკიცებული ჩანაწერი არ შექმნილა.', 'Estimate saved in this browser only. No verified CORE record was created.')) }
    catch { setNotice(t('შენახვა ვერ მოხერხდა.', 'Could not save.')) }
  }
  return <section className="ge-section" aria-labelledby="geometry-title">
    <span className="lx-eyebrow">DIGITAL TWIN / GEOMETRY / ESTIMATED</span><h2 id="geometry-title">{t('ზომიდან — წონამდე.', 'Measurements to weight.')}</h2><p>{t('რგოლის გამოთვლა: შეიყვანე ზომები და მასალის სიმკვრივე. წონა ავტომატურად განახლდება.', 'Circular band calculator: enter dimensions and material density. Weight updates automatically.')}</p>
    <div className="ge-layout"><div>
      {field('circumference', t('თითის გარშემოწერილობა · mm', 'Finger circumference · mm'))}
      {field('width', t('ბეჭდის სიგანე · mm', 'Band width · mm'))}
      {field('thickness', t('ბეჭდის სისქე · mm', 'Band thickness · mm'))}
      {field('density', t('მასალის სიმკვრივე · g/cm³', 'Material density · g/cm³'))}
      <p>{t('მოდელი ითვლის მთლიან, მართკუთხა კვეთის რგოლს. ქვა, ღრუ, სამაგრი და მოზაიკა არ შედის. სიმკვრივე შენი კონკრეტული მასალის მონაცემიდან უნდა აიღო.', 'The model assumes a solid rectangular band. Stones, cavities, settings and mosaic are excluded. Use density for your actual material.')}</p><Link to="/fit-profile">{t('ჩემი ზომების პროფილი', 'My measurements profile')} ↗</Link>
    </div><div className="ge-results" aria-live="polite">
      <span className="lx-eyebrow">ESTIMATED / USER INPUT</span><h3>{t('შეფასებითი შედეგი', 'Estimated result')}</h3>
      <dl><div><dt>{t('მოცულობა', 'Volume')}</dt><dd>{geometry ? `${geometry.volume.toFixed(4)} cm³` : '—'}</dd></div><div><dt>ESTIMATED WEIGHT</dt><dd>{geometry ? `${geometry.grams.toFixed(3)} g` : '—'}</dd></div></dl>
      <label>Brand Line<select value={line} onChange={e => { setLine(e.target.value); setNotice('') }}><option value="silver">Silver</option><option value="gold">Gold</option><option value="premium">Premium</option></select></label>
      {field('pricingWeight', t('ფასის საანგარიშო წონა · kg', 'Pricing weight · kg'))}
      <p>{t('ეს ცალკე საანგარიშო საფუძველია. ფიზიკურ წონას ავტომატურად არ უდრის. შეყვანილი მონაცემები დაუდასტურებელია.', 'This is a separate pricing basis. It does not automatically equal physical weight. Entered data is unverified.')}</p>
      <dl><div><dt>ESTIMATED PRICE</dt><dd>{price ? new Intl.NumberFormat(language === 'ka' ? 'ka-GE' : 'en-US', { style: 'currency', currency: 'USD' }).format(price.minor / 100) : '—'}</dd></div><div><dt>VERIFIED OFFER</dt><dd>{t('მიუწვდომელია', 'Unavailable')}</dd></div></dl>
      <p>{line === 'premium' ? t('Premium-ის წესი დამტკიცებას საჭიროებს.', 'Premium pricing requires approval.') : !price ? t('ფასი საჭიროებს გეომეტრიას, საანგარიშო წონასა და მოქმედ CORE კურსს. კურსის არქონისას წონის გამოთვლა კვლავ მუშაობს.', 'Pricing requires geometry, a pricing weight and a current CORE quote. Weight still calculates without a quote.') : t('გამოყენებულია მოქმედი CORE კურსი. შედეგი შეფასებაა.', 'Current CORE quote applied. Result is an estimate.')}</p>
      {quotes.isError && <button className="mx-button mx-secondary" type="button" onClick={() => quotes.refetch()}>{t('კურსის ხელახლა ჩატვირთვა', 'Retry quote')}</button>}
      <button className="mx-button" type="button" disabled={!geometry} onClick={save}>{t('შეინახე შეფასების მონახაზი', 'Save estimate draft')}</button><p role="status">{notice}</p>
      <details><summary>{t('ფორმულა და წყარო', 'Formula and source')}</summary><p>r = circumference / (2π)<br />V = π × ((r + thickness)² − r²) × width / 1000<br />g = V × density<br />Silver = W × (Ag + Ag)<br />Gold = W × Au</p>{price?.sources.map(q => <p key={q.metal}>{q.metal}: {q.pricePerKgUsd} USD/kg<br />{q.source}<br />{q.sourceTimestamp} — {q.validUntil}</p>)}</details>
      <p>{t('შეფასება არ არის საბოლოო შეთავაზება ან წარმოების ნებართვა. საკუთარი დიზაინი ანგარიშში შეინახე და შემოწმება მოითხოვე.', 'An estimate is not a final offer or production authorization. Save a design to your account and request review.')}</p><Link to="/my-designs">{t('ჩემი დიზაინები და შემოწმება', 'My designs and verification')} ↗</Link>
    </div></div>
  </section>
}
