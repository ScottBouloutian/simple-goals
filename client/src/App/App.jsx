import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Login from '../Login';
import Home from '../Home';

injectTapEventPlugin();

function getPath(path) {
    const baseUrl = process.env.PUBLIC_URL;
    return `${baseUrl}${path}`;
}

const App = () => (
    <MuiThemeProvider>
        <Router>
            <div>
                <Route
                  exact
                  path={getPath('/')}
                  render={() => <Redirect to={getPath('/login')} />}
                />
                <Route path={getPath('/login')} component={Login} />
                <Route
                  path={getPath('/home')}
                  render={() => (sessionStorage.getItem('token') ? <Home /> : <Redirect to={getPath('/login')} />)}
                />
            </div>
        </Router>
    </MuiThemeProvider>
);

export default App;
