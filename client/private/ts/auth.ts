import { injectClassNames } from '../ts/global';
const styles = { global: require('../styles/global.scss'), auth: require('../styles/auth.scss').default };
injectClassNames(styles.auth);