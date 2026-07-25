import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes, randomUUID } from 'crypto';
import { mkdir, rename, unlink, writeFile } from 'fs/promises';
import { join } from 'path';
import { In, Repository } from 'typeorm';
import { BrandLineProfile } from '../../database/entities/brand-line-profile.entity';
import {
  CatalogCollection,
  catalogCollectionView,
} from '../../database/entities/catalog-collection.entity';
import {
  CatalogItem,
  catalogItemView,
} from '../../database/entities/catalog-item.entity';
import { User } from '../../database/entities/user.entity';
import {
  CreateCatalogItemDto,
  CreateCollectionDto,
  UpdateCatalogItemDto,
  UpdateCollectionDto,
} from './dto/catalog.dto';
import {
  CATALOG_CATEGORIES,
  isCatalogCategory,
  normalizeCatalogCategory,
} from './catalog-categories';

const IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MODEL_MIME = new Set([
  'model/gltf-binary',
  'model/gltf+json',
  'application/octet-stream',
  'model/vnd.usdz+zip',
]);
const MODEL_EXT = new Set(['glb', 'gltf', 'usdz', 'usdc']);
const IMAGE_MAX = 10 * 1024 * 1024;
const MODEL_MAX = 1024 * 1024 * 1024;

function slugify(title: string) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  const suffix = randomBytes(3).toString('hex');
  return `${base || 'collection'}-${suffix}`;
}

@Injectable()
export class CatalogService {
  private readonly uploadRoot =
    process.env.UPLOAD_DIR ?? join(process.cwd(), 'uploads');

  constructor(
    @InjectRepository(CatalogCollection)
    private readonly collections: Repository<CatalogCollection>,
    @InjectRepository(CatalogItem)
    private readonly items: Repository<CatalogItem>,
    @InjectRepository(BrandLineProfile)
    private readonly brandProfiles: Repository<BrandLineProfile>,
  ) {}

  private itemDir(itemId: string) {
    return join(this.uploadRoot, 'catalog', itemId);
  }

  private publicOwnerMeta(
    user: User | null | undefined,
    profile: BrandLineProfile | null | undefined,
  ) {
    if (!user) {
      return {
        ownerName: 'Member',
        brandLineId: null as string | null,
        mergeId: null as string | null,
        brandName: null as string | null,
        logoUrl: null as string | null,
        avatarUrl: null as string | null,
      };
    }
    const publicKey = user.brandLineId || user.mergeId;
    return {
      ownerName: `${user.firstName} ${user.lastName}`.trim() || 'Member',
      brandLineId: user.brandLineId ?? null,
      mergeId: user.mergeId ?? null,
      brandName: profile?.name?.trim() || null,
      logoUrl:
        profile?.logoUrl && publicKey
          ? `/api/brand/public/${encodeURIComponent(publicKey)}/logo`
          : null,
      avatarUrl: user.avatarUrl
        ? `/api/users/public/${encodeURIComponent(user.mergeId)}/avatar`
        : null,
    };
  }

  private async brandProfilesByUserIds(userIds: string[]) {
    const unique = [...new Set(userIds.filter(Boolean))];
    if (unique.length === 0) return new Map<string, BrandLineProfile>();
    const rows = await this.brandProfiles.find({
      where: { userId: In(unique) },
    });
    return new Map(rows.map((p) => [p.userId, p]));
  }

  private async ownedItem(userId: string, itemId: string) {
    const item = await this.items.findOne({
      where: { id: itemId },
      relations: { collection: true },
    });
    if (!item) throw new NotFoundException('Item not found');
    if (item.collection.userId !== userId) {
      throw new ForbiddenException('Not your item');
    }
    return item;
  }

  private async ownedCollection(userId: string, id: string) {
    const row = await this.collections.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Collection not found');
    if (row.userId !== userId) throw new ForbiddenException('Not your collection');
    return row;
  }

  async listForUser(userId: string) {
    const rows = await this.collections.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
      relations: { items: true },
    });
    return rows.map((c) => catalogCollectionView(c));
  }

  async listPublic(limit = 50, category?: string) {
    const where: {
      visibility: 'PUBLIC';
      category?: (typeof CATALOG_CATEGORIES)[number];
    } = { visibility: 'PUBLIC' };
    if (category && isCatalogCategory(category)) {
      where.category = category;
    }
    const rows = await this.collections.find({
      where,
      order: { updatedAt: 'DESC' },
      take: limit,
      relations: { items: true, user: true },
    });
    const profiles = await this.brandProfilesByUserIds(rows.map((c) => c.userId));
    return rows.map((c) => ({
      ...catalogCollectionView(c),
      ...this.publicOwnerMeta(c.user, profiles.get(c.userId)),
    }));
  }

  async publicCategoryStats() {
    const rows = await this.collections
      .createQueryBuilder('c')
      .select('c.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('c.visibility = :v', { v: 'PUBLIC' })
      .groupBy('c.category')
      .getRawMany<{ category: string; count: string }>();

    const counts = Object.fromEntries(
      CATALOG_CATEGORIES.map((key) => [key, 0]),
    ) as Record<(typeof CATALOG_CATEGORIES)[number], number>;

    for (const row of rows) {
      const key = normalizeCatalogCategory(row.category);
      counts[key] += Number(row.count) || 0;
    }

    return CATALOG_CATEGORIES.map((key) => ({
      key,
      count: counts[key],
    }));
  }

  async getForUser(userId: string, id: string) {
    const row = await this.collections.findOne({
      where: { id },
      relations: { items: true },
    });
    if (!row) throw new NotFoundException('Collection not found');
    if (row.userId !== userId) throw new ForbiddenException('Not your collection');
    return {
      ...catalogCollectionView(row),
      items: row.items
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map(catalogItemView),
    };
  }

  async getPublicBySlug(slug: string) {
    const row = await this.collections.findOne({
      where: { slug, visibility: 'PUBLIC' },
      relations: { items: true, user: true },
    });
    if (!row) throw new NotFoundException('Collection not found');
    const profile = row.userId
      ? await this.brandProfiles.findOne({ where: { userId: row.userId } })
      : null;
    return {
      ...catalogCollectionView(row),
      ...this.publicOwnerMeta(row.user, profile),
      items: row.items
        .filter((i) => i.status === 'ACTIVE')
        .map(catalogItemView),
    };
  }

  async create(userId: string, dto: CreateCollectionDto) {
    let slug = slugify(dto.title);
    while (await this.collections.findOne({ where: { slug } })) {
      slug = slugify(dto.title);
    }
    const row = this.collections.create({
      userId,
      title: dto.title.trim(),
      description: dto.description?.trim() || null,
      visibility: dto.visibility,
      category: normalizeCatalogCategory(dto.category),
      slug,
    });
    await this.collections.save(row);
    return catalogCollectionView(row, 0);
  }

  async update(userId: string, id: string, dto: UpdateCollectionDto) {
    const row = await this.ownedCollection(userId, id);
    if (dto.title !== undefined) row.title = dto.title.trim();
    if (dto.description !== undefined) row.description = dto.description?.trim() || null;
    if (dto.visibility !== undefined) row.visibility = dto.visibility;
    if (dto.category !== undefined) row.category = normalizeCatalogCategory(dto.category);
    await this.collections.save(row);
    const count = await this.items.count({ where: { collectionId: id } });
    return catalogCollectionView(row, count);
  }

  async remove(userId: string, id: string) {
    const row = await this.ownedCollection(userId, id);
    await this.collections.remove(row);
    return { ok: true };
  }

  async addItem(userId: string, collectionId: string, dto: CreateCatalogItemDto) {
    await this.ownedCollection(userId, collectionId);
    const price =
      dto.priceUsd !== undefined && Number.isFinite(Number(dto.priceUsd))
        ? Math.round(Number(dto.priceUsd) * 100) / 100
        : null;
    const item = this.items.create({
      collectionId,
      title: dto.title.trim(),
      description: dto.description?.trim() || null,
      metalType: dto.metalType?.trim() || null,
      imageUrl: dto.imageUrl?.trim() || null,
      priceUsd: price,
      status: 'ACTIVE',
    });
    await this.items.save(item);
    return catalogItemView(item);
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCatalogItemDto) {
    const item = await this.ownedItem(userId, itemId);
    if (dto.title !== undefined) item.title = dto.title.trim();
    if (dto.description !== undefined) item.description = dto.description?.trim() || null;
    if (dto.metalType !== undefined) item.metalType = dto.metalType?.trim() || null;
    if (dto.imageUrl !== undefined) item.imageUrl = dto.imageUrl?.trim() || null;
    if (dto.status !== undefined) item.status = dto.status;
    if (dto.priceUsd !== undefined) {
      item.priceUsd =
        dto.priceUsd === null
          ? null
          : Math.round(Number(dto.priceUsd) * 100) / 100;
    }
    await this.items.save(item);
    return catalogItemView(item);
  }

  async removeItem(userId: string, itemId: string) {
    const item = await this.ownedItem(userId, itemId);
    await this.items.remove(item);
    return { ok: true };
  }

  async uploadImage(userId: string, itemId: string, file: Express.Multer.File | undefined) {
    if (!file?.buffer?.length) throw new BadRequestException('Image file is required');
    if (!IMAGE_MIME.has(file.mimetype)) {
      throw new BadRequestException('Allowed: JPEG, PNG, WebP, GIF');
    }
    if (file.size > IMAGE_MAX) throw new BadRequestException('Image too large (max 10 MB)');

    const item = await this.ownedItem(userId, itemId);
    const dir = this.itemDir(itemId);
    await mkdir(dir, { recursive: true });
    const ext =
      file.mimetype === 'image/png' ? 'png' : file.mimetype === 'image/webp' ? 'webp' : file.mimetype === 'image/gif' ? 'gif' : 'jpg';
    const stored = `img-${randomUUID()}.${ext}`;
    await writeFile(join(dir, stored), file.buffer);
    item.imageUrl = stored;
    await this.items.save(item);
    return catalogItemView(item);
  }

  async uploadModel3d(userId: string, itemId: string, file: Express.Multer.File | undefined) {
    if (!file) throw new BadRequestException('3D model file is required');
    const ext = file.originalname.split('.').pop()?.toLowerCase() ?? '';
    if (!MODEL_MIME.has(file.mimetype) && !MODEL_EXT.has(ext)) {
      if (file.path) await unlink(file.path).catch(() => undefined);
      throw new BadRequestException('Allowed: GLB, GLTF, USDZ, USDC');
    }
    if (file.size > MODEL_MAX) {
      if (file.path) await unlink(file.path).catch(() => undefined);
      throw new BadRequestException('Model too large (max 1 GB)');
    }

    const item = await this.ownedItem(userId, itemId);
    const dir = this.itemDir(itemId);
    await mkdir(dir, { recursive: true });
    const format = ext || 'glb';
    const stored = `model-${randomUUID()}.${format}`;
    const dest = join(dir, stored);

    try {
      if (file.path) {
        await rename(file.path, dest);
      } else if (file.buffer?.length) {
        await writeFile(dest, file.buffer);
      } else {
        throw new BadRequestException('3D model file is required');
      }
    } catch (err) {
      if (file.path) await unlink(file.path).catch(() => undefined);
      throw err;
    }

    item.model3dUrl = stored;
    item.model3dFormat = format;
    await this.items.save(item);
    return catalogItemView(item);
  }

  private resolveStoredPath(itemId: string, stored: string) {
    if (stored.includes('..') || stored.includes('/') || stored.includes('\\')) {
      throw new NotFoundException('Asset not found');
    }
    return join(this.itemDir(itemId), stored);
  }

  async getImageFile(itemId: string, stored: string) {
    const item = await this.items.findOne({ where: { id: itemId } });
    if (!item?.imageUrl || item.imageUrl !== stored) {
      throw new NotFoundException('Image not found');
    }
    const ext = stored.split('.').pop()?.toLowerCase();
    const mimeType =
      ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : ext === 'gif' ? 'image/gif' : 'image/jpeg';
    return { filePath: this.resolveStoredPath(itemId, stored), mimeType };
  }

  async getModelFile(itemId: string, stored: string) {
    const item = await this.items.findOne({ where: { id: itemId } });
    if (!item?.model3dUrl || item.model3dUrl !== stored) {
      throw new NotFoundException('Model not found');
    }
    const ext = stored.split('.').pop()?.toLowerCase() ?? 'glb';
    const mimeType =
      ext === 'gltf' ? 'model/gltf+json' : ext === 'usdz' || ext === 'usdc' ? 'model/vnd.usdz+zip' : 'model/gltf-binary';
    return { filePath: this.resolveStoredPath(itemId, stored), mimeType };
  }

  async getImageFileForUser(userId: string, itemId: string) {
    const item = await this.ownedItem(userId, itemId);
    if (!item.imageUrl || item.imageUrl.startsWith('http')) {
      throw new NotFoundException('No uploaded image');
    }
    return this.getImageFile(itemId, item.imageUrl);
  }

  async getModelFileForUser(userId: string, itemId: string) {
    const item = await this.ownedItem(userId, itemId);
    if (!item.model3dUrl) throw new NotFoundException('No 3D model');
    return this.getModelFile(itemId, item.model3dUrl);
  }

  private async getPublicActiveItem(itemId: string) {
    const item = await this.items.findOne({
      where: { id: itemId },
      relations: { collection: true },
    });
    if (!item || item.status !== 'ACTIVE' || item.collection?.visibility !== 'PUBLIC') {
      throw new NotFoundException('Item not found');
    }
    return item;
  }

  async getPublicImageFile(itemId: string) {
    const item = await this.getPublicActiveItem(itemId);
    if (!item.imageUrl || item.imageUrl.startsWith('http')) {
      throw new NotFoundException('No uploaded image');
    }
    return this.getImageFile(itemId, item.imageUrl);
  }

  async getPublicModelFile(itemId: string) {
    const item = await this.getPublicActiveItem(itemId);
    if (!item.model3dUrl) throw new NotFoundException('No 3D model');
    return this.getModelFile(itemId, item.model3dUrl);
  }
}
