import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CoinsService } from '../coins/coins.service';
import { ApplicationStatus } from '../../database/entities/coin-application.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, userPublicView } from '../../database/entities/user.entity';
import { Order, orderView } from '../../database/entities/order.entity';
import { UsersService } from '../users/users.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager')
export class AdminController {
  constructor(
    private readonly coins: CoinsService,
    private readonly usersService: UsersService,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Order) private readonly orders: Repository<Order>,
  ) {}

  @Get('applications')
  async applications(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const result = await this.coins.listAll({
      status: status?.replace(/\s+/g, '_').toLowerCase(),
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search,
    });
    return result.items;
  }

  @Get('applications/stats')
  stats() {
    return this.coins.stats();
  }

  @Get('applications/:id')
  async application(@Param('id') id: string) {
    const result = await this.coins.listAll({ search: id, limit: 1 });
    const app = result.items.find((a) => a.id === id);
    if (!app) {
      const all = await this.coins.listAll({ limit: 500 });
      const found = all.items.find((a) => a.id === id);
      if (!found) throw new NotFoundException('Application not found');
      return found;
    }
    return app;
  }

  @Patch('applications/:id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: ApplicationStatus; note?: string; crystalSent?: boolean },
  ) {
    return this.coins.updateStatus(id, body.status, {
      note: body.note,
      crystalSent: body.crystalSent,
    });
  }

  @Get('users')
  async listUsers(
    @Query('search') search?: string,
    @Query('kycStatus') kycStatus?: string,
  ) {
    const qb = this.users.createQueryBuilder('u').orderBy('u.createdAt', 'DESC');
    if (search?.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      qb.where(
        '(LOWER(u.email) LIKE :q OR LOWER(u.firstName) LIKE :q OR LOWER(u.lastName) LIKE :q OR LOWER(u.mergeId) LIKE :q)',
        { q },
      );
    }
    if (kycStatus?.trim()) {
      qb.andWhere('u.kycStatus = :kycStatus', { kycStatus: kycStatus.toLowerCase() });
    }
    const rows = await qb.take(100).getMany();
    return rows.map((u) => ({
      ...userPublicView(u),
      name: `${u.firstName} ${u.lastName}`,
      joined: u.createdAt.toISOString().slice(0, 10),
    }));
  }

  @Patch('users/:id/kyc')
  async updateUserKyc(
    @Param('id') id: string,
    @Body() body: { kycStatus: string },
  ) {
    const user = await this.usersService.updateKycStatus(id, body.kycStatus);
    return {
      ...user,
      name: `${user.firstName} ${user.lastName}`,
      joined: user.createdAt.slice(0, 10),
    };
  }

  @Get('orders')
  async listOrders() {
    const rows = await this.orders.find({
      relations: { user: true, application: true },
      order: { createdAt: 'DESC' },
      take: 100,
    });
    return rows.map((o) => ({
      ...orderView(o),
      user: o.user ? `${o.user.firstName} ${o.user.lastName}` : o.userId,
      userEmail: o.user?.email ?? null,
      coinType: o.application?.coinType ?? null,
      crystalSent: o.application?.crystalSent ?? false,
      appStatus: o.application?.status ?? null,
    }));
  }
}
