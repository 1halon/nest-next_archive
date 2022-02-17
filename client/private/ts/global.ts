export class Logger {
    constructor(title?: string) {
        this.title = title;
    }
    private title;

    debug(message?: any, args?: any[], title?: string);
    debug(data: { args: [], message: any, title?: string });
    debug(p0?, p1?, p2?) {
        const data = { args: [], message: '', title: this.title } as any;
        switch (typeof p0) {
            case 'object':
                Object.keys(p0).forEach(key => data[key] = p0[key]);
                break;

            default:
                data.args = p1 ?? [];
                data.message = p0 ?? '';
                data.title = p2 ?? this.title;
                break;
        }

        console.log(`%c[${data.title}]`, 'color: purple;', data.message, ...data.args);
    }

    error() { console.error.apply(this, arguments); }

    log() { console.log.apply(this, arguments); }

    warn() { console.warn.apply(this, arguments); }
}
window['logger'] = new Logger('Window');
export class RTCConnection {
    constructor(options?) {
        const candidates = [];
        this.channels = {};
        this.connection = new RTCPeerConnection();
        this.logger = new Logger('RTCConnection');
        this.ws = new WebSocket(options.server);
        this.ws.addEventListener('message', async ({ data }) => {
            const message = await new Promise((resolve) => resolve(JSON.parse(data))).catch(() => data) as any;

            if (message.event === 'ID') window['id'] = message.id;
            else if (message.event === 'ANSWER') {
                await this.connection.setRemoteDescription(message.sdp);
                candidates.forEach(candidate => this.ws.send(JSON.stringify({
                    _id: window['id'],
                    event: 'ICECANDIDATE',
                    candidate
                })))
            } else if (message.event === 'ICECANDIDATE') this.connection.addIceCandidate(message.candidate);
        });

        this.connection.addEventListener('connectionstatechange', () => {
            this.logger.debug({ message: `connectionState => ${this.connection.connectionState}` });
        });

        this.connection.addEventListener('icecandidate', ({ candidate }) => {
            candidate && candidates.push(candidate);
        });

        this.connection.addEventListener('iceconnectionstatechange', () => {
            this.logger.debug({ message: `iceConnectionState => ${this.connection.iceConnectionState}` });
        });

        this.connection.addEventListener('icegatheringstatechange', () => {
            this.logger.debug({ message: `iceGatheringState => ${this.connection.iceGatheringState}` });
        });

        this.connection.addEventListener('negotiationneeded', async () => {
            await this.connection.setLocalDescription(await this.connection.createOffer());
            this.ws.send(JSON.stringify({
                _id: window['id'],
                event: 'OFFER',
                sdp: this.connection.localDescription
            }));
        });

        this.connection.addEventListener('signalingstatechange', () => {
            this.logger.debug({ message: `signalingState => ${this.connection.signalingState}` });
        });

        this.connection.addEventListener('track', ({ streams, track }) => {
            this.logger.debug({ args: [streams], message: '[STREAMS]' });
            this.logger.debug({ args: [track], message: '[TRACK]' });
        });
    }
    public channels: Record<string, RTCDataChannel>;
    public connection: RTCPeerConnection;
    public logger: Logger;
    public ws: WebSocket;
}

export function injectClassNames(object: object) {
    if (!Array.isArray(object) && typeof object === 'object')
        for (const key of Object.keys(object))
            for (const element of [...document.getElementsByClassName(key)]) {
                element.classList.remove(key); element.classList.add(object[key]);
            }
}