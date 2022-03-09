import EventEmitter from 'events';
import { v4 } from 'uuid';
import { Logger, ops, WS, WSOptions } from './global';

interface AudioInfo {
    dB: number;
    dB_difference: number;
    last_dB: number;
    last_dBs: number[] | [number, number, number, number, number];
    speaking: boolean;
    thresholds: { dynamic: number, static: number };
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

interface RTCCEvents {
    speaking: [speaking: boolean];
}

interface RTCCOptions {
    gateway: string;
    threshold?: { type?: 'DYNAMIC' | 'STATIC'; value?: number; };
    transport?: 'DATACHANNEL' | 'DEFAULT';
}

export class RTCConnection extends EventEmitter {
    constructor(options: RTCCOptions, ws_options?: WSOptions) {
        super();
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
        Object.defineProperty(this, 'options', {
            value: ops<RTCCOptions>(options, {
                gateway: {
                    type: 'string',
                    properties: { required: !0 }
                },
                threshold: {
                    type: 'object',
                    default: { type: 'DYNAMIC', value: -60 }
                },
                transport: {
                    type: 'string',
                    default: 'DEFAULT'
                }
            }), writable: !1
        });
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

                const speaking = info.speaking;
                if (info.dB > info.thresholds['dynamic']) info.speaking = !0;
                else info.speaking = !1;

                if (speaking !== info.speaking) this.emit('speaking', info.speaking);

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

    emit<K extends keyof RTCCEvents>(eventName: K, ...args: RTCCEvents[K]): boolean {
        return EventEmitter.prototype.emit.apply(this, arguments);
    }

    on<K extends keyof RTCCEvents>(eventName: K, listener: (...args: RTCCEvents[K]) => void): this {
        return EventEmitter.prototype.on.apply(this, arguments);
    }
}

window.AudioContext = window.AudioContext || window['webkitAudioContext'];