import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { randomInt, randomUUID } from 'crypto';
import { User, userPublicView } from '../../database/entities/user.entity';
import { EmailVerificationCode } from '../../database/entities/email-verification-code.entity';
import { RefreshToken } from '../../database/entities/refresh-token.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  mergeSocialLinks,
  sanitizeSocialLinks,
  socialLinksPublicView,
} from '../../common/social-links';

const KYC_STATUSES = new Set(['pending', 'verified', 'rejected']);

const AVATAR_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

@Injectable()
export class UsersService {
  private readonly uploadRoot =
    process.env.UPLOAD_DIR ?? join(process.cwd(), 'uploads');

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(EmailVerificationCode)
    private readonly emailCodes: Repository<EmailVerificationCode>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokens: Repository<RefreshToken>,
    private readonly mail: MailService,
    private readonly notifications: NotificationsService,
  ) {}

  private normalizeBcryptHash(hash: string) {
    if (!hash) return hash;
    return hash.replace(/^\$2y\$/, '$2b$').replace(/^\$2a\$/, '$2b$');
  }

  private async comparePassword(password: string, hash: string) {
    return bcrypt.compare(password, this.normalizeBcryptHash(hash));
  }

  private async hashPassword(password: string) {
    return bcrypt.hash(password, 12);
  }

  private avatarDir(userId: string) {
    return join(this.uploadRoot, 'avatars', userId);
  }

  async findById(userId: string) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    const user = await this.findById(userId);

    if (dto.firstName !== undefined) user.firstName = dto.firstName.trim();
    if (dto.lastName !== undefined) user.lastName = dto.lastName.trim();
    if (dto.phone !== undefined) {
      const phone = dto.phone.trim() || null;
      if (phone) {
        const taken = await this.users.findOne({ where: { phone } });
        if (taken && taken.id !== userId) {
          throw new ConflictException('Phone already registered');
        }
      }
      user.phone = phone;
    }

    if (dto.socialLinks !== undefined) {
      try {
        const patch = sanitizeSocialLinks(dto.socialLinks);
        user.socialLinks = mergeSocialLinks(user.socialLinks, patch);
      } catch (e) {
        throw new BadRequestException(
          e instanceof Error ? e.message : 'Invalid social links',
        );
      }
    }

    await this.users.save(user);
    return userPublicView(user);
  }

  async uploadAvatar(userId: string, file: Express.Multer.File | undefined) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Image file is required');
    }
    if (!AVATAR_MIME.has(file.mimetype)) {
      throw new BadRequestException('Allowed types: JPEG, PNG, WEBP');
    }
    if (file.size > AVATAR_MAX_BYTES) {
      throw new BadRequestException('Image too large (max 5 MB)');
    }

    const user = await this.findById(userId);
    const dir = this.avatarDir(userId);
    await mkdir(dir, { recursive: true });
    const ext = file.mimetype === 'image/png' ? 'png' : file.mimetype === 'image/webp' ? 'webp' : 'jpg';
    const storedName = `${randomUUID()}.${ext}`;
    const filePath = join(dir, storedName);
    await writeFile(filePath, file.buffer);

    user.avatarUrl = storedName;
    await this.users.save(user);
    return userPublicView(user);
  }

  async getAvatarFile(userId: string) {
    const user = await this.findById(userId);
    if (!user.avatarUrl) {
      throw new NotFoundException('No avatar');
    }
    const filePath = join(this.avatarDir(userId), user.avatarUrl);
    const ext = user.avatarUrl.split('.').pop()?.toLowerCase();
    const mimeType =
      ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    return { filePath, mimeType };
  }

  private async findByPublicId(id: string) {
    const key = id.trim();
    if (!key) throw new NotFoundException('User not found');
    const user = await this.users.findOne({
      where: [{ mergeId: key }, { brandLineId: key }],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /** Safe public member card (no email/phone/KYC docs) */
  async getPublicMemberProfile(id: string) {
    const user = await this.findByPublicId(id);
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: `${user.firstName} ${user.lastName}`.trim(),
      mergeId: user.mergeId,
      brandLineId: user.brandLineId,
      founderId: user.founderId,
      hasAvatar: !!user.avatarUrl,
      avatarUrl: user.avatarUrl
        ? `/api/users/public/${encodeURIComponent(user.mergeId)}/avatar`
        : null,
      socialLinks: socialLinksPublicView(user.socialLinks),
      profilePath: `/u/${encodeURIComponent(user.mergeId)}`,
      brandPath: user.brandLineId
        ? `/b/${encodeURIComponent(user.brandLineId)}`
        : `/u/${encodeURIComponent(user.mergeId)}`,
      memberSince: user.createdAt.toISOString(),
    };
  }

  async getPublicAvatarFile(id: string) {
    const user = await this.findByPublicId(id);
    return this.getAvatarFile(user.id);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.findById(userId);
    if (!(await this.comparePassword(currentPassword, user.passwordHash))) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    if (currentPassword === newPassword) {
      throw new BadRequestException('New password must be different');
    }

    user.passwordHash = await this.hashPassword(newPassword);
    await this.users.save(user);
    await this.refreshTokens.delete({ userId: user.id });

    await this.notifications.create({
      userId: user.id,
      type: 'security',
      title: 'Password updated',
      body: 'Your account password was changed successfully.',
    });

    return { ok: true, message: 'Password updated' };
  }

  async requestEmailChange(userId: string, newEmail: string) {
    const normalized = newEmail.trim().toLowerCase();
    const user = await this.findById(userId);

    if (user.email === normalized) {
      throw new BadRequestException('This is already your email');
    }

    const taken = await this.users.findOne({ where: { email: normalized } });
    if (taken) {
      throw new ConflictException('Email already registered');
    }

    const recent = await this.emailCodes.findOne({
      where: { email: normalized },
      order: { createdAt: 'DESC' },
    });
    if (recent && Date.now() - recent.createdAt.getTime() < 60_000) {
      throw new BadRequestException(
        'Please wait 60 seconds before requesting a new code',
      );
    }

    await this.emailCodes.delete({ email: normalized });

    const code = String(randomInt(100000, 999999));
    const expiresAt = new Date(Date.now() + 15 * 60_000);

    try {
      await this.mail.sendEmailChangeCode(normalized, code);
    } catch {
      throw new ServiceUnavailableException(
        'Could not send verification email. Please try again in a minute.',
      );
    }

    await this.emailCodes.save(
      this.emailCodes.create({ email: normalized, code, expiresAt, used: false }),
    );

    return { ok: true, message: 'Verification code sent to new email' };
  }

  async confirmEmailChange(
    userId: string,
    newEmail: string,
    code: string,
    currentPassword: string,
  ) {
    const normalized = newEmail.trim().toLowerCase();
    const user = await this.findById(userId);

    if (!(await this.comparePassword(currentPassword, user.passwordHash))) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const taken = await this.users.findOne({ where: { email: normalized } });
    if (taken && taken.id !== userId) {
      throw new ConflictException('Email already registered');
    }

    const row = await this.emailCodes.findOne({
      where: { email: normalized, code, used: false },
      order: { createdAt: 'DESC' },
    });
    if (!row || row.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    row.used = true;
    await this.emailCodes.save(row);

    const oldEmail = user.email;
    user.email = normalized;
    await this.users.save(user);

    await this.notifications.create({
      userId: user.id,
      type: 'security',
      title: 'Email updated',
      body: `Your account email was changed from ${oldEmail} to ${normalized}.`,
    });

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

  async getRegistrationGoalStats() {
    const goal = Math.max(1, Number(process.env.REGISTRATION_GOAL ?? 1000));
    const registeredUsers = await this.users
      .createQueryBuilder('u')
      .where(`NOT (u.roles::jsonb ? 'admin')`)
      .getCount();
    const progressPct = Math.min(100, Math.round((registeredUsers / goal) * 100));

    return {
      registeredUsers,
      goal,
      remaining: Math.max(0, goal - registeredUsers),
      goalReached: registeredUsers >= goal,
      progressPct,
    };
  }
}
