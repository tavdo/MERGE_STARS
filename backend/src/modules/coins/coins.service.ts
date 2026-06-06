import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  applicationView,
  CoinApplication,
} from '../../database/entities/coin-application.entity';
import { User } from '../../database/entities/user.entity';
import { SubmitApplicationDto } from './dto/submit-application.dto';

@Injectable()
export class CoinsService {
  constructor(
    @InjectRepository(CoinApplication)
    private readonly apps: Repository<CoinApplication>,
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
      coinValue: dto.coinValue,
      notes: dto.notes ?? null,
      status: 'submitted',
      crystalSent: false,
    });
    await this.apps.save(app);
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

  async updateStatus(publicId: string, status: CoinApplication['status'], crystalSent?: boolean) {
    const app = await this.apps.findOne({ where: { publicId }, relations: { user: true } });
    if (!app) throw new NotFoundException('Application not found');
    app.status = status;
    if (crystalSent !== undefined) app.crystalSent = crystalSent;
    await this.apps.save(app);
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
