import { useCallback, useEffect, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'
import { useTranslation } from 'react-i18next'
import { getCroppedAvatarFile } from '@/utils/cropImage'

interface AvatarCropModalProps {
  imageSrc: string
  fileName?: string
  onCancel: () => void
  onConfirm: (file: File) => void
}

export default function AvatarCropModal({
  imageSrc,
  fileName,
  onCancel,
  onConfirm,
}: AvatarCropModalProps) {
  const { t } = useTranslation()
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onCancel()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [busy, onCancel])

  const apply = async () => {
    if (!croppedAreaPixels || busy) return
    setBusy(true)
    setError(null)
    try {
      const file = await getCroppedAvatarFile(imageSrc, croppedAreaPixels, fileName)
      onConfirm(file)
    } catch {
      setError(t('pages.profile.cropFailed', { defaultValue: 'Could not crop photo' }))
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.72)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="avatar-crop-title"
      onClick={() => {
        if (!busy) onCancel()
      }}
    >
      <div
        className="w-full sm:max-w-md flex flex-col overflow-hidden"
        style={{
          background: 'rgba(12,12,12,0.98)',
          border: '1px solid rgba(201,168,76,0.28)',
          borderRadius: '8px 8px 0 0',
          boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pt-5 pb-3">
          <h2
            id="avatar-crop-title"
            className="text-xs font-semibold tracking-[0.2em] uppercase"
            style={{ color: '#c9a84c' }}
          >
            {t('pages.profile.cropTitle', { defaultValue: 'Crop photo' })}
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            {t('pages.profile.cropHint', {
              defaultValue: 'Drag to reposition. Use the slider to zoom.',
            })}
          </p>
        </div>

        <div className="relative mx-5 h-72 sm:h-80 overflow-hidden rounded-sm bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: { background: '#000' },
              cropAreaStyle: {
                border: '2px solid rgba(201,168,76,0.85)',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
              },
            }}
          />
        </div>

        <div className="px-5 pt-4 pb-2">
          <label className="flex items-center gap-3 text-xs text-neutral-400 tracking-wide">
            <span className="shrink-0 uppercase tracking-[0.15em]" style={{ color: 'rgba(201,168,76,0.75)' }}>
              {t('pages.profile.cropZoom', { defaultValue: 'Zoom' })}
            </span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-[#c9a84c]"
              disabled={busy}
              aria-label={t('pages.profile.cropZoom', { defaultValue: 'Zoom' })}
            />
          </label>
          {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
        </div>

        <div className="flex gap-3 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            className="luxury-btn-ghost flex-1 justify-center text-xs !min-h-11 !py-2"
            onClick={onCancel}
            disabled={busy}
          >
            {t('common.cancel', { defaultValue: 'Cancel' })}
          </button>
          <button
            type="button"
            className="luxury-btn-glass flex-1 justify-center text-xs !min-h-11 !py-2"
            onClick={() => void apply()}
            disabled={busy || !croppedAreaPixels}
          >
            {busy
              ? t('common.loading', { defaultValue: 'Loading…' })
              : t('pages.profile.cropApply', { defaultValue: 'Apply' })}
          </button>
        </div>
      </div>
    </div>
  )
}
