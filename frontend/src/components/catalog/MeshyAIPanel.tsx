import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Model3DViewer from './Model3DViewer'

const STYLES = ['Jewelry', 'Luxury coin', 'Watch', 'Sculpture', 'Ring', 'Pendant'] as const

export type MeshyGenerateResult = {
  prompt: string
  style: string
  previewUrl: string | null
}

type Props = {
  onGenerate?: (payload: { prompt: string; style: string }) => Promise<MeshyGenerateResult | void>
  resultUrl?: string | null
}

export default function MeshyAIPanel({ onGenerate, resultUrl: externalResult }: Props) {
  const { t } = useTranslation()
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState<string>(STYLES[0])
  const [status, setStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [localResult, setLocalResult] = useState<string | null>(null)

  const resultUrl = externalResult ?? localResult

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setStatus('generating')
    setProgress(8)

    try {
      if (onGenerate) {
        const res = await onGenerate({ prompt: prompt.trim(), style })
        if (res?.previewUrl) setLocalResult(res.previewUrl)
        setStatus('done')
        setProgress(100)
        return
      }

      // Visual demo until Meshy API is wired
      const steps = [18, 42, 68, 88, 100]
      for (const p of steps) {
        await new Promise((r) => setTimeout(r, 500))
        setProgress(p)
      }
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="catalog-meshy-panel">
      <div className="catalog-meshy-header">
        <div className="catalog-meshy-badge">
          <span aria-hidden>✦</span>
          Meshy AI
        </div>
        <p className="catalog-meshy-sub">
          {t('collections.meshySub', { defaultValue: 'Describe your piece — AI generates a 3D model for your catalog.' })}
        </p>
      </div>

      <label className="auth-field-label" htmlFor="meshy-prompt">
        {t('collections.meshyPrompt', { defaultValue: 'Prompt' })}
      </label>
      <textarea
        id="meshy-prompt"
        className="gold-input catalog-meshy-prompt"
        rows={4}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={t('collections.meshyPlaceholder', {
          defaultValue: 'e.g. A luxury gold coin with MERGE STARS engraving, brushed metal finish…',
        })}
      />

      <p className="auth-field-label mt-4">{t('collections.meshyStyle', { defaultValue: 'Style' })}</p>
      <div className="catalog-meshy-chips">
        {STYLES.map((s) => (
          <button
            key={s}
            type="button"
            className={`catalog-meshy-chip${style === s ? ' catalog-meshy-chip--active' : ''}`}
            onClick={() => setStyle(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="catalog-meshy-actions">
        <button
          type="button"
          className="catalog-meshy-generate"
          disabled={!prompt.trim() || status === 'generating'}
          onClick={handleGenerate}
        >
          {status === 'generating'
            ? t('collections.meshyGenerating', { defaultValue: 'Generating…' })
            : t('collections.meshyGenerate', { defaultValue: 'Generate 3D with Meshy AI' })}
        </button>
        <span className="catalog-meshy-api-note">
          {t('collections.meshyApiNote', { defaultValue: 'Connect MESHY_API_KEY on the server to enable live generation.' })}
        </span>
      </div>

      {status === 'generating' && (
        <div className="catalog-meshy-progress">
          <div className="catalog-meshy-progress-bar" style={{ width: `${progress}%` }} />
          <span>{progress}%</span>
        </div>
      )}

      {status === 'error' && (
        <p className="text-sm text-red-400 mt-2">
          {t('collections.meshyError', { defaultValue: 'Generation failed. Check Meshy API configuration.' })}
        </p>
      )}

      <div className="catalog-meshy-preview mt-6">
        <p className="dash-label mb-3">{t('collections.meshyPreview', { defaultValue: 'AI preview' })}</p>
        <Model3DViewer
          modelUrl={resultUrl}
          emptyLabel={t('collections.meshyPreviewEmpty', { defaultValue: 'Generated model will appear here' })}
        />
        {status === 'done' && !resultUrl && (
          <p className="catalog-meshy-demo-note">
            {t('collections.meshyDemoDone', { defaultValue: 'Demo complete — wire Meshy API to load the real .glb here.' })}
          </p>
        )}
      </div>
    </div>
  )
}
