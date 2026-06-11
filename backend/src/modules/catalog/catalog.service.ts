import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import {
  CatalogCollection,
  catalogCollectionView,
} from '../../database/entities/catalog-collection.entity';
import {
  CatalogItem,
  catalogItemView,
} from '../../database/entities/catalog-item.entity';
import {
  CreateCatalogItemDto,
  CreateCollectionDto,
  UpdateCatalogItemDto,
  UpdateCollectionDto,
} from './dto/catalog.dto';

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
  constructor(
    @InjectRepository(CatalogCollection)
    private readonly collections: Repository<CatalogCollection>,
    @InjectRepository(CatalogItem)
    private readonly items: Repository<CatalogItem>,
  ) {}

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

  async listPublic(limit = 50) {
    const rows = await this.collections.find({
      where: { visibility: 'PUBLIC' },
      order: { updatedAt: 'DESC' },
      take: limit,
      relations: { items: true, user: true },
    });
    return rows.map((c) => ({
      ...catalogCollectionView(c),
      ownerName: c.user ? `${c.user.firstName} ${c.user.lastName}`.trim() : 'Member',
      brandLineId: c.user?.brandLineId ?? null,
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
    return {
      ...catalogCollectionView(row),
      ownerName: row.user ? `${row.user.firstName} ${row.user.lastName}`.trim() : 'Member',
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
    const item = this.items.create({
      collectionId,
      title: dto.title.trim(),
      description: dto.description?.trim() || null,
      metalType: dto.metalType?.trim() || null,
      imageUrl: dto.imageUrl?.trim() || null,
      status: 'ACTIVE',
    });
    await this.items.save(item);
    return catalogItemView(item);
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCatalogItemDto) {
    const item = await this.items.findOne({
      where: { id: itemId },
      relations: { collection: true },
    });
    if (!item) throw new NotFoundException('Item not found');
    if (item.collection.userId !== userId) throw new ForbiddenException('Not your item');
    if (dto.title !== undefined) item.title = dto.title.trim();
    if (dto.description !== undefined) item.description = dto.description?.trim() || null;
    if (dto.metalType !== undefined) item.metalType = dto.metalType?.trim() || null;
    if (dto.imageUrl !== undefined) item.imageUrl = dto.imageUrl?.trim() || null;
    if (dto.status !== undefined) item.status = dto.status;
    await this.items.save(item);
    return catalogItemView(item);
  }

  async removeItem(userId: string, itemId: string) {
    const item = await this.items.findOne({
      where: { id: itemId },
      relations: { collection: true },
    });
    if (!item) throw new NotFoundException('Item not found');
    if (item.collection.userId !== userId) throw new ForbiddenException('Not your item');
    await this.items.remove(item);
    return { ok: true };
  }
}
