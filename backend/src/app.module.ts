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
import { User } from './database/entities/user.entity';
import { CoinApplication } from './database/entities/coin-application.entity';
import { Order } from './database/entities/order.entity';
import { MetalPrice } from './database/entities/metal-price.entity';
import { RefreshToken } from './database/entities/refresh-token.entity';
import { ContactMessage } from './database/entities/contact-message.entity';
import { Referral } from './database/entities/referral.entity';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? 'merge_stars',
      password: process.env.DB_PASSWORD ?? 'merge_stars',
      database: process.env.DB_NAME ?? 'merge_stars',
      entities: [
        User,
        CoinApplication,
        Order,
        MetalPrice,
        RefreshToken,
        ContactMessage,
        Referral,
      ],
      synchronize: process.env.DB_SYNC !== 'false',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    }),
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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
