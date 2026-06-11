import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import FileDropzone from './FileDropzone'
import MeshyAIPanel from './MeshyAIPanel'
import Model3DViewer from './Model3DViewer'

export type CatalogItemStudioPayload = {
  title: string
  description?: string
  metalType?: string
  imageUrl?: string
  imageFile?: File | null
  modelFile?: File | null
  modelUrl?: string | null
  modelFormat?: string | null
  meshyPrompt?: string
}

type Tab = 'details' | 'image' | 'model'

type Props = {
  onSubmit: (payload: CatalogItemStudioPayload) => void
  submitting?: boolean
  error?: string | null
}

const MODEL_ACCEPT = '.glb,.gltf,.usdz,.usdc,model/gltf-binary,model/vnd.usdz+zip'

function modelFormatFromName(name: string) {
  const ext = name.split('.').pop()?.toLowerCase()
  return ext ?? 'glb'
}

export default function CatalogItemStudio({ onSubmit, submitting, error }: Props) {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('details')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [metal, setMetal] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [modelPreview, setModelPreview] = useState<string | null>(null)
  const [meshyModelUrl, setMeshyModelUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null)
      return
    }
    const url = URL.createObjectURL(imageFile)
    setImagePreview(url)
    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  useEffect(() => {
    if (!modelFile) {
      if (!meshyModelUrl) setModelPreview(null)
      return
    }
    const url = URL.createObjectURL(modelFile)
    setModelPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [modelFile, meshyModelUrl])

  const activeModelUrl = modelPreview ?? meshyModelUrl
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'details', label: t('collections.tabDetails', { defaultValue: 'Details' }), icon: '◎' },
    { id: 'image', label: t('collections.tabImage', { defaultValue: 'Image' }), icon: '🖼' },
    { id: 'model', label: t('collections.tab3d', { defaultValue: '3D Model' }), icon: '◆' },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setTab('details')
      return
    }
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      metalType: metal.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      imageFile,
      modelFile,
      modelUrl: activeModelUrl,
      modelFormat: modelFile ? modelFormatFromName(modelFile.name) : meshyModelUrl ? 'glb' : null,
    })
  }

  const resetMedia = () => {
    setImageFile(null)
    setImageUrl('')
    setModelFile(null)
    setMeshyModelUrl(null)
  }

  return (
    <form className="catalog-studio" onSubmit={handleSubmit}>
      <div className="catalog-studio-head">
        <p className="dash-label">{t('collections.addItem', { defaultValue: 'Add catalog item' })}</p>
        <p className="catalog-studio-sub">
          {t('collections.studioSub', { defaultValue: 'Upload media or generate a 3D model with Meshy AI.' })}
        </p>
      </div>

      <div className="catalog-studio-tabs" role="tablist">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`catalog-studio-tab${tab === item.id ? ' catalog-studio-tab--active' : ''}`}
            onClick={() => setTab(item.id)}
          >
            <span aria-hidden>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      <div className="catalog-studio-body">
        {tab === 'details' && (
          <div className="catalog-studio-pane space-y-4">
            <div>
              <label className="auth-field-label">{t('collections.itemName', { defaultValue: 'Item title' })}</label>
              <input className="gold-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <label className="auth-field-label">{t('collections.itemDesc', { defaultValue: 'Description' })}</label>
              <textarea className="gold-input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <label className="auth-field-label">{t('collections.metal', { defaultValue: 'Metal / material' })}</label>
              <input className="gold-input" value={metal} onChange={(e) => setMetal(e.target.value)} placeholder="Gold 999, Silver…" />
            </div>
          </div>
        )}

        {tab === 'image' && (
          <div className="catalog-studio-pane catalog-studio-split">
            <div>
              <FileDropzone
                label={t('collections.uploadImage', { defaultValue: 'Upload product image' })}
                hint="JPG, PNG, WebP · max 10 MB"
                accept="image/jpeg,image/png,image/webp,image/gif"
                icon="🖼"
                fileName={imageFile?.name}
                previewUrl={imagePreview}
                previewType="image"
                onFile={setImageFile}
              />
              <p className="catalog-studio-or">{t('collections.or', { defaultValue: 'or paste URL' })}</p>
              <input
                className="gold-input"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>
            {(imagePreview || imageUrl) && (
              <div className="catalog-studio-side-preview">
                <p className="dash-label mb-2">{t('collections.preview', { defaultValue: 'Preview' })}</p>
                <img src={imagePreview ?? imageUrl} alt="" className="catalog-studio-image-preview" />
              </div>
            )}
          </div>
        )}

        {tab === 'model' && (
          <div className="catalog-studio-pane catalog-studio-model-layout">
            <div className="catalog-studio-model-upload">
              <FileDropzone
                label={t('collections.upload3d', { defaultValue: 'Upload 3D model' })}
                hint="GLB, GLTF, USDZ, USDC"
                accept={MODEL_ACCEPT}
                icon="◆"
                fileName={modelFile?.name}
                onFile={(f) => {
                  setModelFile(f)
                  if (f) setMeshyModelUrl(null)
                }}
              />
              <p className="catalog-studio-divider">
                <span>{t('collections.or', { defaultValue: 'or' })}</span>
              </p>
              <MeshyAIPanel
                onGenerate={async ({ prompt }) => {
                  // Parent/backend will replace this — demo returns null preview
                  void prompt
                  return { prompt, style: '', previewUrl: null }
                }}
                resultUrl={meshyModelUrl}
              />
            </div>
            <div className="catalog-studio-model-preview">
              <p className="dash-label mb-2">{t('collections.modelPreview', { defaultValue: '3D preview' })}</p>
              <Model3DViewer modelUrl={activeModelUrl} />
              {modelFile && (
                <p className="catalog-studio-file-meta">
                  {modelFile.name} · {modelFormatFromName(modelFile.name).toUpperCase()}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {(imageFile || modelFile || imageUrl) && (
        <div className="catalog-studio-assets">
          <span>{t('collections.attached', { defaultValue: 'Attached:' })}</span>
          {imageFile && <span className="catalog-studio-pill">🖼 {imageFile.name}</span>}
          {!imageFile && imageUrl && <span className="catalog-studio-pill">🔗 Image URL</span>}
          {modelFile && <span className="catalog-studio-pill">◆ {modelFile.name}</span>}
          {meshyModelUrl && <span className="catalog-studio-pill">✦ Meshy AI</span>}
          <button type="button" className="catalog-studio-clear" onClick={resetMedia}>
            {t('collections.clearMedia', { defaultValue: 'Clear media' })}
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="catalog-studio-footer">
        <p className="catalog-studio-footer-note">
          {t('collections.uploadNote', {
            defaultValue: 'File uploads will be saved when you connect the catalog upload API on the server.',
          })}
        </p>
        <button type="submit" disabled={submitting} className="luxury-btn-glass">
          {submitting ? '…' : t('collections.addItemBtn', { defaultValue: 'Add item' })}
        </button>
      </div>
    </form>
  )
}
