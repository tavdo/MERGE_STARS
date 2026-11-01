"use client";
import { ArrowRight } from 'lucide-react';
import { fashionMuseumSections, fashionMuseumDestination, type FashionMuseumChoice } from '@/museum-v78/lib/fashion-museum';

export function FashionMuseum({ disabled, onDestination }: { disabled: boolean; onDestination: (destination: ReturnType<typeof fashionMuseumDestination>) => void }) {
  function open(choice: FashionMuseumChoice) { if (!disabled) onDestination(fashionMuseumDestination(choice)); }
  return <section className="fashion-museum-directory" aria-label="Complete Fashion Museum">
    <header><span className="eyebrow">FASHION LIVING MUSEUM</span><h3>Your complete wardrobe world.</h3><p>Explore a category, discover public brands, or prepare your own design.</p></header>
    <div>{fashionMuseumSections.map(section => <nav key={section.title} aria-label={section.title}>
      <h4>{section.title}</h4>{section.choices.map(choice => <button type="button" key={choice.label} disabled={disabled} onClick={() => open(choice)}><span>{choice.label}</span><ArrowRight size={16}/></button>)}
    </nav>)}</div>
    <p className="fine-note">Character designs require the appropriate rights. Public exhibits come from CORE; missing products are not generated substitutes.</p>
  </section>;
}
