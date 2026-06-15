import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoinApplication } from '../../database/entities/coin-application.entity';
import { BrandLineProfile } from '../../database/entities/brand-line-profile.entity';
import { User } from '../../database/entities/user.entity';
import { Order } from '../../database/entities/order.entity';
import { CoinsModule } from '../coins/coins.module';
import { UsersModule } from '../users/users.module';
import { AdminController } from './admin.controller';
import { AdminAnalyticsService } from './admin-analytics.service';

@Module({
  imports: [CoinsModule, UsersModule, TypeOrmModule.forFeature([User, Order, CoinApplication, BrandLineProfile])],
  controllers: [AdminController],
  providers: [AdminAnalyticsService],
})
export class AdminModule {}
