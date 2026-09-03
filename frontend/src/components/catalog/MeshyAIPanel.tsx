import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  generateMeshyFromImages,
  generateMeshyModel,
  extractApiError,
  MESHY_STYLE_PROMPTS,
  triggerGlbDownload,
} from '@/features/catalog/meshy.hooks'

const STYLES = [
  { value: 'Case', labelKey: 'case' },
  { value: 'Jewelry', labelKey: 'jewelry' },
  { value: 'Luxury coin', labelKey: 'luxuryCoin' },
  { value: 'Watch', labelKey: 'watch' },
  { value: 'Sculpture', labelKey: 'sculpture' },
  { value: 'Ring', labelKey: 'ring' },
  { value: 'Pendant', labelKey: 'pendant' },
] as const

export type MeshyStyleOption = { value: string; labelKey: string }

const VIEW_HINTS = [
  { key: 'front', label: 'Front 3/4' },
  { key: 'back', label: 'Back 3/4' },
  { key: 'left', label: 'Left' },
  { key: 'right', label: 'Right' },
] as const

export type MeshyGenerateResult = {
  prompt: string
  style: string
  previewUrl: string | null
  jobId?: string
}

type Props = {
  onGenerate?: (payload: MeshyGenerateResult) => void | Promise<void>
  resultUrl?: string | null
  defaultStyle?: string
  defaultPrompt?: string
  /** Override style chips (e.g. brand-case step shows only Case). */
  styles?: readonly MeshyStyleOption[]
}

type Mode = 'text' | 'image'

type PhotoSlot = {
  id: string
  file: File
  preview: string
}

function isAllowedImage(file: File) {
  return (
    file.type === 'image/jpeg' ||
    file.type === 'image/jpg' ||
    file.type === 'image/png' ||
    /\.(jpe?g|png)$/i.test(file.name)
  )
}

export default function MeshyAIPanel({
  onGenerate,
  resultUrl: externalResult,
  defaultStyle,
  defaultPrompt,
  styles: stylesProp,
}: Props) {
  const { t } = useTranslation()
  const styleOptions = stylesProp ?? STYLES
  const [mode, setMode] = useState<Mode>('text')
  const [prompt, setPrompt] = useState(defaultPrompt ?? '')
  const [style, setStyle] = useState<string>(defaultStyle ?? styleOptions[0]?.value ?? 'Case')
  const [photos, setPhotos] = useState<PhotoSlot[]>([])
  const [status, setStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [localResult, setLocalResult] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resultUrl = externalResult ?? localResult
  const isReady = Boolean(resultUrl) && status !== 'generating' && status !== 'error'

  useEffect(() => {
    if (defaultStyle) setStyle(defaultStyle)
  }, [defaultStyle])

  useEffect(() => {
    if (defaultPrompt) setPrompt((p) => p.trim() || defaultPrompt)
  }, [defaultPrompt])

  useEffect(() => {
    if (externalResult && status === 'idle') {
      setStatus('done')
      setProgress(100)
    }
  }, [externalResult, status])

  useEffect(() => {
    return () => {
      photos.forEach((p) => URL.revokeObjectURL(p.preview))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- revoke only on unmount
  }, [])

  const clearPhotos = () => {
    setPhotos((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.preview))
      return []
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const addPhotos = (list: FileList | File[] | null) => {
    if (!list?.length) return
    const incoming = Array.from(list)
    let err: string | null = null

    setPhotos((prev) => {
      const room = Math.max(0, 4 - prev.length)
      if (room === 0) {
        err = t('collections.meshyMaxPhotos', {
          defaultValue: 'Maximum 4 reference photos (front / back / left / right).',
        })
        return prev
      }
      const next: PhotoSlot[] = []
      for (const file of incoming) {
        if (next.length >= room) {
          err = t('collections.meshyMaxPhotos', {
            defaultValue: 'Maximum 4 reference photos (front / back / left / right).',
          })
          break
        }
        if (!isAllowedImage(file)) {
          err = t('collections.meshyImageTypeError', {
            defaultValue: 'Please upload JPG or PNG photos.',
          })
          continue
        }
        if (file.size > 10 * 1024 * 1024) {
          err = t('collections.meshyImageSizeError', {
            defaultValue: 'Each image must be 10MB or smaller.',
          })
          continue
        }
        next.push({
          id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
          file,
          preview: URL.createObjectURL(file),
        })
      }
      return [...prev, ...next]
    })
    setErrorMsg(err)
  }

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id)
      if (target) URL.revokeObjectURL(target.preview)
      return prev.filter((p) => p.id !== id)
    })
  }

  const applyStylePrompt = () => {
    const suggested = MESHY_STYLE_PROMPTS[style]
    if (suggested) setPrompt(suggested)
  }

  const canGenerate =
    mode === 'text'
      ? Boolean(prompt.trim() || MESHY_STYLE_PROMPTS[style] || style.trim())
      : photos.length >= 1

  const handleGenerate = async () => {
    if (!canGenerate) return
    setStatus('generating')
    setProgress(5)
    setErrorMsg(null)
    if (!externalResult) setLocalResult(null)

    try {
      const res =
        mode === 'image'
          ? await generateMeshyFromImages(
              photos.map((p) => p.file),
              style,
              prompt,
              (p) => setProgress(p),
            )
          : await generateMeshyModel(
              { prompt: prompt.trim(), style },
              (p) => setProgress(p),
            )
      if (res.previewUrl) {
        setLocalResult(res.previewUrl)
        triggerGlbDownload(
          res.previewUrl,
          `merge-stars-${(res.jobId || 'model').slice(0, 8)}.glb`,
        )
      }
      try {
        await onGenerate?.(res)
      } catch (saveErr) {
        setErrorMsg(
          t('configurator.saveAfterGenerateFailed', {
            defaultValue: '3D model generated but could not save: {{msg}}',
            msg: extractApiError(saveErr),
          }),
        )
      }
      setStatus('done')
      setProgress(100)
    } catch (err) {
      setStatus('error')
      setErrorMsg(extractApiError(err))
    }
  }

  const generateButtonLabel =
    status === 'generating'
      ? t('collections.meshyGenerating', { defaultValue: 'Generating…' })
      : isReady
        ? t('collections.meshyRegenerate', { defaultValue: 'Regenerate' })
        : t('collections.meshyGenerate', { defaultValue: 'Generate' })

  return (
    <div className="catalog-meshy-panel">
      <div className="catalog-meshy-header">
        <p className="catalog-meshy-sub">
          {isReady
            ? t('collections.meshyReady', {
                defaultValue:
                  'Your 3D model is ready. Update the prompt below and tap Regenerate for a new version.',
              })
            : t('collections.meshySub', {
                defaultValue: 'Describe your piece — AI will generate a 3D model for your catalog.',
              })}
        </p>
      </div>

      <div className="catalog-meshy-modes" role="tablist" aria-label="3D generation input mode">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'text'}
          className={`catalog-meshy-mode${mode === 'text' ? ' catalog-meshy-mode--active' : ''}`}
          onClick={() => setMode('text')}
          disabled={status === 'generating'}
        >
          {t('collections.meshyModeText', { defaultValue: 'Describe' })}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'image'}
          className={`catalog-meshy-mode${mode === 'image' ? ' catalog-meshy-mode--active' : ''}`}
          onClick={() => setMode('image')}
          disabled={status === 'generating'}
        >
          {t('collections.meshyModeImage', { defaultValue: 'Photos + prompt' })}
        </button>
      </div>

      {mode === 'image' && (
        <div className="catalog-meshy-upload">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png"
            className="sr-only"
            id="meshy-images"
            multiple
            onChange={(e) => {
              addPhotos(e.target.files)
              e.target.value = ''
            }}
          />

          <p className="catalog-meshy-multiview-hint">
            {t('collections.meshyMultiHint', {
              defaultValue:
                'Best results: 2–4 views of the same piece — Front 3/4, Back 3/4, Left, Right. Plain background, sharp light.',
            })}
          </p>

          <div className="catalog-meshy-slots">
            {VIEW_HINTS.map((hint, i) => {
              const photo = photos[i]
              return (
                <div key={hint.key} className="catalog-meshy-slot">
                  {photo ? (
                    <>
                      <img src={photo.preview} alt="" />
                      <span className="catalog-meshy-slot-label">{hint.label}</span>
                      <button
                        type="button"
                        className="catalog-meshy-slot-remove"
                        onClick={() => removePhoto(photo.id)}
                        disabled={status === 'generating'}
                        aria-label="Remove photo"
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="catalog-meshy-slot-empty"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={status === 'generating' || photos.length >= 4}
                    >
                      <span>+</span>
                      <em>{hint.label}</em>
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          <div className="catalog-meshy-upload-actions">
            <button
              type="button"
              className="catalog-meshy-upload-clear"
              onClick={() => fileInputRef.current?.click()}
              disabled={status === 'generating' || photos.length >= 4}
            >
              {t('collections.meshyAddPhotos', {
                defaultValue: photos.length ? 'Add more photos' : 'Add photos',
              })}
            </button>
            {photos.length > 0 && (
              <button
                type="button"
                className="catalog-meshy-upload-clear"
                onClick={clearPhotos}
                disabled={status === 'generating'}
              >
                {t('collections.meshyClearPhotos', { defaultValue: 'Clear all' })}
              </button>
            )}
            <span className="catalog-meshy-photo-count">
              {photos.length}/4
            </span>
          </div>
        </div>
      )}

      <div className="catalog-meshy-prompt-block">
        <div className="catalog-meshy-prompt-head">
          <label className="auth-field-label" htmlFor="meshy-prompt">
            {mode === 'image'
              ? t('collections.meshyPhotoPrompt', {
                  defaultValue: 'Prompt (optional — guides materials & details)',
                })
              : t('collections.meshyPrompt', { defaultValue: 'Prompt' })}
          </label>
          {mode === 'image' && MESHY_STYLE_PROMPTS[style] && (
            <button
              type="button"
              className="catalog-meshy-fill-prompt"
              onClick={applyStylePrompt}
              disabled={status === 'generating'}
            >
              {t('collections.meshyUseStylePrompt', {
                defaultValue: 'Use style standard',
              })}
            </button>
          )}
        </div>
        <textarea
          id="meshy-prompt"
          className="gold-input catalog-meshy-prompt"
          rows={mode === 'image' ? 5 : 4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            isReady
              ? t('collections.meshyRegeneratePlaceholder', {
                  defaultValue:
                    'Describe changes — e.g. sharper engraving, brushed gold finish, slimmer case…',
                })
              : mode === 'image'
                ? t('collections.meshyPhotoPromptPlaceholder', {
                    defaultValue:
                      'Optional: describe materials, separated parts, crystal, engravings… Or tap “Use style standard”.',
                  })
                : t('collections.meshyPlaceholder', {
                    defaultValue:
                      'e.g. A luxury gold coin with MERGE STARS engraving, brushed metal finish…',
                  })
          }
        />
      </div>

      <p className="auth-field-label mt-4">
        {t('collections.meshyStyle', { defaultValue: 'Style' })}
      </p>
      <div className="catalog-meshy-chips">
        {styleOptions.map((s) => (
          <button
            key={s.value}
            type="button"
            className={`catalog-meshy-chip${style === s.value ? ' catalog-meshy-chip--active' : ''}`}
            onClick={() => setStyle(s.value)}
            disabled={status === 'generating'}
          >
            {t(`collections.meshyStyles.${s.labelKey}`)}
          </button>
        ))}
      </div>

      <div className="catalog-meshy-actions">
        <button
          type="button"
          className="catalog-meshy-generate"
          disabled={!canGenerate || status === 'generating'}
          onClick={handleGenerate}
        >
          {generateButtonLabel}
        </button>
      </div>

      {status === 'generating' && (
        <div className="catalog-meshy-progress">
          <div className="catalog-meshy-progress-bar" style={{ width: `${progress}%` }} />
          <span>{progress}%</span>
        </div>
      )}

      {status === 'error' && (
        <p className="text-sm text-red-400 mt-2">
          {errorMsg ||
            t('collections.meshyError', {
              defaultValue: 'Generation failed. Please try again.',
            })}
        </p>
      )}
    </div>
  )
}
