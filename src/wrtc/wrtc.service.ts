import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { WebSocket } from 'ws';
import wrtc from 'wrtc';

@Injectable()
export class WrtcService {
    constructor() {
        this.clients = {};
    }

    public clients: Record<string, Client>;

    createClient(ws: WebSocket, id?: string): Client {
        id = id ?? randomUUID();
        const client = {
            id,
            wrtc: {
                candidates: [],
                connection: new wrtc.RTCPeerConnection(),
                streams: []
            },
            ws
        } as Client, { wrtc: { candidates, connection, streams } } = client;

        connection.addEventListener('icecandidate', ({ candidate }) => {
            if (candidate)
                if (connection.connectionState === 'connected')
                    ws.send(JSON.stringify({ event: 'ICECANDIDATE', candidate }));
                else candidates.push(candidate);
        });
        let negotiation_status = 'NEEDED';
        connection.addEventListener('negotiationneeded', async () => {
            if (negotiation_status !== 'IN_PROGRESS') {
                negotiation_status = 'IN_PROGRESS';
                await connection.setLocalDescription(await connection.createOffer());
                ws.send(JSON.stringify({ id: id, event: 'OFFER', sdp: connection.localDescription }));
                negotiation_status = 'DONE';
            }
        });
        connection.addEventListener('track', ({ streams: _streams }) => {
            streams.push(..._streams);
            Object.values(this.clients)
                .filter(client => client.id !== id)
                .filter(client => client.wrtc.connection.connectionState === 'connected')
                .map(client => client.wrtc.connection)
                .forEach(connection => _streams
                    .forEach(stream => stream.getTracks()
                        .forEach(track =>
                            connection.addTransceiver(track, { direction: 'sendonly', streams: [stream] }))));
        });

        Object.values(this.clients)
            .filter(client => client.id !== id)
            .filter(client => client.wrtc.connection.connectionState === 'connected')
            .map(client => client.wrtc.streams)
            .forEach(streams => streams
                .forEach(stream => stream.getTracks()
                    .forEach(track => connection.addTransceiver(track, { direction: 'sendonly', streams: [stream] }))));

        return client;
    }

    deleteClient(id: string) {
        delete this.clients[id];
    }

    getClient(id: string, fetch?: false): boolean;
    getClient(id: string, fetch?: true): Client;
    getClient(ws: WebSocket, fetch?: false): boolean;
    getClient(ws: WebSocket, fetch?: true): Client;
    getClient(p0: string | WebSocket, fetch?: boolean) {
        if (typeof p0 === 'string') var client = this.clients[p0];
        else var client = Object.values(this.clients).find(client => JSON.stringify(client.ws) === JSON.stringify(p0));
        return client ? (fetch ? client : true) : false;
    }

    saveClient(client: Client, overwrite?: boolean) {
        this.clients[client.id] = client;
    }
}

export interface Client {
    id: string;
    wrtc: {
        candidates: RTCIceCandidate[];
        connection: RTCPeerConnection;
        streams: MediaStream[];
    };
    ws: WebSocket;
}
