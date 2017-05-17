"use strict";

var express = require('express');
var router = express.Router();

var responseHandler = require('../controller/responseHandler.js');
var tools = require('../controller/tools.js');

var services  = {};
	services.type = require('../services/type.js');
	services.dbService = require('../services/dbService.js');

var routes = {};

routes.get = function(req, res, next) {
	var data = tools.createData(req);
	if(!data.dbFile) return responseHandler(406, req, res);

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

routes.set = function(req, res, next) {
	var data = tools.createData(req);
	data.tid 		= req.body.tid;
	data.type_label = req.body.type_label;
	data.cashType 	= req.body.cashType;
	data.master 	= req.body.master;
	data.showInMap 	= req.body.showInMap;
	data.quickSelect= req.body.quickSelect;

	if(!data.dbFile || !data.tid && ( !data.type_label || data.cashType === undefined ))
		return responseHandler(406, req, res);

	services.type.setTypes(data)
		.nodeify(function(err, data){
			if(err){
				responseHandler(err.code, req, res);
			}else{
				responseHandler(200, data.resault[0] , req, res);
				services.dbService.syncDB(data);
			}
		});
}
router.all('/set'	, routes.set);

routes.del = async(req, res, next) => {
  var data = tools.createData(req);

  if (!data.dbFile || !req.body.del_tid)
    return responseHandler(406, req, res);

  data['meta'] = { 'del_tid': req.body.del_tid };

  await services.type.delTypes(data);

  responseHandler(data['error'] || 200, req, res);
  services.dbService.syncDB(data);
}
router.all('/del', routes.del);


routes.getMaps = function(req, res, next) {
	var data = tools.createData(req);
	if(!data.dbFile) return responseHandler(406, req, res);
	data.tid = req.body.tid;

	services.type.getTypeMaps(data)
		.nodeify(function(err, data){
			if(err){
				responseHandler(err.code, req, res);
			}else{
				responseHandler(200, data.resault[0] , req, res);
			}
		});
}
router.all('/getMaps'	, routes.getMaps);

routes.setMaps = function(req, res, next) {
	var data = tools.createData(req);
	data.tid = req.body.tid;
	data.sub_tid = req.body.sub_tid;

	if(!data.dbFile || !data.tid || !data.sub_tid)
		return responseHandler(406, req, res);

	services.type.setTypeMaps(data)
		.nodeify(function(err, data){
			if(err){
				responseHandler(err.code, req, res);
			}else{
				responseHandler(200, data.resault[0] , req, res);
				services.dbService.syncDB(data);
			}
		});
}
router.all('/setMaps'	, routes.setMaps);


routes.delTypeMaps = function(req, res, next) {
	var data = tools.createData(req);
	data.del_tid = req.body.del_tid;
	data.del_sub_tid = req.body.del_sub_tid;

	if(!data.dbFile || !data.del_tid || !data.del_sub_tid)
		return responseHandler(406, req, res);

	services.type.delTypeMaps(data)
		.nodeify(function(err, data){
			if(err){
				responseHandler(err.code, req, res);
			}else{
				responseHandler(200, data.resault[0] , req, res);
				services.dbService.syncDB(data);
			}
		});
}
router.all('/delMaps'	, routes.delTypeMaps);

routes.setMapSequence = function(req, res, next) {
	var data = tools.createData(req);
	data.tid = req.body.tid;
	data.sub_tid = req.body.sub_tid;
	data.sequence = req.body.sequence;

	if(!data.dbFile || !data.tid || !data.sub_tid || !data.sequence )
		return responseHandler(406, req, res);

	services.type.setTypeMaps(data)
		.nodeify(function(err, data){
			if(err){
				responseHandler(err.code, req, res);
			}else{
				responseHandler(200, data.resault[0] , req, res);
				services.dbService.syncDB(data);
			}
		});
}
router.all('/setMapSequence'	, routes.setMapSequence);

module.exports = router;