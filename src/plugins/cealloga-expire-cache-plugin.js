/**
 * @desc A plugin used to lazily manage the application cache per request.
 * @since 0.2.0
 */
'use strict';

/**
 * @ignore
 */
const settings = require('../settings'),
    limits = settings.limits || {};
    
/**
 * @desc Number of days in which an unpublished `ceallogFunction` can remain
 * cached. Default: `5`.
 * @type number
 * @since 0.2.0
 */
const UNPUBLISHED_CACHED_LIMIT = limits.UNPUBLISHED_CACHED_LIMIT || 5;

module.exports = {
    afterExecute: function(response) {
        /* istanbul ignore next*/
        return;
    },
    /**
     * @desc Attempts to retrieve cached function and metadata by id. If
     * successful, and if the cached function is both unpublished and above the
     * `UNPUBLISHED_CACHED_LIMIT`, the function is removed from cache.
     * @param {Object} request Express request object.
     * @since 0.2.0
     */
    beforeExecute: function(request) {
        let id = request.params.id;
        let cached = request.cache.getUnpublished(id);
        
        if(cached) {
            let ceallogFunction = cached.ceallogFunction;
            let createdDate = new Date(ceallogFunction["created_date"]);
            let elapsedDays = (new Date() - createdDate) / 1000 / 60 / 60 / 24;
            let published = ceallogFunction.published;
            
            if(!published && elapsedDays > UNPUBLISHED_CACHED_LIMIT) {
                request.cache.removeUnpublished(id);
            }
        }
    },
    extend: function() {
        /* istanbul ignore next*/
        return;
    }
};
