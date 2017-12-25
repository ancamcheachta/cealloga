'use strict';

// Requirements
const CeallogFunction = require('../models/CeallogFunction');
const compileRequest = require('../compiler').compileRequest;
const getDbCallback = require('../mongoose-util').getDbCallback;
const HttpError = require('../classes/HttpError');
const ValidateError = require('../classes/ValidateError');

// Constants
const messages = {
    NO_BODY: 'Required `body` field missing.',
    NO_LABEL: 'Required `label` field missing.',
    NO_NAME: 'Required `name` field missing.'
};

// Functions
const handleBody = (req, res, next) => {
    let body = req.body;
    let err;
    
    if(body) {
        // If a body exists, check there is a `body`, `name`, and `label`. If
        // any values are missing, throw an error and respond with a 400.
        // Otherwise, assign `body` to `req.code` for use by the compiler.
        try {
            if(!body.body) {
                throw new ValidateError(messages.NO_BODY, 'NO_BODY');
            } else if(!body.name) {
                throw new ValidateError(messages.NO_NAME, 'NO_NAME');
            } else if(!body.label) {
                throw new ValidateError(messages.NO_LABEL, 'NO_LABEL');
            } else {
                req.code = body.body;
            }
        } catch(e) {
            err = new HttpError(e, e.errorType, 400);
            err.sendError(res);
        } finally {
            if(err) return; // Stop now if there was an error...
            else next();    // ... otherwise continue
        }
    } else {
        // If a body is missing somehow, throw a generic error, log it, swallow
        // it, and respond with a 500.
        try {
            throw new Error('Missing request body.');
        } catch(e) {
            err = new HttpError(e);
            err.sendError(res);
        } finally {
            return;
        }
    }
};

const handleCompilerResult = (req, res, next) => {
    let err;
    try {
        if(req.compiler.error) {
            throw new HttpError(req.compiler.error, 'COMPILATION_ERROR', 400);
        }
    } catch(e) {
        err = e;
    } finally {
        if(err) {
            err.sendError(res);
            return;
        }
        next();
    }
};

const save = (req, res, next) => {
    let resource = {
        body: req.code,
        compiled: typeof req.compiler.compiled == 'function',
        label: req.body.label,
        name: req.body.name
    };
    
    let callback = getDbCallback(req, res);
    
    let ceallogFunction = new CeallogFunction(resource);

    ceallogFunction.save(callback);
    return;
};

module.exports = [handleBody, compileRequest, handleCompilerResult, save];
