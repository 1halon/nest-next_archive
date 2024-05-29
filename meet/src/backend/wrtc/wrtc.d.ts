/*declare module 'wrtc' {
    class Sink extends EventTarget {
        constructor(track: MediaStreamTrack);
        public stopped: boolean;
        stop(): void;
    }
    class Source extends EventTarget {
        close(): void;
        createTrack(): MediaStreamTrack;
    }
    const nonstandard = {
        i420ToRgba: Function,
        RTCAudioSink: class extends Sink {
            ondata: (audio_data, bits_per_sample: number, sample_rate: number, number_of_channels: number, number_of_frames: number) => void;
        },
        RTCAudioSource: class extends Source {
            onData: (samples, bitsPerSample, sampleRate, channelCount, numberOfFrames) => void;
        },
        RTCVideoSink: class extends Sink {
            constructor(track: MediaStreamTrack);
            public stopped: boolean;
            stop: Function;
        },
        RTCVideoSource: class extends Source {
            public isScreencast: boolean;
            public needsDenoising: boolean;
            onFrame: Function;
        },
        rgbaToI420: Function
    };
    export {
        MediaStream,
        MediaStreamTrack,
        RTCDataChannel,
        RTCDataChannelEvent,
        RTCDtlsTransport,
        RTCIceCandidate,
        RTCIceTransport,
        RTCPeerConnection,
        RTCPeerConnectionIceEvent,
        RTCRtpReceiver,
        RTCRtpSender,
        RTCRtpTransceiver,
        RTCSctpTransport,
        RTCSessionDescription,
        getUserMedia,
        mediaDevices,
        nonstandard,
    }
}
*/