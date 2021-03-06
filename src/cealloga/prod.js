/**
 * @desc Exports route for `/cealloga/:name`
 * @since 0.2.0
 */
'use strict';

/**
 * @ignore
 */
const CeallogError = require('../classes/CeallogError'),
    HttpError = require('../classes/HttpError');

/**
 * @ignore
 */
const messages = {
	MISSING_PARAMS: 'Required parameters missing.',
	NON_EXISTING_RESOURCE: 'Resource does not exist.'
};

/**
 * @param plugins {...Object} Plugin modules to be applied to ceallog function
 * execution
 * @return {Array} An array of Express middlewear callback functions
 */
const prod = plugins => {
    const core = require('./core')(plugins);
    
    const afterExecute = core.afterExecute;
    
    const beforeExecute = core.beforeExecute;
    
    const getCeallog = core.getCeallog;
    
    const execute = (req, res, next) => {
        let name = req.params.name;
        let cached = req.cache.getPublished(name);
        
        res.execution = res.execution || {executed: null, error: null};
        
        if (cached && cached.compiled && typeof cached.compiled == 'function') {
            try {
                res.execution.executed = cached.compiled(req.ceallog);
            } catch(e) {
                res.execution.error = new HttpError(
                    e, 'INTERNAL_SERVER_ERROR', 500
                );
            } finally {
                next();
            }
        }
    };
    
    const respond = core.respond;
    
    const validateService = (req, res, next) => {
        let name = req.params.name, status;

        try{
            switch(true){
                case !req.cache.getPublished(name):
                    status = 404;
                    throw new CeallogError(
                        messages.NON_EXISTING_RESOURCE,
                        'NON_EXISTING_RESOURCE'
                    );
                /* istanbul ignore next */
                case !name || name == '':
                    status = 400;
                    throw new CeallogError(
                        messages.MISSING_PARAMS,
                        'MISSING_PARAMS'
                    );
                default:
                    next();
                    return;
            }
        } catch(e) {
            new HttpError(e, e.errorType, status).sendError(res);
        }
    };
    
    return [
        validateService,
        getCeallog,
        beforeExecute,
        execute,
        afterExecute,
        respond
    ];
};

module.exports = prod;
