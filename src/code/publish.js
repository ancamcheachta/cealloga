'use strict';

const CeallogFunction = require('../models/CeallogFunction');
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
        
        CeallogFunction.findOne({_id: id}, function(err, result) {
            let dbResult = util.dbResultCallback(req.publisher)(err, result);
            
            if(dbResult.type == 'SUCCESS' && result != null && '_id' in result) {
                req.publisher.newRecord = result;
                
                next();
            } else {
                try {
                    throw new PublishError(
                        messages.NON_EXISTING_RESOURCE,
                        'NON_EXISTING_RESOURCE'
                    );
                } catch(e) {
                    err = new HttpError(e, e.errorType, 400);
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
    let query = {$and: [
        {name: {$eq: name}},
        {published: {$eq: true}}
    ]};
    
    if(name) {
        CeallogFunction.findOne(query, (err, result) => {
            let dbResult = util.dbResultCallback(req.publisher)(err, result);

            if(dbResult.type == 'SUCCESS' && result != null && '_id' in result) {
                req.publisher.oldRecord = result;
            }
            
            next();
        });
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
        let response = {};
        
        response.compiled = r.compiled;
        response.created_date = r.created_date;
        response.id = r._id;
        response.label = r.label;
        response.name = r.name;
        response.published = true;
        response.service = `/${settings.cealloga.api_path}/${r.name}`;

        res.json(response);
    }).catch((err) => {
        
    });
};

module.exports = [findNew, findOld, update];
