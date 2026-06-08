import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoinApplication } from '../../database/entities/coin-application.entity';
import { UsersModule } from '../users/users.module';
import { CoinsController } from './coins.controller';
import { CoinsService } from './coins.service';

@Module({
  imports: [TypeOrmModule.forFeature([CoinApplication]), UsersModule],
  controllers: [CoinsController],
  providers: [CoinsService],
  exports: [CoinsService],
})
export class CoinsModule {}
