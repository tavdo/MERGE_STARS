import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoinApplication } from '../../database/entities/coin-application.entity';
import { User } from '../../database/entities/user.entity';
import { Order } from '../../database/entities/order.entity';
import { CoinsModule } from '../coins/coins.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [CoinsModule, TypeOrmModule.forFeature([User, Order, CoinApplication])],
  controllers: [AdminController],
})
export class AdminModule {}
