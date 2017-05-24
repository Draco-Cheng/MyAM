"use strict";
var express = require('express');
var router = express.Router();
var routes = {};
var i18n = require('../i18n/i18n.js');
var responseHandler = require('../controller/responseHandler.js');
var authService = require('../services/auth.js');

/*
 * GET home page.
 */

routes.index = function(req, res, next) {
  if (req.method === 'OPTIONS') {
    var headers = {};
    // IE8 does not allow domains to be specified, just the *
    // headers["Access-Control-Allow-Origin"] = req.headers.origin;
    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
    headers["Access-Control-Allow-Credentials"] = false;
    headers["Access-Control-Max-Age"] = '86400'; // 24 hours
    headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Auth-UID, Auth-Salt, Auth-Token";
    res.writeHead(200, headers);
    res.end();
  } else if (req.url.indexOf('/auth/login') == 0) {
    // Cross domain header
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  } else {
    // Cross domain header
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    // do auth check 
    if (authService.check(req.headers)) {
      next();
    } else {
      responseHandler(401, req, res);
    }
  }
}

routes.ping = function(req, res, next) {
  responseHandler(200, req, res);
}

router.all('*', routes.index)
  .head('/', routes.ping)
  .get('/ping', routes.ping)
  .use('/auth', require('./auth'))
  .use('/profile', require('./profile'))
  .use('/db', require('./db'))
  .use('/currency', require('./currency'))
  .use('/type', require('./type'))
  .use('/record', require('./record'));

module.exports = router;
