import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { MetalsModule } from '../metals/metals.module';
import { MuseumCoreController } from './museum-core.controller';
import { MuseumCoreService } from './museum-core.service';

@Module({
  imports: [CatalogModule, MetalsModule],
  controllers: [MuseumCoreController],
  providers: [MuseumCoreService],
})
export class MuseumCoreModule {}
