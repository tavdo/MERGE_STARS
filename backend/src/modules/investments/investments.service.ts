import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoinApplication } from '../../database/entities/coin-application.entity';

@Injectable()
export class InvestmentsService {
  constructor(
    @InjectRepository(CoinApplication)
    private readonly apps: Repository<CoinApplication>,
  ) {}

  async listForUser(userId: string) {
    const rows = await this.apps.find({
      where: { userId },
      order: { submittedAt: 'DESC' },
    });
    return rows.map((a) => ({
      id: a.id,
      amountUsd: Number(a.coinValue),
      applicationId: a.publicId,
      createdAt: a.submittedAt.toISOString(),
    }));
  }

  async summary(userId: string) {
    const rows = await this.apps.find({ where: { userId } });
    const totalUsd = rows.reduce((s, a) => s + Number(a.coinValue), 0);
    return { totalUsd, changePct: 0 };
  }
}
