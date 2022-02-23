import { injectClassNames, RTCConnection, WS } from '../ts/global';
import LevelProcessorURL from '../js/level-processor.worklet.js';

const styles = {
    global: require('../styles/global.scss'),
    index: require('../styles/index.scss').default
}
injectClassNames(styles.index);

const RTCC = new RTCConnection({ gateway: 'ws://localhost' }); window['RTCC'] = RTCC;

const local_video = document.querySelector('video'),
    local_audio = document.querySelector('audio');

RTCC.ws.addEventListener('open', () =>
    navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(function (stream) {
        const receiver = RTCC.connection.addTransceiver(stream.getAudioTracks()[0], { direction: 'sendonly', streams: [stream] });

        (async function () {
            const context = new AudioContext(), source = context.createMediaStreamSource(stream);
            await context.audioWorklet.addModule(LevelProcessorURL);
            const node = new AudioWorkletNode(context, 'level-processor');

            source.connect(node).connect(context.destination);
        })()

        /*const context = new AudioContext(), source = context.createMediaStreamSource(stream),
            analyser = (function (context) {
                const analyser = context.createAnalyser();
                analyser.fftSize = 512;
                analyser.minDecibels = -127;
                analyser.maxDecibels = 0;
                analyser.smoothingTimeConstant = 0.4;
                return analyser;
            })(context), volumes = new Uint8Array(analyser.frequencyBinCount);

        source.connect(analyser);

        await context.audioWorklet.addModule(LevelProcessorURL);

        let threshold = 25, interval;
        interval = setInterval(() => {
            analyser.getByteFrequencyData(volumes);
            let volumeSum = 0;
            for (const volume of volumes)
                volumeSum += volume;
            const averageVolume = volumeSum / volumes.length,
                volume = Math.floor(averageVolume * 100 / 127);
            if (volume >= threshold) {
                RTCC.logger.debug('SPEAKING')
            }
        }, 100);*/
    })
);