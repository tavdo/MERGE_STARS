import masterLogo from '../assets/assistant-logo.png'

/** Existing canonical asset: never recolor, crop, redraw or substitute a user mark. */
export default function MergeMasterLogo({ className = '', decorative = false }: { className?: string; decorative?: boolean }) {
  return <img src={masterLogo} className={className} alt={decorative ? '' : 'MERGE ⭐ STARS — master identity'} aria-hidden={decorative || undefined} />
}
