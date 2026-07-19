import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogCollection } from '../../database/entities/catalog-collection.entity';
import { CatalogItem } from '../../database/entities/catalog-item.entity';
import { CatalogOrder } from '../../database/entities/catalog-order.entity';
import { WalletModule } from '../wallet/wallet.module';
import { OrdersModule } from '../orders/orders.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CatalogCollection, CatalogItem, CatalogOrder]),
    WalletModule,
    forwardRef(() => OrdersModule),
    NotificationsModule,
  ],
  controllers: [CatalogController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
