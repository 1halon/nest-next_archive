import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';
import wrtc from 'wrtc';

interface Client { }

@Injectable()
export class WrtcService {
    constructor() {
        this.clients = {};
    };

    public clients: Record<string, Client>;

    createClient(id: string, ws: WebSocket) {
        const client = {};

        return client;
    }
}