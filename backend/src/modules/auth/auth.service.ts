import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes, randomInt } from 'crypto';
import { User, userPublicView } from '../../database/entities/user.entity';
import { RefreshToken } from '../../database/entities/refresh-token.entity';
import { EmailVerificationCode } from '../../database/entities/email-verification-code.entity';
import { PasswordResetToken } from '../../database/entities/password-reset-token.entity';
import { MailService } from '../mail/mail.service';
import { ReferralsService } from '../referrals/referrals.service';
import { NotificationsService } from '../notifications/notifications.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly log = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokens: Repository<RefreshToken>,
    @InjectRepository(EmailVerificationCode)
    private readonly emailCodes: Repository<EmailVerificationCode>,
    @InjectRepository(PasswordResetToken)
    private readonly resetTokens: Repository<PasswordResetToken>,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
    private readonly referrals: ReferralsService,
    private readonly notifications: NotificationsService,
  ) {}

  private async hashPassword(password: string) {
    return bcrypt.hash(password, 12);
  }

  /** Laravel / PHP bcrypt uses $2y$; Node bcrypt expects $2a$ or $2b$ */
  private normalizeBcryptHash(hash: string) {
    return hash.replace(/^\$2y\$/, '$2a$');
  }

  private async comparePassword(password: string, hash: string) {
    return bcrypt.compare(password, this.normalizeBcryptHash(hash));
  }

  private signAccessToken(user: User) {
    return this.jwt.sign(
      { sub: user.id, email: user.email },
      {
        secret: process.env.JWT_SECRET ?? 'merge-stars-dev-secret-change-me',
        expiresIn: (process.env.JWT_ACCESS_TTL ?? '15m') as `${number}m`,
      },
    );
  }

  private async createRefreshToken(userId: string) {
    const token = randomBytes(48).toString('hex');
    const days = Number(process.env.JWT_REFRESH_DAYS ?? 7);
    const expiresAt = new Date(Date.now() + days * 86400000);
    await this.refreshTokens.save(
      this.refreshTokens.create({ userId, token, expiresAt }),
    );
    return token;
  }

  private normalizePersonalId(id: string) {
    return id.trim().replace(/\s+/g, '');
  }

  private async nextUserIds() {
    const rows = await this.users.find({ select: { mergeId: true } });
    let max = 0;
    for (const row of rows) {
      const match = /^MERGE-(\d+)$/.exec(row.mergeId);
      if (match) max = Math.max(max, Number(match[1]));
    }
    const n = max + 1;
    const padded = String(n).padStart(6, '0');
    return {
      mergeId: `MERGE-${padded}`,
      founderId: `FND-${padded}`,
      brandLineId: `BL-${padded}`,
    };
  }

  async sendVerificationCode(email: string) {
    const normalized = email.trim().toLowerCase();
    const existing = await this.users.findOne({ where: { email: normalized } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const recent = await this.emailCodes.findOne({
      where: { email: normalized },
      order: { createdAt: 'DESC' },
    });
    if (recent && Date.now() - recent.createdAt.getTime() < 60_000) {
      throw new BadRequestException('Please wait 60 seconds before requesting a new code');
    }

    await this.emailCodes.delete({ email: normalized });

    const code = String(randomInt(100000, 999999));
    const expiresAt = new Date(Date.now() + 15 * 60_000);

    try {
      await this.mail.sendVerificationCode(normalized, code);
    } catch (err) {
      this.log.error(
        `Verification email to ${normalized} failed: ${(err as Error).message}`,
      );
      throw new ServiceUnavailableException(
        'Could not send verification email. Please try again in a minute.',
      );
    }

    await this.emailCodes.save(
      this.emailCodes.create({ email: normalized, code, expiresAt, used: false }),
    );
    return { ok: true, message: 'Verification code sent' };
  }

  private async consumeVerificationCode(email: string, code: string) {
    const normalized = email.trim().toLowerCase();
    const row = await this.emailCodes.findOne({
      where: { email: normalized, code, used: false },
      order: { createdAt: 'DESC' },
    });
    if (!row || row.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired verification code');
    }
    row.used = true;
    await this.emailCodes.save(row);
  }

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const phone = dto.phone?.trim() || null;
    const personalId = this.normalizePersonalId(dto.personalId);

    if (!personalId) {
      throw new BadRequestException('Personal ID is required');
    }

    const existingEmail = await this.users.findOne({ where: { email } });
    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    if (phone) {
      const existingPhone = await this.users.findOne({ where: { phone } });
      if (existingPhone) {
        throw new ConflictException('Phone already registered');
      }
    }

    const existingPersonalId = await this.users.findOne({ where: { personalId } });
    if (existingPersonalId) {
      throw new ConflictException('Personal ID already registered — one account per ID');
    }

    const emailVerify = process.env.EMAIL_VERIFY !== 'false';
    if (emailVerify) {
      if (!dto.verificationCode?.trim()) {
        throw new BadRequestException('Email verification code is required');
      }
      await this.consumeVerificationCode(email, dto.verificationCode.trim());
    }

    const ids = await this.nextUserIds();
    if (await this.users.findOne({ where: { mergeId: ids.mergeId } })) {
      throw new ConflictException('Could not allocate user ID, try again');
    }

    const user = this.users.create({
      email,
      phone,
      passwordHash: await this.hashPassword(dto.password),
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      personalId,
      mergeId: ids.mergeId,
      founderId: ids.founderId,
      brandLineId: ids.brandLineId,
      roles: ['user'],
      status: 'active',
      kycStatus: 'pending',
      termsAcceptedAt: new Date(),
    });

    await this.users.save(user);
    await this.referrals.attachReferral(user, dto.referralCode);
    await this.notifications.create({
      userId: user.id,
      type: 'welcome',
      title: 'Welcome to MERGE STARS',
      body: `Your account ${ids.mergeId} is ready. Complete KYC to unlock full platform access.`,
    });
    const accessToken = this.signAccessToken(user);
    const refreshToken = await this.createRefreshToken(user.id);
    return {
      accessToken,
      refreshToken,
      user: userPublicView(user),
    };
  }

  async login(dto: LoginDto) {
    const identifier = (dto.identifier ?? dto.email ?? '').trim().toLowerCase();
    if (!identifier) throw new UnauthorizedException('Invalid credentials');

    const user = await this.users
      .createQueryBuilder('u')
      .where('LOWER(u.email) = :id', { id: identifier })
      .orWhere('u.phone = :phone', { phone: dto.identifier?.trim() })
      .getOne();

    if (!user || !(await this.comparePassword(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.status !== 'active') {
      throw new UnauthorizedException('Account disabled');
    }

    const accessToken = this.signAccessToken(user);
    const refreshToken = await this.createRefreshToken(user.id);
    return {
      accessToken,
      refreshToken,
      user: userPublicView(user),
    };
  }

  async forgotPassword(email: string) {
    const normalized = email.trim().toLowerCase();
    const user = await this.users.findOne({ where: { email: normalized } });

    if (user) {
      await this.resetTokens.delete({ email: normalized });
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60_000);
      await this.resetTokens.save(
        this.resetTokens.create({ email: normalized, token, expiresAt, used: false }),
      );
      const base = (process.env.FRONTEND_URL ?? 'http://localhost:5173').replace(/\/$/, '');
      this.mail.sendPasswordReset(normalized, `${base}/reset-password?token=${token}`);
    }

    return { ok: true, message: 'If that email exists, a reset link was sent' };
  }

  async resetPassword(token: string, password: string) {
    const row = await this.resetTokens.findOne({ where: { token, used: false } });
    if (!row || row.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset link');
    }

    const user = await this.users.findOne({ where: { email: row.email } });
    if (!user) {
      throw new BadRequestException('Invalid or expired reset link');
    }

    user.passwordHash = await this.hashPassword(password);
    await this.users.save(user);
    row.used = true;
    await this.resetTokens.save(row);
    await this.refreshTokens.delete({ userId: user.id });

    return { ok: true, message: 'Password updated' };
  }

  async refresh(refreshToken: string) {
    const row = await this.refreshTokens.findOne({ where: { token: refreshToken } });
    if (!row || row.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }
    const user = await this.users.findOne({ where: { id: row.userId } });
    if (!user) throw new UnauthorizedException('User not found');

    await this.refreshTokens.delete({ id: row.id });
    const accessToken = this.signAccessToken(user);
    const newRefresh = await this.createRefreshToken(user.id);
    return { accessToken, refreshToken: newRefresh, user: userPublicView(user) };
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      await this.refreshTokens.delete({ token: refreshToken });
    }
    return { ok: true };
  }
}
