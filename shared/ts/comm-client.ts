import ws from 'ws';
import wrtc from 'wrtc';
import { createWRTC, ops, WRTC } from './global';
import EventEmitter from 'events';
import { WS } from 'frontend/private/ts/global';

export interface CommClientOptions {
    'rtc-config'?: RTCConfiguration;
    target: 'CLIENT' | 'SERVER';
    transport?: 'DATACHANNEL' | 'DEFAULT';
}

export class CommClient extends EventEmitter {
    constructor(id: string, socket: SignalingSocket, options: CommClientOptions) {
        super();
        options = ops<CommClientOptions>(options, {
            'rtc-config': { type: 'object', default: {} },
            target: { type: 'string', properties: { required: true } },
            transport: { type: 'string', default: 'DEFAULT' }
        }, false);
        this.connection = createWRTC.apply(this, [options.target === 'CLIENT' ? RTCPeerConnection : wrtc.RTCPeerConnection, options['rtc-config']]);
        Object.defineProperties(this, {
            id: { value: id, writable: !1 },
            options: { value: options, writable: !1 },
        });
        this.socket = socket;

        socket.on('ANSWER', async (sdp) => await this.connection.setRemoteDescription(sdp).catch(e => void e));
        socket.on('BULK_ICECANDIDATES', (candidates) =>
            candidates.forEach(async candidate => await this.connection.addIceCandidate(candidate).catch(e => void e)));
        socket.on('ICECANDIDATE', async (candidate) => await this.connection.addIceCandidate(candidate).catch(e => void e));
        socket.on('OFFER', async (sdp) => this.connection.setRemoteDescription(sdp).then(async () => {
            await this.connection.setLocalDescription(await this.connection.createAnswer());
            socket.send({ event: 'ANSWER', data: { sdp: this.connection.localDescription } });
        }).catch(e => void e));
    };

    public connection: WRTC;
    public readonly id: string;
    public socket: SignalingSocket;

    private readonly options: CommClientOptions;
}

export enum SignalingSocketState { }

export interface SignalingSocketEvents extends SignalingSocketMessageEvents {
    close: [event: CloseEvent | ws.CloseEvent];
    error: [event: ErrorEvent | ws.ErrorEvent];
    message: [event: MessageEvent | ws.MessageEvent];
    open: [event: Event | ws.Event];
}

export interface SignalingSocketMessageEvents {
    ANSWER: [sdp: RTCSessionDescriptionInit];
    'BULK_ICECANDIDATES': [candidates: RTCIceCandidateInit[]];
    ICECANDIDATE: [candidate: RTCIceCandidate];
    OFFER: [sdp: RTCSessionDescriptionInit];
}

export interface SignalingSocketOptions {}

export class SignalingSocket extends EventEmitter {
    constructor(ws: WS | ws, options?: SignalingSocketOptions) {
        super();
        options = ops<SignalingSocketOptions>(options, { });
        Object.defineProperty(this, 'options', { value: options, writable: !1 });
        this.ws = ws as WS;

        for (const eventName of ['close', 'error', 'open'])
            this.ws.addEventListener(eventName, event => this.emit(eventName as keyof SignalingSocketEvents, event));

        this.ws.addEventListener('message', event => {
            let _event = event as any;
            try {
                _event.data = JSON.parse(event.data);
            } catch (error) { } finally {
                this.emit('message', event);
            }
        });

        this.on('message', ({ data: message }) => {
            typeof message === 'object'
                && !Array.isArray(message)
                && typeof message.event === 'string'
                //&& this.options.events.hasOwnProperty(message.event)
                && message.hasOwnProperty('data')
                && this.emit[message.event](message.data);
        });
    };

    public ws: WS | ws;

    private options: SignalingSocketOptions;

    public close(code?: number, reason?: string) {
        if (this.ws instanceof WebSocket) this.ws.close(code, reason);
        else (this.ws as ws).terminate();
    }

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