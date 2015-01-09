"use strict";
var express = require('express');
var router = express.Router();
var routes = {};
var i18n = require('../i18n/i18n.js');
var responseHandler = require('../controller/responseHandler.js');

/*
 * GET home page.
 */

routes.index = function(req, res, next) {
	if ('do next'){
		next();
	}else{
		responseHandler(401, req, res);
	}
}

routes.ping = function(req, res,next) {
	responseHandler(200, req, res);
}
	
router.all('*'		, routes.index)
	  .head('/'		, routes.ping)
	  .get('/ping'	, routes.ping)
	  .use('/db'	, require('./db'))
	  .use('/currency'	, require('./currency'))
	  .use('/type'	, require('./type'));	

module.exports = router;