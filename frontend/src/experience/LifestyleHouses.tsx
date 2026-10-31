import { Link, useSearchParams } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { districts, type Language } from './content'
import { lifestyleHouses, lifestyleHouse, lifestyleDesignLink } from './lifestyle-houses'
import './lifestyle-houses.css'

export default function LifestyleHouses({ language }: { language: Language }) {
  const [params, setParams] = useSearchParams()
  const house = lifestyleHouse(params.get('house'))
  const t = (ka: string, en: string) => language === 'ka' ? ka : en
  return <section className="lh-world" aria-label={t('MERGE ცხოვრების სახლები', 'MERGE lifestyle houses')}>
    <figure className="lh-world-view"><img src="/museum/lifestyle-megapolis-20261029.png" width="1586" height="992" loading="lazy" decoding="async" alt={t('MERGE მეგაპოლისის არქიტექტურული კონცეფცია: რენესანსის, საქორწინო და ოჯახური სივრცეები', 'MERGE architectural concept with Renaissance, Wedding and Family districts')}/><figcaption>MERGE LIVING MUSEUM · {t('არქიტექტურული კონცეფცია', 'ARCHITECTURAL CONCEPT')}</figcaption></figure>
    <nav className="lh-house-nav" aria-label={t('აირჩიე ცხოვრების სახლი', 'Choose a lifestyle house')}>{lifestyleHouses.map(item => <button type="button" key={item.id} aria-pressed={house.id === item.id} onClick={() => { const next = new URLSearchParams(params); next.set('house', item.id); setParams(next, { preventScrollReset: true }) }}>{item.name}</button>)}</nav>
    <div className="lh-house-heading"><div><p>{house.name}</p><h2>{house.title[language]}</h2></div><Link to={lifestyleDesignLink(house.id, house.categories[0])!}>{t('მოამზადე საკუთარი დიზაინი', 'Prepare your design')}<ArrowUpRight size={18}/></Link></div>
    <div className="lh-category-list">{house.categories.map(category => {
      const label = districts.find(item => item[0] === category)
      return <div key={category}><Link to={`/museum?category=${category}#mx-museum-collection`}>{label?.[language === 'ka' ? 1 : 2] ?? category}<ArrowUpRight size={18}/></Link><Link to={lifestyleDesignLink(house.id, category)!} aria-label={`${t('დიზაინის მომზადება', 'Prepare design')}: ${label?.[language === 'ka' ? 1 : 2] ?? category}`}>{t('ჩემი ვერსია', 'My version')}</Link></div>
    })}</div>
    <p className="lh-boundary">{t('ეს თემატური სივრცეებია. საკუთარი დიზაინი ჯერ მონახაზია; რეალური 3D გენერაცია, CORE შენახვა და წარმოება შესაბამის დადასტურებას საჭიროებს.', 'These are curated experiences. Your design begins as a brief; real 3D generation, CORE saving and production require their respective confirmations.')}</p>
  </section>
}
