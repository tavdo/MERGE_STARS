import React, {
  Suspense,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { Canvas } from '@react-three/fiber'
import { Center, Environment, OrbitControls, useGLTF } from '@react-three/drei'

function GlbModel({ url, onLoaded }: { url: string; onLoaded?: () => void }) {
  const { scene } = useGLTF(url)
  const clone = useMemo(() => scene.clone(true), [scene])

  useEffect(() => {
    onLoaded?.()
  }, [onLoaded, scene, url])

  return (
    <Center>
      <primitive object={clone} />
    </Center>
  )
}

class GlbErrorBoundary extends React.Component<
  { children: ReactNode; onError: () => void },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch() {
    this.props.onError()
  }

  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

function ViewerCanvas({
  modelUrl,
  onLoaded,
  onError,
  fullscreen,
}: {
  modelUrl: string
  onLoaded: () => void
  onError: () => void
  fullscreen?: boolean
}) {
  return (
    <Canvas
      key={`${modelUrl}-${fullscreen ? 'fs' : 'inline'}`}
      camera={{ position: [0, 0, fullscreen ? 3.2 : 4], fov: fullscreen ? 38 : 42 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0)
      }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 3]} intensity={1.1} />
      <Suspense fallback={null}>
        <GlbErrorBoundary onError={onError}>
          <GlbModel url={modelUrl} onLoaded={onLoaded} />
        </GlbErrorBoundary>
        <Environment preset="city" />
      </Suspense>
      <OrbitControls
        enablePan={false}
        minDistance={fullscreen ? 1.2 : 2}
        maxDistance={fullscreen ? 14 : 8}
        autoRotate={fullscreen}
        autoRotateSpeed={0.6}
      />
    </Canvas>
  )
}

type Props = {
  modelUrl: string | null
  emptyLabel?: string
  className?: string
}

export default function Model3DViewer({ modelUrl, emptyLabel = '3D preview', className = '' }: Props) {
  const [failed, setFailed] = useState(false)
  const [loading, setLoading] = useState(Boolean(modelUrl))
  const [fullscreen, setFullscreen] = useState(false)
  const [fsLoading, setFsLoading] = useState(false)

  useEffect(() => {
    setFailed(false)
    setLoading(Boolean(modelUrl))
    setFullscreen(false)
  }, [modelUrl])

  useEffect(() => {
    if (!fullscreen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false)
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [fullscreen])

  if (!modelUrl) {
    return (
      <div className={`catalog-3d-viewer catalog-3d-viewer--empty ${className}`.trim()}>
        <span className="catalog-3d-viewer-placeholder">◆</span>
        <p>{emptyLabel}</p>
      </div>
    )
  }

  if (failed) {
    return (
      <div className={`catalog-3d-viewer catalog-3d-viewer--empty ${className}`.trim()}>
        <span className="catalog-3d-viewer-placeholder">◆</span>
        <p>Could not load 3D preview</p>
      </div>
    )
  }

  const openFullscreen = () => {
    setFsLoading(true)
    setFullscreen(true)
  }

  return (
    <>
      <div className={`catalog-3d-viewer ${className}`.trim()}>
        {loading && (
          <div className="catalog-3d-viewer-loading" aria-live="polite" aria-busy="true">
            <div className="catalog-3d-viewer-spinner" aria-hidden />
            <p>Loading 3D model…</p>
            <div className="catalog-3d-viewer-shimmer" aria-hidden />
          </div>
        )}
        <ViewerCanvas
          modelUrl={modelUrl}
          onLoaded={() => setLoading(false)}
          onError={() => {
            setFailed(true)
            setLoading(false)
          }}
        />
        {!loading && (
          <>
            <p className="catalog-3d-viewer-hint">Drag to rotate</p>
            <button
              type="button"
              className="catalog-3d-viewer-fs-btn"
              onClick={openFullscreen}
              aria-label="Open fullscreen 3D preview"
            >
              Fullscreen
            </button>
          </>
        )}
      </div>

      {fullscreen &&
        createPortal(
          <div className="catalog-3d-fs" role="dialog" aria-modal="true" aria-label="Fullscreen 3D preview">
            <div className="catalog-3d-fs-backdrop" onClick={() => setFullscreen(false)} />
            <div className="catalog-3d-fs-stage">
              {fsLoading && (
                <div className="catalog-3d-viewer-loading" aria-live="polite" aria-busy="true">
                  <div className="catalog-3d-viewer-spinner" aria-hidden />
                  <p>Loading 3D model…</p>
                  <div className="catalog-3d-viewer-shimmer" aria-hidden />
                </div>
              )}
              <ViewerCanvas
                modelUrl={modelUrl}
                fullscreen
                onLoaded={() => setFsLoading(false)}
                onError={() => {
                  setFsLoading(false)
                  setFullscreen(false)
                  setFailed(true)
                }}
              />
              <div className="catalog-3d-fs-bar">
                <p>Drag to rotate · Scroll to zoom · Esc to close</p>
                <button type="button" className="catalog-3d-fs-close" onClick={() => setFullscreen(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
