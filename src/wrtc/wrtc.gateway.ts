import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { randomUUID } from 'crypto';
import { Server, WebSocket } from 'ws';
import wrtc from 'wrtc';

const clients = {} as Record<string, { _id: string, wrtc: { candidates: [], channels: Record<string, RTCDataChannel>, connection: RTCPeerConnection }, ws: WebSocket }>;

@WebSocketGateway()
export class WrtcGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  private readonly server: Server;

  afterInit(server: Server) {

  }
  handleConnection(ws: WebSocket, ...args: any[]) {
    const id = randomUUID().split('-').join('');
    clients[id] = { _id: id, wrtc: { candidates: [], channels: {}, connection: new wrtc.RTCPeerConnection() }, ws }

    ws.send(JSON.stringify({ event: 'ID', id }));
    ws.onmessage = async (event) => {
      const message = await new Promise((resolve) => resolve(JSON.parse(event.data.toString()))).catch(() => event.data.toString()) as any;

      const { _id, wrtc: { candidates, channels, connection } } = clients[message._id];

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
    }
  }
  handleDisconnect(client: WebSocket) {

  }
}
