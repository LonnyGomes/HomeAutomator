/*jslint node: true */
/*
 * GET home page.
 */
var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function (req, res) {
    'use strict';
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

module.exports = router;
