"use strict";

var express = require('express');
var router = express.Router();

var responseHandler = require('../controller/responseHandler.js');
var tools = require('../controller/tools.js');

var services  = {};
	services.currency = require('../services/currency.js');

var routes = {};

routes.get = function(req, res, next) {
	var data = tools.createData(req);
	if(!data.dbFile) return responseHandler(406, req, res);	

	services.currency.getCurrencies(data)
		.nodeify(function(err, data){
			if(err){
				responseHandler(err.code, req, res);
			}else{
				responseHandler(200, data.resault[0] , req, res);
			}
		});
}
router.all('/get'	, routes.get);

routes.set = function(req, res, next) {
	var data = tools.createData(req);
	data.cid	= req.body.cid;
	data.to_cid	= req.body.to_cid;
	data.type 	= req.body.type.toUpperCase();
	data.memo 	= req.body.memo;
	data.rate 	= req.body.rate;
	data.date 	= req.body.date;
	data.quickSelect = req.body.quickSelect;

	if(!data.dbFile || (!data.cid && ( !data.type || !data.rate ) ) )
		return responseHandler(406, req, res);

	services.currency.setCurrencies(data)
		.nodeify(function(err, data){
			if(err){
				responseHandler(err.code, req, res);
			}else{
				responseHandler(200, req, res);
			}
		});
}
router.all('/set'	, routes.set);


module.exports = router;