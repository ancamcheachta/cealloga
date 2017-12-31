'use strict';

const CeallogFunction = require('../models/CeallogFunction');
const HttpError = require('../classes/HttpError');
const RecordError = require('../classes/RecordError');
const settings = require('../settings');

const messages = {
    'MISSING_PARAMS': 'Required parameters missing.',
    'NON_EXISTING_RESOURCE': 'Resource does not exist.'
};

module.exports = (req, res, next) => {
    let id = req.params.id;
    
    if(id) {
        CeallogFunction.findOne({_id: id}, (err, result) => {
            if(err) {
                try {
                    throw new RecordError(
                        messages.NON_EXISTING_RESOURCE,
                        'NON_EXISTING_RESOURCE'
                    );
                } catch(e) {
                    new HttpError(e, e.errorType, 404).sendError(res);
                }
            } else {
                let service = result.published ? `/${settings.cealloga.api_path}/${result.name}`:
                    `/${settings.cealloga.api_path}/${settings.cealloga.test_path}/${result._id}`;
                    
                res.statusCode = 200;
                res.json({
                    id: result._id,
                    compiled: result.compiled,
                    label: result.label,
                    name: result.name,
                    published: result.published,
                    service: service
                });
            }
        });
    } else {
        try {
            throw new RecordError(messages.MISSING_PARAMS, 'MISSING_PARAMS');
        } catch(e) {
            new HttpError(e, e.errorType, 400).sendError(res);
        }
    }
};
