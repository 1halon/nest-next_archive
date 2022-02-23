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

      if (message.event === 'ANSWER') {
        await connection.setRemoteDescription(message.sdp);
        if (candidates.length > 0) ws.send(JSON.stringify({ event: 'BULK_ICECANDIDATES', candidates }));
      }
      else if (message.event === 'BULK_ICECANDIDATES')
        message.candidates.forEach(candidate => connection.addIceCandidate(candidate).catch(e => void e));
      else if (message.event === 'ICECANDIDATE')
        connection.addIceCandidate(message.candidate).catch(e => void e);
      else if (message.event === 'OFFER') {
        const { id, sdp } = message;
        if (!this.wrtcService.getClient(id)) {
          client.id = id; this.wrtcService.saveClient(client, true);
        }

        await connection.setRemoteDescription(sdp).catch(e => void e);
        await connection.setLocalDescription(await connection.createAnswer());
        ws.send(JSON.stringify({ event: 'ANSWER', sdp: connection.localDescription }));
        if (candidates.length > 0) ws.send(JSON.stringify({ event: 'BULK_ICECANDIDATES', candidates }));
      }
    });
  }

  handleDisconnect(ws: WebSocket) {
    this.wrtcService.deleteClient(this.wrtcService.getClient(ws, true)?.id);
  }
}
