import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, orderView } from '../../database/entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
  ) {}

  private enrichDelivery(order: Order) {
    const trackingCode = order.trackingCode ?? null;
    const estDeliveryAt = order.estDeliveryAt ?? null;
    let deliveryStatus = order.deliveryStatus || 'pending';
    if (order.status === 'paid' || order.status === 'confirmed') {
      deliveryStatus = deliveryStatus === 'pending' ? 'processing' : deliveryStatus;
    }
    if (order.status === 'shipped') deliveryStatus = 'in_transit';
    if (order.status === 'delivered') deliveryStatus = 'delivered';
    return {
      trackingCode,
      courier: order.courier ?? null,
      estDeliveryAt,
      deliveryStatus,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
    };
  }

  private mapOrder(o: Order) {
    const delivery = this.enrichDelivery(o);
    return {
      ...orderView(o),
      ...delivery,
      awaitingEarnings: o.paymentMethod === 'earnings' && o.status === 'pending',
      estDeliveryAt: delivery.estDeliveryAt?.toISOString() ?? null,
      shippedAt: delivery.shippedAt?.toISOString() ?? null,
      deliveredAt: delivery.deliveredAt?.toISOString() ?? null,
      coinType: o.application?.coinType ?? null,
      quantity: o.application?.quantity ?? null,
    };
  }

  async listForUser(userId: string) {
    const rows = await this.orders.find({
      where: { userId },
      relations: { application: true },
      order: { createdAt: 'DESC' },
    });
    return rows.map((o) => this.mapOrder(o));
  }

  async getLatestDelivery(userId: string) {
    const order = await this.orders.findOne({
      where: { userId },
      relations: { application: true },
      order: { createdAt: 'DESC' },
    });
    if (!order) throw new NotFoundException('No orders yet');
    return this.mapOrder(order);
  }

  /** Pending earnings orders for the wallet page. */
  async listAwaitingEarnings(userId: string) {
    const rows = await this.orders.find({
      where: { userId, paymentMethod: 'earnings', status: 'pending' },
      relations: { application: true },
      order: { createdAt: 'DESC' },
    });
    return rows.map((o) => this.mapOrder(o));
  }
}
