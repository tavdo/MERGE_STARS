import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  applicationView,
  CoinApplication,
} from '../../database/entities/coin-application.entity';
import { User } from '../../database/entities/user.entity';
import { SubmitApplicationDto } from './dto/submit-application.dto';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CoinsService {
  constructor(
    @InjectRepository(CoinApplication)
    private readonly apps: Repository<CoinApplication>,
    private readonly usersService: UsersService,
    private readonly mail: MailService,
    private readonly notifications: NotificationsService,
  ) {}

  private nextPublicId() {
    const year = new Date().getFullYear();
    const n = Math.floor(100000 + Math.random() * 899999);
    return `APP-${year}-${String(n).padStart(6, '0')}`;
  }

  async listForUser(userId: string) {
    const rows = await this.apps.find({
      where: { userId },
      order: { submittedAt: 'DESC' },
    });
    return rows.map((a) => applicationView(a));
  }

  async getForUser(userId: string, publicId: string) {
    const app = await this.apps.findOne({ where: { publicId, userId } });
    if (!app) throw new NotFoundException('Application not found');
    return applicationView(app);
  }

  async getLatestForUser(userId: string) {
    const app = await this.apps.findOne({
      where: { userId },
      order: { submittedAt: 'DESC' },
    });
    if (!app) return null;
    return applicationView(app);
  }

  async submit(user: User, dto: SubmitApplicationDto) {
    if (dto.firstName || dto.lastName || dto.phone) {
      await this.usersService.updateMe(user.id, {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
      });
    }

    let publicId = this.nextPublicId();
    while (await this.apps.findOne({ where: { publicId } })) {
      publicId = this.nextPublicId();
    }

    const app = this.apps.create({
      publicId,
      userId: user.id,
      coinType: dto.coinType,
      quantity: dto.quantity,
      metalPurity: dto.metalPurity ?? 999,
      metalType: dto.metalType ?? null,
      coinValue: dto.coinValue,
      notes: dto.notes ?? null,
      financingPreference: dto.financingPreference ?? null,
      financingTermMonths: dto.financingTermMonths ?? null,
      deliveryAddress: dto.deliveryAddress ?? null,
      additionalNotes: dto.additionalNotes ?? null,
      status: 'submitted',
      crystalSent: false,
    });
    await this.apps.save(app);

    const freshUser = await this.usersService.findById(user.id);
    const email = dto.contactEmail ?? freshUser.email;
    const name = `${dto.firstName ?? freshUser.firstName} ${dto.lastName ?? freshUser.lastName}`.trim();
    await this.mail.sendApplicationReceived(email, name, publicId);

    await this.notifications.create({
      userId: user.id,
      type: 'application_submitted',
      title: 'Application received',
      body: `Your application ${publicId} was submitted successfully.`,
      meta: { applicationId: publicId },
    });

    return applicationView(app);
  }

  async listAll(params: { status?: string; page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const qb = this.apps
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.user', 'u')
      .orderBy('a.submittedAt', 'DESC');

    if (params.status && params.status !== 'all') {
      qb.andWhere('a.status = :status', { status: params.status });
    }
    if (params.search?.trim()) {
      const q = `%${params.search.trim().toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(a.publicId) LIKE :q OR LOWER(u.firstName) LIKE :q OR LOWER(u.lastName) LIKE :q OR LOWER(u.email) LIKE :q)',
        { q },
      );
    }

    const [rows, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items: rows.map((a) =>
        applicationView(a, `${a.user?.firstName ?? ''} ${a.user?.lastName ?? ''}`.trim()),
      ),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateStatus(
    publicId: string,
    status: CoinApplication['status'],
    options?: { crystalSent?: boolean; note?: string },
  ) {
    const app = await this.apps.findOne({ where: { publicId }, relations: { user: true } });
    if (!app) throw new NotFoundException('Application not found');

    const previousStatus = app.status;
    app.status = status;

    if (status === 'sent_to_crystal') {
      app.crystalSent = true;
    }
    if (options?.crystalSent !== undefined) {
      app.crystalSent = options.crystalSent;
    }
    if (options?.note !== undefined) {
      app.statusNote = options.note || null;
    }

    await this.apps.save(app);

    if (app.user && previousStatus !== status) {
      const name = `${app.user.firstName} ${app.user.lastName}`.trim();
      await this.mail.sendApplicationStatusUpdate(
        app.user.email,
        name,
        publicId,
        status,
        options?.note,
      );
      await this.notifications.create({
        userId: app.userId,
        type: 'application_status',
        title: 'Application status updated',
        body: `${publicId}: ${status.replace(/_/g, ' ')}`,
        meta: { applicationId: publicId, status, note: options?.note ?? null },
      });
    }

    return applicationView(
      app,
      `${app.user?.firstName ?? ''} ${app.user?.lastName ?? ''}`.trim(),
    );
  }

  async stats() {
    const total = await this.apps.count();
    const approved = await this.apps.count({ where: { status: 'approved' } });
    const rejected = await this.apps.count({ where: { status: 'rejected' } });
    const inProduction = await this.apps.count({ where: { status: 'in_production' } });
    const sum = await this.apps
      .createQueryBuilder('a')
      .select('COALESCE(SUM(a.coinValue), 0)', 'total')
      .getRawOne<{ total: string }>();
    return {
      totalApplications: total,
      approved,
      rejected,
      inProduction,
      totalFunds: Number(sum?.total ?? 0),
    };
  }
}
