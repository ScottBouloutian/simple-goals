import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Login from '../Login';
import Home from '../Home';

injectTapEventPlugin();

const App = () => (
    <MuiThemeProvider>
        <Router>
            <div>
                <Route exact path="/" render={() => <Redirect to="/login" />} />
                <Route path="/login" component={Login} />
                <Route
                  path="/home"
                  render={() => (sessionStorage.getItem('token') ? <Home /> : <Redirect to="/login" />)}
                />
            </div>
        </Router>
    </MuiThemeProvider>
);

export default App;
