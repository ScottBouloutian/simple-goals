import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import Snackbar from 'material-ui/Snackbar';
import { withRouter } from 'react-router-dom';
import { noop } from 'lodash';
import './Login.css';
import Cognito, { AUTHENTICATE_USER_SUCCESS, NEW_PASSWORD_REQUIRED } from '../Cognito';

class Login extends Component {
    constructor() {
        super();
        this.cognito = new Cognito();
        this.state = {
            username: '',
            password: '',
            confirmPassword: '',
            error: null,
            newPassword: false,
        };
    }

    setPassword() {
        const { password, confirmPassword } = this.state;
        const { history } = this.props;
        if (password === confirmPassword) {
            this.cognito.setNewPassword(password).subscribe(
                noop,
                error => this.setState({ error }),
                () => history.replace(`${process.env.PUBLIC_URL}/home`),
            );
        } else {
            this.setState({
                error: new Error('passwords must match'),
            });
        }
    }

    login() {
        const { username, password } = this.state;
        const { history } = this.props;
        this.cognito.login(username, password).subscribe((event) => {
            switch (event.type) {
            case AUTHENTICATE_USER_SUCCESS:
                sessionStorage.setItem('token', event.token);
                history.replace(`${process.env.PUBLIC_URL}/home`);
                break;
            case NEW_PASSWORD_REQUIRED:
                this.setState({
                    password: '',
                    newPassword: true,
                });
                break;
            default:
            }
        }, error => this.setState({ error }));
    }

    renderLogin() {
        const { username, password } = this.state;
        const usernameChanged = (event, value) => this.setState({ username: value });
        const passwordChanged = (event, value) => this.setState({ password: value });
        return (
            <div className="sign-in">
                <TextField
                  hintText="Email"
                  value={username}
                  onChange={usernameChanged}
                />
                <TextField
                  hintText="Password"
                  type="password"
                  value={password}
                  onChange={passwordChanged}
                />
                <FlatButton label="Login" onTouchTap={() => this.login()} />
            </div>
        );
    }

    renderNewPassword() {
        const { password, confirmPassword } = this.state;
        const passwordChanged = (event, value) => this.setState({ password: value });
        const confirmPasswordChanged = (event, value) => this.setState({ confirmPassword: value });
        return (
            <div className="sign-in">
                <TextField
                  hintText="New password"
                  type="password"
                  value={password}
                  onChange={passwordChanged}
                />
                <TextField
                  hintText="Confirm password"
                  type="password"
                  value={confirmPassword}
                  onChange={confirmPasswordChanged}
                />
                <FlatButton label="Set Password" onTouchTap={() => this.setPassword()} />
            </div>
        );
    }

    render() {
        const { newPassword, error } = this.state;
        const handleRequestClose = () => this.setState({ error: null });
        return (
            <div>
                {newPassword ? this.renderNewPassword() : this.renderLogin()}
                <Snackbar
                  open={error !== null}
                  message={error ? error.message : ''}
                  autoHideDuration={4000}
                  onRequestClose={handleRequestClose}
                />
            </div>
        );
    }
}

Login.propTypes = {
    history: PropTypes.shape({
        replace: PropTypes.func.isRequired,
    }).isRequired,
};

export default withRouter(Login);
