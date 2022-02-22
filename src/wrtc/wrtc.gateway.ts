import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway } from '@nestjs/websockets';
import { randomUUID } from 'crypto';
import { Server, WebSocket } from 'ws';
import wrtc from 'wrtc';
import { createWriteStream } from 'fs';
import { WrtcService } from './wrtc.service';

interface Client {
  id: string;
  wrtc: {
    candidates: RTCIceCandidate[];
    channels: Record<string, RTCDataChannel>;
    connection: RTCPeerConnection;
    streams: MediaStream[];
  };
  ws: WebSocket;
}

@WebSocketGateway()
export class WrtcGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  constructor(
    private readonly wrtcService: WrtcService
  ) { };

  private clients: Record<string, Client>;
  private readonly server: Server;

  afterInit(server: Server) {
    this.clients = {};
    //setInterval(() => console.log(Object.values(this.clients).map(client => client.wrtc)), 5000);
  }
  handleConnection(ws: WebSocket, ...args: any[]) {
    const id = randomUUID(),
      client = { id, wrtc: { candidates: [], channels: {}, connection: new wrtc.RTCPeerConnection(), streams: [] }, ws } as Client;
    this.clients[id] = client;

    const { wrtc: { candidates, connection, streams } } = client;

    connection.addEventListener('datachannel', ({ channel }) => {
      const channelName = `${channel.label}-${id}`;
      this.wrtcService.handleDataChannel(channel, {
        global: () => {
          Object.values(this.clients)
            .filter(client => client.id !== id)
            .forEach(client => {
              const { wrtc: { channels, connection } } = client;
              channels[channelName] = this.wrtcService.handleDataChannel(connection.createDataChannel(channelName));
            });
        },
        message: (data) => {
          if (!data || !(data instanceof ArrayBuffer)) return;
          Object.values(this.clients)
            .filter(client => client.id !== id)
            .filter(client => client.wrtc.channels[channelName])
            .map(client => client.wrtc.channels[channelName])
            .forEach(channel => channel.readyState === 'open' && channel.send(data));
        },
      })
    });

    connection.addEventListener('icecandidate', ({ candidate }) => {
      if (candidate)
        if (connection.connectionState === 'connected')
          ws.send(JSON.stringify({ event: 'ICECANDIDATE', candidate }));
        else candidates.push(candidate);
    });

    connection.addEventListener('track', ({ streams: _streams }) => {
      streams.push(..._streams);
      Object.values(this.clients)
        .filter(client => client.id !== id)
        .filter(client => client.wrtc.connection.connectionState === 'connected')
        .map(client => client.wrtc.connection)
        .forEach(connection => _streams
          .forEach(stream => stream.getTracks()
            .forEach(track => connection.addTrack(track, stream)))); // FIXME Tracks won't add to client's connection.
    });

    Object.values(this.clients)
      .filter(client => client.id !== id)
      .filter(client => client.wrtc.connection.connectionState === 'connected')
      .map(client => client.wrtc.streams)
      .forEach(streams => streams
        .forEach(stream => stream.getTracks()
          .forEach(track => connection.addTrack(track, stream)))); // FIXME Only 1 stream adds to client's connection.

    ws.addEventListener('message', async function ({ data }) {
      const message = await new Promise((resolve) => resolve(JSON.parse(data.toString()))).catch(() => data.toString()) as any;

      if (message.event === 'OFFER') {
        await connection.setRemoteDescription(message.sdp);
        await connection.setLocalDescription(await connection.createAnswer());
        ws.send(JSON.stringify({
          event: 'ANSWER',
          sdp: connection.localDescription
        }));
      } else if (message.event === 'ICECANDIDATE') {
        connection.addIceCandidate(message.candidate);
        candidates.forEach(candidate => ws.send(JSON.stringify({ event: 'ICECANDIDATE', candidate })));
      }
    });
  }
  handleDisconnect(ws: WebSocket) {
    const { id } = Object.values(this.clients).find(client => JSON.stringify(client.ws) === JSON.stringify(ws));
    if (id) delete this.clients[id];
  }
}
