import { injectClassNames, RTCConnection, WS } from '../ts/global';

const styles = {
    global: require('../styles/global.scss'),
    index: require('../styles/index.scss').default
}
injectClassNames(styles.index);

const RTCC = new RTCConnection({ gateway: 'ws://localhost' }); window['RTCC'] = RTCC;