import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { MetalsService } from '../metals/metals.service';
import { RedisService } from '../redis/redis.service';

@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource() private readonly db: DataSource,
    private readonly mail: MailService,
    private readonly metals: MetalsService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  async check() {
    let dbOk = false;
    let metalsOk = false;
    try {
      await this.db.query('SELECT 1');
      dbOk = true;
    } catch {
      dbOk = false;
    }
    try {
      const live = this.metals.getLive();
      metalsOk = live.length > 0;
    } catch {
      metalsOk = false;
    }
    const redisOk = await this.redis.ping();
    return {
      ok: dbOk,
      db: dbOk ? 'up' : 'down',
      mail: this.mail.mailMode(),
      redis: this.redis.status(),
      redisOk,
      metals: metalsOk ? 'up' : 'down',
      ws: 'socket.io',
      version: '1.2.0',
      timestamp: new Date().toISOString(),
    };
  }
}
