
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
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
    private readonly dataSource: DataSource,
  ) {}

  private requireVerifiedFulfillmentOffer(): void {
    // Legacy orders have no verified pricing-weight/Brand House fulfillment snapshot.
    // They must not be treated as newly approved payable offers.
    throw new BadRequestException(
      'Verified Brand House offer and locked CORE pricing snapshot required before payment.',
    );
  }

  private nextPublicId() {
    const year = new Date().getFullYear();
    const n = Math.floor(100000 + Math.random() * 899999);
    return `ORD-${year}-${String(n).padStart(6, '0')}`;
  }

  private enrichDelivery(order: Order) {
    const trackingCode = order.trackingCode ?? null;
    const estDeliveryAt = order.estDeliveryAt ?? null;
    let deliveryStatus = order.deliveryStatus || 'pending';
    if (order.status === 'paid' || order.status === 'confirmed') {
      deliveryStatus =
        deliveryStatus === 'pending' ? 'processing' : deliveryStatus;
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
      awaitingEarnings: o.paymentMethod === 'earnings' && o.status === 'pending',
      ...delivery,
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

  /**
   * When a buyer pays for a coin that uses another member's catalog design,
   * credit the design author 50% of the paid amount.
   */
  async creditDesignRoyalty(
    order: Order,
    app: CoinApplication | null | undefined,
    manager: EntityManager,
  ) {
    const application =
      app ??
      (order.applicationId
        ? await manager
            .getRepository(CoinApplication)
            .findOne({ where: { id: order.applicationId } })
        : null);
    if (!application?.designAuthorId) return null;
    if (application.designAuthorId === order.userId) return null;

    const already = await this.wallet.hasDesignRoyaltyForOrder(
      order.id,
      manager,
    );
    if (already) return null;

    const paid = Number(order.amount);
    const royalty = Math.round(paid * DESIGN_ROYALTY_FRACTION * 100) / 100;
    if (royalty <= 0) return null;

    return this.wallet.credit(
      {
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
      },
      manager,
    );
  }

  async markOrderPaid(orderIdOrPublicId: string) {
    this.requireVerifiedFulfillmentOffer();
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Order);
      const order = await repo.findOne({
        where: [{ id: orderIdOrPublicId }, { publicId: orderIdOrPublicId }],
        lock: { mode: 'pessimistic_write' },
      });
      if (!order) throw new NotFoundException('Order not found');
      const app = order.applicationId
        ? await manager
            .getRepository(CoinApplication)
            .findOne({ where: { id: order.applicationId } })
        : null;
      if (
        !app?.priceQuotedAt ||
        !Number.isFinite(Number(order.amount)) ||
        Number(order.amount) <= 0 ||
        Number(order.amount) !== Number(app.coinValue)
      ) {
        throw new BadRequestException(
          'Order requires a trusted quote matching the payable amount',
        );
      }
      await this.wallet.lockUsers(manager, [
        order.userId,
        ...(app?.designAuthorId ? [app.designAuthorId] : []),
      ]);
      if (order.status !== 'paid') {
        order.status = 'paid';
        order.deliveryStatus =
          order.deliveryStatus === 'pending'
            ? 'processing'
            : order.deliveryStatus;
        await repo.save(order);
      }
      await this.creditDesignRoyalty(order, app, manager);
      order.application = app;
      return this.mapOrder(order);
    });
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

  async createForApplication(
    user: User,
    applicationPublicId: string,
    paymentMethod: string,
  ) {
    this.requireVerifiedFulfillmentOffer();
    const method = paymentMethod || 'bank';
    if (!['full', 'bank', 'earnings'].includes(method)) {
      throw new BadRequestException('Invalid payment method');
    }

    return this.dataSource.transaction(async (manager) => {
      const apps = manager.getRepository(CoinApplication);
      const orders = manager.getRepository(Order);
      const app = await apps.findOne({
        where: { publicId: applicationPublicId, userId: user.id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!app) throw new NotFoundException('Application not found');
      if (
        !app.priceQuotedAt ||
        !['approved', 'funds_received'].includes(app.status)
      ) {
        throw new BadRequestException(
          'Application must have a server quote and approval before payment',
        );
      }
      const existing = await orders.findOne({
        where: { applicationId: app.id },
      });
      if (existing) {
        existing.application = app;
        return this.mapOrder(existing);
      }
      await this.wallet.lockUsers(manager, [
        user.id,
        ...(app.designAuthorId ? [app.designAuthorId] : []),
      ]);

      const amount = Number(app.coinValue);
      if (!Number.isFinite(amount) || amount <= 0)
        throw new BadRequestException('Invalid order amount');
      if (method === 'earnings') {
        const balance = await this.wallet.getBalance(user.id, manager);
        if (balance < amount) {
          throw new BadRequestException(
            `Insufficient earnings balance. Available: $${balance.toFixed(2)}, required: $${amount.toFixed(2)}`,
          );
        }
      }

      let publicId = this.nextPublicId();
      while (await orders.findOne({ where: { publicId } })) {
        publicId = this.nextPublicId();
      }

      const order = orders.create({
        publicId,
        userId: user.id,
        applicationId: app.id,
        amount: app.coinValue,
        paymentMethod: method,
        status: method === 'earnings' ? 'paid' : 'pending',
        trackingCode: null,
        courier: null,
        estDeliveryAt: null,
        deliveryStatus: 'pending',
      });
      await orders.save(order);

      if (method === 'earnings') {
        await this.wallet.debitForOrder(
          {
            userId: user.id,
            amount,
            orderId: order.id,
            note: `Paid coin order ${publicId} with earnings`,
          },
          manager,
        );
        await this.creditDesignRoyalty(order, app, manager);
      }

      const saved = await orders.findOne({
        where: { id: order.id },
        relations: { application: true },
      });
      return this.mapOrder(saved!);
    });
  }

async payWithEarnings(user: User, orderIdOrPublicId: string) {
    this.requireVerifiedFulfillmentOffer();
    return this.dataSource.transaction(async (manager) => {
      const orders = manager.getRepository(Order);
      const key = /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(orderIdOrPublicId)
        ? { id: orderIdOrPublicId } : { publicId: orderIdOrPublicId };
      const order = await orders.findOne({ where: { ...key, userId: user.id }, lock: { mode: 'pessimistic_write' } });
      if (!order) throw new NotFoundException('Order not found');
      if (order.status !== 'pending') throw new BadRequestException('Order is not awaiting payment');
      await this.wallet.lockUsers(manager, [user.id]);
      await this.wallet.debitForOrder({ userId: user.id, amount: Number(order.amount), orderId: order.id,
        note: `Paid coin order ${order.publicId} with earnings` }, manager);
      order.paymentMethod = 'earnings'; order.status = 'paid';
      order.deliveryStatus = order.deliveryStatus === 'pending' ? 'processing' : order.deliveryStatus;
      await orders.save(order);
      await this.creditDesignRoyalty(order, undefined, manager);
      return this.mapOrder(order);
    });
  }

  async listAwaitingEarnings(userId: string) {
    const rows = await this.orders.find({
      where: { userId, paymentMethod: 'earnings', status: 'pending' },
      relations: { application: true },
      order: { createdAt: 'DESC' },
    });
    return rows.map((o) => this.mapOrder(o));
  }
}
