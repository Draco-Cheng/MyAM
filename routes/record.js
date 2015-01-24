"use strict";

var express = require('express');
var router = express.Router();

var responseHandler = require('../controller/responseHandler.js');
var tools = require('../controller/tools.js');

var services  = {};
	services.record = require('../services/record.js');

var routes = {};

routes.del = function(req, res, next) {
	var data = tools.createData(req);
	data.del_rid	= req.body.rid;

	if(!data.dbFile || !data.del_rid)
		return responseHandler(406, req, res);

	services.record.delRecord(data)
		.nodeify(function(err, data){
			if(err){
				responseHandler(err.code, req, res);
			}else{
				responseHandler(200, req, res);
			}
		});
}
router.all('/del'	, routes.del);

routes.set = function(req, res, next) {
	var data = tools.createData(req);
	data.rid	= req.body.rid;
	data.cashType = req.body.cashType;
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
	data.rids_json	= req.body.rids_json;
	data.tids_json	= req.body.tids_json;
	data.cid	= req.body.cid;
	data.value_greater = req.body.value_greater;
	data.value_less = req.body.value_less;
	data.memo = req.body.memo;
	data.start_date	= req.body.start_date;
	data.end_date = req.body.end_date;
	data.limit = req.body.limit;
	data.cashType = req.body.cashType;

	try{data.orderBy = JSON.parse(req.body.orderBy);}catch(e){};
	

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

routes.getTypes = function(req, res, next) {
	var data = tools.createData(req);
	data.rids = req.body.rids_json ? JSON.parse(req.body.rids_json) : [];
	data.tids = req.body.tids_json ? JSON.parse(req.body.tids_json) : [];

	if(!data.dbFile)
		return responseHandler(406, req, res);

	services.record.getRecordTypes(data)
		.nodeify(function(err, data){
			if(err){
				responseHandler(err.code, req, res);
			}else{
				responseHandler(200,data.resault[0], req, res);
			}
		});
}
router.all('/getTypes'	, routes.getTypes);

module.exports = router;