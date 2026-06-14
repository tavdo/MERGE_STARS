import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../database/entities/order.entity';
import { Notification } from '../../database/entities/notification.entity';
import { CoinApplication } from '../../database/entities/coin-application.entity';
import { CoinsModule } from '../coins/coins.module';
import { InvestmentsModule } from '../investments/investments.module';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [
    CoinsModule,
    InvestmentsModule,
    TypeOrmModule.forFeature([Order, Notification, CoinApplication]),
  ],
  controllers: [DashboardController],
})
export class DashboardModule {}
