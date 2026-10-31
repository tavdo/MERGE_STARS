import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ExperienceService } from './experience.service';
import { ExperienceController } from './experience.controller';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { FitDto } from './experience.dto';
import { User } from '../../database/entities/user.entity';

describe('Living Museum CORE boundary', () => {
  it('limits the design review queue to existing admin and manager roles', () => {
    expect(
      Reflect.getMetadata(
        GUARDS_METADATA,
        ExperienceController.prototype.reviewQueue,
      ),
    ).toEqual([JwtAuthGuard, RolesGuard]);
    expect(
      Reflect.getMetadata(
        ROLES_KEY,
        ExperienceController.prototype.reviewQueue,
      ),
    ).toEqual(['admin', 'manager']);
  });
  const fit = { findOne: jest.fn(), upsert: jest.fn(), delete: jest.fn() };
  const proposals = {
    create: jest.fn((v) => v),
    save: jest.fn((v) => ({ ...v, id: 'draft', createdAt: new Date() })),
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
  };
  const interactions = {
    count: jest.fn(),
    find: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
  };
  const items = { findOne: jest.fn(), find: jest.fn(), findAndCount: jest.fn() };
  const houses = { findOne: jest.fn() };
  const service = new ExperienceService(
    fit as never,
    proposals as never,
    interactions as never,
    items as never,
    houses as never,
  );
  const item = {
    id: 'source',
    status: 'ACTIVE',
    collection: { userId: 'owner', visibility: 'PUBLIC' },
    createdAt: new Date(),
    updatedAt: new Date(),
    priceUsd: 100,
  };
  beforeEach(() => jest.clearAllMocks());
  it('rejects private source access without ownership', async () => {
    items.findOne.mockResolvedValue({
      ...item,
      collection: { userId: 'owner', visibility: 'PRIVATE' },
    });
    await expect(service.eligibleProduct('source', 'other')).rejects.toThrow(
      'Product not available',
    );
    await expect(
      service.eligibleProduct('source', 'owner'),
    ).resolves.toMatchObject({ id: 'source' });
  });
  it('does not promote catalog asking price or a ready image to a verified offer', async () => {
    items.findOne.mockResolvedValue({ ...item, imageUrl: 'image.png' });
    interactions.count.mockResolvedValue(2);
    await expect(service.publicProduct('source')).resolves.toMatchObject({
      truthState: 'CONCEPT',
      physicalWeightGrams: null,
      estimatedPriceMinor: null,
      orderAllowed: false,
      verifiedOffer: null,
      likes: 2,
    });
  });
  it('requires explicit consent before storing any measurement', async () => {
    await expect(
      service.saveFit('owner', {
        consent: false,
        measurements: { height: 170 },
      }),
    ).rejects.toThrow('consent');
    expect(fit.upsert).not.toHaveBeenCalled();
  });
  it('validates measurement range and excludes caller-supplied verification', async () => {
    const dto = plainToInstance(FitDto, {
      consent: true,
      measurements: { height: 999, verified: true },
    });
    expect(
      await validate(dto, { whitelist: true, forbidNonWhitelisted: true }),
    ).not.toHaveLength(0);
  });
  it('snapshots source version and manual fit without changing the source product', async () => {
    items.findOne.mockResolvedValue(item);
    houses.findOne.mockResolvedValue({ id: 'house' });
    fit.findOne.mockResolvedValue({ measurements: { wrist: 17 } });
    const result = await service.createProposal(
      { id: 'creator', brandLineId: 'LINE-1' } as User,
      { sourceProductId: 'source', material: 'gold' },
    );
    expect(result).toMatchObject({
      rootProductId: 'source',
      sourceProductId: 'source',
      creatorId: 'creator',
      houseId: 'house',
      newProductId: null,
      truthState: 'CONCEPT',
      orderAllowed: false,
      preferences: { measurements: { wrist: 17 } },
    });
    expect(result.sourceVersion).toBe(item.updatedAt.toISOString());
  });
  it('scopes verification requests to owner and records a request without confirming production', async () => {
    proposals.findOne.mockResolvedValue(null);
    await expect(service.requestVerification('other', 'draft')).rejects.toThrow(
      'Design not found',
    );
    expect(proposals.findOne).toHaveBeenCalledWith({
      where: { id: 'draft', creatorId: 'other' },
    });
    proposals.findOne.mockResolvedValue({
      id: 'draft',
      sourceProductId: 'source',
      sourceUpdatedAt: item.updatedAt,
      verificationRequestedAt: new Date(),
    });
    await expect(
      service.requestVerification('owner', 'draft'),
    ).resolves.toMatchObject({
      verificationStatus: 'REQUESTED',
      truthState: 'CONCEPT',
      orderAllowed: false,
      productionAuthorized: false,
    });
    expect(proposals.save).not.toHaveBeenCalled();
  });
  it('makes like/save writes idempotent and unlike scoped to current user', async () => {
    items.findOne.mockResolvedValue(item);
    interactions.find.mockResolvedValue([]);
    await service.interaction('owner', 'source', {
      kind: 'LIKE',
      active: true,
    });
    expect(interactions.upsert).toHaveBeenCalledWith(
      { userId: 'owner', productId: 'source', kind: 'LIKE' },
      ['userId', 'productId', 'kind'],
    );
    await service.interaction('owner', 'source', {
      kind: 'LIKE',
      active: false,
    });
    expect(interactions.delete).toHaveBeenCalledWith({
      userId: 'owner',
      productId: 'source',
      kind: 'LIKE',
    });
  });
  it('hides saved sources that became private to another owner', async () => {
    interactions.find.mockResolvedValue([{ productId: 'source' }]);
    items.findOne.mockResolvedValue({
      ...item,
      collection: { userId: 'owner', visibility: 'PRIVATE' },
    });
    await expect(service.savedProducts('other')).resolves.toEqual([]);
  });
  it('protects all personal profile, draft, interaction and analytics routes with existing JWT guard', () => {
    for (const method of [
      'fit',
      'saveFit',
      'removeFit',
      'designs',
      'design',
      'verify',
      'state',
      'interact',
      'pulse',
      'saved',
      'museum',
      'publication',
    ]) {
      expect(
        Reflect.getMetadata(
          GUARDS_METADATA,
          ExperienceController.prototype[method],
        ),
      ).toEqual([JwtAuthGuard]);
    }
  });
  it('builds personal vitrines only from current owner records with bounded pages', async () => {
    items.findAndCount.mockResolvedValue([[{ ...item, collectionId: 'collection', collection: { ...item.collection, id: 'collection', slug: 'mine', title: 'Mine', visibility: 'PRIVATE' } }], 80]);
    proposals.findAndCount.mockResolvedValue([[], 0]);
    const result = await service.personalMuseum({ id: 'owner', mergeId: 'MASTER-1' } as User, 1);
    expect(items.findAndCount).toHaveBeenCalledWith(expect.objectContaining({ where: { collection: { userId: 'owner' }, status: 'ACTIVE' }, skip: 24, take: 24 }));
    expect(proposals.findAndCount).toHaveBeenCalledWith(expect.objectContaining({ where: { creatorId: 'owner' }, skip: 24, take: 24 }));
    expect(result).toMatchObject({ identity: { masterId: 'MASTER-1', officialPartner: false }, hasMore: true, products: [{ id: 'source', collection: { visibility: 'PRIVATE' }, orderAllowed: false, productionAuthorized: false }] });
  });
  it('rejects a parent from another user or product before saving a version', async () => {
    items.findOne.mockResolvedValue(item);
    proposals.findOne.mockResolvedValue(null);
    await expect(service.createProposal({ id: 'creator' } as User, { sourceProductId: 'source', parentProposalId: 'parent' })).rejects.toThrow('Parent version');
    expect(proposals.findOne).toHaveBeenCalledWith({ where: { id: 'parent', creatorId: 'creator' } });
    proposals.findOne.mockResolvedValue({ id: 'parent', sourceProductId: 'different' });
    await expect(service.createProposal({ id: 'creator' } as User, { sourceProductId: 'source', parentProposalId: 'parent' })).rejects.toThrow('Parent version');
    expect(proposals.save).not.toHaveBeenCalled();
  });
  it('appends a new private version linked to an owned parent without overwriting it', async () => {
    items.findOne.mockResolvedValue(item);
    proposals.findOne.mockResolvedValue({ id: 'parent', sourceProductId: 'source' });
    houses.findOne.mockResolvedValue(null);
    fit.findOne.mockResolvedValue(null);
    const result = await service.createProposal({ id: 'creator' } as User, { sourceProductId: 'source', parentProposalId: 'parent' });
    expect(result).toMatchObject({ id: 'draft', parentProposalId: 'parent', rootProductId: 'source', visibility: 'PRIVATE', publicationStatus: 'PRIVATE', officialPartner: false, orderAllowed: false });
    expect(proposals.save).toHaveBeenCalledTimes(1);
    expect(proposals.save).toHaveBeenCalledWith(expect.not.objectContaining({ id: 'parent' }));
  });
  it('requires explicit publication consent and owner authorization', async () => {
    await expect(service.requestPublication('owner', 'draft', false)).rejects.toThrow('consent');
    expect(proposals.findOne).not.toHaveBeenCalled();
    proposals.findOne.mockResolvedValue(null);
    await expect(service.requestPublication('other', 'draft', true)).rejects.toThrow('Design not found');
    expect(proposals.findOne).toHaveBeenCalledWith({ where: { id: 'draft', creatorId: 'other' } });
    expect(proposals.save).not.toHaveBeenCalled();
  });
  it('records publication intent but never makes a proposal public, paid or production-ready', async () => {
    const row = { id: 'draft', sourceProductId: 'source', sourceUpdatedAt: item.updatedAt, publicationRequestedAt: null };
    proposals.findOne.mockResolvedValue(row);
    const result = await service.requestPublication('owner', 'draft', true);
    expect(result).toMatchObject({ visibility: 'PRIVATE', publicationStatus: 'PENDING_RIGHTS_REVIEW', publicationConsentVersion: 'museum-publication-2026-10-09-v1', orderAllowed: false, productionAuthorized: false });
    expect(row.publicationRequestedAt).toBeInstanceOf(Date);
    await service.requestPublication('owner', 'draft', true);
    expect(proposals.save).toHaveBeenCalledTimes(1);
  });
});
