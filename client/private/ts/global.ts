import { ops } from '../../../shared/ts/global';

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

                // https://stackoverflow.com/a/68588846/16313645
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
        }

        console.log(`%c[${data.title}]`, 'color: purple;', data.message, ...data.args);
        function _default(title) {
            data.args = p1 ?? []; data.message = p0 ?? ''; data.title = p2 ?? title;
        }
    }

    error() { console.error.apply(this, arguments); }

    log() { console.log.apply(this, arguments); }

    warn() { console.warn.apply(this, arguments); }
}

window['logger'] = new Logger('Window');

interface WSEvents {
    ANSWER: { sdp: RTCSessionDescriptionInit };
    'BULK_ICECANDIDATES': { candidates: RTCIceCandidateInit[] };
    ICECANDIDATE: { candidate: RTCIceCandidate };
    OFFER: { sdp: RTCSessionDescriptionInit };
}

export interface WSOptions {
    debug?: boolean | string;
    protocols?: string | string[];
}

export class WS extends WebSocket {
    constructor(url: string | URL, options?: WSOptions) {
        super(url, options?.protocols ?? []);
        this.events = {};
        Object.defineProperty(this, 'options', {
            value: ops<WSOptions>(options, {
                debug: {
                    default: !1,
                    type: ['boolean', 'string']
                },
                protocols: {
                    default: [],
                    type: ['object', 'string']
                }
            }), writable: !1
        });
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

            typeof message === 'object'
                && !Array.isArray(message)
                && typeof message.event === 'string'
                && this.events.hasOwnProperty(message.event)
                && message.hasOwnProperty('data')
                && this.events[message.event](message.data);
        });
    }

    private events: any;
    public logger: Logger | null;
    private readonly options: WSOptions;

    close(code?: number, reason?: string): void {
        if (this.options.debug) this.logger.debug(`[CLOSED] ${this.url}`);
        WebSocket.prototype.send.apply(this, [code, reason]);
    }

    on<K extends keyof WSEvents>(event: K, handler: (data: WSEvents[K]) => void) {
        this.events[event] = handler;
    }

    send(data: string | object | ArrayBufferLike | Blob | ArrayBufferView): void {
        if (this.options.debug) this.logger.debug('[SEND]', [data]);
        if (typeof data === 'object') data = JSON.stringify(data);
        WebSocket.prototype.send.apply(this, [data]);
    }
}

export function injectClassNames(object: object) {
    if (!Array.isArray(object) && typeof object === 'object')
        for (const key of Object.keys(object))
            for (const element of [...document.getElementsByClassName(key)]) {
                element.classList.remove(key); element.classList.add(object[key]);
            }
}