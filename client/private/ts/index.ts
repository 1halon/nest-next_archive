import { injectClassNames } from '../ts/global';

const styles = {
    global: require('../styles/global.scss'),
    index: require('../styles/index.scss')
}
injectClassNames(styles.index);

const file_input = document.querySelector('input');

file_input.onchange = function () {
    const file = file_input.files[0];
    const form_data = new FormData();
    form_data.append('file', file);
    fetch('/api/v1/upload', {
        body: form_data,
        method: 'POST'
    });
}