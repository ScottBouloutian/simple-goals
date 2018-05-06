class RequestError extends Error {
    constructor(code, body) {
        super(`code ${code}: ${JSON.stringify(body)}`);
        this.code = code;
        this.body = body;
    }
}
module.exports = RequestError;
