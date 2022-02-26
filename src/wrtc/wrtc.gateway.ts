import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway } from '@nestjs/websockets';
import { randomUUID } from 'crypto';
import { Server, WebSocket } from 'ws';
import wrtc from 'wrtc';
import { createWriteStream } from 'fs';
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
    const client = this.wrtcService.createClient(ws), { wrtc: { candidates, connection } } = client;

    ws.addEventListener('message', async ({ data }) => {
      const message = await new Promise((resolve) => resolve(JSON.parse(data.toString()))).catch(() => data.toString()) as any;
    });
  }

  handleDisconnect(ws: WebSocket) {
    this.wrtcService.deleteClient(this.wrtcService.getClient(ws, true)?.id);
  }
}
