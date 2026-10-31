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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { jwtSecret } from '../../config/security';

function parseCorsOrigins(raw: string | undefined): string[] | boolean {
  if (!raw?.trim()) return ['http://localhost:5173', 'http://localhost:8080'];
  return raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}

@WebSocketGateway({
  cors: {
    origin: parseCorsOrigins(process.env.FRONTEND_URL),
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayInit
{
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly notifications: NotificationsService,
    @InjectRepository(User) private readonly users: Repository<User>,
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
      const payload = this.jwt.verify<{ sub: string; exp: number }>(token, {
        secret: jwtSecret(),
      });
      const user = await this.users.findOne({ where: { id: payload.sub } });
      if (!user || user.status !== 'active' || !payload.exp) {
        client.disconnect();
        return;
      }
      client.join(`user:${payload.sub}`);
      client.data.userId = payload.sub;
      const expiry = setTimeout(
        () => client.disconnect(),
        Math.min(Math.max(0, payload.exp * 1000 - Date.now()), 2_147_483_647),
      );
      expiry.unref();
      client.once('disconnect', () => clearTimeout(expiry));
    } catch {
      client.disconnect();
    }
  }

  async emitToUser(userId: string, event: string, data: unknown) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user || user.status !== 'active') {
      this.server?.in(`user:${userId}`).disconnectSockets(true);
      return;
    }
    this.server?.to(`user:${userId}`).emit(event, data);
  }
}
