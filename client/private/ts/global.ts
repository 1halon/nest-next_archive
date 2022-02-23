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
        this.options = options ?? {} as WSOptions;
        if (this.options.debug) {
            const start = Date.now();
            this.logger = new Logger(`WS${typeof options?.debug === 'string' && options?.debug !== '' ? `<${options?.debug}>` : ''}`);
            this.logger.debug(`[CONNECT] ${url}`);

            this.addEventListener('close', () => this.logger.debug(`[CLOSED] ${url}`));
            this.addEventListener('message', async ({ data }) =>
                this.logger.debug('[RECEIVE]', [await new Promise((resolve) => resolve(JSON.parse(data))).catch(() => data) as any]));
            this.addEventListener('open', () => this.logger.debug(`[CONNECTED] ${url} in ${Date.now() - start} ms`));
        }
    }
    public logger: Logger | null;
    public options: WSOptions;
    close(code?: number, reason?: string): void {
        if (this.options.debug) this.logger.debug(`[CLOSED] ${{ code, reason }}`);
        WebSocket.prototype.send.apply(this, [code, reason]);
    }
    send(data: string | object | ArrayBufferLike | Blob | ArrayBufferView): void {
        if (this.options.debug) this.logger.debug('[SEND]', [data]);
        if (typeof data === 'object') try { data = JSON.stringify(data); } catch (error) { }
        WebSocket.prototype.send.apply(this, [data]);
    }
}
export class RTCConnection {
    constructor(options: RTCConnectionOptions, _options?: WSOptions) {
        this.audio_context = new AudioContext();
        this.connection = this.createConnection();
        this.id = v4();
        this.logger = new Logger('RTCConnection');
        this.ws = new WS(options.gateway, { debug: 'RTCConnection' });
        this.ws.addEventListener('message', async ({ data }) => {
            const message = await new Promise((resolve) => resolve(JSON.parse(data))).catch(() => data) as any;

            if (message.event === 'ANSWER') {
                await this.connection.setRemoteDescription(message.sdp);
                this.ws.send({ id: this.id, event: 'BULK_ICECANDIDATES', candidates: this.connection['candidates'] });
            }
            else if (message.event === 'BULK_ICECANDIDATES')
                message.candidates.forEach(candidate => this.connection.addIceCandidate(candidate).catch(e => void e));
            else if (message.event === 'ICECANDIDATE')
                this.connection.addIceCandidate(message.candidate).catch(e => void e);
            else if (message.event === 'OFFER') {
                await this.connection.setRemoteDescription(message.sdp).catch(e => void e);
                await this.connection.setLocalDescription(await this.connection.createAnswer());
                this.ws.send({ event: 'ANSWER', sdp: this.connection.localDescription });
                if (this.connection['candidates'].length > 0)
                    this.ws.send({ event: 'BULK_ICECANDIDATES', candidates: this.connection['candidates'] });
            }
        });
    };

    public audio_context: AudioContext;
    public connection: RTCPeerConnection;
    public id: string;
    public logger: Logger;
    public ws: WS;

    createConnection(configuration?: RTCConfiguration) {
        const connection = new RTCPeerConnection(configuration); connection['candidates'] = [];

        connection.addEventListener('connectionstatechange', () => {
            this.logger.debug(`connectionState => ${connection.connectionState}`);
        });
        connection.addEventListener('icecandidate', ({ candidate }) => {
            if (candidate)
                if (connection.connectionState === 'connected')
                    this.ws.send({ id: this.id, event: 'ICECANDIDATE', candidate });
                else connection['candidates'].push(candidate);
        });
        connection.addEventListener('iceconnectionstatechange', () => {
            this.logger.debug(`iceConnectionState => ${connection.iceConnectionState}`);
        });
        connection.addEventListener('icegatheringstatechange', () => {
            this.logger.debug(`iceGatheringState => ${connection.iceGatheringState}`);
        });
        let negotiation_status = 'NEEDED';
        connection.addEventListener('negotiationneeded', async () => {
            if (negotiation_status !== 'IN_PROGRESS') {
                negotiation_status = 'IN_PROGRESS';
                await this.connection.setLocalDescription(await connection.createOffer());
                this.ws.send({ id: this.id, event: 'OFFER', sdp: this.connection.localDescription });
                negotiation_status = 'DONE';
            }
        });
        connection.addEventListener('signalingstatechange', () => {
            this.logger.debug(`signalingState => ${connection.signalingState}`);
        });

        connection.addEventListener('track', ({ streams }) => {

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