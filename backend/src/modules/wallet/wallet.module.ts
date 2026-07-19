import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletTransaction } from '../../database/entities/wallet-transaction.entity';
import { User } from '../../database/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WalletTransaction, User]),
    NotificationsModule,
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
