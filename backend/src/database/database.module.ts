import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CoinApplication } from './entities/coin-application.entity';
import { Order } from './entities/order.entity';
import { MetalPrice } from './entities/metal-price.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { ContactMessage } from './entities/contact-message.entity';
import { Referral } from './entities/referral.entity';
import { DatabaseSeedService } from './database-seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      CoinApplication,
      Order,
      MetalPrice,
      RefreshToken,
      ContactMessage,
      Referral,
    ]),
  ],
  providers: [DatabaseSeedService],
})
export class DatabaseModule {}
