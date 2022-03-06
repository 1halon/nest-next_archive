import { injectClassNames, RTCConnection, WS } from '../ts/global';

const styles = {
    global: require('../styles/global.scss'),
    index: require('../styles/index.scss').default
}
injectClassNames(styles.index);

const RTCC = new RTCConnection({ gateway: 'ws://localhost' }); window['RTCC'] = RTCC;

navigator.mediaDevices.getUserMedia({ audio: true }).then(async function (stream) {
    const context = new AudioContext(),
        source = context.createMediaStreamSource(stream),
        source2 = context.createMediaStreamSource(stream),
        analyser = (function () {
            const analyser = context.createAnalyser();
            analyser.channelCount = 1;
            analyser.fftSize = 64;
            //analyser.maxDecibels = 0;
            analyser.smoothingTimeConstant = .5;
            return analyser;
        })();


    const instant = document.querySelector('.instant');

    source.connect(analyser)//.connect(context.destination);

    let byteFrequencies = new Uint8Array(1), last_dBs = [];
    function update() {
        analyser.getByteFrequencyData(byteFrequencies);
        const byteFrequency = byteFrequencies[0],
            percent = byteFrequency / 255,
            dB = Number((analyser.minDecibels + ((analyser.maxDecibels - analyser.minDecibels) * percent)).toFixed());
        if (last_dBs.length === 10) last_dBs.shift(); last_dBs.push(dB);

        const last = Number((last_dBs.reduce((pre, current) => pre + current, 0) / (last_dBs.length / 1.15)).toFixed());
        if (last > -60 && dB > -60) source2.connect(context.destination);
        else source2.disconnect();
        instant.innerHTML = `${last} - ${dB}`;
        requestAnimationFrame(update);
    }

    update();
});