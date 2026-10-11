import { useEffect } from 'react'

type MuseumShowcaseLightboxProps = {
  open: boolean
  image: string
  alt: string
  title: string
  closeLabel: string
  prevLabel: string
  nextLabel: string
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
}

export function MuseumShowcaseLightbox({
  open,
  image,
  alt,
  title,
  closeLabel,
  prevLabel,
  nextLabel,
  onClose,
  onPrev,
  onNext,
}: MuseumShowcaseLightboxProps) {
  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev?.()
      if (e.key === 'ArrowRight') onNext?.()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose, onPrev, onNext])

  if (!open) return null

  return (
    <div className="mus-lightbox" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        className="mus-lightbox-backdrop"
        onClick={onClose}
        aria-label={closeLabel}
      />
      <div className="mus-lightbox-panel">
        <button type="button" className="mus-lightbox-close" onClick={onClose} aria-label={closeLabel}>
          ×
        </button>
        {onPrev && (
          <button type="button" className="mus-lightbox-nav mus-lightbox-nav--prev" onClick={onPrev} aria-label={prevLabel}>
            ‹
          </button>
        )}
        {onNext && (
          <button type="button" className="mus-lightbox-nav mus-lightbox-nav--next" onClick={onNext} aria-label={nextLabel}>
            ›
          </button>
        )}
        <figure className="mus-lightbox-figure">
          <img src={image} alt={alt} />
          <figcaption>{title}</figcaption>
        </figure>
      </div>
    </div>
  )
}
