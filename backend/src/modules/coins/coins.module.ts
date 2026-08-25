import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoinApplication } from '../../database/entities/coin-application.entity';
import { CatalogItem } from '../../database/entities/catalog-item.entity';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrdersModule } from '../orders/orders.module';
import { CoinConfiguratorModule } from '../coin-configurator/coin-configurator.module';
import { CoinsController } from './coins.controller';
import { CoinsService } from './coins.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CoinApplication, CatalogItem]),
    UsersModule,
    NotificationsModule,
    OrdersModule,
    CoinConfiguratorModule,
  ],
  controllers: [CoinsController],
  providers: [CoinsService],
  exports: [CoinsService],
})
export class CoinsModule {}
