import { injectClassNames, RTCConnection } from '../ts/global';

const styles = {
    global: require('../styles/global.scss'),
    index: require('../styles/index.scss').default
}
injectClassNames(styles.index);

const RTCC = new RTCConnection({ server: 'ws://localhost' });

const local_video = document.querySelector('video');

(async function () {
    const local_stream = await navigator.mediaDevices.getDisplayMedia({ audio: false, video: true });
    local_stream.getTracks().forEach(track => RTCC.connection.addTrack(track, local_stream));
    local_video.srcObject = local_stream;
})();