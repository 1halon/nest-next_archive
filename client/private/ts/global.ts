interface RTCConnectionOptions {
    gateway: string;
}

interface WSOptions {
    debug?: boolean | string;
    protocols?: string | string[];
}

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

            this.addEventListener('close', () => { this.logger.debug(`[CLOSED] ${url}`); });
            this.addEventListener('message', async ({ data }) =>
                this.logger.debug(await new Promise((resolve) => resolve(JSON.parse(data))).catch(() => data) as any));
            this.addEventListener('open', () => { this.logger.debug(`[CONNECTED] ${url} in ${Date.now() - start} ms`); });
        }
    }
    public logger: Logger | null;
    public options: WSOptions;
    close(code?: number, reason?: string): void {
        if (this.options.debug) this.logger.debug(`[CLOSED] ${{ code, reason }}`);
        WebSocket.prototype.send.apply(this, [code, reason]);
    }
    send(data: string | object | ArrayBufferLike | Blob | ArrayBufferView): void {
        if (this.options.debug) this.logger.debug(data);
        if (typeof data === 'object') try { data = JSON.stringify(data); } catch (error) { }
        WebSocket.prototype.send.apply(this, [data]);
    }
}

export class RTCConnection {
    constructor(options: RTCConnectionOptions, _options?: WSOptions) {
        this.connection = this.createConnection();
        this.channels = {
            audio: this.createDataChannel('AUDIO'),
            camera: this.createDataChannel('CAMERA'),
            stream: this.createDataChannel('STREAM'),
        };
        this.logger = new Logger('RTCConnection');
        this.ws = new WS(options.gateway, { debug: 'RTCConnection' });
        this.ws.addEventListener('message', async ({ data }) => {
            const message = await new Promise((resolve) => resolve(JSON.parse(data))).catch(() => data) as any;

            if (message.event === 'ANSWER') {
                await this.connection.setRemoteDescription(message.sdp);
                this.connection['candidates'].forEach(candidate => this.ws.send({
                    event: 'ICECANDIDATE',
                    candidate
                }));
            } else if (message.event === 'ICECANDIDATE') this.connection.addIceCandidate(message.candidate);
        });
    }
    public channels: Record<string, RTCDataChannel>;
    public connection: RTCPeerConnection;
    public logger: Logger;
    public ws: WS;

    createConnection(configuration?: RTCConfiguration) {
        const connection = new RTCPeerConnection(configuration); connection['candidates'] = [];

        connection.addEventListener('connectionstatechange', () => {
            this.logger.debug(`connectionState => ${connection.connectionState}`);
        });

        connection.addEventListener('datachannel', ({ channel }) => {

        });

        connection.addEventListener('icecandidate', ({ candidate }) => candidate && connection['candidates'].push(candidate));

        connection.addEventListener('iceconnectionstatechange', () => {
            this.logger.debug(`iceConnectionState => ${connection.iceConnectionState}`);
        });

        connection.addEventListener('icegatheringstatechange', () => {
            this.logger.debug(`iceGatheringState => ${connection.iceGatheringState}`);
        });

        connection.addEventListener('negotiationneeded', async () => {
            await this.connection.setLocalDescription(await connection.createOffer());
            this.ws.send({
                event: 'OFFER',
                sdp: this.connection.localDescription
            });
        });

        connection.addEventListener('signalingstatechange', () => {
            this.logger.debug(`signalingState => ${connection.signalingState}`);
        });

        return connection;
    }

    createDataChannel(label: string, dataChannelDict?: RTCDataChannelInit) {
        return this.handleDataChannel(this.connection.createDataChannel(label, dataChannelDict));
    }

    handleDataChannel(channel: RTCDataChannel, callbacks?: {
        close?: (this: RTCDataChannel) => void; error?: (this: RTCDataChannel) => void; open?: (this: RTCDataChannel) => void;
        message?: (this: RTCDataChannel, data?, origin?: string, ports?: readonly MessagePort[]) => void;
    }) {
        channel.bufferedAmountLowThreshold = 0;
        channel.addEventListener('close', function () {
            callbacks?.close.apply(channel);
        });

        channel.addEventListener('error', function () {
            callbacks?.error.apply(channel);
            channel.close();
        });

        channel.addEventListener('open', function () {
            callbacks?.message.apply(channel);
            channel.addEventListener('message', function ({ data, origin, ports }) {
                callbacks?.message.apply(channel, [data, origin, ports]);
            });
        });

        return channel;
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