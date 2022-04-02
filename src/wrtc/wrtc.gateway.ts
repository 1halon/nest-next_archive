import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway } from '@nestjs/websockets';
import { randomUUID } from 'crypto';
import { IncomingMessage } from 'http';
import { ClientOptions } from 'shared/ts/client';
import { Server, WebSocket } from 'ws';
import { WrtcService } from './wrtc.service';

@WebSocketGateway()
export class WrtcGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  constructor(
    private readonly wrtcService: WrtcService
  ) { };

  private readonly server: Server;

  afterInit(server: Server) { }

  handleConnection(ws: WebSocket, request: IncomingMessage) {
    ws['id'] = request.headers['sec-websocket-key'];
    const query = new URLSearchParams(request?.url.split('/?')[1]), id = query.get('id') ?? randomUUID(),
      transport = query.get('transport') as ClientOptions['transport'];
    this.wrtcService.clients[id] = new WrtcService.Client(id, ws, { target: 'SERVER', transport: transport });
  }

  handleDisconnect(ws: WebSocket) {
    if (ws['id']) var filter = client => client.ws['id'] === ws['id'];
    else var filter = client => JSON.stringify(client.ws) === JSON.stringify(ws);
    if (filter) var client = Object.values(this.wrtcService.clients).find(filter);
    if (client instanceof WrtcService.Client) {
      client.disconnect(); delete this.wrtcService.clients[client.id];
    }
  }
}
