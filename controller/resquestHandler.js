'use strict';
var express = require('express');
var router = express.Router();
var colors = require('colors');

var logger = require('../controller/logger.js');
var i18n = require('../i18n/i18n.js');

var routes = {};

routes.index = function(req, res, next) {
  req.reqId = Date.now();

  var _requestLog = ('[' + req.method + ']').bgGreen + ' ' + req.originalUrl;

  if (req.query) {
    var _bodyString = JSON.stringify(req.body)
    if (_bodyString !== '{}') _requestLog += '\n\t\t\t' + '[BODY]'.green + ' ' + JSON.stringify(req.body);
  }

  logger.request(req.reqId, _requestLog);
  next();
}

router.all('*', routes.index);
module.exports = router;
