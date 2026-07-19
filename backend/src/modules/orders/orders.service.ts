import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, orderView } from '../../database/entities/order.entity';
import { User } from '../../database/entities/user.entity';
import { CoinApplication } from '../../database/entities/coin-application.entity';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(CoinApplication)
    private readonly apps: Repository<CoinApplication>,
    private readonly wallet: WalletService,
  ) {}

  private nextPublicId() {
    const year = new Date().getFullYear();
    const n = Math.floor(100000 + Math.random() * 899999);
    return `ORD-${year}-${String(n).padStart(6, '0')}`;
  }

  private enrichDelivery(order: Order) {
    const trackingCode =
      order.trackingCode ?? `MS-TRK-${order.publicId.replace(/^ORD-/, '')}`;
    const estDeliveryAt =
      order.estDeliveryAt ?? new Date(order.createdAt.getTime() + 14 * 86400000);
    let deliveryStatus = order.deliveryStatus || 'pending';
    if (order.status === 'paid' || order.status === 'confirmed') {
      deliveryStatus = deliveryStatus === 'pending' ? 'processing' : deliveryStatus;
    }
    if (order.status === 'shipped') deliveryStatus = 'in_transit';
    if (order.status === 'delivered') deliveryStatus = 'delivered';
    return {
      trackingCode,
      courier: order.courier ?? (deliveryStatus === 'in_transit' || deliveryStatus === 'delivered' ? 'DHL Express' : null),
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
      estDeliveryAt: delivery.estDeliveryAt.toISOString(),
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

  async createForApplication(user: User, applicationPublicId: string, paymentMethod: string) {
    const method = paymentMethod || 'bank';
    if (!['full', 'bank', 'earnings'].includes(method)) {
      throw new BadRequestException('Invalid payment method');
    }

    const app = await this.apps.findOne({
      where: { publicId: applicationPublicId, userId: user.id },
    });
    if (!app) throw new NotFoundException('Application not found');

    const amount = Number(app.coinValue);
    if (method === 'earnings') {
      const balance = await this.wallet.getBalance(user.id);
      if (balance < amount) {
        throw new BadRequestException(
          `Insufficient earnings balance. Available: $${balance.toFixed(2)}, required: $${amount.toFixed(2)}`,
        );
      }
    }

    let publicId = this.nextPublicId();
    while (await this.orders.findOne({ where: { publicId } })) {
      publicId = this.nextPublicId();
    }

    const estDeliveryAt = new Date(Date.now() + 14 * 86400000);
    const order = this.orders.create({
      publicId,
      userId: user.id,
      applicationId: app.id,
      amount: app.coinValue,
      paymentMethod: method,
      status: method === 'earnings' ? 'paid' : 'pending',
      trackingCode: `MS-TRK-${publicId.replace(/^ORD-/, '')}`,
      courier: null,
      estDeliveryAt,
      deliveryStatus: method === 'earnings' ? 'processing' : 'pending',
    });
    await this.orders.save(order);

    if (method === 'earnings') {
      try {
        await this.wallet.debitForOrder({
          userId: user.id,
          amount,
          orderId: order.id,
          note: `Paid coin order ${publicId} with earnings`,
        });
      } catch (err) {
        await this.orders.delete({ id: order.id });
        throw err;
      }
    }

    const saved = await this.orders.findOne({
      where: { id: order.id },
      relations: { application: true },
    });
    return this.mapOrder(saved!);
  }

  /**
   * If the user has a pending coin order and enough earnings balance,
   * debit wallet and mark the oldest pending order as paid.
   */
  async tryPayPendingWithEarnings(userId: string) {
    const pending = await this.orders.findOne({
      where: { userId, status: 'pending' },
      relations: { application: true },
      order: { createdAt: 'ASC' },
    });
    if (!pending) {
      return { paid: false as const, reason: 'no_pending_order' as const };
    }

    const amount = Number(pending.amount);
    const balance = await this.wallet.getBalance(userId);
    if (balance < amount) {
      return {
        paid: false as const,
        reason: 'insufficient_balance' as const,
        balance,
        required: amount,
        orderId: pending.publicId,
      };
    }

    await this.wallet.debitForOrder({
      userId,
      amount,
      orderId: pending.id,
      note: `Auto-paid coin order ${pending.publicId} from catalog earnings`,
    });

    pending.status = 'paid';
    pending.paymentMethod = 'earnings';
    pending.deliveryStatus =
      pending.deliveryStatus === 'pending' ? 'processing' : pending.deliveryStatus;
    await this.orders.save(pending);

    return {
      paid: true as const,
      orderId: pending.publicId,
      amount,
      balanceAfter: await this.wallet.getBalance(userId),
    };
  }
}
