import { injectClassNames, RTCConnection, WS } from '../ts/global';

const styles = {
    global: require('../styles/global.scss'),
    index: require('../styles/index.scss').default
}
injectClassNames(styles.index);

const RTCC = new RTCConnection({ gateway: 'ws://localhost' }); window['RTCC'] = RTCC;

const local_video = document.querySelector('video'),
    local_audio = document.createElement('audio');

RTCC.ws.addEventListener('open', () =>
    setTimeout(function () {
        navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(function (stream) {
            const recorder = new MediaRecorder(stream);
            let interval;
            recorder.addEventListener('dataavailable', async function ({ data }) {
                const buffer = await data.arrayBuffer(), channel = RTCC.channels['audio'];
                if (channel.readyState === 'open') channel.send(buffer);
            });
            recorder.addEventListener('start', function () {
                interval = setInterval(function () {
                    recorder.requestData();
                }, 100);
            });
            recorder.addEventListener('stop', function () {
                clearInterval(interval); interval = undefined;
            });
            recorder.start();
        });
    }, 5000)
);