import { museumV78Fetch } from '@/museum-v78/transport';
import { z } from "zod";
import { createDraftSchema, designDraftSchema, draftName, type DesignDraft, type DraftInput } from "./draft-contract";

export class DraftRequestError extends Error {
  code: string;
  constructor(code: string) { super(code); this.code = code; }
}
type Transport = typeof fetch;
const knownErrors = new Set(["AUTH_REQUIRED", "ORIGIN_REJECTED", "INVALID_DESIGN", "BODY_TOO_LARGE", "IDEMPOTENCY_CONFLICT", "INVALID_PARENT", "COLLECTION_LIMIT_REACHED", "DRAFT_STORAGE_UNAVAILABLE"]);
const listSchema = z.object({ drafts: z.array(designDraftSchema).max(200), scope: z.literal("EXPERIENCE_DRAFTS"), core_connected: z.literal(false) }).strict();
const savedSchema = z.object({ draft: designDraftSchema, replayed: z.boolean() }).strict();

async function requestDrafts(input: DraftInput | null, transport: Transport) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await transport("/api/designs", {
      method: input ? "POST" : "GET", credentials: "same-origin", redirect: "error", cache: "no-store",
      headers: { Accept: "application/json", ...(input ? { "Content-Type": "application/json" } : {}) },
      ...(input ? { body: JSON.stringify(input) } : {}), signal: controller.signal,
    });
    if (response.status === 401) throw new DraftRequestError("AUTH_REQUIRED");
    if (response.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") throw new DraftRequestError("DRAFT_RESPONSE_INVALID");
    const reader = response.body?.getReader();
    if (!reader) throw new DraftRequestError("DRAFT_RESPONSE_INVALID");
    let size = 0;
    const chunks: Uint8Array[] = [];
    try {
      while (true) {
        const part = await reader.read();
        if (part.done) break;
        size += part.value.byteLength;
        if (size > 512 * 1024) { await reader.cancel(); throw new DraftRequestError("DRAFT_RESPONSE_INVALID"); }
        chunks.push(part.value);
      }
    } finally { reader.releaseLock(); }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    let raw: unknown;
    try { raw = JSON.parse(new TextDecoder().decode(bytes)); }
    catch { throw new DraftRequestError("DRAFT_RESPONSE_INVALID"); }
    if (!response.ok) {
      const code = z.object({ error: z.string() }).safeParse(raw);
      throw new DraftRequestError(code.success && knownErrors.has(code.data.error) ? code.data.error : "DRAFT_STORAGE_UNAVAILABLE");
    }
    return raw;
  } catch (error) {
    if (error instanceof DraftRequestError) throw error;
    throw new DraftRequestError(controller.signal.aborted ? "DRAFT_TIMEOUT" : "DRAFT_STORAGE_UNAVAILABLE");
  } finally { clearTimeout(timer); }
}

export async function loadDesignDrafts(transport: Transport = museumV78Fetch): Promise<DesignDraft[]> {
  const result = listSchema.safeParse(await requestDrafts(null, transport));
  if (!result.success || new Set(result.data.drafts.map(draft => draft.draft_id)).size !== result.data.drafts.length) throw new DraftRequestError("DRAFT_RESPONSE_INVALID");
  return result.data.drafts;
}

export async function saveDesignDraft(snapshot: unknown, transport: Transport = museumV78Fetch): Promise<DesignDraft> {
  const input = createDraftSchema.parse(snapshot);
  const result = savedSchema.safeParse(await requestDrafts(input, transport));
  if (!result.success) throw new DraftRequestError("DRAFT_RESPONSE_INVALID");
  const draft = result.data.draft;
  if (draft.source_reference_id !== input.source_reference_id || draft.parent_draft_id !== (input.parent_draft_id ?? null) ||
      draft.config.material !== input.config.material || draft.config.scale !== input.config.scale ||
      JSON.stringify(draft.config.material_preference ?? null) !== JSON.stringify(input.config.material_preference ?? null) ||
      draft.config.name !== input.config.name || draft.name !== draftName(input)) throw new DraftRequestError("DRAFT_RESPONSE_INVALID");
  // Retry remains a manual action with the same request_id, including when the
  // server committed a save whose response was lost. Never retry writes blindly.
  return draft;
}
