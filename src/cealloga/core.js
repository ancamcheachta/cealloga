/**
 * @desc Exports core routes for `/cealloga/` services
 * @since 0.2.0
 */
'use strict';

/**
 * @ignore
 */
const Ceallog = require('../classes/Ceallog');

/**
 * @param plugins {...Object} Plugin modules to be applied to ceallog function
 * execution
 * @return {Object} An object containing Express middlewear callback functions
 */
const core = plugins => {
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
    
    const respond = (req, res, next) => {
        if (!res.execution.error) {
            res.json(res.execution.executed);
            
            return;
        }
        
        res.execution.error.sendError(res);
        
        return;
    };
    
    return {
        afterExecute: afterExecute,
        beforeExecute: beforeExecute,
        getCeallog: getCeallog,
        respond: respond
    };
};

module.exports = core;
