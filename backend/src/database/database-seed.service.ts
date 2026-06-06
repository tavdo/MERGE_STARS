import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../database/entities/user.entity';

@Injectable()
export class DatabaseSeedService implements OnModuleInit {
  private readonly log = new Logger(DatabaseSeedService.name);

  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  async onModuleInit() {
    const count = await this.users.count();
    if (count > 0) {
      this.log.log(`Skipping seed — ${count} user(s) already in database`);
      return;
    }

    const email = (process.env.SEED_ADMIN_EMAIL ?? 'admin@mergestars.com').toLowerCase();
    const password = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!ChangeMe';
    const user = this.users.create({
      email,
      phone: null,
      passwordHash: await bcrypt.hash(password, 12),
      firstName: 'Admin',
      lastName: 'Merge Stars',
      personalId: null,
      mergeId: 'MERGE-ADMIN',
      founderId: 'FND-ADMIN',
      brandLineId: 'BL-ADMIN',
      roles: ['admin', 'manager'],
      status: 'active',
      kycStatus: 'verified',
    });
    await this.users.save(user);
    this.log.log(`Seeded admin user ${email} (change password after first login)`);
  }
}
