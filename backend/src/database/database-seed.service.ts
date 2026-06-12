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
    const email = (process.env.SEED_ADMIN_EMAIL ?? 'admin@mergestars.com').toLowerCase();
    const password = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!ChangeMe';

    if (process.env.SEED_ADMIN_SYNC === 'true') {
      const existing = await this.users.findOne({ where: { email } });
      if (existing) {
        existing.passwordHash = await bcrypt.hash(password, 12);
        if (!existing.roles.includes('admin')) {
          existing.roles = [...new Set([...existing.roles, 'admin', 'manager'])];
        }
        await this.users.save(existing);
        this.log.log(`Synced password for admin ${email} (SEED_ADMIN_SYNC=true)`);
        return;
      }
    }

    const count = await this.users.count();
    if (count > 0) {
      this.log.log(`Skipping seed — ${count} user(s) already in database`);
      return;
    }

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
