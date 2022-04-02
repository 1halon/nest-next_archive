import ws from 'ws';
import wrtc from 'wrtc';
import { createWRTC, ops, WRTC } from 'shared/ts/global';
import EventEmitter from 'events';

export enum ClientState {
    CONNECTING,
    CONNECTED,
    DISCONNECTED,
    RESUMING
}

export interface ClientOptions {
    target: 'CLIENT' | 'SERVER';
    transport?: 'DATACHANNEL' | 'DEFAULT';
}

export class Client extends EventEmitter {
    constructor(id: string, ws: WebSocket | ws, options?: ClientOptions) {
        super();
        options = ops<ClientOptions>(options, {
            target: { type: 'string', properties: { required: true } },
            transport: { type: 'string', default: 'DEFAULT' }
        }, false);
        this.connection = createWRTC.apply(this, [options.target === 'CLIENT' ? RTCPeerConnection : wrtc.RTCPeerConnection]);
        this.id = id;
        this.options = options;
        this.state = ClientState['CONNECTED'];
        this.ws = ws;
    };

    public static State = ClientState;

    public connection: WRTC;
    public readonly id: string;
    public options: ClientOptions;
    public state = ClientState['CONNECTING'];
    public ws: WebSocket | ws;

    disconnect() {
        this.connection.close();
        this.ws.close();
        this.state = ClientState['DISCONNECTED'];
    }

    resume() {
        this.state = ClientState['RESUMING'];

        this.state = ClientState['CONNECTED'];
    }

    send(data: any, cb?: (err?: Error) => void): void;
    send(
        data: any,
        options: { mask?: boolean | undefined; binary?: boolean | undefined; compress?: boolean | undefined; fin?: boolean | undefined },
        cb?: (err?: Error) => void,
    ): void;
    send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void;
    send(data) {
        if (typeof data === 'object') data = JSON.stringify(data);
        (this.options.target === 'CLIENT' ? WebSocket : ws).prototype.send.apply(this, [data].concat([...arguments].slice(1)));
    }
}