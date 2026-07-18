import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Referral } from '../../database/entities/referral.entity';
import { User } from '../../database/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PlatformSettingsService } from '../settings/platform-settings.service';

@Injectable()
export class ReferralsService {
  private readonly log = new Logger(ReferralsService.name);

  constructor(
    @InjectRepository(Referral) private readonly referrals: Repository<Referral>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly notifications: NotificationsService,
    private readonly platformSettings: PlatformSettingsService,
    private readonly mail: MailService,
  ) {}

  shareBase() {
    return (process.env.FRONTEND_URL ?? 'http://localhost:5173').replace(/\/$/, '');
  }

  buildShareLink(mergeId: string, source: 'qr' | 'link' = 'link') {
    const params = new URLSearchParams({
      tab: 'register',
      ref: mergeId,
    });
    if (source === 'qr') params.set('src', 'qr');
    return `${this.shareBase()}/login?${params.toString()}`;
  }

  async attachReferral(
    referredUser: User,
    referralCode?: string,
    source?: string,
  ) {
    const code = referralCode?.trim();
    if (!code) return null;

    const referrer = await this.users.findOne({
      where: [{ mergeId: code }, { founderId: code }, { brandLineId: code }],
    });
    if (!referrer || referrer.id === referredUser.id) return null;

    const existing = await this.referrals.findOne({
      where: { referrerId: referrer.id, referredUserId: referredUser.id },
    });
    if (existing) return existing;

    referredUser.referredById = referrer.id;
    await this.users.save(referredUser);

    const row = this.referrals.create({
      referrerId: referrer.id,
      referredUserId: referredUser.id,
      referredName: `${referredUser.firstName} ${referredUser.lastName}`.trim(),
      status: 'registered',
    });
    await this.referrals.save(row);

    const referredName =
      `${referredUser.firstName} ${referredUser.lastName}`.trim() || referredUser.email;
    const viaQr = (source ?? '').toLowerCase() === 'qr';
    const title = viaQr ? 'Someone joined via your QR code' : 'New referral signup';
    const body = viaQr
      ? `${referredName} registered after scanning your QR code.`
      : `${referredName} registered using your referral link.`;

    await this.notifications.create({
      userId: referrer.id,
      type: 'referral_signup',
      title,
      body,
      meta: {
        referredUserId: referredUser.id,
        referralId: row.id,
        source: viaQr ? 'qr' : 'link',
      },
    });

    try {
      await this.mail.sendReferralJoined(
        referrer.email,
        referrer.firstName,
        referredName,
        viaQr,
      );
    } catch (err) {
      this.log.warn(
        `Referral email to ${referrer.email} failed: ${(err as Error).message}`,
      );
    }

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
    const shares = await this.platformSettings.get();
    return {
      total: rows.length,
      verified,
      pending,
      shareLink: this.buildShareLink(mergeId, 'link'),
      qrLink: this.buildShareLink(mergeId, 'qr'),
      qrRef: `QR-REF-${mergeId.replace(/^MERGE-/, '')}`,
      platformShare: shares.referrerShare,
    };
  }
}
