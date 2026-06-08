import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Notification,
  notificationView,
} from '../../database/entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';

export interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  body: string;
  meta?: Record<string, unknown> | null;
}

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private gateway: NotificationsGateway | null = null;

  constructor(
    @InjectRepository(Notification)
    private readonly notifications: Repository<Notification>,
  ) {}

  onModuleInit() {
    /* gateway wired via setGateway after module init */
  }

  setGateway(gateway: NotificationsGateway) {
    this.gateway = gateway;
  }

  async create(input: CreateNotificationInput) {
    const row = this.notifications.create({
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      meta: input.meta ?? null,
      read: false,
    });
    await this.notifications.save(row);
    const view = notificationView(row);
    try {
      this.gateway?.emitToUser(input.userId, 'notification:new', view);
    } catch (err) {
      this.logger.warn(`WS emit failed: ${String(err)}`);
    }
    return view;
  }

  async listForUser(userId: string, limit = 50) {
    const rows = await this.notifications.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: Math.min(limit, 100),
    });
    return rows.map(notificationView);
  }

  async unreadCount(userId: string) {
    return this.notifications.count({ where: { userId, read: false } });
  }

  async markRead(userId: string, id: string) {
    const row = await this.notifications.findOne({ where: { id, userId } });
    if (!row) return null;
    row.read = true;
    await this.notifications.save(row);
    return notificationView(row);
  }

  async markAllRead(userId: string) {
    await this.notifications.update({ userId, read: false }, { read: true });
    return { ok: true };
  }
}
