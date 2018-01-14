/**
 * @desc Exports route for `/cealloga/_test/*`
 * @since 0.2.0
 */
'use strict';

/**
 * @ignore
 */
const Ceallog = require('../classes/Ceallog'),
    HttpError = require('../classes/HttpError');

/**
 * @param plugins {...Object} Plugin modules to be applied to ceallog function
 * execution
 * @return {Array} An array of Express middlewear callback functions
 */
const dev = plugins => {
    const afterExecute = (req, res, next) => {
        plugins.forEach(plugin => {
            plugin.afterExecute.apply(req.ceallog, [res]);
        });
        
        next();
    };
    
    const beforeExecute = (req, res, next) => {
        plugins.forEach(plugin => {
            plugin.beforeExecute.apply(req.ceallog, [req]);
        });
        
        next();
    };
    
    const getCeallog = (req, res, next) => {
        req.ceallog = new Ceallog();
        
        plugins.forEach(plugin => {
            plugin.extend.apply(req.ceallog, [req]);
        });
        
        next();
    };
    
    const execute = (req, res, next) => {
        let id = req.params.id;
        let cached = req.cache.getUnpublished(id);
        
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
    
    const respond = (req, res, next) => {
        if (!res.execution.error) {
            res.json(res.execution.executed);
            
            return;
        }
        
        res.execution.error.sendError(res);
        
        return;
    };
    
    const validateService = (req, res, next) => {
        // TODO: Check for id, return 404 if not found.
        next();
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

module.exports = dev;
