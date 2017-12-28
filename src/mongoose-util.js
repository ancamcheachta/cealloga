'use strict';

const mongoose = require('mongoose');

const responses = {
    INVALID_ID: {
        statusCode: 400,
        message: 'Invalid id.'
    },
    INTERNAL_SERVER_ERROR: {
        statusCode: 500,
        message: 'An internal error occurred.'
    },
    MISSING_PARAMS: {
        statusCode: 400,
        message: 'Missing required query parameters.'
    },
    MISSING_RESOURCE: {
        statusCode: 400,
        message: 'Missing resource.'
    },
    REMOVED_RESOURCE: {
        statusCode: 204,
        message: null
    },
    RESOURCE_NOT_FOUND: {
        statusCode: 404,
        message: 'Resource not found.'
    },
    SAVE_RESULT: {
        statusCode: 201,
        message: 'Resource created.'
    },
    SUCCESS: {
        statusCode: 200,
        message: 'Resource retrieved successfully.'
    },
    UPDATE_RESULT: {
        statusCode: 204,
        message: null
    },
    UPDATE_ERROR: {
        statusCode: 406,
        message: 'Server rejected partial resource.'
    },
    VALIDATION_ERROR: {
        statusCode: 400,
        message: 'There were problems with the values you provided. Please review.'
    }
};

const settings = require('./settings');

var util = {
    getObjectId: function(str){
        let oid = null;
        try {
            oid = mongoose.Types.ObjectId(str);
        } catch(e) { }  // TODO: define exception behaviour
        return oid;
    },
    dbResultCallback: function(req) {
        return function(err, results) {
            req.mongooseResults = req.mongooseResults || [];
            
            let mongooseResult = {};
            
            mongooseResult.isErr = err != null && typeof err == 'object' && 'name' in err && 'errors' in err;
            mongooseResult.isSave = !mongooseResult.isErr && !err && results && typeof results == 'object' && 'nInserted' in results;
            mongooseResult.isUpdate = !mongooseResult.isErr && !err && results && typeof results == 'object' && 'ok' in results;
            mongooseResult.isDelete = !mongooseResult.isErr && !err && results && typeof results == 'object' && 'result' in results && 'ok' in results.result;
            mongooseResult.results = results;
            mongooseResult.err = err;

            switch(true) {
                case err != null && err.name == 'ValidationError':
                    mongooseResult.type = 'VALIDATION_ERROR';
                    break;
                case mongooseResult.isSave:
                    mongooseResult.type = 'SAVE_RESULT';
                    break;
                case mongooseResult.isUpdate && results.ok > 0:
                    mongooseResult.type = 'UPDATE_RESULT';
                    break;
                case mongooseResult.isUpdate && results.ok == 0:
                    mongooseResult.type = 'UPDATE_ERROR';
                    break;
                case mongooseResult.isDelete:
                    mongooseResult.type = 'REMOVED_RESOURCE';
                    break;
                case err != null:
                    mongooseResult.type = 'INTERNAL_SERVER_ERROR';
                    break;
                default:
                    mongooseResult.type = 'SUCCESS';
            }
            
            mongooseResult.message = responses[mongooseResult.type].message;
            mongooseResult.statusCode = responses[mongooseResult.type].statusCode;

            req.mongooseResults.push(mongooseResult);
            
            return mongooseResult;
        };
    },
    getDbCallback: function(req, res) {
        return function(err, results) {
            let isMongooseErr = err && typeof err == 'object' && 'name' in err && 'ersrors' in err,
                isMongooseSaveResult = !isMongooseErr && !err && results && typeof results == 'object' && '_id' in results,
                isMongooseUpdateResult = !isMongooseErr && !err && results && typeof results == 'object' && 'ok' in results,
                isMongooseDeleteResult = !isMongooseErr && !err && results && typeof results == 'object' && 'result' in results && 'ok' in results.result;
                
            if(isMongooseErr && err.name == 'ValidationError'){
                util.sendMongooseErr(req, res, responses.VALIDATION_ERROR, err);
                return;
            } else if(isMongooseSaveResult) {
                util.sendMongooseSuccess(req, res, responses.SAVE_RESULT, results);
                return;
            } else if(isMongooseUpdateResult && results.ok > 0) {
                util.sendMongooseSuccess(req, res, responses.UPDATE_RESULT, results);
                return;
            } else if(isMongooseUpdateResult && results.ok == 0){
                util.send(req, res, responses.UPDATE_ERROR);
                return;
            } else if(isMongooseDeleteResult) {
                util.sendMongooseSuccess(req, res, responses.REMOVED_RESOURCE, results);
                return;
            } else if(err) {
                console.error(err);
                util.send(req, res, responses.INTERNAL_SERVER_ERROR);
                return;
            }
            
            if(!err && res.beforeSend && typeof res.beforeSend == 'function') {
                res.beforeSend(results, function(errEnumVal, filtered) {
                    if(errEnumVal) {
                        util.send(req, res, errEnumVal);
                        return;
                    }
                    res.json(filtered);
                    return;
                });
                return;
            }
            
            res.json(results);
        };
    },
    responses: responses,
    send: function(req, res, enumVal){
        res.statusCode = enumVal.statusCode;
        res.json({message: enumVal.message});
    },
    sendMongooseErr: function(req, res, enumVal, err) {
        res.statusCode = enumVal.statusCode;
        res.json({
            errors: function() {
                var errors = [];
                for(var field in err.errors) {
                    var e = err.errors[field];
                    if(e && typeof e == 'object' && 'message' in e) {
                        errors.push({
                            field: field,
                            message: e.message
                        });
                    }
                }
                return errors;
            }(),
            message: enumVal.message
        });
    },
    sendMongooseSuccess: function(req, res, enumVal, success) {
        res.statusCode = enumVal.statusCode || 200;
        switch(enumVal) {
            case responses.SAVE_RESULT:
                res.json({
                    compiled: true,
                    id: success._id,
                    message: enumVal.message,
                    published: false,
                    service: `/${settings.cealloga.api_path}/${settings.cealloga.test_path}/${success._id}`
                });
                break;
            case responses.UPDATE_RESULT:
                res.send(enumVal.message);
                break;
            case responses.REMOVED_RESOURCE:
                res.send(enumVal.message);
                break;
            default: 
                res.json(success);
        }
    }
};

module.exports = util;
