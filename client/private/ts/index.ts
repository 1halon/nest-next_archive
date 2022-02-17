import { injectClassNames, RTCConnection } from '../ts/global';

const styles = {
    global: require('../styles/global.scss'),
    index: require('../styles/index.scss').default
}
injectClassNames(styles.index);

const RTCC = new RTCConnection({ server: 'ws://localhost' });

const local_video = document.querySelector('video'),
    local_audio = document.createElement('audio');