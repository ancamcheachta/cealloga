'use strict';

const CompilerError = require('./CompilerError');

class HttpError extends Error {
    constructor(inner, errorType, status) {
        super(inner.message);
        
        this.name = this.constructor.name;
        this.inner = inner;
        
        if(arguments.length == 3) {
            this.errorType = errorType;
            this.status = status;
        } else {
            this.serverError();
        }
        
        this.defineBody();
    }
    defineBody() {
        this.body = {};
        this.body.error_type = this.errorType;
        this.body.message = this.message;
        
        if(this.inner instanceof CompilerError) {
            this.body.compiled = false;
            this.body.location = this.inner.location;
        }
    }
    serverError() {
        this.errorType = 'INTERNAL_SERVER_ERROR';
        this.message = 'An unknown exception occurred.';
        this.status = 500;
    }
    sendError(res) {
        res.status = this.status;
        res.json(this.body);
    }
}

module.exports = HttpError;
