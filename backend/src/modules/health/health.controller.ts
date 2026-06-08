import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { MailService } from '../mail/mail.service';

@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource() private readonly db: DataSource,
    private readonly mail: MailService,
  ) {}

  @Get()
  async check() {
    let dbOk = false;
    try {
      await this.db.query('SELECT 1');
      dbOk = true;
    } catch {
      dbOk = false;
    }
    return {
      ok: dbOk,
      db: dbOk ? 'up' : 'down',
      mail: this.mail.isConfigured() ? 'smtp' : 'dev-log',
      ws: 'socket.io',
      version: '1.1.0',
      timestamp: new Date().toISOString(),
    };
  }
}
