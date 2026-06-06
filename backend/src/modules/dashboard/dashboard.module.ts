import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../database/entities/order.entity';
import { CoinsModule } from '../coins/coins.module';
import { InvestmentsModule } from '../investments/investments.module';
import { DashboardController } from './dashboard.controller';
import { InvestmentsService } from '../investments/investments.service';

@Module({
  imports: [CoinsModule, InvestmentsModule, TypeOrmModule.forFeature([Order])],
  controllers: [DashboardController],
})
export class DashboardModule {}
