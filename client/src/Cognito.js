import * as CognitoIdentityServiceProvider from 'amazon-cognito-identity-js';
import { Observable } from 'rxjs';

const clientId = '1ja9qonrrvp4eddehu4r2hpi7h';

export const userPoolId = 'us-east-1_maCdisn5p';
export const identityPoolId = 'us-east-1:cf82ada7-69d3-4b4f-bf8a-c68c2f86fd1f';
export const AUTHENTICATE_USER_SUCCESS = 'AUTHENTICATE_USER_SUCCESS';
export const NEW_PASSWORD_REQUIRED = 'NEW_PASSWORD_REQUIRED';

class Cognito {
    constructor() {
        this.userAttributes = null;
        this.cognitoUser = null;
    }

    login(username, password) {
        const authenticationData = {
            Username: username,
            Password: password,
        };
        const authenticationDetails = new CognitoIdentityServiceProvider
            .AuthenticationDetails(authenticationData);
        const poolData = {
            UserPoolId: userPoolId,
            ClientId: clientId,
        };
        const userPool = new CognitoIdentityServiceProvider.CognitoUserPool(poolData);
        const userData = {
            Username: username,
            Pool: userPool,
        };
        this.cognitoUser = new CognitoIdentityServiceProvider.CognitoUser(userData);
        return Observable.create(observer => (
            this.cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: (result) => {
                    observer.next({
                        type: AUTHENTICATE_USER_SUCCESS,
                        token: result.getIdToken().getJwtToken(),
                    });
                    observer.complete();
                },
                onFailure: error => observer.error(error),
                newPasswordRequired: (userAttributes) => {
                    this.userAttributes = userAttributes;
                    observer.next({
                        type: NEW_PASSWORD_REQUIRED,
                    });
                    observer.complete();
                },
            })
        ));
    }

    setNewPassword(password) {
        delete this.userAttributes.email_verified;
        return Observable.create(observer => (
            this.cognitoUser.completeNewPasswordChallenge(password, this.userAttributes, {
                onSuccess: () => observer.complete(),
                onFailure: error => observer.error(error),
            })
        ));
    }
}

export default Cognito;
