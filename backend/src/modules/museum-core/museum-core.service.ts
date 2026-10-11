import { Injectable, NotFoundException } from '@nestjs/common';
import type { Request } from 'express';
import { CatalogItem } from '../../database/entities/catalog-item.entity';
import { catalogItemView } from '../../database/entities/catalog-item.entity';
import { CatalogService } from '../catalog/catalog.service';
import { MetalsService } from '../metals/metals.service';

const SLUG_RE = /^[a-zA-Z0-9_-]{1,120}$/;

@Injectable()
export class MuseumCoreService {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly metals: MetalsService,
  ) {}

  siteOrigin(req: Request): string {
    const configured = process.env.PUBLIC_SITE_URL?.trim().replace(/\/$/, '');
    if (configured) return configured;
    const host = req.get('x-forwarded-host') ?? req.get('host');
    const proto = (req.get('x-forwarded-proto') ?? req.protocol ?? 'http').split(',')[0].trim();
    return `${proto}://${host}`;
  }

  private timestamps(origin: string) {
    const now = new Date().toISOString();
    return {
      source_origin: origin,
      response_at: now,
      retrieved_at: now,
    };
  }

  async getCatalog(req: Request) {
    const origin = this.siteOrigin(req);
    const rows = await this.catalogService.listPublic(100);
    const collections = rows.map((c) => this.collectionSummary(c));
    return {
      collections,
      ...this.timestamps(origin),
    };
  }

  async collectionBySlug(req: Request, slug: string) {
    if (!SLUG_RE.test(slug)) {
      return { error: 'INVALID_CORE_SLUG' as const };
    }
    const origin = this.siteOrigin(req);
    try {
      const data = await this.catalogService.getPublicBySlug(slug);
      const collection = this.collectionSummary(data);
      const items = (data.items as ReturnType<typeof catalogItemView>[]).map((item) =>
        this.coreItemView(item as CatalogItem & ReturnType<typeof catalogItemView>, collection.id, origin),
      );
      return {
        collection,
        items,
        ...this.timestamps(origin),
      };
    } catch (e) {
      if (e instanceof NotFoundException) {
        return { error: 'CORE_ENTITY_NOT_FOUND' as const };
      }
      throw e;
    }
  }

  prices(req: Request) {
    const origin = this.siteOrigin(req);
    const now = new Date().toISOString();
    const live = this.metals.getLive();
    return {
      prices: live.map((p) => ({
        metal: p.metal,
        priceUsd: p.priceUsd,
        pricePerKgUsd: p.pricePerKgUsd,
        changePct: p.changePct,
      })),
      response_at: now,
      source_origin: origin,
      quote_at: null,
      quote_freshness: 'UNVERIFIED',
      verified_offer: false,
      retrieved_at: now,
    };
  }

  capabilityUnavailable(capability: string) {
    return {
      capability,
      available: false,
      source_of_truth: 'MERGE_CORE',
      status: 'DEPENDENCY_REQUIRED',
      error: 'CORE_DEPENDENCY_REQUIRED',
    };
  }

  private collectionSummary(c: {
    id: string;
    title: string;
    slug: string;
    visibility: string;
    category: string;
    brandLineId?: string | null;
    brandName?: string | null;
    mergeId?: string | null;
    updatedAt: string;
  }) {
    return {
      id: c.id,
      title: c.title,
      slug: c.slug,
      visibility: c.visibility,
      category: c.category,
      brandLineId: c.brandLineId ?? null,
      brandName: c.brandName ?? null,
      mergeId: c.mergeId ?? null,
      updatedAt: c.updatedAt,
    };
  }

  private coreItemView(
    item: CatalogItem | ReturnType<typeof catalogItemView>,
    collectionId: string,
    origin: string,
  ) {
    const view = 'hasModel3d' in item && typeof item.hasModel3d === 'boolean'
      ? item
      : catalogItemView(item as CatalogItem);
    const updatedAt = view.updatedAt;
    return {
      id: view.id,
      collectionId: view.collectionId ?? collectionId,
      title: view.title,
      description: view.description ?? null,
      metalType: view.metalType ?? null,
      hasImage: view.hasImage,
      hasModel3d: view.hasModel3d,
      status: view.status,
      lifecycle: view.lifecycle ?? 'ACTIVE',
      ownership: view.ownership ?? 'PRIVATE',
      createdAt: view.createdAt,
      updatedAt,
      source: {
        system: 'MERGE_CORE',
        entity_type: 'catalog_item',
        entity_id: view.id,
        collection_id: collectionId,
        source_revision: null,
        source_updated_at: updatedAt,
      },
      rights_state: 'UNAVAILABLE',
      verification_state: 'UNAVAILABLE',
      image_url: view.hasImage
        ? `${origin}/api/catalog/public/items/${view.id}/image`
        : null,
      model_url: view.hasModel3d
        ? `${origin}/api/catalog/public/items/${view.id}/model3d`
        : null,
    };
  }
}
