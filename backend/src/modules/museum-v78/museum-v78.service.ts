import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createHash, randomUUID } from 'crypto';
import { MuseumRecord } from './museum-record.entity';
import { canonicalDraftPayload, createDraftSchema, draftName } from './contracts/draft-contract';
import { atelierInputSchema } from './contracts/atelier-contract';
import { houseSceneInputSchema, houseScenePayload } from './contracts/house-scene-contract';

export type RecordKind = 'designs' | 'atelier' | 'house-scenes';
const limits = { designs: 200, atelier: 100, 'house-scenes': 80 };

@Injectable()
export class MuseumV78Service {
  constructor(private readonly db: DataSource) {}

  async list(owner: string, kind: RecordKind) {
    const rows = await this.db.getRepository(MuseumRecord).find({
      where: { ownerId: owner, kind }, order: { createdAt: 'DESC', id: 'DESC' }, take: limits[kind],
    });
    const values = rows.map(row => row.payload);
    return kind === 'designs' ? { drafts: values, scope: 'EXPERIENCE_DRAFTS', core_connected: false }
      : kind === 'atelier' ? { drafts: values } : { versions: values };
  }

  async save(owner: string, kind: RecordKind, body: unknown) {
    const schema = kind === 'designs' ? createDraftSchema : kind === 'atelier' ? atelierInputSchema : houseSceneInputSchema;
    const parsed = schema.safeParse(body);
    if (!parsed.success) throw Error(kind === 'house-scenes' ? 'INVALID_SCENE' : 'INVALID_DESIGN');
    const input = parsed.data as any;
    const canonical = kind === 'designs' ? canonicalDraftPayload(input)
      : kind === 'house-scenes' ? houseScenePayload(input) : JSON.stringify(input.intent);
    const hash = createHash('sha256').update(canonical).digest('hex');
    return this.db.transaction(async manager => {
      // Serialize each owner's bounded collection, including first insert and retry races.
      await manager.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [owner + ':' + kind]);
      const repo = manager.getRepository(MuseumRecord);
      const old = await repo.findOne({ where: { ownerId: owner, kind, requestId: input.request_id } });
      const field = kind === 'house-scenes' ? 'version' : 'draft';
      if (old) {
        if (old.requestHash !== hash) throw Error('IDEMPOTENCY_CONFLICT');
        return { [field]: old.payload, replayed: true };
      }
      const parentId = kind === 'designs' ? input.parent_draft_id : kind === 'house-scenes' ? input.parent_version_id : null;
      if (parentId) {
        const parent = await repo.findOne({ where: { id: parentId, ownerId: owner, kind } });
        if (!parent || (kind === 'designs' && parent.payload.source_reference_id !== input.source_reference_id)) {
          throw Error(kind === 'designs' ? 'INVALID_PARENT' : 'INVALID_SCENE_PARENT');
        }
      }
      if (await repo.countBy({ ownerId: owner, kind }) >= limits[kind]) {
        throw Error(kind === 'house-scenes' ? 'SCENE_VERSION_LIMIT' : 'COLLECTION_LIMIT_REACHED');
      }
      const id = randomUUID(), created = new Date();
      const payload = kind === 'designs' ? {
        draft_id: id, root_reference_id: input.source_reference_id, source_reference_id: input.source_reference_id,
        parent_draft_id: input.parent_draft_id ?? null, name: draftName(input), config: input.config,
        status: 'CONCEPT', core_product_id: null, core_house_id: null,
        generation_status: 'NOT_YET_IMPLEMENTED', created_at: created.toISOString(),
      } : kind === 'atelier' ? {
        id, intent: input.intent, status: 'CONCEPT', generation_status: 'DEPENDENCY_REQUIRED',
        core_product_id: null, core_house_id: null, created_at: created.toISOString(),
      } : {
        id, parent_version_id: input.parent_version_id, layout: input.layout, created_at: created.toISOString(),
        scope: 'PRIVATE_SCENE_STUDY', core_house_id: null, publication_status: 'PRIVATE',
      };
      await repo.save(repo.create({ id, ownerId: owner, kind, requestId: input.request_id, requestHash: hash, payload, createdAt: created }));
      await manager.query('INSERT INTO museum_v78_events(id,record_id,owner_id,event,created_at) VALUES($1,$2,$3,$4,$5)',
        [randomUUID(), id, owner, kind === 'designs' ? 'DESIGN_DRAFT_CREATED' : kind === 'atelier' ? 'ATELIER_BRIEF_CREATED' : 'SCENE_VERSION_CREATED', created]);
      return { [field]: payload, replayed: false };
    });
  }

  async health(owner: string) {
    const privateCount = await this.db.getRepository(MuseumRecord).countBy({ ownerId: owner, kind: 'atelier' });
    return { checked_at: new Date().toISOString(), scope: 'PRIVATE_EXPERIENCE_PROJECT', overall: 'DEGRADED',
      services: [
        { id: 'experience-storage', label: 'Private draft storage', status: 'AVAILABLE', detail: 'Read verified against the CORE PostgreSQL database for the signed-in account.' },
        { id: 'shared-identity', label: 'Shared CORE identity', status: 'AVAILABLE', detail: 'The existing CORE bearer session is verified by the server; owner IDs are never accepted from the client.' },
        { id: 'production', label: 'Generation, payment and production', status: 'SETUP_REQUIRED', detail: 'Private concept drafts do not create payable offers or authorize production.' },
      ], private_briefs: privateCount, public_catalog: null, verified_orders: null, verified_payments: null,
      production_queue: null, commissions_available: null };
  }
}
