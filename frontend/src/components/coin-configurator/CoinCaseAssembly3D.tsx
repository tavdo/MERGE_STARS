import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Center, Environment, OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { resolveMeshyAssetUrl } from '@/features/catalog/meshy.hooks'
import type { CaseLayoutJson } from './CoinCaseLayoutView'

export type AssemblyItem = {
  id: string
  title: string
  model3dUrl?: string | null
  xPct?: number
  yPct?: number
  wPct?: number
}

type Props = {
  /** Meshy GLB — brand case exterior (step 1 + assembly base when approved). */
  caseModelUrl?: string | null
  caseWeightG?: number
  layout?: CaseLayoutJson | null
  items?: AssemblyItem[]
  className?: string
  label?: string
  /** case-shell = exterior only; assembly = case + products */
  previewMode?: 'case-shell' | 'assembly'
  /** When true, assembly uses the approved Meshy case instead of procedural placeholder. */
  caseApproved?: boolean
}

function pctToPos(xPct = 50, yPct = 50): [number, number, number] {
  const x = ((xPct - 50) / 50) * 0.72
  const z = ((yPct - 50) / 50) * 0.72
  return [x, 0.22, z]
}

function normalizeToGround(object: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(object)
  const center = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())
  object.position.x -= center.x
  object.position.z -= center.z
  object.position.y -= box.min.y
  return size
}

function fitScale(object: THREE.Object3D, targetMax = 0.32) {
  const box = new THREE.Box3().setFromObject(object)
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z, 0.001)
  return targetMax / maxDim
}

function EmptyCompartmentSlots({ layout }: { layout?: CaseLayoutJson | null }) {
  const slots = layout?.compartments ?? []
  if (!slots.length) {
    return (
      <>
        {[
          [0.28, 0.28],
          [-0.28, 0.28],
          [0.28, -0.28],
          [-0.28, -0.28],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.18, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.24, 0.2]} />
            <meshStandardMaterial color="#1a0f0a" roughness={0.95} metalness={0.05} />
          </mesh>
        ))}
      </>
    )
  }

  return (
    <>
      {slots.map((slot, i) => {
        const [x, , z] = pctToPos(slot.xPct, slot.yPct)
        const w = ((slot.wPct ?? 16) / 100) * 1.4
        const h = ((slot.hPct ?? 14) / 100) * 1.2
        return (
          <mesh key={slot.productId ?? i} position={[x, 0.18, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[w, h]} />
            <meshStandardMaterial color="#1a0f0a" roughness={0.95} metalness={0.05} />
          </mesh>
        )
      })}
    </>
  )
}

/** Fallback open luxury tray — top-down readable, no vertical torus hoop. */
function ProceduralEmptyCase({ layout }: { layout?: CaseLayoutJson | null }) {
  return (
    <group>
      <mesh position={[0, 0.06, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.14, 1.2, 0.12, 64]} />
        <meshStandardMaterial color="#14100e" metalness={0.88} roughness={0.34} />
      </mesh>
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[1.02, 1.08, 0.1, 64]} />
        <meshStandardMaterial color="#3d1a28" roughness={0.94} metalness={0.06} />
      </mesh>
      <mesh position={[0, 0.195, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.98, 1.16, 64]} />
        <meshStandardMaterial color="#c9a84c" metalness={0.94} roughness={0.14} />
      </mesh>
      <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.2, 48]} />
        <meshStandardMaterial color="#d4b85a" metalness={0.9} roughness={0.18} />
      </mesh>
      <EmptyCompartmentSlots layout={layout} />
    </group>
  )
}

function BrandCaseGlb({ url }: { url: string }) {
  const resolved = resolveMeshyAssetUrl(url)
  if (!resolved) return <ProceduralEmptyCase />
  const { scene } = useGLTF(resolved)
  const prepared = useMemo(() => {
    const clone = scene.clone(true)
    normalizeToGround(clone)
    const box = new THREE.Box3().setFromObject(clone)
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z, 0.001)
    const scale = 2.1 / maxDim
    clone.scale.setScalar(scale)
    normalizeToGround(clone)
    return clone
  }, [scene])

  return <primitive object={prepared} />
}

function CaseExteriorGlb({ url }: { url: string }) {
  return (
    <Center>
      <BrandCaseGlb url={url} />
    </Center>
  )
}

function AnimatedProduct({
  url,
  target,
  delayMs,
}: {
  url: string
  target: [number, number, number]
  delayMs: number
}) {
  const group = useRef<THREE.Group>(null)
  const resolved = resolveMeshyAssetUrl(url)
  const { scene } = useGLTF(resolved!)
  const prepared = useMemo(() => {
    const clone = scene.clone(true)
    const s = fitScale(clone, 0.34)
    clone.scale.setScalar(s)
    normalizeToGround(clone)
    return clone
  }, [scene])
  const start = useMemo(() => performance.now() + delayMs, [delayMs])
  const fromY = target[1] + 1.2

  useFrame(() => {
    if (!group.current) return
    const elapsed = performance.now() - start
    if (elapsed < 0) return
    const t = Math.min(1, elapsed / 1500)
    const ease = 1 - Math.pow(1 - t, 3)
    group.current.position.set(target[0], fromY + (target[1] - fromY) * ease, target[2])
    group.current.rotation.y = (1 - ease) * Math.PI * 0.35
  })

  if (!resolved) return null

  return (
    <group ref={group} position={[target[0], fromY, target[2]]}>
      <primitive object={prepared} />
    </group>
  )
}

function AssemblyScene({
  caseModelUrl,
  layout,
  items,
  previewMode,
  caseApproved,
}: {
  caseModelUrl?: string | null
  layout?: CaseLayoutJson | null
  items: AssemblyItem[]
  previewMode: 'case-shell' | 'assembly'
  caseApproved?: boolean
}) {
  const isAssembly = previewMode === 'assembly'
  const useBrandCase = Boolean(caseModelUrl && (caseApproved || !isAssembly))

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 8, 4]} intensity={1.2} castShadow />
      <directionalLight position={[-4, 4, -2]} intensity={0.35} color="#c9a84c" />
      <Environment preset="city" />

      {useBrandCase && caseModelUrl ? (
        <CaseExteriorGlb url={caseModelUrl} />
      ) : (
        <ProceduralEmptyCase layout={layout} />
      )}

      {isAssembly &&
        items.map((item, i) => {
          const comp = layout?.compartments?.find((c) => c.productId === item.id)
          const pos = pctToPos(item.xPct ?? comp?.xPct, item.yPct ?? comp?.yPct)
          const delay = i * 450
          if (item.model3dUrl) {
            return (
              <AnimatedProduct key={item.id} url={item.model3dUrl} target={pos} delayMs={delay} />
            )
          }
          return null
        })}

      <OrbitControls
        enablePan={false}
        minDistance={2.2}
        maxDistance={5.5}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.15}
        target={[0, 0.15, 0]}
      />
    </>
  )
}

export function parseCaseDesign(layout: CaseLayoutJson | null | undefined) {
  const raw = layout as {
    caseDesign?: { model3dUrl?: string; approved?: boolean; prompt?: string }
  } | null
  return raw?.caseDesign ?? null
}

export default function CoinCaseAssembly3D({
  caseModelUrl,
  caseWeightG: _caseWeightG,
  layout,
  items: itemsProp,
  className = '',
  label,
  previewMode: previewModeProp,
  caseApproved,
}: Props) {
  const compartments = layout?.compartments ?? []
  const items: AssemblyItem[] = useMemo(() => {
    if (itemsProp?.length) {
      return itemsProp.map((p, i) => ({
        ...p,
        xPct: p.xPct ?? compartments[i]?.xPct,
        yPct: p.yPct ?? compartments[i]?.yPct,
      }))
    }
    return compartments.map((c, i) => ({
      id: c.productId ?? `c-${i}`,
      title: c.title ?? 'Item',
      model3dUrl: c.model3dUrl,
      xPct: c.xPct,
      yPct: c.yPct,
      wPct: c.wPct,
    }))
  }, [itemsProp, compartments])

  const resolvedCase = caseModelUrl ?? parseCaseDesign(layout)?.model3dUrl ?? null
  const previewMode =
    previewModeProp ?? (items.length > 0 ? 'assembly' : 'case-shell')

  const hint =
    previewMode === 'assembly'
      ? items.length
        ? 'Your products animate into the case · drag to rotate'
        : 'Approved brand case · add products to fill it'
      : 'Exterior case design preview · products added in step 2'

  return (
    <div className={`coin-case-assembly3d ${className}`.trim()}>
      {label && <p className="coin-case-assembly3d-label">{label}</p>}
      <div className="coin-case-assembly3d-canvas-wrap catalog-3d-viewer">
        <Canvas shadows camera={{ position: [0, 3.4, 2.6], fov: 38 }}>
          <Suspense fallback={null}>
            <AssemblyScene
              caseModelUrl={resolvedCase}
              layout={layout}
              items={items}
              previewMode={previewMode}
              caseApproved={caseApproved}
            />
          </Suspense>
        </Canvas>
      </div>
      <p className="coin-case-assembly3d-hint">{hint}</p>
    </div>
  )
}
