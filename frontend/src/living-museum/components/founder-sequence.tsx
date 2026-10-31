import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { founderSequence } from '../lib/founder-sequence';
import '../founder-sequence.css';

type Action = 'museum' | 'catalog' | 'commercial';
export function FounderSequence({ onAction }: { onAction: (action: Action) => void }) {
  const [index, setIndex] = useState(0);
  const stage = founderSequence[index];
  return <section className="founder-sequence" aria-label="პლატფორმის თანმიმდევრობა">
    <nav aria-label="მომხმარებლის გზის ეტაპები">{founderSequence.map((item, i) =>
      <button key={item.id} aria-current={i === index ? 'step' : undefined} onClick={() => setIndex(i)}>
        <span>{String(i + 1).padStart(2, '0')}</span>{item.title}
      </button>)}</nav>
    <figure><img src={stage.image} alt={`MERGE ${stage.title} — კონცეფტუალური არქიტექტურა`} /><figcaption>CONCEPT · ვიზუალზე მოცემული ფასები, ზომები და სტატუსები არ არის დადასტურებული მონაცემები.</figcaption></figure>
    <div className="founder-sequence-actions">
      <button type="button" aria-label="წინა ეტაპი" title="წინა ეტაპი" disabled={index === 0} onClick={() => setIndex(i => i - 1)}><ArrowLeft size={18}/></button>
      <h3 aria-live="polite">{stage.title}</h3>
      {stage.action.startsWith('/') ? <Link to={stage.action}>{stage.label}<ArrowRight size={17}/></Link> :
        <button type="button" onClick={() => onAction(stage.action as Action)}>{stage.label}<ArrowRight size={17}/></button>}
      <button type="button" aria-label="შემდეგი ეტაპი" title="შემდეგი ეტაპი" disabled={index === founderSequence.length - 1} onClick={() => setIndex(i => i + 1)}><ArrowRight size={18}/></button>
    </div>
  </section>;
}
