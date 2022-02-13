import { injectClassNames, RTCConnection } from '../ts/global';

const styles = {
    global: require('../styles/global.scss'),
    index: require('../styles/index.scss').default
}
injectClassNames(styles.index);

new RTCConnection({ server: 'ws://localhost' });