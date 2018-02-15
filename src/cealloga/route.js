/**
 * @desc Exports middlewear for `cealloga/_test/:id` and `/cealloga/:name`.
 * @since 0.2.0
 */
'use strict';

/**
 * @ignore
 */
const express = require('express'),
    dev = require('./dev'),
    prod = require('./prod'),
    router = express.Router(),
    settings = require('../settings'),
    testPath = settings.cealloga.test_path,
    cache = require('../cache'),
    path = require('path');

/**
 * @ignore
 */
let plugins = [require('../plugins/cealloga-variables-plugin')];

if (settings.plugins && settings.plugins instanceof Array) {
    /* istanbul ignore next */
    settings.plugins.forEach(plugin => plugins.push(require(plugin)));
}

router.use(cache.initRequest);
router.post(`/${testPath}/:id`, dev(plugins));
router.post(`/:name`, prod(plugins));

module.exports = router;
