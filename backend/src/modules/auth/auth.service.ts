import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { User, userPublicView } from '../../database/entities/user.entity';
import { RefreshToken } from '../../database/entities/refresh-token.entity';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokens: Repository<RefreshToken>,
    private readonly jwt: JwtService,
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

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const phone = dto.phone?.trim() || null;

    const existing = await this.users.findOne({
      where: [{ email }, ...(phone ? [{ phone }] : [])],
    });
    if (existing) {
      throw new ConflictException('Email or phone already registered');
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
      personalId: dto.personalId?.trim() || null,
      mergeId: ids.mergeId,
      founderId: ids.founderId,
      brandLineId: ids.brandLineId,
      roles: ['user'],
      status: 'active',
      kycStatus: 'pending',
    });

    await this.users.save(user);
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
