import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Model3DViewer from '../catalog/Model3DViewer'

const STYLE_KEYS = ['luxuryCoin', 'jewelry', 'ring', 'pendant', 'sculpture', 'watch'] as const

type Props = {
  /** Called once the user has attempted generation (required to continue). */
  onAttempted: () => void
  attempted: boolean
  prompt: string
  onPromptChange: (value: string) => void
  styleKey: string
  onStyleChange: (value: string) => void
}

export default function OrderAIDesignPanel({
  onAttempted,
  attempted,
  prompt,
  onPromptChange,
  styleKey,
  onStyleChange,
}: Props) {
  const { t } = useTranslation()
  const [status, setStatus] = useState<'idle' | 'generating' | 'unavailable'>('idle')
  const [progress, setProgress] = useState(0)

  const handleGenerate = async () => {
    if (!prompt.trim() || status === 'generating') return
    setStatus('generating')
    setProgress(12)

    const steps = [28, 48, 72, 90]
    for (const p of steps) {
      await new Promise((r) => setTimeout(r, 280))
      setProgress(p)
    }

    setProgress(100)
    setStatus('unavailable')
    onAttempted()
  }

  return (
    <div className="order-ai-panel">
      <div className="order-ai-header">
        <div className="order-ai-badge">
          <span aria-hidden>✦</span>
          {t('application.aiBadge')}
        </div>
        <p className="order-ai-sub">{t('application.aiSub')}</p>
      </div>

      <label className="apply-label" htmlFor="order-ai-prompt">
        {t('application.aiPrompt')}
      </label>
      <textarea
        id="order-ai-prompt"
        className="apply-field resize-none order-ai-prompt"
        rows={4}
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        placeholder={t('application.aiPlaceholder')}
      />

      <p className="apply-label mt-6">{t('application.aiStyle')}</p>
      <div className="order-ai-chips">
        {STYLE_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className={`order-ai-chip${styleKey === key ? ' order-ai-chip--active' : ''}`}
            onClick={() => onStyleChange(key)}
          >
            {t(`application.aiStyles.${key}`)}
          </button>
        ))}
      </div>

      <div className="order-ai-actions">
        <button
          type="button"
          className="order-ai-generate"
          disabled={!prompt.trim() || status === 'generating'}
          onClick={handleGenerate}
        >
          {status === 'generating' ? t('application.aiGenerating') : t('application.aiGenerate')}
        </button>
        <p className="order-ai-hint">{t('application.aiRequiredHint')}</p>
      </div>

      {status === 'generating' && (
        <div className="order-ai-progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="order-ai-progress-bar" style={{ width: `${progress}%` }} />
          <span>{progress}%</span>
        </div>
      )}

      {status === 'unavailable' && (
        <div className="order-ai-unavailable" role="status">
          <p className="order-ai-unavailable-title">{t('application.aiUnavailableTitle')}</p>
          <p className="order-ai-unavailable-body">{t('application.aiUnavailable')}</p>
        </div>
      )}

      <div className="order-ai-preview mt-6">
        <p className="dash-label mb-3">{t('application.aiPreview')}</p>
        <Model3DViewer modelUrl={null} emptyLabel={t('application.aiPreviewEmpty')} className="order-ai-viewer" />
      </div>

      {attempted && (
        <p className="order-ai-acknowledged">{t('application.aiAcknowledged')}</p>
      )}
    </div>
  )
}
