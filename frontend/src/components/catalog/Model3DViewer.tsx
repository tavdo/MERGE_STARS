import { Suspense, useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Center, Environment, OrbitControls, useGLTF } from '@react-three/drei'

function GlbModel({ url, onLoaded }: { url: string; onLoaded?: () => void }) {
  const { scene } = useGLTF(url)

  useEffect(() => {
    onLoaded?.()
  }, [onLoaded])

  const clone = useMemo(() => scene.clone(true), [scene])

  return (
    <Center>
      <primitive object={clone} />
    </Center>
  )
}

type Props = {
  modelUrl: string | null
  emptyLabel?: string
  className?: string
}

export default function Model3DViewer({ modelUrl, emptyLabel = '3D preview', className = '' }: Props) {
  if (!modelUrl) {
    return (
      <div className={`catalog-3d-viewer catalog-3d-viewer--empty ${className}`.trim()}>
        <span className="catalog-3d-viewer-placeholder">◆</span>
        <p>{emptyLabel}</p>
      </div>
    )
  }

  return (
    <div className={`catalog-3d-viewer ${className}`.trim()}>
      <Canvas camera={{ position: [0, 0, 4], fov: 42 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 6, 3]} intensity={1.1} />
        <Suspense fallback={null}>
          <GlbModel url={modelUrl} />
          <Environment preset="city" />
        </Suspense>
        <OrbitControls enablePan={false} minDistance={2} maxDistance={8} />
      </Canvas>
      <p className="catalog-3d-viewer-hint">Drag to rotate</p>
    </div>
  )
}
