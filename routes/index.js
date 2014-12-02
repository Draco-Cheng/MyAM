"use strict";
var express = require('express');
var router = express.Router();
var routes = {};

/*
 * GET home page.
 */


routes.index = function(req, res, next) {
	if ('do next'){
		next();
	}else{
		res.status(401);
		res.json({message: 'stop'})
	}
}


routes.ping = function(req, res,next) {
	res.statusCode = 200;
	res.end('pong');
}

	
router.all('*'		, routes.index)
	  .head('/'		, routes.ping)
	  .get('/ping'	, routes.ping)
	  .use('/db'	, require('./db'));	

module.exports = router;