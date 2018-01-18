'use strict';

const assert = require('assert');
const cache = require('../src/cache');

const compiled = () => {};
const unpublished = {
    body: '() => {}',
    id: 'asdf',
    label: 'Unpublished',
    name: 'unpublished',
    published: false
};

describe('cache', () => {
	describe('#remove()', () => {
	    it('should succeed to remove existing unpublished resource', () => {
    	    let req = {};
    	    
    	    cache.add(compiled, unpublished);
    	    cache.initRequest(req, null, () => {
    	        assert(req.cache.removeUnpublished(unpublished.id), 'Remove failed');
    	    });
	    });
	    
	    it('should fail to remove non-existing unpublished resource', () => {
    	    let req = {};

    	    cache.initRequest(req, null, () => {
    	        assert(!req.cache.removeUnpublished('noop'), 'Remove succeeded');
    	    });
	    });
	});
});
