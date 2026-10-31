import {
  BadRequestException,
  Injectable,
  Logger,
  Optional,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import {
  CatalogItem,
  catalogItemView,
} from '../../database/entities/catalog-item.entity';
import { BrandLineProfile } from '../../database/entities/brand-line-profile.entity';
import { User } from '../../database/entities/user.entity';
import {
  FitProfile,
  DesignProposal,
  ProductInteraction,
  measurementKeys,
} from './experience.entity';
import { FitDto, ProposalDto, InteractionDto } from './experience.dto';
import { NotificationsService } from '../notifications/notifications.service';

export const productBoundary = {
  truthState: 'CONCEPT',
  generationStatus: null,
  calculationStatus: 'UNAVAILABLE',
  physicalWeightGrams: null,
  pricingWeightKg: null,
  estimatedPriceMinor: null,
  verifiedOffer: null,
  orderAllowed: false,
  productionAuthorized: false,
  passport: null,
  missing: [
    'APPROVED_GEOMETRY',
    'MATERIAL_COMPOSITION',
    'FIT_RULE',
    'PRODUCT_PRICING_RULE',
    'ENGINEERING_VERIFICATION',
  ],
};

@Injectable()
export class ExperienceService {
  private readonly log = new Logger(ExperienceService.name);
  constructor(
    @InjectRepository(FitProfile) private readonly fits: Repository<FitProfile>,
    @InjectRepository(DesignProposal)
    private readonly proposals: Repository<DesignProposal>,
    @InjectRepository(ProductInteraction)
    private readonly interactions: Repository<ProductInteraction>,
    @InjectRepository(CatalogItem)
    private readonly items: Repository<CatalogItem>,
    @InjectRepository(BrandLineProfile)
    private readonly houses: Repository<BrandLineProfile>,
    @Optional() private readonly notifications?: NotificationsService,
  ) {}
  async eligibleProduct(id: string, userId?: string) {
    const item = await this.items.findOne({
      where: { id, status: 'ACTIVE' },
      relations: { collection: true },
    });
    if (
      !item ||
      (item.collection.visibility !== 'PUBLIC' &&
        item.collection.userId !== userId)
    )
      throw new NotFoundException('Product not available');
    return item;
  }
  async publicProduct(id: string) {
    const item = await this.eligibleProduct(id);
    return {
      ...catalogItemView(item),
      ...productBoundary,
      sourceVersion: item.updatedAt.toISOString(),
      likes: await this.interactions.count({
        where: { productId: id, kind: 'LIKE' },
      }),
    };
  }
  getFit(userId: string) {
    return this.fits.findOne({ where: { userId } });
  }
  async saveFit(userId: string, dto: FitDto) {
    if (dto.consent !== true)
      throw new BadRequestException(
        'Measurement storage requires explicit consent',
      );
    if (!dto.measurements || !Object.keys(dto.measurements).length)
      throw new BadRequestException('Provide at least one measurement');
    const measurements = {};
    for (const key of measurementKeys) {
      const value = dto.measurements[key];
      if (value !== undefined) {
        if (!Number.isFinite(value) || value <= 0)
          throw new BadRequestException('Invalid measurement');
        measurements[key] = value;
      }
    }
    if (!Object.keys(measurements).length)
      throw new BadRequestException('No supported measurements');
    await this.fits.upsert(
      {
        userId,
        measurements,
        source: 'MANUAL_UNVERIFIED',
        consentedAt: new Date(),
      },
      ['userId'],
    );
    return this.getFit(userId);
  }
  async removeFit(userId: string) {
    await this.fits.delete({ userId });
    return { ok: true };
  }
  async createProposal(user: User, dto: ProposalDto) {
    const source = await this.eligibleProduct(dto.sourceProductId, user.id);
    if (dto.parentProposalId) {
      const parent = await this.proposals.findOne({ where: { id: dto.parentProposalId, creatorId: user.id } });
      if (!parent || parent.sourceProductId !== source.id) throw new BadRequestException('Parent version is not available for this source');
    }
    const house = await this.houses.findOne({ where: { userId: user.id } });
    const fit = await this.getFit(user.id);
    const row = this.proposals.create({
      creatorId: user.id,
      sourceProductId: source.id,
      parentProposalId: dto.parentProposalId ?? null,
      publicationRequestedAt: null,
      publicationConsentVersion: null,
      sourceUpdatedAt: source.updatedAt,
      houseId: house?.id ?? null,
      brandLineId: user.brandLineId ?? null,
      preferences: {
        material: dto.material,
        initials: dto.initials,
        notes: dto.notes,
        measurements: fit?.measurements ?? {},
        fitSource: fit?.source ?? null,
        fitUpdatedAt: fit?.updatedAt?.toISOString() ?? null,
      },
      verificationRequestedAt: null,
    });
    const saved = await this.proposals.save(row);
    await this.notify(
      user.id,
      saved.id,
      'design_saved',
      'Design draft saved',
      'Your source-linked design proposal is saved. It is not a verified offer.',
    );
    return this.proposalView(saved);
  }
  private async notify(
    userId: string,
    designId: string,
    type: string,
    title: string,
    body: string,
  ) {
    try {
      await this.notifications?.create({
        userId,
        type,
        title,
        body,
        meta: { designId, path: `/my-designs#design-${designId}` },
      });
    } catch {
      this.log.warn('Design persisted but notification delivery unavailable');
    }
  }
  proposalView(row: DesignProposal) {
    return {
      ...row,
      ...productBoundary,
      rootProductId: row.sourceProductId,
      versionId: row.id,
      newProductId: null,
      kind: 'DESIGN_PROPOSAL',
      visibility: 'PRIVATE',
      publicationStatus: row.publicationRequestedAt ? 'PENDING_RIGHTS_REVIEW' : 'PRIVATE',
      officialPartner: false,
      verificationStatus: row.verificationRequestedAt
        ? 'REQUESTED'
        : 'NOT_REQUESTED',
      sourceVersion: row.sourceUpdatedAt.toISOString(),
    };
  }
  async listProposals(userId: string) {
    return (
      await this.proposals.find({
        where: { creatorId: userId },
        order: { createdAt: 'DESC' },
      })
    ).map((row) => this.proposalView(row));
  }
  async personalMuseum(user: User, page = 0) {
    const offset = Math.min(999999, Math.max(0, Math.floor(page) || 0)) * 24;
    const [products, productCount] = await this.items.findAndCount({
      where: { collection: { userId: user.id }, status: 'ACTIVE' },
      relations: { collection: true }, order: { createdAt: 'DESC', id: 'DESC' }, skip: offset, take: 24,
    });
    const [versions, versionCount] = await this.proposals.findAndCount({
      where: { creatorId: user.id }, order: { createdAt: 'DESC', id: 'DESC' }, skip: offset, take: 24,
    });
    return {
      identity: { masterId: user.mergeId, ownerId: user.id, kind: 'PERSONAL_BRAND_MUSEUM', officialPartner: false },
      products: products.map(item => ({ ...catalogItemView(item), collection: { id: item.collection.id, title: item.collection.title, slug: item.collection.slug, visibility: item.collection.visibility, category: item.collection.category }, ...productBoundary })),
      versions: versions.map(row => this.proposalView(row)),
      page: offset / 24, pageSize: 24, productCount, versionCount, hasMore: offset + 24 < Math.max(productCount, versionCount),
      publicPublication: 'EXPLICIT_CONSENT_AND_RIGHTS_REVIEW_REQUIRED',
    };
  }
  async requestPublication(userId: string, id: string, consent: boolean) {
    if (consent !== true) throw new BadRequestException('Publication requires explicit author consent');
    const row = await this.proposals.findOne({ where: { id, creatorId: userId } });
    if (!row) throw new NotFoundException('Design not found');
    if (!row.publicationRequestedAt) {
      row.publicationRequestedAt = new Date();
      row.publicationConsentVersion = 'museum-publication-2026-10-09-v1';
      await this.proposals.save(row);
    }
    return this.proposalView(row);
  }
  async reviewQueue() {
    return (
      await this.proposals.find({
        where: { verificationRequestedAt: Not(IsNull()) },
        order: { verificationRequestedAt: 'ASC' },
        take: 100,
      })
    ).map((row) => this.proposalView(row));
  }
  async requestVerification(userId: string, id: string) {
    const row = await this.proposals.findOne({
      where: { id, creatorId: userId },
    });
    if (!row) throw new NotFoundException('Design not found');
    if (!row.verificationRequestedAt) {
      row.verificationRequestedAt = new Date();
      await this.proposals.save(row);
      await this.notify(
        userId,
        row.id,
        'verification_requested',
        'Design review requested',
        'Your request has been recorded. Engineering approval and a verified offer are still pending.',
      );
    }
    return this.proposalView(row);
  }
  async interaction(userId: string, productId: string, dto: InteractionDto) {
    await this.eligibleProduct(productId, userId);
    if (dto.active)
      await this.interactions.upsert({ userId, productId, kind: dto.kind }, [
        'userId',
        'productId',
        'kind',
      ]);
    else await this.interactions.delete({ userId, productId, kind: dto.kind });
    return this.interactionState(userId, productId);
  }
  async interactionState(userId: string, productId: string) {
    await this.eligibleProduct(productId, userId);
    const rows = await this.interactions.find({ where: { userId, productId } });
    return {
      liked: rows.some((r) => r.kind === 'LIKE'),
      saved: rows.some((r) => r.kind === 'SAVE'),
    };
  }
  async savedProducts(userId: string) {
    const rows = await this.interactions.find({
      where: { userId, kind: 'SAVE' },
      order: { createdAt: 'DESC' },
      take: 100,
    });
    const result: Array<
      ReturnType<typeof catalogItemView> & {
        collectionSlug: string;
        visibility: string;
      }
    > = [];
    for (const row of rows) {
      try {
        const item = await this.eligibleProduct(row.productId, userId);
        result.push({
          ...catalogItemView(item),
          collectionSlug: item.collection.slug,
          visibility: item.collection.visibility,
        });
      } catch (error) {
        if (!(error instanceof NotFoundException)) throw error;
      }
    }
    return result;
  }
  async pulse(userId: string) {
    const house = await this.houses.findOne({ where: { userId } });
    const owned = await this.items.find({
      where: { collection: { userId } },
      select: { id: true },
    });
    const products = owned.map((i) => i.id);
    let likes = 0,
      saves = 0;
    for (const productId of products) {
      likes += await this.interactions.count({
        where: { productId, kind: 'LIKE' },
      });
      saves += await this.interactions.count({
        where: { productId, kind: 'SAVE' },
      });
    }
    const proposals = await this.listProposals(userId);
    return {
      qrScans: house?.qrScans ?? null,
      profileViews: house?.profileViews ?? null,
      likes,
      saves,
      designs: proposals.length,
      verificationRequests: proposals.filter(
        (p) => p.verificationStatus === 'REQUESTED',
      ).length,
      messages: null,
      production: null,
      passportEvents: null,
    };
  }
}
