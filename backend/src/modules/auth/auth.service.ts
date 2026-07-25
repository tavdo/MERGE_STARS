import {
  BadRequestException,
  ConflictException,
  Injectable,
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
import { PhoneVerificationCode } from '../../database/entities/phone-verification-code.entity';
import { MailService } from '../mail/mail.service';
import { ReferralsService } from '../referrals/referrals.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SmsService } from '../sms/sms.service';
import { PlatformSettingsService } from '../settings/platform-settings.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokens: Repository<RefreshToken>,
    @InjectRepository(EmailVerificationCode)
    private readonly emailCodes: Repository<EmailVerificationCode>,
    @InjectRepository(PasswordResetToken)
    private readonly resetTokens: Repository<PasswordResetToken>,
    @InjectRepository(PhoneVerificationCode)
    private readonly phoneCodes: Repository<PhoneVerificationCode>,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
    private readonly sms: SmsService,
    private readonly referrals: ReferralsService,
    private readonly notifications: NotificationsService,
    private readonly platformSettings: PlatformSettingsService,
  ) {}

  private async hashPassword(password: string) {
    return bcrypt.hash(password, 12);
  }

  /** Laravel / PHP bcrypt uses $2y$; Node bcrypt expects $2a$ or $2b$ */
  private normalizeBcryptHash(hash: string) {
    if (!hash) return hash;
    return hash.replace(/^\$2y\$/, '$2b$').replace(/^\$2a\$/, '$2b$');
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
    } catch {
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

  async sendPhoneVerificationCode(phone: string) {
    const normalized = phone.trim();
    if (!/^\+[1-9]\d{7,14}$/.test(normalized)) {
      throw new BadRequestException('Enter phone in international format, e.g. +9955…');
    }

    const recent = await this.phoneCodes.findOne({
      where: { phone: normalized },
      order: { createdAt: 'DESC' },
    });
    if (recent && Date.now() - recent.createdAt.getTime() < 60_000) {
      throw new BadRequestException('Please wait 60 seconds before requesting a new code');
    }

    await this.phoneCodes.delete({ phone: normalized });
    const code = String(randomInt(100000, 999999));
    const expiresAt = new Date(Date.now() + 15 * 60_000);

    try {
      await this.sms.sendVerificationCode(normalized, code);
    } catch {
      throw new ServiceUnavailableException(
        'Could not send SMS verification code. Please try again shortly.',
      );
    }

    await this.phoneCodes.save(
      this.phoneCodes.create({ phone: normalized, code, expiresAt, used: false }),
    );
    return { ok: true, message: 'Verification code sent' };
  }

  private async consumePhoneVerificationCode(phone: string, code: string) {
    const normalized = phone.trim();
    const row = await this.phoneCodes.findOne({
      where: { phone: normalized, code, used: false },
      order: { createdAt: 'DESC' },
    });
    if (!row || row.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired phone verification code');
    }
    row.used = true;
    await this.phoneCodes.save(row);
  }

  async googleLogin(idToken: string, referralCode?: string, referralSource?: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    if (!clientId) {
      throw new ServiceUnavailableException('Google sign-in is not configured');
    }

    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!res.ok) throw new UnauthorizedException('Invalid Google token');

    const data = (await res.json()) as {
      aud?: string;
      email?: string;
      email_verified?: string;
      given_name?: string;
      family_name?: string;
      sub?: string;
    };

    if (data.aud !== clientId || data.email_verified !== 'true' || !data.email) {
      throw new UnauthorizedException('Google account could not be verified');
    }

    const email = data.email.toLowerCase();
    let user = await this.users.findOne({ where: { email } });

    if (!user) {
      const ids = await this.nextUserIds();
      user = this.users.create({
        email,
        phone: null,
        passwordHash: await this.hashPassword(randomBytes(24).toString('hex')),
        firstName: data.given_name?.trim() || 'Google',
        lastName: data.family_name?.trim() || 'User',
        personalId: null,
        mergeId: ids.mergeId,
        founderId: ids.founderId,
        brandLineId: ids.brandLineId,
        roles: ['user'],
        status: 'active',
        kycStatus: 'pending',
        termsAcceptedAt: new Date(),
      });
      await this.users.save(user);
      await this.referrals.attachReferral(user, referralCode, referralSource);
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

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const phone = dto.phone?.trim() || null;

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

    const emailVerify = process.env.EMAIL_VERIFY !== 'false';
    if (emailVerify) {
      if (!dto.verificationCode?.trim()) {
        throw new BadRequestException('Email verification code is required');
      }
      await this.consumeVerificationCode(email, dto.verificationCode.trim());
    }

    const smsVerify = process.env.SMS_VERIFY === 'true';
    if (smsVerify && phone) {
      if (!dto.phoneVerificationCode?.trim()) {
        throw new BadRequestException('Phone verification code is required');
      }
      await this.consumePhoneVerificationCode(phone, dto.phoneVerificationCode.trim());
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
      // Filled later by KYC review/OCR from the uploaded identity card.
      personalId: null,
      mergeId: ids.mergeId,
      founderId: ids.founderId,
      brandLineId: ids.brandLineId,
      roles: ['user'],
      status: 'active',
      kycStatus: (await this.platformSettings.get()).autoVerify ? 'verified' : 'pending',
      termsAcceptedAt: new Date(),
    });

    await this.users.save(user);
    await this.referrals.attachReferral(user, dto.referralCode, dto.referralSource);
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
      const recent = await this.resetTokens.findOne({
        where: { email: normalized },
        order: { createdAt: 'DESC' },
      });
      if (recent && Date.now() - recent.createdAt.getTime() < 60_000) {
        throw new BadRequestException('Please wait 60 seconds before requesting a new code');
      }

      await this.resetTokens.delete({ email: normalized });
      const code = String(randomInt(100000, 999999));
      const expiresAt = new Date(Date.now() + 15 * 60_000);

      await this.resetTokens.save(
        this.resetTokens.create({ email: normalized, token: code, expiresAt, used: false }),
      );

      try {
        await this.mail.sendPasswordResetCode(normalized, code);
      } catch {
        throw new ServiceUnavailableException(
          'Could not send password reset email. Please try again in a minute.',
        );
      }
    }

    return { ok: true, message: 'If that email is registered, a reset code was sent' };
  }

  async resetPassword(token: string, password: string, email?: string) {
    const isCode = /^\d{6}$/.test(token);
    let row: PasswordResetToken | null;
    if (isCode) {
      const normalized = email?.trim().toLowerCase();
      if (!normalized) {
        throw new BadRequestException('Email is required with reset code');
      }
      row = await this.resetTokens.findOne({
        where: { email: normalized, token, used: false },
        order: { createdAt: 'DESC' },
      });
    } else {
      row = await this.resetTokens.findOne({ where: { token, used: false } });
    }
    if (!row || row.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset code');
    }

    const user = await this.users.findOne({ where: { email: row.email } });
    if (!user) {
      throw new BadRequestException('Invalid or expired reset code');
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
