import ws from 'ws';
import wrtc from 'wrtc';
import { createWRTC, ops, WRTC } from 'shared/ts/global';
import EventEmitter from 'events';

export enum CommClientState {
    CONNECTING,
    CONNECTED,
    DISCONNECTED
}

export interface CommClientOptions {
    'rtc-config': RTCConfiguration;
    target: 'CLIENT' | 'SERVER';
    transport?: 'DATACHANNEL' | 'DEFAULT';
}

export class CommClient extends EventEmitter {
    constructor(id: string, ws: WebSocket | ws, options?: CommClientOptions) {
        super();
        options = ops<CommClientOptions>(options, {
            'rtc-config': { type: 'object', default: {} },
            target: { type: 'string', properties: { required: true } },
            transport: { type: 'string', default: 'DEFAULT' }
        }, false);
        this.connection = createWRTC.apply(this, [options.target === 'CLIENT' ? RTCPeerConnection : wrtc.RTCPeerConnection, options['rtc-config']]);
        this.id = id;
        this.options = options;
        this.state = CommClientState['CONNECTED'];
        this.ws = ws;
    };

    public static State = CommClientState;

    public connection: WRTC;
    public readonly id: string;
    public options: CommClientOptions;
    public state = CommClientState['CONNECTING'];
    public ws: WebSocket | ws;

    disconnect() {
        this.connection.close();
        this.ws.close();
        this.state = CommClientState['DISCONNECTED'];
    }
}