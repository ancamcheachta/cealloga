'use strict';

const express = require('express');
const dev = require('./dev');
const prod = require('./prod');
const router = express.Router();
const settings = require('../settings');

module.exports = plugins => {
    const apiPath = settings.cealloga.api_path;
    const testPath = settings.cealloga.test_path;
    
    if (arguments.length > 1) {
        plugins = Array.prototype.slice.call(arguments);
    } else if (arguments.length == 1 && !(arguments[0] instanceof Array)) {
        plugins = [arguments[0]];
    } else {
        plugins = plugins || [];
    }
    
    router.post(`/${apiPath}/${testPath}/:id`, dev(plugins));
    router.post(`/${apiPath}/:name`, prod(plugins));
    
    return router;
};
