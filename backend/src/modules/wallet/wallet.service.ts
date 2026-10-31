
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import {
  WalletTransaction,
  walletTxView,
} from '../../database/entities/wallet-transaction.entity';
import { User } from '../../database/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  constructor(
    @InjectRepository(WalletTransaction)
    private readonly txs: Repository<WalletTransaction>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly notifications: NotificationsService,
  ) {}

  async getBalance(userId: string, manager?: EntityManager): Promise<number> {
    const repo = manager ? manager.getRepository(WalletTransaction) : this.txs;
    const row = await repo
      .createQueryBuilder('t')
      .select(
        "COALESCE(SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE -t.amount END), 0)",
        'balance',
      )
      .where('t.userId = :userId', { userId })
      .getRawOne<{ balance: string }>();
    return Number(row?.balance ?? 0);
  }

  async lockUsers(manager: EntityManager, userIds: string[]) {
    // A stable row exists even before the user's first wallet entry. Sorting
    // avoids deadlocks when a buyer and a design author are locked together.
    for (const id of [...new Set(userIds)].sort()) {
      const user = await manager
        .getRepository(User)
        .findOne({ where: { id }, lock: { mode: 'pessimistic_write' } });
      if (!user) throw new NotFoundException('User not found');
    }
  }

  private money(amount: number) {
    const cents = Math.round(amount * 100);
    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !Number.isSafeInteger(cents) ||
      Math.abs(cents / 100 - amount) > 0.000001
    ) {
      throw new BadRequestException(
        'Amount must be positive with at most two decimal places',
      );
    }
    return cents / 100;
  }

  async getMe(userId: string, limit = 30) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const balance = await this.getBalance(userId);
    const rows = await this.txs.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: Math.min(limit, 100),
    });

    const totals = rows.length
      ? await this.txs
          .createQueryBuilder('t')
          .select('t.type', 'type')
          .addSelect('SUM(t.amount)', 'total')
          .where('t.user_id = :userId', { userId })
          .groupBy('t.type')
          .getRawMany<{ type: string; total: string }>()
      : [];
    const sumFor = (type: string) =>
      Number(totals.find((r) => r.type === type)?.total ?? 0);

    return {
      balance,
      currency: 'USD',
      activated: !!user.walletActivatedAt,
      activatedAt: user.walletActivatedAt?.toISOString() ?? null,
      totalEarned: sumFor('credit'),
      totalSpent: sumFor('debit'),
      transactions: rows.map(walletTxView),
    };
  }

  async credit(
    params: {
      userId: string;
      amount: number;
      reason: string;
      note?: string;
      createdBy?: string;
      meta?: Record<string, unknown>;
      notify?: boolean;
    },
    transaction?: EntityManager,
  ) {
    const amount = this.money(Number(params.amount));
    const write = async (manager: EntityManager) => {
      await this.lockUsers(manager, [params.userId]);
      const repo = manager.getRepository(WalletTransaction);
      const prev = await this.getBalance(params.userId, manager);
      const balanceAfter = Math.round((prev + amount) * 100) / 100;
      const tx = repo.create({
        userId: params.userId,
        type: 'credit',
        amount,
        balanceAfter,
        reason: params.reason,
        note: params.note?.trim() || null,
        orderId: null,
        createdBy: params.createdBy ?? null,
        meta: params.meta ?? null,
      });
      return repo.save(tx);
    };
    const row = transaction
      ? await write(transaction)
      : await this.dataSource.transaction(write);

    if (!transaction && params.notify !== false) {
      await this.notifications
        .create({
          userId: params.userId,
          type: 'wallet_credit',
          title: 'Earnings credited',
          body: `$${amount.toFixed(2)} was added to your earnings wallet.`,
          meta: { amount, reason: params.reason, txId: row.id },
        })
        .catch((error: Error) =>
          this.logger.warn(`Credit notification failed: ${error.message}`),
        );
    }

    return walletTxView(row);
  }

  async debitForOrder(
    params: {
      userId: string;
      amount: number;
      orderId: string;
      note?: string;
    },
    transaction?: EntityManager,
  ) {
    const amount = this.money(Number(params.amount));
    const write = async (manager: EntityManager) => {
      await this.lockUsers(manager, [params.userId]);
      const repo = manager.getRepository(WalletTransaction);
      const existing = await repo.findOne({
        where: { orderId: params.orderId, type: 'debit' },
      });
      if (existing) return walletTxView(existing);
      const prev = await this.getBalance(params.userId, manager);
      if (prev < amount) {
        throw new BadRequestException(
          `Insufficient earnings balance. Available: $${prev.toFixed(2)}, required: $${amount.toFixed(2)}`,
        );
      }
      const balanceAfter = Math.round((prev - amount) * 100) / 100;
      const tx = repo.create({
        userId: params.userId,
        type: 'debit',
        amount,
        balanceAfter,
        reason: 'coin_order',
        note: params.note?.trim() || 'Coin order paid with earnings',
        orderId: params.orderId,
        createdBy: null,
        meta: { orderId: params.orderId },
      });
      const saved = await repo.save(tx);
      return walletTxView(saved);
    };
    return transaction
      ? write(transaction)
      : this.dataSource.transaction(write);
  }

  async creditByEmailOrMergeId(params: {
    identifier: string;
    amount: number;
    note?: string;
    createdBy: string;
  }) {
    const id = params.identifier.trim();
    const user = await this.users.findOne({
      where: [{ email: id.toLowerCase() }, { mergeId: id }, { id }],
    });
    if (!user) throw new NotFoundException('User not found');

    return this.credit({
      userId: user.id,
      amount: params.amount,
      reason: 'admin_credit',
      note: params.note || 'Catalog earnings credit (admin)',
      createdBy: params.createdBy,
      meta: { source: 'admin', labeledAs: 'catalog_earnings_50pct' },
    });
  }

  async hasDesignRoyaltyForOrder(
    coinOrderId: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    const row = await (
      manager ? manager.getRepository(WalletTransaction) : this.txs
    )
      .createQueryBuilder('t')
      .where('t.reason = :reason', { reason: 'design_royalty' })
      .andWhere(`t.meta->>'coinOrderId' = :coinOrderId`, { coinOrderId })
      .getOne();
    return !!row;
  }

async activate(userId: string, source = 'user') {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (!user.walletActivatedAt) {
      user.walletActivatedAt = new Date();
      await this.users.save(user);
      await this.notifications.create({
        userId,
        type: 'wallet_activated',
        title: 'Earnings wallet activated',
        body: 'Your earnings wallet is open. Design royalties and catalog earnings are credited here and can be used to pay for coin orders.',
        meta: { source },
      });
    }

    return { activated: true, activatedAt: user.walletActivatedAt.toISOString() };
  }
}
