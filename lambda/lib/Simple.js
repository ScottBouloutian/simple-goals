const requestLib = require('request');
const Promise = require('bluebird');
const { defaultsDeep } = require('lodash');
const RequestError = require('./RequestError');

const request = Promise.promisify(requestLib);

class Simple {
    constructor(options) {
        this.sfst = options.sfst;
        this.username = options.username;
        this.password = options.password;
        this.jar = request.jar();
        this.token = null;
        this.userId = null;
        this.accountId = null;
    }

    apiRequest(uri, options = { }) {
        const updatedOptions = defaultsDeep(options, {
            uri,
            method: 'GET',
            headers: {
                'accept-language': 'en-US,en;q=0.8',
                'upgrade-insecure-requests': '1',
                'cache-control': 'no-cache',
            },
            gzip: true,
            jar: this.jar,
        });
        return new Promise((resolve, reject) => {
            request(updatedOptions, (error, response) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(response);
                }
            });
        });
    }

    login() {
        return this.apiRequest('https://signin.simple.com/')
            .then(({ statusCode, body }) => {
                if (statusCode !== 200) {
                    throw new RequestError(statusCode, body);
                }
                const regex = /<meta name="_csrf" content="(.*)">/;
                const crsf = body.match(regex)[1];
                return this.apiRequest('https://signin.simple.com/', {
                    method: 'POST',
                    headers: {
                        cookie: `sfst=${this.sfst}`,
                    },
                    form: {
                        _csrf: crsf,
                        username: this.username,
                        password: this.password,
                    },
                });
            })
            .then(({ headers, statusCode, body }) => {
                if (statusCode !== 303) {
                    throw new RequestError(statusCode, body);
                }
                const token = headers.location.match(/token=(.+)/)[1];
                return this.apiRequest('https://bank.simple.com/auth/token', {
                    method: 'GET',
                    qs: { token },
                });
            })
            .then(({ statusCode, body }) => {
                if (statusCode !== 200) {
                    throw new RequestError(statusCode, body);
                }
                [, this.token] = body.match(/data-csrf="(.+)"/);
                [, this.userId] = body.match(/data-uuid="(.+)"/);
                [, this.accountId] = body.match(/data-account-reference="(.+)"/);
            });
    }

    goals() {
        const host = 'https://bank.simple.com';
        const uri = `${host}/goals-api/users/${this.userId}/accounts/${this.accountId}/goals`;
        return this.apiRequest(uri, {
            headers: {
                cookie: 'SLB_SVC=kangaroo-compass',
            },
            followRedirect: false,
            json: true,
        }).then(({ statusCode, body }) => {
            if (statusCode !== 200) {
                throw new RequestError(statusCode, body);
            }
            return body.filter(goal => !goal.archived);
        });
    }

    setGoal(goal) {
        const host = 'https://bank.simple.com';
        const uri = `${host}/goals-api/users/${this.userId}/accounts/${this.accountId}/goals`;
        return this.apiRequest(uri, {
            method: 'POST',
            headers: {
                cookie: 'SLB_SVC=kangaroo-compass',
                'x-csrf-token': this.token,
            },
            json: goal,
        }).then(({ statusCode, body }) => {
            if (statusCode !== 200) {
                throw new RequestError(statusCode, body);
            }
            return body;
        });
    }
}
module.exports = Simple;
