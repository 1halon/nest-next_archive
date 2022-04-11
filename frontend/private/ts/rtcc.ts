import EventEmitter from 'events';
import { createWRTC, ops } from '../../../shared/ts/global';
import { v4 } from 'uuid';
import { Logger, WS } from './global';
import { CommClient, SignalingSocket } from '../../../shared/ts/comm-client';

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
        func: Function;
        interval: number | typeof setInterval;
        source: MediaStreamAudioSourceNode;
        stream: MediaStream;
    }
    context: AudioContext;
    info: AudioInfo
}

interface CamInfo { }

interface Cam {
    info: CamInfo;
}

interface DisplayInfo { }

interface Display {
    info: DisplayInfo;
}

interface RTCCEvents {
    connected: [];
    speaking: [speaking: boolean];
}

interface RTCCOptions {
    gateway: string;
    threshold?: { type?: 'DYNAMIC' | 'STATIC'; value?: number; };
    transport?: 'DATACHANNEL' | 'DEFAULT';
}

export default class RTCConnection extends EventEmitter {
    constructor(options: RTCCOptions) {
        super();
        this.audio = {
            _: { analyser: null, func: null, interval: null, source: null, stream: null },
            context: null,
            info: {
                dB: -100,
                dB_difference: 0,
                last_dB: -100,
                last_dBs: new Array(5).fill(-100, 0, 5),
                speaking: !1,
                thresholds: { dynamic: -60, static: -60 }
            }
        }
        Object.defineProperties(this, {
            id: { value: v4(), writable: !1 },
            options: {
                value: ops<RTCCOptions>(options, {
                    gateway: { type: 'string', properties: { required: !0 } },
                    threshold: { type: 'object', default: { type: 'DYNAMIC', value: -60 } },
                    transport: { type: 'string', default: 'DEFAULT' }
                }), writable: !1
            }
        });
        this.comm = new CommClient(this.id,
            new SignalingSocket(new WS(options.gateway + `?id=${this.id}&transport=${this.options.transport}`)), { target: 'CLIENT' });
    };

    public audio: Audio;
    public cam: Cam;
    public comm: CommClient;
    public display: Display;
    public id: string;

    private readonly options: RTCCOptions;

    public createAudio() {
        navigator.mediaDevices.getUserMedia({ audio: true }).then((_stream => {
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
            }
            _.interval = setInterval(_.func, 5e2);
            _.source = context.createMediaStreamSource(_stream);
            _.stream = _stream;
            _.source.connect(_.analyser);
        })).catch(e => void e);
    }

    public createCam() {
        navigator.mediaDevices.getUserMedia({ video: true }).then((_stream => {
            // TODO
        })).catch(e => void e);
    }

    public createDisplay() {
        navigator.mediaDevices.getDisplayMedia({ audio: true, video: true }).then((_stream => {
            // TODO
        })).catch(e => void e);
    }

    public emit<K extends keyof RTCCEvents>(eventName: K, ...args: RTCCEvents[K]): boolean {
        return EventEmitter.prototype.emit.apply(this, arguments);
    }

    public on<K extends keyof RTCCEvents>(eventName: K, listener: (...args: RTCCEvents[K]) => void): this {
        return EventEmitter.prototype.on.apply(this, arguments);
    }
}

window.AudioContext = window.AudioContext || window['webkitAudioContext'];