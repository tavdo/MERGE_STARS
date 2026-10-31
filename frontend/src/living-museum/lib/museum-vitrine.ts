import type { CoreCollectionDetail, CoreItem } from './core-contract';
import type { SpatialCamera, Vec3 } from './museum-spatial';
import { approvedModelURL } from './core-model-asset.ts';

// Museum layout references only: no copied product, version, rights or geometry truth.
export const coreVitrineSlots = Object.freeze([
  { id: 'vitrine-1', position: [-7, .5, 9.4] as Vec3 },
  { id: 'vitrine-2', position: [-3.5, .5, 9.4] as Vec3 },
  { id: 'vitrine-3', position: [3.5, .5, 9.4] as Vec3 },
  { id: 'vitrine-4', position: [7, .5, 9.4] as Vec3 },
]);
export type VitrineSlotId = typeof coreVitrineSlots[number]['id'];
export type CoreExhibitReference = { itemId: string; collectionId: string; collectionSlug: string; title: string; brandName: string | null; modelURL: string; sourceUpdatedAt: string };
export type MuseumPlacement = { slot: VitrineSlotId; itemId: string; collectionSlug: string };
export type VitrineRequest = { reference: CoreExhibitReference; serial: number };
export const MUSEUM_LAYOUT_KEY = 'merge-museum-private-vitrines-v1';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function coreExhibitReference(item: CoreItem, detail: CoreCollectionDetail): CoreExhibitReference {
  if (!item.hasModel3d || !item.model_url || item.source.system !== 'MERGE_CORE' || item.id !== item.source.entity_id || item.collectionId !== detail.collection.id || item.source.collection_id !== detail.collection.id || !detail.items.some(record => record.id === item.id)) throw Error('CORE_EXHIBIT_UNAVAILABLE');
  const modelURL = approvedModelURL(item.model_url);
  if (new URL(modelURL).pathname.split('/').at(-2) !== item.id) throw Error('CORE_EXHIBIT_SOURCE_MISMATCH');
  return { itemId: item.id, collectionId: detail.collection.id, collectionSlug: detail.collection.slug, title: item.title, brandName: detail.collection.brandName ?? null, modelURL, sourceUpdatedAt: item.updatedAt };
}
export function readMuseumLayout(value: string | null): MuseumPlacement[] {
  if (!value) return [];
  try { const rows: unknown = JSON.parse(value); if (!Array.isArray(rows) || rows.length > coreVitrineSlots.length) return [];
    const seen = new Set<string>();
    return rows.filter((row): row is MuseumPlacement => !!row && typeof row === 'object' && coreVitrineSlots.some(slot => slot.id === row.slot) && !seen.has(row.slot) && typeof row.itemId === 'string' && uuid.test(row.itemId) && typeof row.collectionSlug === 'string' && /^[a-zA-Z0-9_-]{1,120}$/.test(row.collectionSlug) && !!seen.add(row.slot)).map(({ slot, itemId, collectionSlug }) => ({ slot, itemId, collectionSlug }));
  } catch { return []; }
}
export function placementCamera(slot: VitrineSlotId): SpatialCamera {
  const position = coreVitrineSlots.find(value => value.id === slot)?.position; if (!position) throw Error('UNKNOWN_VITRINE');
  return { position: [position[0], 1.95, position[2] + 3.35], yaw: 0, pitch: -.1, fov: 46, focus: 1, framing: 'OBJECT', displayBounds: [2.25, 2.25] };
}
