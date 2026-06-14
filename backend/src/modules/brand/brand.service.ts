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
import { CatalogCollection } from '../../database/entities/catalog-collection.entity';
import { User } from '../../database/entities/user.entity';
import { UpdateBrandLineDto } from './dto/brand.dto';

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

  async getMine(user: User) {
    const row = await this.ensureProfile(user);
    const activeProducts = await this.activeProductCount(user.id);
    return {
      ...brandLineProfileView(row, activeProducts),
      brandLineId: user.brandLineId,
    };
  }

  async update(user: User, dto: UpdateBrandLineDto) {
    const row = await this.ensureProfile(user);
    if (dto.name !== undefined) row.name = dto.name.trim() || row.name;
    if (dto.description !== undefined) row.description = dto.description?.trim() || null;
    await this.profiles.save(row);
    const activeProducts = await this.activeProductCount(user.id);
    return {
      ...brandLineProfileView(row, activeProducts),
      brandLineId: user.brandLineId,
    };
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
      file.mimetype === 'image/png' ? 'png' : file.mimetype === 'image/webp' ? 'webp' : file.mimetype.includes('svg') ? 'svg' : 'jpg';
    const stored = `${randomUUID()}.${ext}`;
    await writeFile(join(dir, stored), file.buffer);
    row.logoUrl = stored;
    await this.profiles.save(row);
    const activeProducts = await this.activeProductCount(user.id);
    return {
      ...brandLineProfileView(row, activeProducts),
      brandLineId: user.brandLineId,
    };
  }

  async getLogoFile(userId: string) {
    const row = await this.profiles.findOne({ where: { userId } });
    if (!row?.logoUrl) throw new NotFoundException('No logo');
    const ext = row.logoUrl.split('.').pop()?.toLowerCase();
    const mimeType =
      ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : ext === 'svg' ? 'image/svg+xml' : 'image/jpeg';
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
}
