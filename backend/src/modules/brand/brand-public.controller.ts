import { Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { createReadStream } from 'fs';
import { BrandService } from './brand.service';

@Controller('brand/public')
export class BrandPublicController {
  constructor(private readonly brand: BrandService) {}

  /** Brand Room — list public brands (must be before :id) */
  @Get()
  listPublic(@Query('limit') limit?: string) {
    const n = limit ? Number(limit) : 60;
    return this.brand.listPublicBrands(Number.isFinite(n) ? n : 60);
  }

  @Get(':id')
  getPublic(@Param('id') id: string) {
    return this.brand.getPublicProfile(id);
  }

  @Get(':id/logo')
  async logo(@Param('id') id: string, @Res() res: Response) {
    const file = await this.brand.getPublicLogoFile(id);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    createReadStream(file.filePath).pipe(res);
  }

  @Post(':id/view')
  trackView(@Param('id') id: string) {
    return this.brand.trackPublicView(id);
  }

  @Post(':id/scan')
  trackScan(@Param('id') id: string) {
    return this.brand.trackPublicScan(id);
  }
}
