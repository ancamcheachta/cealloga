/**
 * @desc Exports cache exposing interfaces for compiled `CeallogFunction` source
 * code and metadata.
 * @since 0.2.0
 */
'use strict';

/**
 * @desc The map in which cached functions are stored.  Key is the
 * `CeallogFunction` name, value is an object containing `compiled` (function)
 * and`ceallogFunction` (object) fields.
 * @private
 * @type {Object}
 * @see #cache
 * @since 0.2.0
 */
let _cache = {};

/**
 * @desc Cache functions exported in this module.
 * @since 0.2.0
 */
const cache = {
    /**
     * @desc Adds function and metadata to cache.
     * @param {function} compiled The compiled function.
     * @param {Object} ceallogFunction The object containing ceallogFunction
     * metadata.
     * @since 0.2.0
     */
    add: (compiled, ceallogFunction) => {
        let name = ceallogFunction.name;
        
        _cache[name] = {
            compiled: compiled,
            ceallogFunction: ceallogFunction
        };
    },
    /**
     * @desc Queries all `CeallogFunction` entries, compiles them, and adds them
     * to the cache. Called when module is loaded.
     * @since 0.2.0
     * @todo Write the code.
     */
    initModule: () => {
        // TODO: Write code
    },
    /**
     * @desc Adds `cache` field to `req`.  Called before any other middlewear on
     * `/code` and `/ceallog` routes.
	 * @param {Object} req Express request object
	 * @param {Object} res Express response object
	 * @param {function} next Function to be called by Express next.
	 * @since 0.2.0
     */
    initRequest: (req, res, next) => {
        req.cache = {
            add: cache.add,
            get: (name) => {
                return _cache[name];
            }
        };
        
        next();
    },
    /**
     * @desc Removes an entry from cache if the name is found.
     * @param {string} name
     * @return {boolean} Whether entry was deleted from the cache.
     * @since 0.2.0
     */
    remove: name => {
        if(name in _cache) {
            delete _cache[name];
            return true;
        }
        
        return false;
    }
};

cache.initModule();

module.exports = cache;
