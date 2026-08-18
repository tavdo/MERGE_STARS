import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandLineProfile } from '../../database/entities/brand-line-profile.entity';
import { CatalogCollection } from '../../database/entities/catalog-collection.entity';
import { CatalogItem } from '../../database/entities/catalog-item.entity';
import { CatalogModule } from '../catalog/catalog.module';
import { User } from '../../database/entities/user.entity';
import { BrandController } from './brand.controller';
import { BrandPublicController } from './brand-public.controller';
import { BrandService } from './brand.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BrandLineProfile, CatalogCollection, CatalogItem, User]),
    CatalogModule,
  ],
  controllers: [BrandController, BrandPublicController],
  providers: [BrandService],
  exports: [BrandService],
})
export class BrandModule {}
