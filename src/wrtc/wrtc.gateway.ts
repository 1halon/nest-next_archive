import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway } from '@nestjs/websockets';
import { randomUUID } from 'crypto';
import { Server, WebSocket } from 'ws';
import { WrtcService } from './wrtc.service';

@WebSocketGateway()
export class WrtcGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  constructor(
    private readonly wrtcService: WrtcService
  ) { };

  private readonly server: Server;

  afterInit(server: Server) {

  }

  handleConnection(ws: WebSocket, ...args: any[]) {
    const query = new URLSearchParams(args[0]?.url.split('/?')[1]),
      id = query.get('id') ?? randomUUID();
    this.wrtcService.clients[id] = this.wrtcService.createClient(id, ws);
  }

  handleDisconnect(ws: WebSocket) {

  }
}
