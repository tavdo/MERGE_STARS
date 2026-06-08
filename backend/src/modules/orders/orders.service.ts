import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, orderView } from '../../database/entities/order.entity';
import { User } from '../../database/entities/user.entity';
import { CoinApplication } from '../../database/entities/coin-application.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(CoinApplication)
    private readonly apps: Repository<CoinApplication>,
  ) {}

  private nextPublicId() {
    const year = new Date().getFullYear();
    const n = Math.floor(100000 + Math.random() * 899999);
    return `ORD-${year}-${String(n).padStart(6, '0')}`;
  }

  async listForUser(userId: string) {
    const rows = await this.orders.find({
      where: { userId },
      relations: { application: true },
      order: { createdAt: 'DESC' },
    });
    return rows.map((o) => ({
      ...orderView(o),
      coinType: o.application?.coinType ?? null,
      quantity: o.application?.quantity ?? null,
    }));
  }

  async createForApplication(user: User, applicationPublicId: string, paymentMethod: string) {
    const app = await this.apps.findOne({
      where: { publicId: applicationPublicId, userId: user.id },
    });
    if (!app) throw new NotFoundException('Application not found');

    let publicId = this.nextPublicId();
    while (await this.orders.findOne({ where: { publicId } })) {
      publicId = this.nextPublicId();
    }

    const order = this.orders.create({
      publicId,
      userId: user.id,
      applicationId: app.id,
      amount: app.coinValue,
      paymentMethod,
      status: 'pending',
    });
    await this.orders.save(order);
    return orderView(order);
  }
}
