'use strict';

const Ceallog = require('../classes/Ceallog');

module.exports = plugins => {
    const afterExecute = (req, res, next) => {
        plugins.forEach(plugin => {
            plugin.afterExecute.apply(req.ceallog, [req]);
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
        let name = req.params.name;
        let cached = req.cache.get(name);
        
        if(cached && cached.compiled && typeof cached.compiled == 'function') {
            cached.compiled.apply(null, [req.ceallog]);
        }
        
        next();
    };
    
    const respond = (req, res, next) => {
        
    };
    
    const validateService = (req, res, next) => {
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
