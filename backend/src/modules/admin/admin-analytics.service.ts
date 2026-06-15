import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { Order } from '../../database/entities/order.entity';
import { CoinApplication } from '../../database/entities/coin-application.entity';
import { BrandLineProfile } from '../../database/entities/brand-line-profile.entity';
import { PlatformSettingsService } from '../settings/platform-settings.service';

const PAID_STATUSES = new Set(['paid', 'in_production', 'delivered', 'completed']);
const APPROVED_STATUSES = new Set(['approved', 'funds_received', 'production_queue', 'in_production', 'quality_check', 'ready', 'delivered']);

function monthKey(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key: string) {
  const [y, m] = key.split('-');
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleString('en-US', { month: 'short' });
}

function countryFromPhone(phone: string | null) {
  if (!phone) return 'Other';
  if (phone.startsWith('+995')) return 'Georgia';
  if (phone.startsWith('+1')) return 'USA';
  if (phone.startsWith('+44')) return 'UK';
  if (phone.startsWith('+49')) return 'Germany';
  return 'Other';
}

@Injectable()
export class AdminAnalyticsService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(CoinApplication) private readonly applications: Repository<CoinApplication>,
    @InjectRepository(BrandLineProfile) private readonly brandProfiles: Repository<BrandLineProfile>,
    private readonly settings: PlatformSettingsService,
  ) {}

  async dashboard() {
    const [userRows, orderRows, appRows, brandRows, platform] = await Promise.all([
      this.users.find(),
      this.orders.find(),
      this.applications.find(),
      this.brandProfiles.find(),
      this.settings.get(),
    ]);

    const totalUsers = userRows.length;
    const verifiedUsers = userRows.filter((u) => u.kycStatus === 'verified').length;
    const totalOrders = orderRows.length;
    const approvedApps = appRows.filter((a) => APPROVED_STATUSES.has(a.status)).length;
    const deliveredOrders = orderRows.filter((o) => o.status === 'delivered').length;
    const paidOrders = orderRows.filter((o) => PAID_STATUSES.has(o.status));
    const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.amount), 0);
    const platformFeeRate = 0.02;
    const platformFee = totalRevenue * platformFeeRate;

    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const prevMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));

    const usersThisMonth = userRows.filter((u) => u.createdAt >= monthStart).length;
    const usersPrevMonth = userRows.filter(
      (u) => u.createdAt >= prevMonthStart && u.createdAt < monthStart,
    ).length;
    const ordersThisMonth = orderRows.filter((o) => o.createdAt >= monthStart).length;
    const ordersPrevMonth = orderRows.filter(
      (o) => o.createdAt >= prevMonthStart && o.createdAt < monthStart,
    ).length;
    const revenueThisMonth = paidOrders
      .filter((o) => o.createdAt >= monthStart)
      .reduce((sum, o) => sum + Number(o.amount), 0);
    const revenuePrevMonth = paidOrders
      .filter((o) => o.createdAt >= prevMonthStart && o.createdAt < monthStart)
      .reduce((sum, o) => sum + Number(o.amount), 0);

    const qrScansMtd = brandRows.reduce((sum, b) => {
      if (b.updatedAt >= monthStart) return sum + b.qrScans;
      return sum;
    }, 0);

    const conversionRate = totalUsers ? (totalOrders / totalUsers) * 100 : 0;

    const pctChange = (current: number, previous: number) => {
      if (previous <= 0) return current > 0 ? '+100%' : '0%';
      const delta = ((current - previous) / previous) * 100;
      const sign = delta >= 0 ? '+' : '';
      return `${sign}${delta.toFixed(1)}%`;
    };

    const monthlyMap = new Map<string, { orders: number; revenue: number }>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      monthlyMap.set(monthKey(d), { orders: 0, revenue: 0 });
    }
    for (const o of orderRows) {
      const key = monthKey(o.createdAt);
      if (!monthlyMap.has(key)) continue;
      const bucket = monthlyMap.get(key)!;
      bucket.orders += 1;
      if (PAID_STATUSES.has(o.status)) bucket.revenue += Number(o.amount);
    }
    const monthly = [...monthlyMap.entries()].map(([key, v]) => ({
      month: monthLabel(key),
      orders: v.orders,
      revenue: Math.round(v.revenue),
    }));

    const countryCounts = new Map<string, number>();
    for (const u of userRows) {
      const c = countryFromPhone(u.phone);
      countryCounts.set(c, (countryCounts.get(c) ?? 0) + 1);
    }
    const countries = [...countryCounts.entries()]
      .map(([country, count]) => ({
        country,
        count,
        pct: totalUsers ? Math.round((count / totalUsers) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const brandCreated = brandRows.filter((b) => b.name?.trim()).length;
    const funnel = [
      { stage: 'Registered', count: totalUsers, pct: 100 },
      {
        stage: 'KYC Verified',
        count: verifiedUsers,
        pct: totalUsers ? Math.round((verifiedUsers / totalUsers) * 100) : 0,
      },
      {
        stage: 'Brand Created',
        count: brandCreated,
        pct: totalUsers ? Math.round((brandCreated / totalUsers) * 100) : 0,
      },
      {
        stage: 'Order Placed',
        count: totalOrders,
        pct: totalUsers ? Math.round((totalOrders / totalUsers) * 100) : 0,
      },
      {
        stage: 'Approved',
        count: approvedApps,
        pct: totalUsers ? Math.round((approvedApps / totalUsers) * 100) : 0,
      },
      {
        stage: 'Delivered',
        count: deliveredOrders,
        pct: totalUsers ? Math.round((deliveredOrders / totalUsers) * 100) : 0,
      },
    ];

    return {
      stats: [
        { label: 'TOTAL USERS', value: String(totalUsers), change: pctChange(usersThisMonth, usersPrevMonth), up: usersThisMonth >= usersPrevMonth, color: '#fff' },
        { label: 'VERIFIED USERS', value: String(verifiedUsers), change: pctChange(verifiedUsers, Math.max(verifiedUsers - usersThisMonth, 0)), up: true, color: '#22c55e' },
        { label: 'TOTAL ORDERS', value: String(totalOrders), change: pctChange(ordersThisMonth, ordersPrevMonth), up: ordersThisMonth >= ordersPrevMonth, color: '#c9a84c' },
        { label: 'APPROVED', value: String(approvedApps), change: '—', up: true, color: '#22c55e' },
        { label: 'CONVERSION RATE', value: `${conversionRate.toFixed(1)}%`, change: '—', up: true, color: '#60a5fa' },
        { label: 'QR SCANS (MTD)', value: String(qrScansMtd), change: '—', up: true, color: '#a78bfa' },
        { label: 'TOTAL REVENUE', value: `$${Math.round(totalRevenue).toLocaleString()}`, change: pctChange(revenueThisMonth, revenuePrevMonth), up: revenueThisMonth >= revenuePrevMonth, color: '#c9a84c' },
        { label: 'PLATFORM FEE', value: `$${Math.round(platformFee).toLocaleString()}`, change: pctChange(revenueThisMonth * platformFeeRate, revenuePrevMonth * platformFeeRate), up: true, color: '#f5d78e' },
      ],
      monthly,
      countries,
      funnel,
      shares: {
        platform: platform.platformShare,
        brand: platform.brandShare,
        referrer: platform.referrerShare,
      },
    };
  }
}
