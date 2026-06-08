import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { NotificationsService } from './notifications.service';

function parseCorsOrigins(raw: string | undefined): string[] | boolean {
  if (!raw?.trim()) return true;
  return raw.split(',').map((o) => o.trim()).filter(Boolean);
}

@WebSocketGateway({
  cors: { origin: parseCorsOrigins(process.env.FRONTEND_URL), credentials: true },
  transports: ['websocket', 'polling'],
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayInit {
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly notifications: NotificationsService,
  ) {}

  afterInit() {
    this.notifications.setGateway(this);
  }

  async handleConnection(client: Socket) {
    const token = (client.handshake.auth as { token?: string })?.token;
    if (!token) {
      client.disconnect();
      return;
    }
    try {
      const payload = this.jwt.verify<{ sub: string }>(token, {
        secret: process.env.JWT_SECRET ?? 'merge-stars-dev-secret-change-me',
      });
      client.join(`user:${payload.sub}`);
      client.data.userId = payload.sub;
    } catch {
      client.disconnect();
    }
  }

  emitToUser(userId: string, event: string, data: unknown) {
    this.server?.to(`user:${userId}`).emit(event, data);
  }
}
