'use strict';

const CeallogFunction = require('../models/CeallogFunction');
const HttpError = require('../classes/HttpError');
const ListError = require('../classes/ListError');

const messages = {
    MISSING_NAME_PARAMETER: '`name` parameter must be included when querying unpublished resources.'
};

// Queries:
// - latest grouped by name
// - published
// - unpublished with name filter
const query = (req, res, next) => {
    let name = req.query.name;
    let published = req.query.published;
    
    if(published != null || name != null) {
        let query;
        
        if(published == '0') {
            if(!name) {
                try {
                    throw ListError(messages.MISSING_NAME_PARAMETER, 'MISSING_NAME_PARAMETER');
                } catch(e) {
                    new HttpError(e, e.errorType, 400).sendError(res);
                } finally {
                    return;
                }
            }
            
            query = {$and: [{published: false}, {name: name}]};
        } else if(name != null) {
            query = {name: name};
        } else {
            query = {published: true};
        }
        
        return CeallogFunction.find(query, (err, result) => {
            
        });
    } else {
        // Query latest
    }
    
    res.json([]);
};

module.exports = [query];
