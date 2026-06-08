import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { CoinsService } from '../coins/coins.service';
import { InvestmentsService } from '../investments/investments.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../database/entities/order.entity';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly coins: CoinsService,
    private readonly investments: InvestmentsService,
    @InjectRepository(Order) private readonly orders: Repository<Order>,
  ) {}

  @Get('summary')
  @UseGuards(JwtAuthGuard)
  async summary(@CurrentUser() user: User) {
    const latestApp = await this.coins.getLatestForUser(user.id);
    const inv = await this.investments.summary(user.id);
    const orderCount = await this.orders.count({ where: { userId: user.id } });

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        mergeId: user.mergeId,
        founderId: user.founderId,
        brandLineId: user.brandLineId,
        kycStatus: user.kycStatus,
      },
      coinBalance: inv.totalUsd > 0 ? Math.round(inv.totalUsd / 2) : 0,
      registeredValue: inv.totalUsd,
      application: latestApp,
      orderCount,
    };
  }
}
