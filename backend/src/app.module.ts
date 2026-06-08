import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditModule } from './audit/audit.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { buildTypeOrmOptions } from './database/typeorm.options';
import { MailModule } from './modules/mail/mail.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CoinsModule } from './modules/coins/coins.module';
import { OrdersModule } from './modules/orders/orders.module';
import { MetalsModule } from './modules/metals/metals.module';
import { InvestmentsModule } from './modules/investments/investments.module';
import { AdminModule } from './modules/admin/admin.module';
import { ContactModule } from './modules/contact/contact.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { HealthModule } from './modules/health/health.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { KycModule } from './modules/kyc/kyc.module';
import { ReferralsModule } from './modules/referrals/referrals.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MailModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(buildTypeOrmOptions()),
    DatabaseModule,
    AuditModule,
    AuthModule,
    UsersModule,
    CoinsModule,
    OrdersModule,
    MetalsModule,
    InvestmentsModule,
    AdminModule,
    ContactModule,
    DashboardModule,
    HealthModule,
    NotificationsModule,
    KycModule,
    ReferralsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
