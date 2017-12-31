'use strict';

const CeallogFunction = require('../models/CeallogFunction');
const compileRequest = require('../compiler').compileRequest;
const HttpError = require('../classes/HttpError');
const PublishError = require('../classes/PublishError');
const settings = require('../settings');
const util = require('../mongoose-util');

const messages = {
    'MISSING_PARAMS': 'Required parameters missing.',
    'NON_EXISTING_RESOURCE': 'Resource does not exist.'
};

const findNew = (req, res, next) => {
    let err;
    
    if('id' in req.params) {
        let id = util.getObjectId(req.params.id);
        
        req.publisher = req.publisher || {oldRecord: null, newRecord: null};
        
        CeallogFunction.findOne({_id: id}, (err, result) => {
            let dbResult = util.dbResultCallback(req.publisher)(err, result);
            
            if(dbResult.type == 'SUCCESS') {
                req.publisher.newRecord = result;
                req.code = result.body;
                
                next();
            } else {
                try {
                    throw new PublishError(
                        messages.NON_EXISTING_RESOURCE,
                        'NON_EXISTING_RESOURCE'
                    );
                } catch(e) {
                    err = new HttpError(e, e.errorType, 404);
                    err.sendError(res);
                }
            }
        });
    } else {
        try {
            throw new PublishError(messages.MISSING_PARAMS, 'MISSING_PARAMS');
        } catch(e) {
            err = new HttpError(e, e.errorType, 400);
            err.sendError(res);
        }
    }
};

const findOld = (req, res, next) => {
    let publisher = req.publisher;
    let name = publisher ? req.publisher.newRecord.name : null;
    let newRecord = req.newRecord;
    
    if(name) {
        let query = {
            $and: [
                {name: {$eq: name}},
                {published: {$eq: true}}
            ]
        };
        
        if(newRecord && newRecord._id) {
            query.$and.push({_id: {$neq: newRecord._id}});
        }
        
        CeallogFunction.findOne(query, (err, result) => {
            let dbResult = util.dbResultCallback(req.publisher)(err, result);

            if(dbResult.type == 'SUCCESS') {
                req.publisher.oldRecord = result;
            }
            
            next();
        });
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
            let newRecord = req.newRecord || {};
            let id = newRecord._id;
            
            err.sendError(res);
            
            if(id) {
                CeallogFunction.update(
                    {_id: id},
                    {compiled: false, published: false}
                );
            }
            
            return;
        }
        next();
    }
};

const update = (req, res, next) => {
    let newRecord = req.publisher.newRecord;
    let oldRecord = req.publisher.oldRecord;
    
    new Promise((resolve, reject) => {
        if(oldRecord) {
            return CeallogFunction.update({_id: oldRecord._id}, {published: false}, (err, _) => {
                if(err) return reject(err);
                
                resolve();
            });
        } resolve();
    }).then((_) => {
        return new Promise((resolve, reject) => {
            CeallogFunction.update({_id: newRecord._id}, {published: true}, (err, _) => {
                if(err) return reject(err);
                
                resolve(newRecord);
            });
        });
    }).then((r) => {
        let response = {
            compiled: r.compiled,
            created_date: r.created_date,
            id: r._id,
            label: r.label,
            name: r.name,
            published: true,
            service: `/${settings.cealloga.api_path}/${r.name}`
        };

        res.statusCode = 200;
        res.json(response);
    }).catch((err) => {
        let dbResult = util.dbResultCallback(req.publisher)(err, null);
        
        try {
            throw new PublishError(dbResult.type, dbResult.message);
        } catch(e) {
            new HttpError(e).sendError(res);
        }
    });
};

module.exports = [findNew, compileRequest, handleCompilerResult, findOld, update];
