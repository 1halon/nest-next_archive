import { injectClassNames } from '../../../ts/global';
import React from 'react';
import ReactDOM from 'react-dom';
import index from '../../../styles/index.scss';
injectClassNames(index);

export default class App extends React.Component {
    render(): React.ReactNode {
        return ('');
    }
}

ReactDOM.render(<React.StrictMode><App /></React.StrictMode>, document.getElementById('root'));