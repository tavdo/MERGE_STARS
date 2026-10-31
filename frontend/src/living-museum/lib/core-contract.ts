import { z } from "zod";

export const CORE_ORIGIN = window.location.origin;
export const CORE_API = import.meta.env.VITE_API_URL || '/api';
export const coreDependencies = ["authentication", "brand-house", "brand-line", "products", "fit", "digital-twin", "versions", "design-proposals", "rights", "history", "materials", "calculate", "verify", "offers", "orders", "payments", "notifications", "production", "qc", "qr", "passport", "partners", "museum-network", "consent", "pulse", "likes", "saves", "generate", "chat", "search"] as const;

const text = z.string().min(1).max(300);
const nullableText = z.string().max(1000).nullable().optional();
const timestamp = z.string().datetime({ offset: true });
const meta = z.object({ timestamp, version: z.string().max(100) });
const collection = z.object({
  id: z.string().uuid(), title: text, slug: z.string().regex(/^[a-zA-Z0-9_-]{1,120}$/),
  visibility: z.literal("PUBLIC"), category: text, brandLineId: nullableText,
  brandName: nullableText, mergeId: nullableText, updatedAt: timestamp,
});
const item = z.object({
  id: z.string().uuid(), collectionId: z.string().uuid(), title: text,
  description: z.string().max(12000).nullable(), metalType: nullableText,
  hasImage: z.boolean(), hasModel3d: z.boolean(), status: text,
  lifecycle: nullableText, ownership: nullableText, createdAt: timestamp, updatedAt: timestamp,
});
export const catalogEnvelope = z.object({ data: z.array(collection).max(200), meta });
export const collectionEnvelope = z.object({ data: collection.extend({ items: z.array(item).max(500) }), meta });
export const pricesEnvelope = z.object({ data: z.array(z.object({
  metal: z.enum(["silver", "gold", "palladium"]),
  priceUsd: z.number().positive().finite(), pricePerKgUsd: z.number().positive().finite(), changePct: z.number().finite(),
})).min(1).max(3), meta });
export const identityEnvelope = z.object({ data: z.object({ id: z.string().uuid() }), meta });

export type CoreCollection = z.infer<typeof collection>;
export type CoreItem = z.infer<typeof item> & {
  source: { system: "MERGE_CORE"; entity_type: "catalog_item"; entity_id: string; collection_id: string; source_revision: null; source_updated_at: string };
  rights_state: "UNAVAILABLE"; verification_state: "UNAVAILABLE";
  image_url: string | null; model_url: string | null;
};
export type CoreCatalog = { collections: CoreCollection[]; source_origin: string; response_at: string; retrieved_at: string };
export type CoreCollectionDetail = { collection: CoreCollection; items: CoreItem[]; source_origin: string; response_at: string; retrieved_at: string };
export type CorePrices = { prices: z.infer<typeof pricesEnvelope>["data"]; response_at: string; retrieved_at: string; source_origin: string; quote_at: null; quote_freshness: "UNVERIFIED"; verified_offer: false };

export function projectCatalog(raw: unknown): Omit<CoreCatalog, "retrieved_at"> {
  const parsed = catalogEnvelope.parse(raw);
  if (new Set(parsed.data.map(x => x.id)).size !== parsed.data.length || new Set(parsed.data.map(x => x.slug)).size !== parsed.data.length) throw new Error("CORE_CONTRACT_INVALID");
  return { collections: parsed.data, source_origin: CORE_ORIGIN, response_at: parsed.meta.timestamp };
}
export function projectCollection(raw: unknown, requestedSlug: string): Omit<CoreCollectionDetail, "retrieved_at"> {
  const parsed = collectionEnvelope.parse(raw), { items, ...record } = parsed.data;
  if (record.slug !== requestedSlug || items.some(x => x.collectionId !== record.id) || new Set(items.map(x => x.id)).size !== items.length) throw new Error("CORE_CONTRACT_INVALID");
  return { collection: record, source_origin: CORE_ORIGIN, response_at: parsed.meta.timestamp, items: items.map(value => ({
    ...value,
    source: { system: "MERGE_CORE", entity_type: "catalog_item", entity_id: value.id, collection_id: record.id, source_revision: null, source_updated_at: value.updatedAt },
    // Neither ACTIVE, an image, ownership, nor an update time supplies these proofs.
    rights_state: "UNAVAILABLE", verification_state: "UNAVAILABLE",
    image_url: value.hasImage ? `${CORE_API}/catalog/public/items/${value.id}/image` : null,
    model_url: value.hasModel3d ? `${CORE_ORIGIN}/api/catalog/public/items/${value.id}/model3d` : null,
  })) };
}
export function projectPrices(raw: unknown): Omit<CorePrices, "retrieved_at"> {
  const parsed = pricesEnvelope.parse(raw);
  if (new Set(parsed.data.map(x => x.metal)).size !== parsed.data.length || parsed.data.some(x => Math.abs(x.priceUsd * 1000 - x.pricePerKgUsd) > Math.max(0.01, x.pricePerKgUsd * 0.00001))) throw new Error("CORE_CONTRACT_INVALID");
  return { prices: parsed.data, response_at: parsed.meta.timestamp, source_origin: CORE_ORIGIN, quote_at: null, quote_freshness: "UNVERIFIED", verified_offer: false };
}

export function unavailableCoreCapability(capability: string) {
  return { capability, available: false, status: "DEPENDENCY_REQUIRED", reason: "CORE_AUTHORIZATION_AND_CURRENT_BACKEND_CONTRACT_REQUIRED", source_of_truth: "MERGE_CORE" } as const;
}
