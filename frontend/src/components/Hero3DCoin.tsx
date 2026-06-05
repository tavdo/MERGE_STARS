/* eslint-disable react-refresh/only-export-components */
import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Center, Environment, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import glbUrl from '../assets/new3d/3.glb?url'

export { glbUrl as landingCoinModelUrl }

// Preload the GLB model
useGLTF.preload(glbUrl)

const COIN_PRESENTATION_ROTATION: [number, number, number] = [0, 0, 0]

function CoinSpinGroup({
  autoRotate,
  children,
}: {
  autoRotate: boolean
  children: ReactNode
}) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (!autoRotate || !groupRef.current) return
    groupRef.current.rotation.y += delta * 0.45
  })

  return <group ref={groupRef}>{children}</group>
}

function CoinModel({ onLoaded }: { onLoaded: () => void }) {
  const { scene } = useGLTF(glbUrl)

  useEffect(() => {
    onLoaded()
  }, [onLoaded])

  const normalized = useMemo(() => {
    const clone = scene.clone(true)

    // Assign highly realistic gold PBR material to all child meshes
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#d4af37'), // warm jewelry gold tone
          metalness: 0.98,
          roughness: 0.22,
          envMapIntensity: 1.8,
        })
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    })

    const box = new THREE.Box3().setFromObject(clone)
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    const scale = 2.4 / maxDim
    clone.scale.setScalar(scale)
    return clone
  }, [scene])

  return (
    <group rotation={COIN_PRESENTATION_ROTATION}>
      <Center>
        <primitive object={normalized} />
      </Center>
    </group>
  )
}

function CoinScene({ autoRotate, onLoaded }: { autoRotate: boolean; onLoaded: () => void }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 6]} intensity={1.6} color="#fff5e0" />
      <directionalLight position={[-4, 2, 3]} intensity={0.6} color="#c9a84c" />
      <pointLight position={[1, 1, 4]} intensity={0.6} color="#f5d78e" />
      <Environment preset="city" />
      <CoinSpinGroup autoRotate={autoRotate}>
        <CoinModel onLoaded={onLoaded} />
      </CoinSpinGroup>
    </>
  )
}

interface Hero3DCoinProps {
  className?: string
  'aria-label'?: string
}

export default function Hero3DCoin({
  className = '',
  'aria-label': ariaLabel = 'MERGE STARS golden coin emblem',
}: Hero3DCoinProps) {
  const [ready, setReady] = useState(false)

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <div
      className={`relative flex flex-col items-center justify-center ${className}`.trim()}
      role="img"
      aria-label={ariaLabel}
      style={{
        width: 'min(92vw, 380px)',
        height: 'min(92vw, 380px)',
        maxWidth: 380,
        maxHeight: 380,
      }}
    >
      {/* GLB WEBGL RENDERER */}
      <Canvas
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.6s ease' }}
        camera={{ position: [0, 0.12, 3.65], fov: 38, near: 0.1, far: 100 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
        }}
      >
        <Suspense fallback={null}>
          <CoinScene autoRotate={!prefersReducedMotion} onLoaded={() => setReady(true)} />
        </Suspense>
      </Canvas>
    </div>
  )
}
