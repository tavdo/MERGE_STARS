import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import {
  BrandLineProfile,
  brandLineProfileView,
} from '../../database/entities/brand-line-profile.entity';
import { CatalogItem } from '../../database/entities/catalog-item.entity';
import {
  CatalogCollection,
  catalogCollectionView,
} from '../../database/entities/catalog-collection.entity';
import { catalogItemView } from '../../database/entities/catalog-item.entity';
import { User } from '../../database/entities/user.entity';
import { UpdateBrandLineDto } from './dto/brand.dto';
import { socialLinksPublicView } from '../../common/social-links';

const LOGO_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']);
const LOGO_MAX = 5 * 1024 * 1024;

@Injectable()
export class BrandService {
  private readonly uploadRoot =
    process.env.UPLOAD_DIR ?? join(process.cwd(), 'uploads');

  constructor(
    @InjectRepository(BrandLineProfile)
    private readonly profiles: Repository<BrandLineProfile>,
    @InjectRepository(CatalogCollection)
    private readonly collections: Repository<CatalogCollection>,
    @InjectRepository(CatalogItem)
    private readonly items: Repository<CatalogItem>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  private logoDir(userId: string) {
    return join(this.uploadRoot, 'brand', userId);
  }

  private async ensureProfile(user: User) {
    let row = await this.profiles.findOne({ where: { userId: user.id } });
    if (!row) {
      row = this.profiles.create({
        userId: user.id,
        name: `${user.firstName} ${user.lastName}`.trim() || 'My Brand',
        description: null,
        logoUrl: null,
        profileViews: 0,
        qrScans: 0,
      });
      await this.profiles.save(row);
    }
    return row;
  }

  private async activeProductCount(userId: string) {
    return this.items
      .createQueryBuilder('item')
      .innerJoin('item.collection', 'c')
      .where('c.userId = :userId', { userId })
      .andWhere('item.status = :status', { status: 'ACTIVE' })
      .getCount();
  }

  private async findOwnerByPublicId(id: string) {
    const key = id.trim();
    if (!key) throw new NotFoundException('Brand not found');
    const user = await this.users.findOne({
      where: [{ brandLineId: key }, { mergeId: key }],
    });
    if (!user) throw new NotFoundException('Brand not found');
    return user;
  }

  private withPublicMeta(user: User, row: BrandLineProfile, activeProducts: number) {
    return {
      ...brandLineProfileView(row, activeProducts),
      brandLineId: user.brandLineId,
      publicUrlPath: user.brandLineId ? `/b/${user.brandLineId}` : null,
    };
  }

  async getMine(user: User) {
    const row = await this.ensureProfile(user);
    const activeProducts = await this.activeProductCount(user.id);
    return this.withPublicMeta(user, row, activeProducts);
  }

  async update(user: User, dto: UpdateBrandLineDto) {
    const row = await this.ensureProfile(user);
    if (dto.name !== undefined) row.name = dto.name.trim() || row.name;
    if (dto.description !== undefined) row.description = dto.description?.trim() || null;
    await this.profiles.save(row);
    const activeProducts = await this.activeProductCount(user.id);
    return this.withPublicMeta(user, row, activeProducts);
  }

  async uploadLogo(user: User, file: Express.Multer.File | undefined) {
    if (!file?.buffer?.length) throw new BadRequestException('Logo file is required');
    if (!LOGO_MIME.has(file.mimetype)) {
      throw new BadRequestException('Allowed: JPEG, PNG, WebP, SVG');
    }
    if (file.size > LOGO_MAX) throw new BadRequestException('Logo too large (max 5 MB)');

    const row = await this.ensureProfile(user);
    const dir = this.logoDir(user.id);
    await mkdir(dir, { recursive: true });
    const ext =
      file.mimetype === 'image/png'
        ? 'png'
        : file.mimetype === 'image/webp'
          ? 'webp'
          : file.mimetype.includes('svg')
            ? 'svg'
            : 'jpg';
    const stored = `${randomUUID()}.${ext}`;
    await writeFile(join(dir, stored), file.buffer);
    row.logoUrl = stored;
    await this.profiles.save(row);
    const activeProducts = await this.activeProductCount(user.id);
    return this.withPublicMeta(user, row, activeProducts);
  }

  async getLogoFile(userId: string) {
    const row = await this.profiles.findOne({ where: { userId } });
    if (!row?.logoUrl) throw new NotFoundException('No logo');
    const ext = row.logoUrl.split('.').pop()?.toLowerCase();
    const mimeType =
      ext === 'png'
        ? 'image/png'
        : ext === 'webp'
          ? 'image/webp'
          : ext === 'svg'
            ? 'image/svg+xml'
            : 'image/jpeg';
    return { filePath: join(this.logoDir(userId), row.logoUrl), mimeType };
  }

  async trackProfileView(user: User) {
    const row = await this.ensureProfile(user);
    row.profileViews += 1;
    await this.profiles.save(row);
    return { profileViews: row.profileViews };
  }

  async trackQrScan(user: User) {
    const row = await this.ensureProfile(user);
    row.qrScans += 1;
    await this.profiles.save(row);
    return { qrScans: row.qrScans };
  }

  /** Brand Room listing — brands with public catalogs or a brand profile */
  async listPublicBrands(limit = 60) {
    const take = Math.min(Math.max(limit, 1), 100);

    const ownersFromCatalogs = await this.collections
      .createQueryBuilder('c')
      .select('DISTINCT c.user_id', 'userId')
      .where('c.visibility = :v', { v: 'PUBLIC' })
      .getRawMany<{ userId: string }>();

    const profileRows = await this.profiles.find({
      relations: { user: true },
      order: { profileViews: 'DESC', updatedAt: 'DESC' },
      take: take * 2,
    });

    const userIds = new Set<string>();
    for (const r of ownersFromCatalogs) if (r.userId) userIds.add(r.userId);
    for (const p of profileRows) if (p.userId) userIds.add(p.userId);

    const result: Array<{
      brandLineId: string | null;
      mergeId: string;
      name: string;
      description: string | null;
      hasLogo: boolean;
      logoUrl: string | null;
      profileViews: number;
      activeProducts: number;
      collectionCount: number;
      ownerName: string;
      hasAvatar: boolean;
      avatarUrl: string | null;
      collections: Array<{ id: string; title: string; slug: string; itemCount: number }>;
      previewProducts: Array<ReturnType<typeof catalogItemView> & {
        collectionSlug?: string
        collectionTitle?: string
      }>;
    }> = [];

    for (const userId of userIds) {
      if (result.length >= take) break;
      const user = await this.users.findOne({ where: { id: userId } });
      if (!user) continue;
      const row = await this.ensureProfile(user);
      const publicCollections = await this.collections.find({
        where: { userId: user.id, visibility: 'PUBLIC' },
        relations: { items: true },
        take: 8,
        order: { updatedAt: 'DESC' },
      });
      const activeProducts = await this.activeProductCount(user.id);
      const displayName =
        row.name?.trim() || `${user.firstName} ${user.lastName}`.trim();
      if (!displayName && publicCollections.length === 0) continue;

      const publicKey = user.brandLineId || user.mergeId;
      const previewItems = publicCollections
        .flatMap((c) =>
          (c.items ?? [])
            .filter((i) => i.status === 'ACTIVE')
            .slice(0, 2)
            .map((i) => ({
              ...catalogItemView(i),
              collectionSlug: c.slug,
              collectionTitle: c.title,
            })),
        )
        .slice(0, 4);

      result.push({
        brandLineId: user.brandLineId,
        mergeId: user.mergeId,
        name: displayName || 'Brand',
        description: row.description,
        hasLogo: !!row.logoUrl,
        logoUrl: row.logoUrl
          ? `/api/brand/public/${encodeURIComponent(publicKey)}/logo`
          : null,
        profileViews: row.profileViews,
        activeProducts,
        collectionCount: publicCollections.length,
        ownerName: `${user.firstName} ${user.lastName}`.trim(),
        hasAvatar: !!user.avatarUrl,
        avatarUrl: user.avatarUrl
          ? `/api/users/public/${encodeURIComponent(user.mergeId)}/avatar`
          : null,
        collections: publicCollections.map((c) => ({
          id: c.id,
          title: c.title,
          slug: c.slug,
          itemCount: c.items?.filter((i) => i.status === 'ACTIVE').length ?? 0,
        })),
        previewProducts: previewItems,
      });
    }

    result.sort(
      (a, b) =>
        b.profileViews - a.profileViews ||
        b.activeProducts - a.activeProducts ||
        b.collectionCount - a.collectionCount,
    );
    return result.slice(0, take);
  }

  /** Public brand / member profile by brandLineId or mergeId */
  async getPublicProfile(id: string) {
    const user = await this.findOwnerByPublicId(id);
    const row = await this.ensureProfile(user);
    const activeProducts = await this.activeProductCount(user.id);
    const collections = await this.collections.find({
      where: { userId: user.id, visibility: 'PUBLIC' },
      order: { updatedAt: 'DESC' },
      relations: { items: true },
      take: 50,
    });

    const publicKey = user.brandLineId || user.mergeId;
    const collectionPayload = collections.map((c) => {
      const activeItems = (c.items ?? [])
        .filter((i) => i.status === 'ACTIVE')
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((i) => ({
          ...catalogItemView(i),
          collectionSlug: c.slug,
          collectionTitle: c.title,
        }));
      return {
        ...catalogCollectionView(c),
        itemCount: activeItems.length,
        items: activeItems,
      };
    });

    const products = collectionPayload.flatMap((c) => c.items);

    return {
      brandLineId: user.brandLineId,
      mergeId: user.mergeId,
      name: row.name || `${user.firstName} ${user.lastName}`.trim() || 'Brand',
      description: row.description,
      hasLogo: !!row.logoUrl,
      logoUrl: row.logoUrl
        ? `/api/brand/public/${encodeURIComponent(publicKey)}/logo`
        : null,
      profileViews: row.profileViews,
      qrScans: row.qrScans,
      activeProducts,
      ownerName: `${user.firstName} ${user.lastName}`.trim(),
      owner: {
        firstName: user.firstName,
        lastName: user.lastName,
        mergeId: user.mergeId,
        brandLineId: user.brandLineId,
        founderId: user.founderId,
        hasAvatar: !!user.avatarUrl,
        avatarUrl: user.avatarUrl
          ? `/api/users/public/${encodeURIComponent(user.mergeId)}/avatar`
          : null,
        socialLinks: socialLinksPublicView(user.socialLinks),
        profilePath: `/u/${encodeURIComponent(user.mergeId)}`,
        brandPath: user.brandLineId
          ? `/b/${encodeURIComponent(user.brandLineId)}`
          : `/u/${encodeURIComponent(user.mergeId)}`,
      },
      collections: collectionPayload,
      products,
    };
  }

  async getPublicLogoFile(id: string) {
    const user = await this.findOwnerByPublicId(id);
    return this.getLogoFile(user.id);
  }

  async trackPublicView(id: string) {
    const user = await this.findOwnerByPublicId(id);
    const row = await this.ensureProfile(user);
    row.profileViews += 1;
    await this.profiles.save(row);
    return { profileViews: row.profileViews };
  }

  async trackPublicScan(id: string) {
    const user = await this.findOwnerByPublicId(id);
    const row = await this.ensureProfile(user);
    row.qrScans += 1;
    await this.profiles.save(row);
    return { qrScans: row.qrScans };
  }
}
