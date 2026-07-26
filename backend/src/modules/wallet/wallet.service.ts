import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  WalletTransaction,
  walletTxView,
} from '../../database/entities/wallet-transaction.entity';
import { User } from '../../database/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(WalletTransaction)
    private readonly txs: Repository<WalletTransaction>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly notifications: NotificationsService,
  ) {}

  async getBalance(userId: string): Promise<number> {
    const last = await this.txs.findOne({
      where: { userId },
      order: { createdAt: 'DESC', id: 'DESC' },
    });
    return last ? Number(last.balanceAfter) : 0;
  }

  /**
   * Opens the earnings wallet for a member. Idempotent: the first opt-in wins,
   * later calls just return the existing activation date.
   */
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

  async credit(params: {
    userId: string;
    amount: number;
    reason: string;
    note?: string;
    createdBy?: string;
    meta?: Record<string, unknown>;
    notify?: boolean;
  }) {
    const amount = Number(params.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Credit amount must be greater than zero');
    }

    const user = await this.users.findOne({ where: { id: params.userId } });
    if (!user) throw new NotFoundException('User not found');
    if (!user.walletActivatedAt) {
      await this.activate(params.userId, `credit:${params.reason}`);
    }

    const row = await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(WalletTransaction);
      const last = await repo.findOne({
        where: { userId: params.userId },
        order: { createdAt: 'DESC', id: 'DESC' },
        lock: { mode: 'pessimistic_write' },
      });
      const prev = last ? Number(last.balanceAfter) : 0;
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
    });

    if (params.notify !== false) {
      await this.notifications.create({
        userId: params.userId,
        type: 'wallet_credit',
        title: 'Earnings credited',
        body: `$${amount.toFixed(2)} was added to your earnings wallet.`,
        meta: { amount, reason: params.reason, txId: row.id },
      });
    }

    return walletTxView(row);
  }

  async debitForOrder(params: {
    userId: string;
    amount: number;
    orderId: string;
    note?: string;
  }) {
    const amount = Number(params.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Debit amount must be greater than zero');
    }

    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(WalletTransaction);
      const last = await repo.findOne({
        where: { userId: params.userId },
        order: { createdAt: 'DESC', id: 'DESC' },
        lock: { mode: 'pessimistic_write' },
      });
      const prev = last ? Number(last.balanceAfter) : 0;
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
    });
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

  async hasDesignRoyaltyForOrder(coinOrderId: string): Promise<boolean> {
    const row = await this.txs
      .createQueryBuilder('t')
      .where('t.reason = :reason', { reason: 'design_royalty' })
      .andWhere(`t.meta->>'coinOrderId' = :coinOrderId`, { coinOrderId })
      .getOne();
    return !!row;
  }
}
