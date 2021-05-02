var express = require('express');
var router = express.Router();

// Requires controller modules
var index = require('../controllers/index');

// Homepage Routes
router.get('/', index.index);
router.get('/home', index.index);

module.exports = router;
