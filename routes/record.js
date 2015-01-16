"use strict";

var express = require('express');
var router = express.Router();

var responseHandler = require('../controller/responseHandler.js');
var tools = require('../controller/tools.js');

var services  = {};
	services.record = require('../services/record.js');

var routes = {};

/*routes.get = function(req, res, next) {
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
router.all('/get'	, routes.get);*/

routes.set = function(req, res, next) {
	var data = tools.createData(req);
	data.rid	= req.body.rid;
	data.cid	= req.body.cid;
	data.value 	= req.body.value;
	data.memo 	= req.body.memo;
	data.date 	= req.body.date;

	if(!data.dbFile || (!data.rid && ( !data.cid || !data.value || !data.date ) ) )
		return responseHandler(406, req, res);

	services.record.setRecord(data)
		.nodeify(function(err, data){
			if(err){
				responseHandler(err.code, req, res);
			}else{
				responseHandler(200,data.resault[0] , req, res);
			}
		});
}
router.all('/set'	, routes.set);

routes.setTypes = function(req, res, next) {
	var data = tools.createData(req);
	data.rid = req.body.rid;
	data.tids_json	= req.body.tids_json;

	if(!data.dbFile || !data.rid || !data.tids_json)
		return responseHandler(406, req, res);

	services.record.setRecordTypes(data)
		.nodeify(function(err, data){
			if(err){
				responseHandler(err.code, req, res);
			}else{
				responseHandler(200, req, res);
			}
		});
}
router.all('/setTypes'	, routes.setTypes);

routes.get = function(req, res, next) {
	var data = tools.createData(req);
	data.rid	= req.body.rid;
	data.cid	= req.body.cid;
	data.value_greater = req.body.value_greater;
	data.value_less = req.body.value_less;
	data.memo = req.body.memo;
	data.start_date	= req.body.start_date;
	data.end_date = req.body.end_date;
	data.limit = req.body.limit;

	services.record.getRecord(data)
		.nodeify(function(err, data){
			if(err){
				responseHandler(err.code, req, res);
			}else{
				responseHandler(200,data.resault[0] , req, res);
			}
		});
}
router.all('/get'	, routes.get);

module.exports = router;