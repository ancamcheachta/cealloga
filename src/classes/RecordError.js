'use strict';

class RecordError extends Error {
    constructor(message, errorType) {
        super(message);
        
        this.errorType = errorType;
        this.name = this.constructor.name;
        
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = RecordError;