type Props = {
  src: string
  className?: string
  alt?: string
}

/** Renders an asset SVG as img to avoid duplicate gradient id collisions. */
export default function BrandIcon({ src, className = '', alt = '' }: Props) {
  return <img src={src} alt={alt} className={`brand-icon ${className}`.trim()} aria-hidden={alt ? undefined : true} />
}
