"use strict";

var express = require('express');
var router = express.Router();

var responseHandler = require('../controller/responseHandler.js');
var tools = require('../controller/tools.js');

var services  = {};
	services.type = require('../services/type.js');



var routes = {};


/*
 * GET home page.
 */

routes.get = function(req, res, next) {
	var data = tools.createData(req);
	if(!data.dbFile) return responseHandler(406, req, res);	
	
	var data = {};
	data.reqId = req.reqId;
	data.request = req ;
	data.dbFile =  config.dbFolder + req.body.db;

	services.type.getTypes(data)
		.nodeify(function(err, data){
			if(err){
				responseHandler(err.code, req, res);
			}else{
				responseHandler(200, data.resault[0] , req, res);
			}
		});
}
router.all('/get'	, routes.get);

module.exports = router;