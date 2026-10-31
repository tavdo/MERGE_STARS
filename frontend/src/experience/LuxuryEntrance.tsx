import { Link } from 'react-router-dom'
import type { Language } from './content'

export default function LuxuryEntrance({ language }: { language: Language }) {
  const text = (ka: string, en: string) => language === 'ka' ? ka : en
  return <section className="lx-entrance">
    <img src="/museum/grand-museum-entrance-v2.png" alt={text('MERGE მუზეუმის შავი და ოქროსფერი მთავარი შესასვლელი', 'MERGE black and gold grand museum entrance concept')} fetchPriority="high" />
    <div className="lx-entrance-shade" />
    <div className="lx-entrance-copy"><span className="lx-eyebrow">THE LIVING CREATION ECOSYSTEM</span><h1><span>MERGE</span><br /><em>⭐ STARS</em></h1><p>{text('შექმენი შენი სამყარო.', 'Create your world.')}</p><Link className="lx-primary-action" to="/museum">{text('შედი ცოცხალ მუზეუმში', 'Enter the Living Museum')}<span>↗</span></Link><Link className="lx-entrance-secondary" to="/museum#mx-museum-collection">{text('შექმენი შენი ვერსია', 'Create your version')} ↗</Link></div>
    <div className="lx-entrance-caption"><span>MERGE / THE GRAND ENTRANCE</span><span>{text('ვიზუალური კონცეფცია', 'Visual concept')} · 01</span></div>
  </section>
}
