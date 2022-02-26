import { v4 } from 'uuid';

export class Logger {
    constructor(title?: string) {
        this.title = title;
    }
    private title;

    debug(message: any, args?: any[], title?: string);
    debug(data: { args: [], message: any, title?: string });
    debug(p0, p1?, p2?) {
        const data = { args: [], message: '', title: this.title } as any;
        switch (typeof p0) {
            case 'object':
                if (objectsHaveSameKeys(p0, data))
                    Object.keys(p0).forEach(key => data[key] = p0[key]);
                else _default(this.title);

                function objectsHaveSameKeys(...objects) {
                    let union = new Set();
                    union = objects.reduce((keys, object) => keys.add(Object.keys(object)), union);
                    if (union.size === 0) return true
                    if (!objects.every((object) => union.size === Object.keys(object).length)) return false

                    for (let key of union.keys() as IterableIterator<any>) {
                        let res = objects.map((o) => (typeof o[key] === 'object' ? o[key] : {}))
                        if (!objectsHaveSameKeys(...res)) return false;
                    }
                    return true
                }
                break;

            default:
                _default(this.title);
                break;
                function _default(title) {
                    data.args = p1 ?? []; data.message = p0 ?? ''; data.title = p2 ?? title;
                }
        }

        console.log(`%c[${data.title}]`, 'color: purple;', data.message, ...data.args);
    }

    error() { console.error.apply(this, arguments); }

    log() { console.log.apply(this, arguments); }

    warn() { console.warn.apply(this, arguments); }
}

export class WS extends WebSocket {
    constructor(url: string | URL, options?: WSOptions) {
        super(url, options?.protocols ?? []);
        this.events = {};
        this.options = this.#options(options);
        if (this.options.debug) {
            const start = Date.now();
            this.logger = new Logger(`WS${typeof options?.debug === 'string' && options?.debug !== '' ? `<${options?.debug}>` : ''}`);
            this.logger.debug(`[CONNECT] ${url}`);

            this.addEventListener('close', () => this.logger.debug(`[CLOSED] ${url}`));
            this.addEventListener('message', async ({ data }) =>
                this.logger.debug('[RECEIVE]', [await new Promise((resolve) => resolve(JSON.parse(data))).catch(() => data) as any]));
            this.addEventListener('open', () => this.logger.debug(`[CONNECTED] ${url} in ${Date.now() - start} ms`));
        }

        this.addEventListener('message', async ({ data }) => {
            const message = await new Promise((resolve) => resolve(JSON.parse(data))).catch(() => data) as any;

            !Array.isArray(message)
                && typeof message === 'object'
                && typeof message.event === 'string'
                && this.events.hasOwnProperty(message.event)
                && message.hasOwnProperty('data')
                && this.events[message.event](message.data);
        });
    }

    private events: any;
    public logger: Logger | null;
    public options: WSOptions;

    #options(options: WSOptions) {
        if (Array.isArray(options) || typeof options !== 'object') options = {};
        if (typeof options.debug !== 'boolean' || typeof options.debug !== 'string') Object.defineProperty(options, 'debug', { value: false });
        if (Array.isArray(options.protocols) || typeof options.protocols !== 'string') Object.defineProperty(options, 'protocols', { value: [] });

        return options;
    }

    close(code?: number, reason?: string): void {
        if (this.options.debug) this.logger.debug(`[CLOSED] ${this.url}`);
        WebSocket.prototype.send.apply(this, [code, reason]);
    }

    on<T extends keyof WSEvents>(event: T, handler: (data: WSEvents[T]) => void) {
        this.events[event] = handler;
    }

    send(data: string | object | ArrayBufferLike | Blob | ArrayBufferView): void {
        if (this.options.debug) this.logger.debug('[SEND]', [data]);
        if (typeof data === 'object') data = JSON.stringify(data);
        WebSocket.prototype.send.apply(this, [data]);
    }
}

interface WSEvents {
    ANSWER: { sdp: RTCSessionDescriptionInit };
    'BULK_ICECANDIDATES': { candidates: RTCIceCandidateInit[] };
    ICECANDIDATE: { candidate: RTCIceCandidate };
    OFFER: { sdp: RTCSessionDescriptionInit };
}

export class RTCConnection {
    constructor(options: RTCConnectionOptions, ws_options?: WSOptions) {
        this.audio_context;
        this.connection = this.createConnection();
        this.id = v4();
        this.logger = new Logger('RTCConnection');
        this.ws = new WS(options.gateway, Object.assign(ws_options ?? {}, { debug: 'RTCConnection' }));

        this.ws.on('ANSWER', async ({ sdp }) => await this.connection.setRemoteDescription(sdp).catch(e => void e));
        this.ws.on('BULK_ICECANDIDATES', async ({ candidates }) =>
            candidates.forEach(async candidate => await this.connection.addIceCandidate(candidate).catch(e => void e)));
        this.ws.on('ICECANDIDATE', async ({ candidate }) => await this.connection.addIceCandidate(candidate).catch(e => void e));
        this.ws.on('OFFER', async ({ sdp }) => this.connection.setRemoteDescription(sdp).then(async () => {
            await this.connection.setLocalDescription(await this.connection.createAnswer());
            this.ws.send({ event: 'ANSWER', data: { sdp: this.connection.localDescription } });
        }));
    };

    public audio_context: AudioContext;
    public connection: RTCPeerConnection;
    public id: string;
    public logger: Logger;
    public ws: WS;

    createConnection(configuration?: RTCConfiguration) {
        const connection = new RTCPeerConnection(configuration), candidates = [];

        connection.addEventListener('datachannel', async () => {
            // TODO
        });
        connection.addEventListener('icecandidate', async ({ candidate }) =>
            candidate &&
                connection.connectionState === 'connected' ?
                this.ws.send({ event: 'ICECANDIDATE', data: { candidate } }) :
                candidates.push(candidate));
        let negotiation_status = false;
        connection.addEventListener('negotiationneeded', async () => {
            if (!negotiation_status) {
                negotiation_status = true;
                await this.connection.setLocalDescription(await this.connection.createOffer());
                this.ws.send({ event: 'OFFER', data: { sdp: this.connection.localDescription } });
                negotiation_status = false;
            }
        });
        connection.addEventListener('track', async ({ streams }) => {
            //TODO
        });

        return connection;
    }
}

export function injectClassNames(object: object) {
    if (!Array.isArray(object) && typeof object === 'object')
        for (const key of Object.keys(object))
            for (const element of [...document.getElementsByClassName(key)]) {
                element.classList.remove(key); element.classList.add(object[key]);
            }
}

interface WSOptions {
    debug?: boolean | string;
    protocols?: string | string[];
}

interface RTCConnectionOptions {
    gateway: string;
}

window.AudioContext = window.AudioContext || window['webkitAudioContext'];
window['logger'] = new Logger('Window');