import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { createReadStream } from 'fs';
import { CatalogService } from '../catalog/catalog.service';
import { MuseumCoreService } from './museum-core.service';

/** Living Museum atelier contract — flat JSON (no global { data } wrapper). */
@Controller('core')
export class MuseumCoreController {
  constructor(
    private readonly core: MuseumCoreService,
    private readonly catalogService: CatalogService,
  ) {}

  @Get('catalog')
  async catalog(@Req() req: Request, @Res() res: Response) {
    res.json(await this.core.getCatalog(req));
  }

  @Get('collection')
  async collection(
    @Req() req: Request,
    @Res() res: Response,
    @Query('slug') slug?: string,
  ) {
    if (!slug?.trim()) {
      return res.status(400).json({ error: 'INVALID_CORE_SLUG' });
    }
    const body = await this.core.collectionBySlug(req, slug.trim());
    if ('error' in body) {
      const status = body.error === 'INVALID_CORE_SLUG' ? 400 : 404;
      return res.status(status).json({ error: body.error });
    }
    res.json(body);
  }

  @Get('prices')
  prices(@Req() req: Request, @Res() res: Response) {
    res.json(this.core.prices(req));
  }

  @Get('model')
  async model(@Query('id') id: string, @Res() res: Response) {
    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
      return res.status(404).json({ error: 'CORE_ENTITY_NOT_FOUND' });
    }
    try {
      const file = await this.catalogService.getPublicModelFile(id);
      res.setHeader('Content-Type', file.mimeType || 'model/gltf-binary');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      createReadStream(file.filePath).pipe(res);
    } catch {
      return res.status(404).json({ error: 'CORE_ENTITY_NOT_FOUND' });
    }
  }

  @Get(':capability')
  capability(@Param('capability') capability: string, @Res() res: Response) {
    if (['catalog', 'collection', 'prices', 'model'].includes(capability)) {
      throw new NotFoundException();
    }
    res.status(503).json(this.core.capabilityUnavailable(capability));
  }
}
