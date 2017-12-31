'use strict';

const express = require('express');
const router = express.Router();

router.get('/', require('./list'));
router.get('/:id', require('./record'));
router.get('/publish/:id', require('./publish'));
router.get('/unpublish/:name', require('./unpublish'));
router.post('/validate', require('./validate'));

module.exports = router;
