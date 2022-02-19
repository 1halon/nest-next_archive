import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway } from '@nestjs/websockets';
import { randomUUID } from 'crypto';
import { Server, WebSocket } from 'ws';
import wrtc from 'wrtc';
import { createWriteStream } from 'fs';

interface Client {
  id: string;
  wrtc: {
    candidates: [];
    channels: Record<string, RTCDataChannel>;
    connection: RTCPeerConnection
  };
  ws: WebSocket;
}

@WebSocketGateway()
export class WrtcGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  private clients: Record<string, Client>;
  private readonly server: Server;

  afterInit(server: Server) {
    this.clients = {};
  }
  handleConnection(ws: WebSocket, ...args: any[]) {
    const id = randomUUID(),
      client = { id, wrtc: { candidates: [], channels: {}, connection: new wrtc.RTCPeerConnection() }, ws } as Client;
    this.clients[id] = client;

    const { wrtc: { candidates, channels, connection } } = client;
    ws.addEventListener('message', async function ({ data }) {
      const message = await new Promise((resolve) => resolve(JSON.parse(data.toString()))).catch(() => data.toString()) as any;

      if (message.event === 'OFFER') {
        await connection.setRemoteDescription(message.sdp);
        await connection.setLocalDescription(await connection.createAnswer());
        ws.send(JSON.stringify({
          event: 'ANSWER',
          sdp: connection.localDescription
        }));
        candidates.forEach(candidate => ws.send(JSON.stringify({
          event: 'ICECANDIDATE',
          candidate
        })));
      } else if (message.event === 'ICECANDIDATE') {
        connection.addIceCandidate(message.candidate);
      }
    });
  }
  handleDisconnect(ws: WebSocket) {
    
  }
}
