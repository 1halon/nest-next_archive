import ws from 'ws';
import wrtc from 'wrtc';
import { createWRTC, ops, WRTC } from 'shared/ts/global';
import EventEmitter from 'events';

export interface CommClientOptions {
    'rtc-config'?: RTCConfiguration;
    target: 'CLIENT' | 'SERVER';
    transport?: 'DATACHANNEL' | 'DEFAULT';
}

export class CommClient extends EventEmitter {
    constructor(id: string, socket: SignalingSocket, options?: CommClientOptions) {
        super();
        options = ops<CommClientOptions>(options, {
            'rtc-config': { type: 'object', default: {} },
            target: { type: 'string', properties: { required: true } },
            transport: { type: 'string', default: 'DEFAULT' }
        }, false);
        this.connection = createWRTC.apply(this, [options.target === 'CLIENT' ? RTCPeerConnection : wrtc.RTCPeerConnection, options['rtc-config']]);
        this.id = id;
        this.options = options;
        this.socket = socket;
    };

    public connection: WRTC;
    public readonly id: string;
    public socket: SignalingSocket;

    private options: CommClientOptions;
}

export enum SignalingSocketState { }

export interface SignalingSocketEvents { }

export interface SignalingSocketOptions { }

export class SignalingSocket extends EventEmitter {
    constructor(ws: WebSocket | ws, options?: SignalingSocketOptions) {
        super();
        options = ops<SignalingSocketOptions>(options, {});
        this.options = options;
        this.ws = ws;
    }

    public state: SignalingSocketState;
    public ws: WebSocket | ws;

    private options: SignalingSocketOptions;

    public emit<K extends keyof SignalingSocketEvents>(eventName: K, ...args: SignalingSocketEvents[K]): boolean {
        return EventEmitter.prototype.emit.apply(this, arguments);
    }

    public on<K extends keyof SignalingSocketEvents>(eventName: K, listener: (...args: SignalingSocketEvents[K]) => void): this {
        return EventEmitter.prototype.on.apply(this, arguments);
    }

    public send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void;
    public send(data: any, cb?: (err?: Error) => void): void;
    public send(data: any, options: { mask?: boolean; binary?: boolean; compress?: boolean; fin?: boolean; }, cb?: (err?: Error) => void): void;
    public send(data: any, options?: any, cb?: any): void {
        if (typeof data === 'object') data = JSON.stringify(data);
        // @ts-ignore
        this.ws.send(data, options, cb);
    }
}