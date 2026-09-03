import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CoinConfiguratorSession,
  ConfiguratorSessionStatus,
} from '../../database/entities/coin-configurator-session.entity';
import {
  CoinConfiguratorProduct,
  configuratorProductView,
} from '../../database/entities/coin-configurator-product.entity';
import {
  CoinPackageConfig,
  coinPackageConfigView,
} from '../../database/entities/coin-package-config.entity';
import { CatalogCollection } from '../../database/entities/catalog-collection.entity';
import { CatalogItem } from '../../database/entities/catalog-item.entity';
import { ProductPassport, productPassportView } from '../../database/entities/product-passport.entity';
import { CONFIGURATOR_PRODUCT_TYPES, PRODUCT_SLOT_LAYOUT, productTypeMeta } from './configurator.constants';
import {
  AddConfiguratorProductDto,
  ApproveConfiguratorProductDto,
  CreateConfiguratorSessionDto,
  UpdateConfiguratorProductDto,
  UpdatePackageConfigDto,
  SaveCaseDesignDto,
} from './dto/configurator.dto';

function sessionView(
  session: CoinConfiguratorSession,
  products: CoinConfiguratorProduct[],
) {
  return {
    id: session.id,
    packageKg: Number(session.packageKg),
    caseWeightG: session.caseWeightG,
    productCapacityG: session.productCapacityG,
    sourceBrandHouseId: session.sourceBrandHouseId,
    sourceQrRef: session.sourceQrRef,
    status: session.status,
    usedWeightG: session.usedWeightG,
    remainingWeightG: session.remainingWeightG,
    caseLayoutJson: session.caseLayoutJson,
    finalizedAt: session.finalizedAt?.toISOString() ?? null,
    products: products.map(configuratorProductView),
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
  };
}

@Injectable()
export class CoinConfiguratorService {
  constructor(
    @InjectRepository(CoinConfiguratorSession)
    private readonly sessions: Repository<CoinConfiguratorSession>,
    @InjectRepository(CoinConfiguratorProduct)
    private readonly products: Repository<CoinConfiguratorProduct>,
    @InjectRepository(CoinPackageConfig)
    private readonly packageConfigs: Repository<CoinPackageConfig>,
    @InjectRepository(CatalogCollection)
    private readonly collections: Repository<CatalogCollection>,
    @InjectRepository(CatalogItem)
    private readonly catalogItems: Repository<CatalogItem>,
    @InjectRepository(ProductPassport)
    private readonly passports: Repository<ProductPassport>,
  ) {}

  private nextPassportId() {
    const n = Math.floor(100000 + Math.random() * 899999);
    return `MERGE-PP-${n}`;
  }

  private getCaseDesign(session: CoinConfiguratorSession) {
    const layout = session.caseLayoutJson as {
      caseDesign?: { model3dUrl?: string; approved?: boolean; prompt?: string; meshyJobId?: string };
    } | null;
    return layout?.caseDesign ?? null;
  }

  private assertCaseReady(session: CoinConfiguratorSession) {
    const cd = this.getCaseDesign(session);
    if (!cd?.approved || !cd?.model3dUrl) {
      throw new BadRequestException('Generate and approve your brand case (500 g) before adding products');
    }
  }

  private mergeCaseLayout(
    session: CoinConfiguratorSession,
    products: CoinConfiguratorProduct[],
    caseDesignPatch?: Record<string, unknown>,
  ) {
    const prev = (session.caseLayoutJson ?? {}) as Record<string, unknown>;
    const layout = this.computeAutoFitLayout(products);
    session.caseLayoutJson = {
      ...layout,
      caseDesign: caseDesignPatch ?? prev.caseDesign ?? this.getCaseDesign(session),
    } as unknown as Record<string, unknown>;
  }

  async saveCaseDesign(userId: string, sessionId: string, dto: SaveCaseDesignDto) {
    const session = await this.loadSessionForUser(sessionId, userId);
    this.assertEditable(session);
    const items = await this.loadProducts(sessionId);
    const prev = this.getCaseDesign(session) ?? {};
    const caseDesign = {
      ...prev,
      prompt: dto.prompt ?? prev.prompt ?? null,
      meshyJobId: dto.meshyJobId ?? prev.meshyJobId ?? null,
      model3dUrl: dto.model3dUrl ?? prev.model3dUrl ?? null,
      approved: false,
      weightG: session.caseWeightG,
      updatedAt: new Date().toISOString(),
    };
    this.mergeCaseLayout(session, items, caseDesign);
    await this.sessions.save(session);
    return sessionView(session, items);
  }

  async approveCaseDesign(userId: string, sessionId: string) {
    const session = await this.loadSessionForUser(sessionId, userId);
    this.assertEditable(session);
    const cd = this.getCaseDesign(session);
    if (!cd?.model3dUrl) {
      throw new BadRequestException('Generate your brand case 3D model first');
    }
    const items = await this.loadProducts(sessionId);
    const caseDesign = { ...cd, approved: true, approvedAt: new Date().toISOString() };
    this.mergeCaseLayout(session, items, caseDesign);
    await this.sessions.save(session);
    return sessionView(session, items);
  }

  private computeAutoFitLayout(products: CoinConfiguratorProduct[]) {
    const inCoin = products.filter((p) =>
      ['approved', 'cad_review', 'verified', 'generated'].includes(p.status),
    );
    const typeCount: Record<string, number> = {};

    const compartments = inCoin.map((p) => {
      const base = PRODUCT_SLOT_LAYOUT[p.productType] ?? PRODUCT_SLOT_LAYOUT.custom;
      const n = typeCount[p.productType] ?? 0;
      typeCount[p.productType] = n + 1;
      const angle = (n * 36 * Math.PI) / 180;
      const driftX = n > 0 ? Math.cos(angle) * 4 : 0;
      const driftY = n > 0 ? Math.sin(angle) * 4 : 0;

      return {
        productId: p.id,
        title: p.title,
        productType: p.productType,
        model3dUrl: p.model3dUrl,
        weightG: p.verifiedWeightG ?? p.estimatedWeightG ?? productTypeMeta(p.productType).defaultWeightG,
        shape: base.shape,
        tier: base.tier,
        xPct: Math.min(88, Math.max(8, base.x + driftX)),
        yPct: Math.min(88, Math.max(8, base.y + driftY)),
        wPct: base.w,
        hPct: base.h,
      };
    });

    return {
      version: 2,
      caseStyle: 'merge-coin-circular-v1',
      diameterCm: 30,
      tiers: 2,
      material: 'Pure Silver Filament 999.9',
      centerMergeCoin: { xPct: 50, yPct: 48, rPct: 11 },
      compartments,
    };
  }

  private async createPassport(
    userId: string,
    session: CoinConfiguratorSession,
    product: CoinConfiguratorProduct,
  ) {
    let publicId = this.nextPassportId();
    while (await this.passports.findOne({ where: { publicId } })) {
      publicId = this.nextPassportId();
    }
    const passport = this.passports.create({
      publicId,
      ownerUserId: userId,
      configuratorProductId: product.id,
      sessionId: session.id,
      brandHouseId: session.sourceBrandHouseId,
      sourceQrRef: session.sourceQrRef,
      productType: product.productType,
      title: product.title,
      prompt: product.prompt,
      model3dUrl: product.model3dUrl,
      estimatedWeightG: product.estimatedWeightG,
      verifiedWeightG: product.verifiedWeightG,
      visibility: product.visibility,
      catalogItemId: product.catalogItemId,
    });
    await this.passports.save(passport);
    product.passportId = passport.id;
    await this.products.save(product);
    return passport;
  }

  listProductTypes() {
    return CONFIGURATOR_PRODUCT_TYPES.map((p) => ({
      key: p.key,
      label: p.label,
      meshyStyle: p.meshyStyle,
      defaultWeightG: p.defaultWeightG,
    }));
  }

  async listPackageConfigs(activeOnly = false) {
    const rows = await this.packageConfigs.find({
      where: activeOnly ? { isActive: true } : {},
      order: { packageKg: 'ASC' },
    });
    return rows.map(coinPackageConfigView);
  }

  async resolvePackageConfig(packageKg?: number, packageConfigId?: string) {
    if (packageConfigId) {
      const row = await this.packageConfigs.findOne({ where: { id: packageConfigId } });
      if (!row || !row.isActive) throw new NotFoundException('Package config not found');
      return row;
    }
    const kg = packageKg ?? 1;
    const row = await this.packageConfigs.findOne({
      where: { packageKg: kg, isActive: true },
    });
    if (row) return row;
    const fallback = await this.packageConfigs.findOne({
      where: { isDefault: true, isActive: true },
    });
    if (!fallback) throw new BadRequestException('No coin package configuration found');
    return fallback;
  }

  private assertEditable(session: CoinConfiguratorSession) {
    if (session.status !== 'draft') {
      throw new BadRequestException('Configurator session is locked');
    }
  }

  private async loadSessionForUser(sessionId: string, userId: string) {
    const session = await this.sessions.findOne({ where: { id: sessionId, userId } });
    if (!session) throw new NotFoundException('Configurator session not found');
    return session;
  }

  private async loadProducts(sessionId: string) {
    return this.products.find({
      where: { sessionId },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  private productWeight(p: CoinConfiguratorProduct) {
    if (!['approved', 'cad_review', 'verified'].includes(p.status)) {
      return 0;
    }
    return p.verifiedWeightG ?? p.estimatedWeightG ?? 0;
  }

  private async recalcSession(session: CoinConfiguratorSession) {
    const items = await this.loadProducts(session.id);
    const used = items.reduce((sum, p) => sum + this.productWeight(p), 0);
    session.usedWeightG = used;
    session.remainingWeightG = Math.max(0, session.productCapacityG - used);
    await this.sessions.save(session);
    return items;
  }

  async createSession(userId: string, dto: CreateConfiguratorSessionDto) {
    const pkg = await this.resolvePackageConfig(dto.packageKg, dto.packageConfigId);
    const scale = Number(pkg.packageKg) > 0 ? Number(dto.packageKg ?? pkg.packageKg) / Number(pkg.packageKg) : 1;
    const totalG = Math.round(pkg.totalWeightG * scale);
    const caseG = Math.round(pkg.caseWeightG * scale);
    const capacityG = Math.round(pkg.productCapacityG * scale);

    const session = this.sessions.create({
      userId,
      packageConfigId: pkg.id,
      packageKg: dto.packageKg ?? pkg.packageKg,
      caseWeightG: caseG,
      productCapacityG: capacityG,
      sourceBrandHouseId: dto.sourceBrandHouseId?.trim() || null,
      sourceQrRef: dto.sourceQrRef?.trim() || null,
      status: 'draft',
      usedWeightG: 0,
      remainingWeightG: capacityG,
    });
    await this.sessions.save(session);
    return sessionView(session, []);
  }

  async getSession(userId: string, sessionId: string) {
    const session = await this.loadSessionForUser(sessionId, userId);
    const items = await this.loadProducts(sessionId);
    return sessionView(session, items);
  }

  async getActiveSession(userId: string) {
    const session = await this.sessions.findOne({
      where: { userId, status: 'draft' },
      order: { updatedAt: 'DESC' },
    });
    if (!session) return null;
    const items = await this.loadProducts(session.id);
    return sessionView(session, items);
  }

  async addProduct(userId: string, sessionId: string, dto: AddConfiguratorProductDto) {
    const session = await this.loadSessionForUser(sessionId, userId);
    this.assertEditable(session);
    this.assertCaseReady(session);
    const meta = productTypeMeta(dto.productType);
    const count = await this.products.count({ where: { sessionId } });
    const product = this.products.create({
      sessionId,
      productType: meta.key,
      title: meta.label,
      status: 'drafting',
      sortOrder: count,
    });
    await this.products.save(product);
    const items = await this.loadProducts(sessionId);
    return sessionView(session, items);
  }

  async updateProduct(
    userId: string,
    sessionId: string,
    productId: string,
    dto: UpdateConfiguratorProductDto,
  ) {
    const session = await this.loadSessionForUser(sessionId, userId);
    this.assertEditable(session);
    const product = await this.products.findOne({ where: { id: productId, sessionId } });
    if (!product) throw new NotFoundException('Product not found');
    if (product.status === 'cad_review' || product.status === 'verified') {
      throw new BadRequestException('Approved products cannot be edited — add a new product instead');
    }
    if (dto.prompt !== undefined) product.prompt = dto.prompt;
    if (dto.meshyJobId !== undefined) product.meshyJobId = dto.meshyJobId;
    if (dto.model3dUrl !== undefined) product.model3dUrl = dto.model3dUrl;
    if (dto.status !== undefined) product.status = dto.status as CoinConfiguratorProduct['status'];
    await this.products.save(product);
    const items = await this.loadProducts(sessionId);
    if (dto.model3dUrl || dto.status === 'generated') {
      this.mergeCaseLayout(session, items);
      await this.sessions.save(session);
    }
    return sessionView(session, items);
  }

  async approveProduct(
    userId: string,
    sessionId: string,
    productId: string,
    dto: ApproveConfiguratorProductDto,
  ) {
    const session = await this.loadSessionForUser(sessionId, userId);
    this.assertEditable(session);
    const product = await this.products.findOne({ where: { id: productId, sessionId } });
    if (!product) throw new NotFoundException('Product not found');
    if (!product.meshyJobId && !product.model3dUrl) {
      throw new BadRequestException('Generate a 3D model before approving');
    }

    const meta = productTypeMeta(product.productType);
    const weight = dto.estimatedWeightG ?? meta.defaultWeightG;
    const itemsBefore = await this.loadProducts(sessionId);
    const usedWithout = itemsBefore
      .filter((p) => p.id !== productId)
      .reduce((sum, p) => sum + this.productWeight(p), 0);
    if (usedWithout + weight > session.productCapacityG) {
      throw new BadRequestException(
        `Not enough capacity. Remaining: ${session.productCapacityG - usedWithout} g`,
      );
    }

    product.status = 'cad_review';
    product.estimatedWeightG = weight;
    product.visibility = dto.visibility ?? 'private';
    product.approvedAt = new Date();
    await this.products.save(product);

    await this.createPassport(userId, session, product);

    if (product.visibility === 'catalog') {
      await this.publishToCatalog(userId, product);
    }

    const items = await this.recalcSession(session);
    this.mergeCaseLayout(session, items);
    await this.sessions.save(session);
    return sessionView(session, items);
  }

  private async publishToCatalog(userId: string, product: CoinConfiguratorProduct) {
    let collection = await this.collections.findOne({
      where: { userId, visibility: 'PUBLIC', isMaster: false },
      order: { updatedAt: 'DESC' },
    });
    if (!collection) {
      collection = this.collections.create({
        userId,
        title: 'My Designs',
        description: 'AI-generated designs from MERGE Coin Configurator',
        slug: `designs-${userId.slice(0, 8)}-${Date.now()}`,
        visibility: 'PUBLIC',
        category: 'jewelry',
      });
      await this.collections.save(collection);
    }
    const item = this.catalogItems.create({
      collectionId: collection.id,
      title: product.title,
      description: product.prompt,
      model3dUrl: product.model3dUrl,
      model3dFormat: product.model3dUrl ? 'glb' : null,
      status: 'ACTIVE',
      ownership: 'PRIVATE',
      lifecycle: 'ACTIVE',
    });
    await this.catalogItems.save(item);
    product.catalogItemId = item.id;
    await this.products.save(product);
  }

  async finalizeSession(userId: string, sessionId: string) {
    const session = await this.loadSessionForUser(sessionId, userId);
    this.assertEditable(session);
    const items = await this.loadProducts(sessionId);
    const approved = items.filter((p) =>
      ['approved', 'cad_review', 'verified'].includes(p.status),
    );
    if (!approved.length) {
      throw new BadRequestException('Approve at least one product before finalizing');
    }

    this.mergeCaseLayout(session, items);
    const snapshot = sessionView(session, items);
    session.status = 'finalized';
    session.finalizedAt = new Date();
    session.snapshotJson = {
      ...snapshot,
      caseLayout: session.caseLayoutJson,
      lockedAt: null,
    } as unknown as Record<string, unknown>;
    await this.sessions.save(session);
    return sessionView(session, items);
  }

  async adminUpdatePackageConfig(id: string, dto: UpdatePackageConfigDto) {
    const row = await this.packageConfigs.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Package config not found');
    if (dto.label !== undefined) row.label = dto.label;
    if (dto.packageKg !== undefined) row.packageKg = dto.packageKg;
    if (dto.caseWeightG !== undefined) row.caseWeightG = dto.caseWeightG;
    if (dto.productCapacityG !== undefined) row.productCapacityG = dto.productCapacityG;
    if (dto.isActive !== undefined) row.isActive = dto.isActive;
    if (dto.packageKg !== undefined || dto.caseWeightG !== undefined || dto.productCapacityG !== undefined) {
      row.totalWeightG = Math.round(Number(row.packageKg) * 1000);
    }
    if (dto.isDefault) {
      await this.packageConfigs.update({ isDefault: true }, { isDefault: false });
      row.isDefault = true;
    } else if (dto.isDefault === false) {
      row.isDefault = false;
    }
    await this.packageConfigs.save(row);
    return coinPackageConfigView(row);
  }

  async adminVerifyProductWeight(productId: string, verifiedWeightG: number) {
    const product = await this.products.findOne({
      where: { id: productId },
      relations: { session: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    product.verifiedWeightG = verifiedWeightG;
    product.status = 'verified';
    await this.products.save(product);
    if (product.passportId) {
      await this.passports.update(product.passportId, { verifiedWeightG });
    }
    if (product.session) {
      const items = await this.recalcSession(product.session);
      return sessionView(product.session, items);
    }
    return configuratorProductView(product);
  }

  async getSessionForApplication(sessionId: string, userId: string) {
    const session = await this.sessions.findOne({ where: { id: sessionId, userId } });
    if (!session) throw new NotFoundException('Configurator session not found');
    if (session.status === 'draft') {
      throw new BadRequestException('Finalize your coin configuration first');
    }
    const items = await this.loadProducts(sessionId);
    return sessionView(session, items);
  }

  async getOrderSnapshot(sessionId: string, userId: string) {
    const session = await this.sessions.findOne({ where: { id: sessionId, userId } });
    if (!session) throw new NotFoundException('Configurator session not found');
    const items = await this.loadProducts(sessionId);
    return {
      session: sessionView(session, items),
      snapshot: session.snapshotJson,
      caseLayout: session.caseLayoutJson,
      sourceBrandHouseId: session.sourceBrandHouseId,
      sourceQrRef: session.sourceQrRef,
      lockedAt: session.status === 'locked' ? session.updatedAt.toISOString() : null,
    };
  }

  async adminListPendingProducts() {
    const rows = await this.products.find({
      where: [{ status: 'cad_review' }],
      order: { updatedAt: 'DESC' },
      take: 200,
    });
    return rows.map((p) => ({
      ...configuratorProductView(p),
      sessionId: p.sessionId,
    }));
  }

  async getPublicPassport(publicId: string) {
    const row = await this.passports.findOne({ where: { publicId } });
    if (!row) throw new NotFoundException('Product passport not found');
    return productPassportView(row);
  }

  async lockSession(sessionId: string, userId: string) {
    const session = await this.loadSessionForUser(sessionId, userId);
    if (session.status !== 'finalized') {
      throw new BadRequestException('Session must be finalized before lock');
    }
    session.status = 'locked';
    if (session.snapshotJson) {
      session.snapshotJson = {
        ...session.snapshotJson,
        lockedAt: new Date().toISOString(),
      };
    }
    await this.sessions.save(session);
    const items = await this.loadProducts(sessionId);
    return sessionView(session, items);
  }
}
