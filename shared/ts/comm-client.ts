import ws from 'ws';
import wrtc from 'wrtc';
import { ops } from './global';
import EventEmitter from 'events';
import { WS } from 'frontend/private/ts/global';

export interface WRTC extends RTCPeerConnection {
    candidates: RTCIceCandidate[];
    channels: Record<string, RTCDataChannel>;
    negotiation_status: boolean;
}

function createWRTC(p0, configuration?: RTCConfiguration): WRTC {
    const connection = new p0(configuration) as WRTC,
        candidates = connection.candidates = [],
        channels = connection.channels = {};
    let negotiation_status = connection.negotiation_status = !1;

    // TODO
    connection.addEventListener('connectionstatechange', async () => {

    });
    // TODO
    connection.addEventListener('datachannel', async ({ channel }) => {
        channel.addEventListener('close', async () => delete channels[channel.label]);
        channel.addEventListener('error', async () => {

        });
        channel.addEventListener('message', async ({ data, origin, ports, source }) => {

        });
        channel.addEventListener('open', async () => channels[channel.label] = channel);
    });
    connection.addEventListener('icecandidate', async ({ candidate }) =>
        candidate &&
            connection.connectionState === 'connected' ?
            this.socket.send({ event: 'ICECANDIDATE', data: { candidate } }) :
            candidates.push(candidate));
    connection.addEventListener('negotiationneeded', async () => {
        if (!negotiation_status) {
            negotiation_status = !0;
            await this.connection.setLocalDescription(await this.connection.createOffer());
            this.socket.send({ event: 'OFFER', data: { sdp: this.connection.localDescription } });
            negotiation_status = !1;
        }
    });
    // TODO
    connection.addEventListener('track', async ({ streams }) => {

    });

    return connection;
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

export interface SignalingSocketOptions { }

class SignalingSocket extends EventEmitter {
    constructor(ws: WS | ws, options?: SignalingSocketOptions) {
        super();
        options = ops<SignalingSocketOptions>(options, {});
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

    private readonly options: SignalingSocketOptions;

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
            target: { type: 'string', properties: { required: !0 } },
            transport: { type: 'string', default: 'DEFAULT' }
        }, false);
        this.connection = createWRTC.apply(this, [options.target === 'CLIENT' ? RTCPeerConnection : wrtc.RTCPeerConnection, options['rtc-config']]);
        Object.defineProperties(this, {
            id: { value: id, writable: !1 },
            options: { value: options, writable: !1 },
        });
        this.socket = socket.on('ANSWER', async (sdp) => await this.connection.setRemoteDescription(sdp).catch(e => void e))
            .on('BULK_ICECANDIDATES', (candidates) =>
                candidates.forEach(async candidate => await this.connection.addIceCandidate(candidate).catch(e => void e)))
            .on('ICECANDIDATE', async (candidate) => await this.connection.addIceCandidate(candidate).catch(e => void e))
            .on('OFFER', async (sdp) => this.connection.setRemoteDescription(sdp).then(async () => {
                await this.connection.setLocalDescription(await this.connection.createAnswer());
                socket.send({ event: 'ANSWER', data: { sdp: this.connection.localDescription } });
            }).catch(e => void e));
    };

    public static SignalingSocket = SignalingSocket;

    private static createWRTC = createWRTC;

    public connection: WRTC;
    public readonly id: string;
    public socket: SignalingSocket;

    private readonly options: CommClientOptions;
}
