/**
 * Wire Meshy AI here when backend is ready.
 *
 * Expected flow:
 * 1. POST /api/catalog/meshy/generate { prompt, style, collectionId? }
 * 2. Poll GET /api/catalog/meshy/jobs/:jobId until status === 'done'
 * 3. Return { previewUrl: string } — public URL to .glb for Model3DViewer
 *
 * Pass the result to MeshyAIPanel via onGenerate in CatalogItemStudio.
 */

export type MeshyJobStatus = 'queued' | 'processing' | 'done' | 'failed'

export interface MeshyGenerateRequest {
  prompt: string
  style: string
  collectionId?: string
}

export interface MeshyGenerateResponse {
  jobId: string
  previewUrl?: string
}
