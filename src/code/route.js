/**
 * @desc Exports middlewear for `/code/*`
 * @since 0.1.0
 */
'use strict';

/**
 * @ignore
 */
const express = require('express'), router = express.Router();

router.get('/publish/:id', require('./publish'));
router.get('/unpublish/:name', require('./unpublish'));
router.post('/validate', require('./validate'));
router.get('/:id', require('./record'));
router.get('/', require('./list'));

module.exports = router;
