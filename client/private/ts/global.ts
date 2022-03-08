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

interface WSEventMap {
    ANSWER: { sdp: RTCSessionDescriptionInit };
    'BULK_ICECANDIDATES': { candidates: RTCIceCandidateInit[] };
    ICECANDIDATE: { candidate: RTCIceCandidate };
    OFFER: { sdp: RTCSessionDescriptionInit };
}

interface WSOptions {
    debug?: boolean | string;
    protocols?: string | string[];
}

export class WS extends WebSocket {
    constructor(url: string | URL, options?: WSOptions) {
        super(url, options?.protocols ?? []);
        this.events = {};
        Object.defineProperty(this, 'options', { value: this.#options(options), writable: false });
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
    private readonly options: WSOptions;

    #options(options: WSOptions) {
        const default_options = { debug: false, protocols: [] } as WSOptions;
        if (Array.isArray(options) || typeof options !== 'object') options = default_options;
        if (typeof options.debug !== 'boolean' || typeof options.debug !== 'string') options.debug = default_options.debug;
        Object.defineProperty(options, 'debug', { value: options.debug, writable: false });
        if (Array.isArray(options.protocols) || typeof options.protocols !== 'string') options.protocols = default_options.protocols;
        Object.defineProperty(options, 'protocols', { value: options.protocols, writable: false });
        return options;
    }

    close(code?: number, reason?: string): void {
        if (this.options.debug) this.logger.debug(`[CLOSED] ${this.url}`);
        WebSocket.prototype.send.apply(this, [code, reason]);
    }

    on<T extends keyof WSEventMap>(event: T, handler: (data: WSEventMap[T]) => void) {
        this.events[event] = handler;
    }

    send(data: string | object | ArrayBufferLike | Blob | ArrayBufferView): void {
        if (this.options.debug) this.logger.debug('[SEND]', [data]);
        if (typeof data === 'object') data = JSON.stringify(data);
        WebSocket.prototype.send.apply(this, [data]);
    }
}

interface AudioInfo {
    dB: number;
    dB_difference: number;
    last_dB: number;
    last_dBs: number[] | [number, number, number, number, number];
    speaking: boolean;
    thresholds: { dynamic: number, static: number };
}

interface RTCCOptions {
    gateway: string;
    transport?: 'DATACHANNEL' | 'DEFAULT';
}

interface Audio {
    _: {
        analyser: AnalyserNode;
        duplicated_track: MediaStreamTrack;
        func: Function;
        interval: number | typeof setInterval;
        source: MediaStreamAudioSourceNode;
        stream: MediaStream;
        track: MediaStreamTrack;
    }
    context: AudioContext;
    info: AudioInfo
}

export class RTCConnection {
    constructor(options: RTCCOptions, ws_options?: WSOptions) {
        this.audio = {
            _: {
                analyser: null,
                duplicated_track: null,
                func: null,
                interval: null,
                source: null,
                stream: null,
                track: null
            },
            context: null,
            info: {
                dB: -100,
                dB_difference: 0,
                last_dB: -100,
                last_dBs: new Array(5).fill(-100, 0, 5),
                speaking: !1,
                thresholds: { dynamic: -60, static: -60 }
            }
        };
        this.connection = this.createConnection();
        Object.defineProperty(this, 'id', { value: v4(), writable: !1 });
        this.logger = new Logger('RTCConnection');
        Object.defineProperty(this, 'options', { value: this.#options(options), writable: !1 });
        this.ws = new WS(options.gateway, Object.assign(ws_options ?? {}, { debug: 'RTCConnection' }));
        this.ws.on('ANSWER', async ({ sdp }) => await this.connection.setRemoteDescription(sdp).catch(e => void e));
        this.ws.on('BULK_ICECANDIDATES', async ({ candidates }) =>
            candidates.forEach(async candidate => await this.connection.addIceCandidate(candidate).catch(e => void e)));
        this.ws.on('ICECANDIDATE', async ({ candidate }) => await this.connection.addIceCandidate(candidate).catch(e => void e));
        this.ws.on('OFFER', async ({ sdp }) => this.connection.setRemoteDescription(sdp).then(async () => {
            await this.connection.setLocalDescription(await this.connection.createAnswer());
            this.ws.send({ event: 'ANSWER', data: { sdp: this.connection.localDescription } });
        }).catch(e => void e));
        this.createAudio();
    };

    public audio: Audio;
    public connection: RTCPeerConnection;
    public id: string;
    public logger: Logger;
    private readonly options: RTCCOptions;
    public ws: WS;

    #options(options: RTCCOptions) {
        const default_options = { transport: 'DEFAULT' } as RTCCOptions;
        if (Array.isArray(options) || typeof options !== 'object') options = default_options;
        if (typeof options.gateway !== 'string' || options.gateway === '') throw new Error('INVALID_GATEWAY');
        Object.defineProperty(options, 'gateway', { value: options.gateway, writable: !1 });
        if (typeof options.transport !== 'string' || options.transport !== 'DATACHANNEL' || options.transport === 'DATACHANNEL')
            options.transport = default_options.transport;
        Object.defineProperty(options, 'transport', { value: options.transport, writable: !1 });
        return options;
    }

    createAudio() {
        navigator.mediaDevices.getUserMedia({ audio: true }).then((async (_stream) => {
            this.audio.context = new AudioContext(); let { audio: { _, context, info } } = this; _.analyser = context.createAnalyser();
            _.analyser.channelCount = 1; _.analyser.fftSize = 64; _.analyser.maxDecibels = 0; _.analyser.smoothingTimeConstant = .5;
            _.func = () => {
                const byteFrequencies = new Uint8Array(1), { maxDecibels, minDecibels } = _.analyser;
                _.analyser.getByteFrequencyData(byteFrequencies);

                info.dB = Number((minDecibels + ((maxDecibels - minDecibels) * byteFrequencies[0] / 255)).toFixed());
                info.last_dB = Number((info.last_dBs.reduce((prev, current) => prev + current, 0) / (info.last_dBs.length)).toFixed());
                if (info.last_dBs.length === 5) info.last_dBs.shift(); info.last_dBs.push(info.dB);

                info.dB_difference = Math.abs(info.last_dB - info.dB);
                info.thresholds['dynamic'] = info.thresholds['static'] - info.dB_difference;

                if (info.dB > info.thresholds['dynamic']) info.speaking = !0;
                else info.speaking = !1;

                //return;
                document.querySelector('.test').innerHTML =
                    `dB = ${info.dB}
                Last dB = ${info.last_dB}
                Last dBs = ${info.last_dBs.join(' / ')}
                Difference = ${info.dB_difference}
                Dynamic Threshold = ${info.thresholds['dynamic']}
                Static Threshold = ${info.thresholds['static']}
                Speaking = ${info.speaking}
                `.split('\n').join('</br>');
            }
            _.interval = setInterval(_.func, 5e2);
            _.source = context.createMediaStreamSource(_stream);
            _.stream = _stream;
            _.track = _.stream.getAudioTracks()[0];
            _.duplicated_track = _.track.clone();
            _.source.connect(_.analyser);
        })).catch(e => void e);
    }

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
        let negotiation_status = !1;
        connection.addEventListener('negotiationneeded', async () => {
            if (!negotiation_status) {
                negotiation_status = !0;
                await this.connection.setLocalDescription(await this.connection.createOffer());
                this.ws.send({ event: 'OFFER', data: { sdp: this.connection.localDescription } });
                negotiation_status = !1;
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

window.AudioContext = window.AudioContext || window['webkitAudioContext'];
window['logger'] = new Logger('Window');