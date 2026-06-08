import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MetalsService } from './metals.service';

function parseCorsOrigins(raw: string | undefined): string[] | boolean {
  if (!raw?.trim()) return true;
  return raw.split(',').map((o) => o.trim()).filter(Boolean);
}

@WebSocketGateway({
  cors: { origin: parseCorsOrigins(process.env.FRONTEND_URL), credentials: true },
  transports: ['websocket', 'polling'],
})
export class MetalsGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly metals: MetalsService) {}

  afterInit() {
    this.metals.setGateway(this);
    this.broadcastPrices(this.metals.getLive());
  }

  handleConnection(client: Socket) {
    client.emit('metals:prices', this.metals.getLive());
  }

  broadcastPrices(data: unknown) {
    this.server?.emit('metals:prices', data);
  }
}
