import { api } from '@/lib/axios'
import type { ApiResponse } from '@/shared/types/api.types'

export type MeshyJobStatus = 'queued' | 'processing' | 'done' | 'failed'

export interface MeshyGenerateRequest {
  prompt: string
  style: string
  collectionId?: string
}

export interface MeshyJob {
  jobId: string
  status: MeshyJobStatus
  progress: number
  previewUrl: string | null
  downloadUrl?: string | null
  thumbnailUrl: string | null
  phase?: 'preview' | 'refine' | 'image'
  source?: 'text' | 'image'
  error: string | null
}

export interface MeshyGenerateResult {
  prompt: string
  style: string
  previewUrl: string | null
  jobId?: string
}

/** Studio defaults — fill into photo-mode prompt (user can edit). */
export const MESHY_STYLE_PROMPTS: Record<string, string> = {
  Watch:
    'Ultra-premium mechanical wristwatch, hard-surface industrial product design, clean symmetrical watch case, separate polished metal bezel, visibly separate transparent sapphire crystal with realistic thickness, separate dial, separate hour and minute hands, detailed side crown, four clean lugs, clearly visible bracelet-to-case mechanical connections and spring-bar areas, articulated metal bracelet with individually defined links and clasp, separate case back, realistic luxury watch proportions, precise mechanical construction, polished metal PBR surfaces, transparent glass, sharp clean edges, high-detail geometry, clean topology, segmented parts, no floating parts, no fused bracelet links, no melted geometry, no distorted dial, no duplicate parts, no random ornaments, no asymmetry',
  Jewelry:
    'Ultra-premium fine jewelry, hard-surface luxury product, clean symmetrical geometry, sharp controlled edges, separate stones and settings where visible, polished precious metal PBR, realistic reflections, clean topology, no melted surfaces, no floating parts, no random ornaments, accurate proportions',
  'Luxury coin':
    'Ultra-premium commemorative luxury coin, hard-surface mint product, sharp rim and edge, crisp relief engraving, separate rim and face geometry where possible, polished precious metal PBR, clean topology, no melted relief, no distorted symbols, accurate proportions',
  Ring:
    'Ultra-premium luxury ring, hard-surface jewelry product, clean shank and setting, sharp controlled edges, polished precious metal PBR, clean topology, no melted geometry, no floating parts, accurate finger proportions',
  Pendant:
    'Ultra-premium luxury pendant, hard-surface jewelry product, clean bail and body, sharp edges, polished precious metal PBR, clean topology, no melted surfaces, no floating parts, accurate proportions',
  Sculpture:
    'Ultra-premium sculpture object, clean defined surfaces, high-detail geometry, polished or matte luxury materials, clean topology, no melted blobs, no floating parts, accurate proportions',
}

const apiBase = (
  import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000')
).replace(/\/$/, '')

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Turn `/api/catalog/meshy/files/...` into a loadable absolute/relative URL for Three.js */
export function resolveMeshyAssetUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
    return path
  }
  if (path.startsWith('/api/')) {
    if (apiBase === '/api') return path
    if (apiBase.endsWith('/api') && path.startsWith('/api/')) {
      return `${apiBase}${path.slice(4)}`
    }
    return `${apiBase.replace(/\/api$/, '')}${path}`
  }
  if (path.startsWith('/')) return `${apiBase}${path}`
  return `${apiBase}/${path}`
}

export function triggerGlbDownload(url: string, filename = 'merge-stars-model.glb') {
  void (async () => {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Download failed (${res.status})`)
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = filename
      a.rel = 'noopener'
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(objectUrl)
    } catch (err) {
      console.error('Meshy GLB download failed', err)
    }
  })()
}

async function pollMeshyJob(
  jobId: string,
  fallback: { prompt: string; style: string },
  onProgress?: (progress: number) => void,
): Promise<MeshyGenerateResult> {
  const deadline = Date.now() + 12 * 60 * 1000
  while (Date.now() < deadline) {
    await sleep(3000)
    const poll = await api.get<ApiResponse<MeshyJob>>(`/catalog/meshy/jobs/${jobId}`)
    const job = poll.data.data
    onProgress?.(job.progress ?? 0)

    if (job.status === 'done') {
      const previewUrl = resolveMeshyAssetUrl(job.previewUrl || job.downloadUrl)
      return {
        prompt: fallback.prompt,
        style: fallback.style,
        previewUrl,
        jobId,
      }
    }
    if (job.status === 'failed') {
      throw new Error(job.error || '3D generation failed')
    }
  }

  throw new Error('3D generation timed out')
}

export async function generateMeshyModel(
  req: MeshyGenerateRequest,
  onProgress?: (progress: number) => void,
): Promise<MeshyGenerateResult> {
  const started = await api.post<ApiResponse<MeshyJob>>('/catalog/meshy/generate', {
    prompt: req.prompt,
    style: req.style,
    collectionId: req.collectionId,
  })
  const jobId = started.data.data.jobId
  onProgress?.(started.data.data.progress ?? 5)
  return pollMeshyJob(jobId, { prompt: req.prompt, style: req.style }, onProgress)
}

export async function generateMeshyFromImages(
  files: File[],
  style: string,
  prompt: string,
  onProgress?: (progress: number) => void,
): Promise<MeshyGenerateResult> {
  if (!files.length) throw new Error('At least one photo is required')
  if (files.length > 4) throw new Error('Maximum 4 reference photos')

  const form = new FormData()
  for (const file of files) form.append('files', file)
  if (style.trim()) form.append('style', style.trim())
  if (prompt.trim()) form.append('prompt', prompt.trim())

  const started = await api.post<ApiResponse<MeshyJob>>(
    '/catalog/meshy/generate-from-image',
    form,
  )
  const jobId = started.data.data.jobId
  onProgress?.(started.data.data.progress ?? 5)
  return pollMeshyJob(
    jobId,
    { prompt: prompt.trim() || `[multi-view ×${files.length}]`, style },
    onProgress,
  )
}

/** @deprecated prefer generateMeshyFromImages */
export async function generateMeshyFromImage(
  file: File,
  style: string,
  onProgress?: (progress: number) => void,
  prompt = '',
): Promise<MeshyGenerateResult> {
  return generateMeshyFromImages([file], style, prompt, onProgress)
}
