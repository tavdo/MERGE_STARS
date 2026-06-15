import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { MetalsModule } from '../metals/metals.module';
import { HealthController } from './health.controller';

@Module({
  imports: [MailModule, MetalsModule],
  controllers: [HealthController],
})
export class HealthModule {}
