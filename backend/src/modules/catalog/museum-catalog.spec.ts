import { CatalogService } from './catalog.service';

describe('Museum catalogue uses canonical public records', () => {
  function fixture(rows: unknown[] = [], total = 0) {
    const query = Object.fromEntries(['innerJoinAndSelect', 'leftJoinAndSelect', 'leftJoin', 'where', 'andWhere', 'orderBy', 'addOrderBy', 'skip', 'take'].map(key => [key, jest.fn().mockReturnThis()]));
    query.getManyAndCount = jest.fn().mockResolvedValue([rows, total]);
    const service = Object.assign(Object.create(CatalogService.prototype), {
      items: { createQueryBuilder: jest.fn(() => query) },
      brandProfilesByUserIds: jest.fn().mockResolvedValue(new Map()),
    }) as CatalogService;
    return { query, service };
  }
  it('always restricts to PUBLIC collections and ACTIVE items', async () => {
    const { service, query } = fixture();
    await service.museumPage({ visibility: 'PRIVATE', status: 'ARCHIVED' });
    expect(query.where).toHaveBeenCalledWith('collection.visibility = :visibility', { visibility: 'PUBLIC' });
    expect(query.andWhere).toHaveBeenCalledWith('item.status = :status', { status: 'ACTIVE' });
  });
  it('pages past the old 50 collection ceiling without loading all products', async () => {
    const { service, query } = fixture([], 1000);
    expect(await service.museumPage({ page: '4' })).toMatchObject({ total: 1000, page: 4, pageSize: 24, hasMore: true });
    expect(query.skip).toHaveBeenCalledWith(96);
    expect(query.take).toHaveBeenCalledWith(24);
    expect(query.addOrderBy).toHaveBeenCalledWith('item.id', 'DESC');
  });
  it('binds author, category, material and escaped search as parameters', async () => {
    const { service, query } = fixture();
    await service.museumPage({ q: '100%_silver', brand: 'author', category: 'watches', material: 'silver', page: '-9' });
    expect(query.andWhere).toHaveBeenCalledWith('collection.category = :category', { category: 'watches' });
    expect(query.andWhere).toHaveBeenCalledWith('(owner.brandLineId = :brand OR owner.mergeId = :brand)', { brand: 'author' });
    expect(query.andWhere).toHaveBeenCalledWith('item.metalType = :material', { material: 'silver' });
    expect(query.andWhere).toHaveBeenCalledWith(expect.stringContaining('ILIKE :search'), { search: '%100\\%\\_silver%' });
    expect(query.skip).toHaveBeenCalledWith(0);
  });
  it('preserves the same item and collection IDs without exposing account secrets', async () => {
    const now = new Date();
    const { service } = fixture([{ id: 'item', title: 'Watch', collectionId: 'collection', status: 'ACTIVE', priceUsd: null, createdAt: now, updatedAt: now,
      collection: { id: 'collection', userId: 'user', title: 'Watches', slug: 'watches', category: 'watches', visibility: 'PUBLIC', createdAt: now, updatedAt: now,
        user: { firstName: 'Author', lastName: 'Name', mergeId: 'MERGE-1', brandLineId: 'BRAND-1', email: 'secret@example.invalid', passwordHash: 'secret' } },
    }], 1);
    const result = await service.museumPage({});
    expect(result.items[0]).toMatchObject({ id: 'item', collectionId: 'collection', lifecycle: 'CONCEPT', verification: 'UNAVAILABLE', collection: { id: 'collection', brandLineId: 'BRAND-1' } });
    expect(JSON.stringify(result)).not.toContain('secret');
  });
});
