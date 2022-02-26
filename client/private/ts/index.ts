import { injectClassNames, RTCConnection, WS } from '../ts/global';
import LevelProcessorURL from '../js/level-processor.worklet.js';

const styles = {
    global: require('../styles/global.scss'),
    index: require('../styles/index.scss').default
}
injectClassNames(styles.index);

const RTCC = new RTCConnection({ gateway: 'ws://localhost' }); window['RTCC'] = RTCC;

navigator.mediaDevices.getUserMedia({ audio: true }).then(async function (stream) {
    const context = new AudioContext(), source = context.createMediaStreamSource(stream);

    await context.audioWorklet.addModule(LevelProcessorURL);
    const node = new AudioWorkletNode(context, 'level-processor');

    const instant = document.querySelector('.instant');

    node.port.onmessage = function ({ data }) {
        instant.innerHTML = (data * 10000).toFixed(2).toString();
    }

    source.connect(node).connect(context.destination);
});