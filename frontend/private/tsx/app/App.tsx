import { injectClassNames } from '../../ts/global';
import React from 'react';
import ReactDOM from 'react-dom';
import index from '../../styles/index.scss';
injectClassNames(index);

export default class App extends React.Component {
    render(): React.ReactNode {
        return (
            <div className={index.grid}>
                <div className={index.image}></div>
                <div className={index.description}>
                    <h2>Welcome to Meet!</h2>
                    <div className={index.text}>
                        ...where you can belong to a school club, a gaming group, or a worldwide art community. Where just you and a handful of friends can spend time together. A place that makes it easy to talk every day and hang out more often.
                    </div>
                </div>
            </div>
        );
    }
}

ReactDOM.render(<React.StrictMode><App /></React.StrictMode>, document.getElementById('root'));