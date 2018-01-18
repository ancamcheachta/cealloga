/**
 * @desc Exports cache exposing interfaces for compiled `CeallogFunction` source
 * code and metadata.
 * @since 0.2.0
 */
'use strict';

/**
 * @ignore
 */
const CeallogFunction = require('./models/CeallogFunction'),
    compileStringSync = require('./compiler').compileStringSync;

/**
 * @desc The map in which published, cached functions are stored.  Key is the
 * `CeallogFunction` name, value is an object containing `compiled` (function)
 * and `ceallogFunction` (object) fields.
 * @private
 * @type {Object}
 * @see #cache
 * @since 0.2.0
 */
let _cache = {};

/**
 * @desc The map in which unpublished, cached functions are stored.  Key is the
 * `CeallogFunction` id, value is an object containing `compiled` (function) and
 * `ceallogFunction` (object) fields.
 * @private
 * @type {Object}
 * @see #cache
 * @since 0.2.0
 */
let _idCache = {};

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
        let key = ceallogFunction.published ? ceallogFunction.name
            :ceallogFunction.id;
        let c = ceallogFunction.published ? _cache : _idCache;
        
        c[key] = {
            compiled: compiled,
            ceallogFunction: ceallogFunction
        };
    },
    /**
     * @desc Queries all `CeallogFunction` entries, compiles them, and adds them
     * to the cache. Called when module is loaded.
     * @since 0.2.0
     */
    init: (callback) => {
        CeallogFunction.find({}, (err, results) => {
            if (err) throw err;
            
            results.forEach(ceallogFunction => {
                ceallogFunction.id = ceallogFunction._id;
                
                delete ceallogFunction.__v;
	            delete ceallogFunction._id;
	            
	            try {
	                let compiled = compileStringSync(ceallogFunction.body);
	                
	                cache.add(compiled, ceallogFunction);
	            } catch(err) {
	                let id = ceallogFunction.id;
	                let name = ceallogFunction.name;
	                
	                console.warn(`Failed to compile/cache \`${name}\` (${id})`);
	                console.warn(err);
	            }
            });
            
            if (callback) {
                callback();
            }
        });
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
            getPublished: (name) => {
                return _cache[name];
            },
            getUnpublished: (id) => {
                return _idCache[id];
            },
            removePublished: (name) => {
                return cache.remove(name, true);
            },
            removeUnpublished: (id) => {
                return cache.remove(id, false);
            },
        };
        
        next();
    },
    /**
     * @desc Removes an entry from the appropriate cache if the key is found.
     * @param {string} key
     * @param {boolean} published
     * @return {boolean} Whether entry was deleted from the cache.
     * @since 0.2.0
     */
    remove: (key, published) => {
        let c = published ? _cache : _idCache;
        
        if(key in c) {
            delete c[key];
            return true;
        }
        
        return false;
    }
};

module.exports = cache;
