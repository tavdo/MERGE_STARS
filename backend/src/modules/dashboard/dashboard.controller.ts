import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { Order } from '../../database/entities/order.entity';
import { Notification } from '../../database/entities/notification.entity';
import { CoinApplication } from '../../database/entities/coin-application.entity';
import { CoinsService } from '../coins/coins.service';
import { InvestmentsService } from '../investments/investments.service';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly coins: CoinsService,
    private readonly investments: InvestmentsService,
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(Notification) private readonly notifications: Repository<Notification>,
    @InjectRepository(CoinApplication) private readonly apps: Repository<CoinApplication>,
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
        email: user.email,
        phone: user.phone,
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

  @Get('activity')
  @UseGuards(JwtAuthGuard)
  async activity(@CurrentUser() user: User) {
    const items: { text: string; time: string; type: string; at: Date }[] = [];

    const notes = await this.notifications.find({
      where: { userId: user.id },
      order: { createdAt: 'DESC' },
      take: 8,
    });
    for (const n of notes) {
      items.push({
        text: n.title,
        time: n.createdAt.toISOString(),
        type: 'notification',
        at: n.createdAt,
      });
    }

    const recentOrders = await this.orders.find({
      where: { userId: user.id },
      order: { createdAt: 'DESC' },
      take: 5,
    });
    for (const o of recentOrders) {
      items.push({
        text: `Order ${o.publicId} — ${o.status}`,
        time: o.createdAt.toISOString(),
        type: 'order',
        at: o.createdAt,
      });
    }

    const apps = await this.apps.find({
      where: { userId: user.id },
      order: { updatedAt: 'DESC' },
      take: 3,
    });
    for (const a of apps) {
      items.push({
        text: `Application ${a.publicId} — ${a.status.replace(/_/g, ' ')}`,
        time: a.updatedAt.toISOString(),
        type: 'application',
        at: a.updatedAt,
      });
    }

    items.sort((a, b) => b.at.getTime() - a.at.getTime());

    return items.slice(0, 10).map(({ text, time, type }) => ({ text, time, type }));
  }
}
