import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, userPublicView } from '../../database/entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';

const KYC_STATUSES = new Set(['pending', 'verified', 'rejected']);

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly mail: MailService,
    private readonly notifications: NotificationsService,
  ) {}

  async findById(userId: string) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    const user = await this.findById(userId);

    if (dto.firstName !== undefined) user.firstName = dto.firstName.trim();
    if (dto.lastName !== undefined) user.lastName = dto.lastName.trim();
    if (dto.phone !== undefined) user.phone = dto.phone.trim() || null;

    await this.users.save(user);
    return userPublicView(user);
  }

  async updateKycStatus(userId: string, kycStatus: string) {
    const normalized = kycStatus.toLowerCase();
    if (!KYC_STATUSES.has(normalized)) {
      throw new NotFoundException('Invalid KYC status');
    }

    const user = await this.findById(userId);
    user.kycStatus = normalized;
    await this.users.save(user);

    const name = `${user.firstName} ${user.lastName}`.trim();
    await this.mail.sendKycDecision(user.email, name, normalized);

    await this.notifications.create({
      userId: user.id,
      type: 'kyc_decision',
      title: 'KYC update',
      body: `Your KYC status is now: ${normalized}`,
      meta: { kycStatus: normalized },
    });

    return userPublicView(user);
  }
}
