import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, orderView } from '../../database/entities/order.entity';
import { User } from '../../database/entities/user.entity';
import { CoinApplication } from '../../database/entities/coin-application.entity';
import { WalletService } from '../wallet/wallet.service';

/** Design author share of the buyer's paid coin order */
const DESIGN_ROYALTY_FRACTION = 0.5;

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
      awaitingEarnings: o.paymentMethod === 'earnings' && o.status === 'pending',
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

  /**
   * When a buyer pays for a coin that uses another member's catalog design,
   * credit the design author 50% of the paid amount.
   */
  async creditDesignRoyalty(order: Order, app?: CoinApplication | null) {
    const application =
      app ??
      (order.applicationId
        ? await this.apps.findOne({ where: { id: order.applicationId } })
        : null);
    if (!application?.designAuthorId) return null;
    if (application.designAuthorId === order.userId) return null;

    const already = await this.wallet.hasDesignRoyaltyForOrder(order.id);
    if (already) return null;

    const paid = Number(order.amount);
    const royalty = Math.round(paid * DESIGN_ROYALTY_FRACTION * 100) / 100;
    if (royalty <= 0) return null;

    return this.wallet.credit({
      userId: application.designAuthorId,
      amount: royalty,
      reason: 'design_royalty',
      note: `Design royalty (50%) from coin order ${order.publicId}`,
      meta: {
        coinOrderId: order.id,
        coinOrderPublicId: order.publicId,
        catalogItemId: application.catalogItemId,
        saleAmount: paid,
        fraction: DESIGN_ROYALTY_FRACTION,
      },
    });
  }

  async markOrderPaid(orderIdOrPublicId: string) {
    const order = await this.orders.findOne({
      where: [{ id: orderIdOrPublicId }, { publicId: orderIdOrPublicId }],
      relations: { application: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'paid') {
      order.status = 'paid';
      order.deliveryStatus =
        order.deliveryStatus === 'pending' ? 'processing' : order.deliveryStatus;
      await this.orders.save(order);
    }
    await this.creditDesignRoyalty(order, order.application);
    return this.mapOrder(order);
  }

  /** Mark pending orders for an application as paid (e.g. admin funds_received). */
  async markPaidForApplication(applicationInternalId: string) {
    const pending = await this.orders.find({
      where: { applicationId: applicationInternalId, status: 'pending' },
      relations: { application: true },
    });
    const results = [];
    for (const order of pending) {
      results.push(await this.markOrderPaid(order.id));
    }
    return results;
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

    // Anyone may choose earnings: picking it opens the wallet. When the balance
    // does not cover the order yet, the order waits until earnings accumulate.
    let settleNow = false;
    if (method === 'earnings') {
      await this.wallet.activate(user.id, 'coin_order');
      const balance = await this.wallet.getBalance(user.id);
      settleNow = balance >= amount && amount > 0;
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
      status: settleNow ? 'paid' : 'pending',
      trackingCode: `MS-TRK-${publicId.replace(/^ORD-/, '')}`,
      courier: null,
      estDeliveryAt,
      deliveryStatus: settleNow ? 'processing' : 'pending',
    });
    await this.orders.save(order);

    if (settleNow) {
      try {
        await this.wallet.debitForOrder({
          userId: user.id,
          amount,
          orderId: order.id,
          note: `Paid coin order ${publicId} with earnings`,
        });
        await this.creditDesignRoyalty(order, app);
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

  /** Settle an order that was reserved for earnings once the balance covers it. */
  async payWithEarnings(user: User, orderIdOrPublicId: string) {
    const order = await this.orders.findOne({
      where: [
        { id: orderIdOrPublicId, userId: user.id },
        { publicId: orderIdOrPublicId, userId: user.id },
      ],
      relations: { application: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'pending') {
      throw new BadRequestException('Order is not awaiting payment');
    }

    const amount = Number(order.amount);
    await this.wallet.activate(user.id, 'coin_order');
    await this.wallet.debitForOrder({
      userId: user.id,
      amount,
      orderId: order.id,
      note: `Paid coin order ${order.publicId} with earnings`,
    });

    order.paymentMethod = 'earnings';
    order.status = 'paid';
    order.deliveryStatus =
      order.deliveryStatus === 'pending' ? 'processing' : order.deliveryStatus;
    await this.orders.save(order);
    await this.creditDesignRoyalty(order, order.application);

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
