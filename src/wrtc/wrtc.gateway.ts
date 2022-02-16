import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { randomUUID } from 'crypto';
import { Server, WebSocket } from 'ws';
import wrtc from 'wrtc';

const clients = {} as Record<string, RTCPeerConnection>;

@WebSocketGateway()
export class WrtcGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  private readonly server: Server;

  afterInit(server: Server) {

  }
  handleConnection(client: WebSocket, ...args: any[]) {
    const id = randomUUID().split('-').join(''),
      rtc = new wrtc.RTCPeerConnection();
      
    clients[id] = rtc;
    client.send(JSON.stringify({ event: 'ID', id }));
    client.onmessage = async (event) => {
      const message = await new Promise((resolve) => resolve(JSON.parse(event.data.toString()))).catch(() => event.data.toString()) as any;

      const rtc = clients[message._id];

      if (message.event === 'OFFER') {
        await rtc.setRemoteDescription(message.offer);
        await rtc.setLocalDescription(await rtc.createAnswer());
        client.send(JSON.stringify({
          event: 'ANSWER',
          answer: rtc.localDescription
        }));
      }
    }
  }
  handleDisconnect(client: WebSocket) {

  }
}
