export class Logger {
    constructor(options?) {
        this.title = options.title;
    }
    private title;

    debug(data) {
        const { args, message, title } = data;
        console.log(`%c[${title ?? this.title}]`, "color: purple;", message, ...args);
    }
}

interface LoggerOptions { }

export class RTCConnection {
    constructor(options?) {
        this.connection = new RTCPeerConnection();
        this.logger = new Logger({title: 'RTCConnection'});
        this.ws = new WebSocket(options.server);
        this.ws.addEventListener('message', async ({ data }) => {
            const message = await new Promise((resolve) => resolve(JSON.parse(data))).catch(() => data) as any;

            if (typeof message === 'object' && !Array.isArray(message)) {
                
            }
        });

        this.connection.addEventListener('connectionstatechange', () => {
            this.logger.debug({ message: `connectionState => ${this.connection.connectionState}` });
        });

        this.connection.addEventListener('icecandidate', ({ candidate }) => {
            if (candidate) {
                this.logger.debug({ args: [candidate], message: '[ICECANDIDATE]' });
            }
        });

        this.connection.addEventListener('iceconnectionstatechange', () => {
            this.logger.debug({ message: `iceConnectionState => ${this.connection.iceConnectionState}` });
        });

        this.connection.addEventListener('icegatheringstatechange', () => {
            this.logger.debug({ message: `iceGatheringState => ${this.connection.iceGatheringState}` });
        });

        this.connection.addEventListener('negotiationneeded', async () => {
            //this.connection.setLocalDescription(await this.connection.createOffer());
        });

        this.connection.addEventListener('signalingstatechange', () => {
            this.logger.debug({ message: `signalingState => ${this.connection.signalingState}` });
        });

        this.connection.addEventListener('track', ({ streams, track }) => {
            this.logger.debug({ args: [streams], message: '[STREAMS]' });
            this.logger.debug({ args: [track], message: '[TRACK]' });
        });
    }
    private connection: RTCPeerConnection;
    private logger: Logger;
    private ws: WebSocket;
}

export function debug(title, message, ...args) { console.log(`%c[${title}]`, "color: purple;", message, ...args); }

export function injectClassNames(object: object) {
    if (!Array.isArray(object) && typeof object === 'object')
        for (const key of Object.keys(object))
            for (const element of [...document.getElementsByClassName(key)]) {
                element.classList.remove(key); element.classList.add(object[key]);
            }
}