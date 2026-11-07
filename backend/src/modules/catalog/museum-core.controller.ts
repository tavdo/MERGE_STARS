import { Controller, Get, NotFoundException, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { CatalogService } from './catalog.service';
import { MetalsService } from '../metals/metals.service';

function publicCollection(
  collection: Awaited<ReturnType<CatalogService['listPublic']>>[number],
) {
  const { id, title, slug, visibility, category, brandLineId, brandName, mergeId, updatedAt } = collection;
  return { id, title, slug, visibility, category, brandLineId, brandName, mergeId, updatedAt };
}

/** Read-only adapter for the original, mirrored Living Museum. */
@Controller('core')
export class MuseumCoreController {
  constructor(
    private readonly catalog: CatalogService,
    private readonly metals: MetalsService,
  ) {}

  private metadata(req: Request) {
    const allowed = (process.env.FRONTEND_URL || '').split(',')
      .map((value) => URL.canParse(value.trim()) ? new URL(value.trim()) : null)
      .filter((value) => value !== null);
    const origin = allowed.find((url) => url.host === req.get('host'))?.origin ??
      allowed[0]?.origin ?? `${req.protocol}://${req.get('host')}`;
    const now = new Date().toISOString();
    return { source_origin: origin, response_at: now, retrieved_at: now };
  }

  @Get('catalog')
  async list(@Req() req: Request, @Res() res: Response) {
    const collections = await this.catalog.listPublic();
    res.setHeader('Cache-Control', 'no-store');
    res.json({ ...this.metadata(req), collections: collections.map(publicCollection) });
  }

  @Get('collection')
  async collection(@Query('slug') slug: unknown, @Req() req: Request, @Res() res: Response) {
    res.setHeader('Cache-Control', 'no-store');
    if (typeof slug !== 'string' || !/^[a-zA-Z0-9_-]{1,120}$/.test(slug)) {
      res.status(400).json({ error: 'INVALID_CORE_SLUG' });
      return;
    }
    try {
      const { items, ...collection } = await this.catalog.getPublicBySlug(slug);
      const metadata = this.metadata(req);
      res.json({
        ...metadata,
        collection: publicCollection(collection),
        items: items.slice(0, 500).map((item) => ({
          id: item.id,
          collectionId: item.collectionId,
          title: item.title,
          description: item.description,
          metalType: item.metalType,
          hasImage: item.hasImage,
          hasModel3d: item.hasModel3d,
          status: item.status,
          lifecycle: item.lifecycle,
          ownership: item.ownership,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          source: {
            system: 'MERGE_CORE',
            entity_type: 'catalog_item',
            entity_id: item.id,
            collection_id: item.collectionId,
            source_revision: null,
            source_updated_at: item.updatedAt,
          },
          rights_state: 'UNAVAILABLE',
          verification_state: 'UNAVAILABLE',
          image_url: item.hasImage ? `/api/catalog/public/items/${item.id}/image` : null,
          model_url: item.hasModel3d ? `${metadata.source_origin}/api/catalog/public/items/${item.id}/model3d` : null,
        })),
      });
    } catch (error) {
      if (!(error instanceof NotFoundException)) throw error;
      res.status(404).json({ error: 'CORE_ENTITY_NOT_FOUND' });
    }
  }

  @Get('prices')
  prices(@Req() req: Request, @Res() res: Response) {
    res.setHeader('Cache-Control', 'no-store');
    const prices = this.metals.getLive();
    if (!prices.length) {
      res.status(503).json({ error: 'CORE_UNAVAILABLE' });
      return;
    }
    res.json({
      ...this.metadata(req),
      prices,
      quote_at: null,
      quote_freshness: 'UNVERIFIED',
      verified_offer: false,
    });
  }
}
