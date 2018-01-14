'use strict';

const express = require('express');
const dev = require('./dev');
const prod = require('./prod');
const router = express.Router();
const settings = require('../settings');

module.exports = function(plugins) {
    const testPath = settings.cealloga.test_path;
    const cache = require('../cache');
    
    if (arguments.length > 1) {
        plugins = Array.prototype.slice.call(arguments);
    } else if (arguments.length == 1 && !(arguments[0] instanceof Array)) {
        plugins = [arguments[0]];
    } else {
        plugins = plugins || [];
    }

    router.use(cache.initRequest);
    router.post(`/${testPath}/:id`, dev(plugins));
    router.post(`/:name`, prod(plugins));
    
    return router;
};
