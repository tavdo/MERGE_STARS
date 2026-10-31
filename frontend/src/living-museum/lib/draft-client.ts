import { useAuthStore } from '@/features/auth/store/auth.store'
import { createDraftSchema, designDraftSchema, draftName, type DesignDraft } from './draft-contract'

function storageKey() {
  const { user, accessToken } = useAuthStore.getState()
  if (!user || !accessToken) throw new Error('AUTH_REQUIRED')
  return `merge.living-museum.drafts.v1.${user.id}`
}

export async function loadDesignDrafts(): Promise<DesignDraft[]> {
  const value = localStorage.getItem(storageKey())
  if (!value) return []
  const rows: unknown = JSON.parse(value)
  if (!Array.isArray(rows) || rows.length > 200) throw new Error('DRAFT_STORAGE_UNAVAILABLE')
  return rows.map(row => designDraftSchema.parse(row))
}

export async function saveDesignDraft(snapshot: unknown): Promise<DesignDraft> {
  const input = createDraftSchema.parse(snapshot)
  const rows = await loadDesignDrafts()
  const existing = rows.find(row => row.draft_id === input.request_id)
  if (existing) {
    if (existing.source_reference_id !== input.source_reference_id || existing.parent_draft_id !== (input.parent_draft_id ?? null) || JSON.stringify(existing.config) !== JSON.stringify(input.config)) throw new Error('IDEMPOTENCY_CONFLICT')
    return existing
  }
  if (rows.length >= 200) throw new Error('COLLECTION_LIMIT_REACHED')
  if (input.parent_draft_id && !rows.some(row => row.draft_id === input.parent_draft_id && row.source_reference_id === input.source_reference_id)) throw new Error('INVALID_PARENT')
  const draft = designDraftSchema.parse({
    draft_id: input.request_id, root_reference_id: input.source_reference_id,
    source_reference_id: input.source_reference_id, parent_draft_id: input.parent_draft_id ?? null,
    name: draftName(input), config: input.config, status: 'CONCEPT',
    core_product_id: null, core_house_id: null, generation_status: 'NOT_YET_IMPLEMENTED',
    created_at: new Date().toISOString(),
  })
  localStorage.setItem(storageKey(), JSON.stringify([draft, ...rows]))
  return draft
}
