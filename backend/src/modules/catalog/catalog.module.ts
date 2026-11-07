import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandLineProfile } from '../../database/entities/brand-line-profile.entity';
import { CatalogCollection } from '../../database/entities/catalog-collection.entity';
import { CatalogItem } from '../../database/entities/catalog-item.entity';
import { BrandRoomPick } from '../../database/entities/brand-room-pick.entity';
import { User } from '../../database/entities/user.entity';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { MeshyService } from './meshy.service';
import { MetalsModule } from '../metals/metals.module';
import { MuseumCoreController } from './museum-core.controller';

@Module({
  imports: [
    MetalsModule,
    TypeOrmModule.forFeature([
      CatalogCollection,
      CatalogItem,
      BrandLineProfile,
      BrandRoomPick,
      User,
    ]),
  ],
  controllers: [CatalogController, MuseumCoreController],
  providers: [CatalogService, MeshyService],
  exports: [CatalogService],
})
export class CatalogModule {}
