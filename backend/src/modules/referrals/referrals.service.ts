import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Referral } from '../../database/entities/referral.entity';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class ReferralsService {
  constructor(
    @InjectRepository(Referral) private readonly referrals: Repository<Referral>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  shareBase() {
    return (process.env.FRONTEND_URL ?? 'http://localhost:5173').replace(/\/$/, '');
  }

  buildShareLink(mergeId: string) {
    return `${this.shareBase()}/login?tab=register&ref=${encodeURIComponent(mergeId)}`;
  }

  async attachReferral(referredUser: User, referralCode?: string) {
    const code = referralCode?.trim();
    if (!code) return null;

    const referrer = await this.users.findOne({
      where: [{ mergeId: code }, { founderId: code }, { brandLineId: code }],
    });
    if (!referrer || referrer.id === referredUser.id) return null;

    referredUser.referredById = referrer.id;
    await this.users.save(referredUser);

    const row = this.referrals.create({
      referrerId: referrer.id,
      referredUserId: referredUser.id,
      referredName: `${referredUser.firstName} ${referredUser.lastName}`.trim(),
      status: 'registered',
    });
    await this.referrals.save(row);
    return row;
  }

  async listForReferrer(referrerId: string) {
    const rows = await this.referrals.find({
      where: { referrerId },
      order: { createdAt: 'DESC' },
    });
    return rows.map((r) => ({
      id: r.id,
      user: r.referredName ?? '—',
      date: r.createdAt.toISOString().slice(0, 10),
      status: r.status.toUpperCase(),
      order: r.orderId ?? '—',
    }));
  }

  async statsForReferrer(referrerId: string, mergeId: string) {
    const rows = await this.referrals.find({ where: { referrerId } });
    const verified = rows.filter((r) => r.status === 'verified' || r.status === 'completed').length;
    const pending = rows.filter((r) => r.status === 'registered' || r.status === 'pending').length;
    return {
      total: rows.length,
      verified,
      pending,
      shareLink: this.buildShareLink(mergeId),
      qrRef: `QR-REF-${mergeId.replace(/^MERGE-/, '')}`,
      platformShare: '1/4',
    };
  }
}
