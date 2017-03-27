const requestLib = require('request');
const Promise = require('bluebird');
const { assign } = require('lodash');

const request = Promise.promisify(requestLib);

class Simple {
    constructor(options) {
        this.username = options.username;
        this.password = options.password;
        this.jar = request.jar();
        this.token = null;
    }

    sendRequest(endpoint = '/', options = { }) {
        const root = 'https://bank.simple.com';
        const requestOptions = assign({
            method: 'get',
            uri: `${root}${endpoint}`,
            jar: this.jar,
            followRedirect: false,
        }, options);
        return request(requestOptions).then(response => response);
    }

    login() {
        const regex = /<meta name="_csrf" content="(.*)">/;
        return this.sendRequest('/', {
            followRedirect: true,
        }).then(({ body }) => {
            const match = body.match(regex);
            if (!match) {
                throw new Error('token not found');
            }
            const token = match[1];
            this.token = token;
            return this.sendRequest('/signin', {
                method: 'post',
                form: {
                    username: this.username,
                    password: this.password,
                    _csrf: token,
                },
            });
        });
    }

    goals() {
        return this.sendRequest('/goals/data', { json: true }).then((response) => {
            const { statusCode, body } = response;
            if (statusCode !== 200) {
                throw new Error(`code ${statusCode}`);
            }
            return body.filter(goal => !goal.archived);
        });
    }

    setGoal(goal) {
        return this.sendRequest('/goals', {
            method: 'post',
            form: assign(goal, {
                _csrf: this.token,
            }),
        }).then(({ statusCode, body }) => {
            if (statusCode !== 200) {
                throw new Error(`code ${statusCode}`);
            }
            return body;
        });
    }
}
module.exports = Simple;
