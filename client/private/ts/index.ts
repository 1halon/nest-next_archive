import { injectClassNames, RTCConnection, WS } from '../ts/global';

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
        RTCC.connection.addTrack(stream.getAudioTracks()[0], stream);
        /*const context = new AudioContext(), source = context.createMediaStreamSource(stream),
            analyser = (function (context) {
                const analyser = context.createAnalyser();
                analyser.fftSize = 512;
                analyser.minDecibels = -127;
                analyser.maxDecibels = 0;
                analyser.smoothingTimeConstant = 0.4;
                return analyser;
            })(context);

        source.connect(analyser);

        const recorder = new MediaRecorder(stream), volumes = new Uint8Array(analyser.frequencyBinCount);
        let threshold = 25, interval;
        recorder.addEventListener('dataavailable', async function ({ data }) {
            if (!data.size) return;
            analyser.getByteFrequencyData(volumes);
            let volumeSum = 0;
            for (const volume of volumes)
                volumeSum += volume;
            const averageVolume = volumeSum / volumes.length,
                volume = Math.floor(averageVolume * 100 / 127);
            if (volume >= threshold) {
                const buffer = await data.arrayBuffer(), channel = RTCC.channels['AUDIO'];
                console.log(buffer);
                if (channel.readyState === 'open') channel.send(buffer);
            }
        });
        recorder.addEventListener('start', function () {
            interval = setInterval(function () {
                recorder.requestData();
            }, 100);
        });
        recorder.addEventListener('stop', function () {
            clearInterval(interval); interval = undefined;
        });
        recorder.start();*/
    })
);