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
