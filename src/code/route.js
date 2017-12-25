'use strict';

const express = require('express');
const router = express.Router();

router.get('/', require('./list'));
router.get('/:id', require('./record'));
router.get('/publish', require('./publish'));
router.get('/unpublish', require('./unpublish'));
router.post('/validate', require('./validate'));

module.exports = router;
