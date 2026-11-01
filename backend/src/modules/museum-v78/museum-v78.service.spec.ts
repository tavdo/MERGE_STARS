import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { MuseumV78Service } from './museum-v78.service';

describe('Museum 78 private persistence contracts', () => {
  const owner = randomUUID();
  const input = () => ({ request_id: randomUUID(), source_reference_id: 'MERGE-EYE-001', parent_draft_id: null,
    config: { material: 'silver', scale: 'fine', name: 'My eyewear' } });
  function fixture() {
    const repo = { findOne: jest.fn().mockResolvedValue(null), countBy: jest.fn().mockResolvedValue(0),
      create: jest.fn(value => value), save: jest.fn(async value => value), find: jest.fn().mockResolvedValue([]) };
    const manager = { getRepository: () => repo, query: jest.fn().mockResolvedValue([]) };
    const db = { getRepository: () => repo, transaction: jest.fn(async fn => fn(manager)) };
    return { service: new MuseumV78Service(db as unknown as DataSource), repo, manager, db };
  }
  it('rejects client-supplied ownership and authoritative CORE fields before touching storage', async () => {
    const { service, db } = fixture();
    await expect(service.save(owner, 'designs', { ...input(), owner_id: randomUUID() })).rejects.toThrow('INVALID_DESIGN');
    await expect(service.save(owner, 'designs', { ...input(), core_product_id: randomUUID() })).rejects.toThrow('INVALID_DESIGN');
    expect(db.transaction).not.toHaveBeenCalled();
  });
  it('returns only the authenticated owner collection', async () => {
    const { service, repo } = fixture();
    expect(await service.list(owner, 'designs')).toEqual({ drafts: [], scope: 'EXPERIENCE_DRAFTS', core_connected: false });
    expect(repo.find).toHaveBeenCalledWith(expect.objectContaining({ where: { ownerId: owner, kind: 'designs' } }));
  });
  it('saves the concept without granting ownership of an authoritative product', async () => {
    const { service, repo, manager } = fixture();
    const result = await service.save(owner, 'designs', input());
    expect(result.draft).toMatchObject({ status: 'CONCEPT', core_product_id: null, core_house_id: null, generation_status: 'NOT_YET_IMPLEMENTED' });
    expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ ownerId: owner, kind: 'designs' }));
    expect(manager.query.mock.calls[0][0]).toContain('pg_advisory_xact_lock');
  });
  it('replays an identical request and rejects a conflicting reuse of its ID', async () => {
    const { service, repo } = fixture();
    const request = input();
    await service.save(owner, 'designs', request);
    repo.findOne.mockResolvedValue(repo.save.mock.calls[0][0]);
    expect((await service.save(owner, 'designs', request)).replayed).toBe(true);
    await expect(service.save(owner, 'designs', { ...request, config: { ...request.config, name: 'Changed' } })).rejects.toThrow('IDEMPOTENCY_CONFLICT');
    expect(repo.save).toHaveBeenCalledTimes(1);
  });
  it('does not link a parent that is absent from this authenticated owner collection', async () => {
    const { service, repo } = fixture();
    const parent = randomUUID();
    await expect(service.save(owner, 'designs', { ...input(), parent_draft_id: parent })).rejects.toThrow('INVALID_PARENT');
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: parent, ownerId: owner, kind: 'designs' } });
    expect(repo.save).not.toHaveBeenCalled();
  });
  it('enforces the collection limit inside the serialized transaction', async () => {
    const { service, repo } = fixture();repo.countBy.mockResolvedValue(200);
    await expect(service.save(owner, 'designs', input())).rejects.toThrow('COLLECTION_LIMIT_REACHED');
    expect(repo.save).not.toHaveBeenCalled();
  });
});
