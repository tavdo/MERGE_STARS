import { useRef, useState } from 'react'

type Props = {
  label: string
  hint?: string
  accept: string
  icon?: string
  fileName?: string | null
  previewUrl?: string | null
  previewType?: 'image' | 'model'
  onFile: (file: File | null) => void
}

export default function FileDropzone({
  label,
  hint,
  accept,
  icon = '📁',
  fileName,
  previewUrl,
  previewType = 'image',
  onFile,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0] ?? null
    onFile(file)
  }

  return (
    <div className="catalog-dropzone-wrap">
      <p className="auth-field-label">{label}</p>
      <button
        type="button"
        className={`catalog-dropzone${dragOver ? ' catalog-dropzone--active' : ''}${fileName ? ' catalog-dropzone--filled' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFiles(e.dataTransfer.files)
        }}
      >
        {previewUrl && previewType === 'image' ? (
          <img src={previewUrl} alt="" className="catalog-dropzone-preview-img" />
        ) : (
          <>
            <span className="catalog-dropzone-icon" aria-hidden>{icon}</span>
            <span className="catalog-dropzone-title">
              {fileName ?? 'Click or drag file here'}
            </span>
            {hint && <span className="catalog-dropzone-hint">{hint}</span>}
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {fileName && (
        <button type="button" className="catalog-dropzone-clear" onClick={() => onFile(null)}>
          Remove file
        </button>
      )}
    </div>
  )
}
