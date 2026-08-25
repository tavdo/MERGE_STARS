import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoinConfiguratorSession } from '../../database/entities/coin-configurator-session.entity';
import { CoinConfiguratorProduct } from '../../database/entities/coin-configurator-product.entity';
import { CoinPackageConfig } from '../../database/entities/coin-package-config.entity';
import { CatalogCollection } from '../../database/entities/catalog-collection.entity';
import { CatalogItem } from '../../database/entities/catalog-item.entity';
import { ProductPassport } from '../../database/entities/product-passport.entity';
import { CoinConfiguratorService } from './coin-configurator.service';
import {
  CoinConfiguratorAdminController,
  CoinConfiguratorController,
} from './coin-configurator.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CoinConfiguratorSession,
      CoinConfiguratorProduct,
      CoinPackageConfig,
      CatalogCollection,
      CatalogItem,
      ProductPassport,
    ]),
  ],
  controllers: [CoinConfiguratorController, CoinConfiguratorAdminController],
  providers: [CoinConfiguratorService],
  exports: [CoinConfiguratorService],
})
export class CoinConfiguratorModule {}
