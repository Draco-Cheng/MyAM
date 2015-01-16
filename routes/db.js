"use strict";
var express = require('express');
var dateFormat = require('dateformat');
var router = express.Router();

var responseHandler = require('../controller/responseHandler.js');
var tools = require('../controller/tools.js');

var services  = {};
    services.initial = require('../services/initial.js');
	services.dbService = require('../services/dbService.js');
	services.currency = require('../services/currency.js');
	services.type = require('../services/type.js');
	

var config = require("../config.js");

var routes = {};

// logger is special function so its not in the controller object
var logger = require("../controller/logger.js");

routes.check = function(req, res, next) {
	var data = tools.createData(req);
	if(!data.dbFile) return responseHandler(406, req, res);	

	services.initial.checkDB(data)
		.nodeify(function(err, data){
			if(err){
				responseHandler(err.code, req, res);
			}else{
				var _res = { dbExists : data.fileExists };
				responseHandler(200, _res , req, res);				
			}
		});
}
router.all('/check'	, routes.check);

routes.dbList = function(req, res, next) {
	var data = tools.createData(req);
	data.path = config.dbFolder;

	services.dbService.dbList(data)
		.then(function(data){
			var _list = data.fileList.filter(function(ele){
			  if(!ele.isDir)
			  	return true;
			}).map(function(ele){
				return ele;
			});

			responseHandler(200,_list, req, res);
		})

}

router.all('/dbList'	, routes.dbList);

routes.creat = function(req, res, next) {
	var data = tools.createData(req);
	if(!data.dbFile || !req.body.mainCurrenciesType)
		return responseHandler(406, req, res);

	services.initial.checkAndCreate(data)
		.then(function(data){
			if(data.code){
				throw responseHandler(data.code, req, res);
			}else{
				logger.info(data.reqId, "set currencies...");
				data.type = req.body.mainCurrenciesType.toUpperCase();
				data.main = true;
				data.memo = "Initialize";
				data.rate = 1;
				data.date = dateFormat(new Date(),"yyyy-mm-dd");
				data.quickSelect = true;
				return services.currency.setCurrencies(data);				
			}
		})
		.then(function(data){
			if(data.code){
				throw responseHandler(data.code, req, res);
			}else{
				logger.info(data.reqId, "set types...");
				data.type_label = "Unclassified";
				data.cashType 	= 0;
				data.master 	= false;
				data.showInMap 	= true;
				data.quickSelect= true;
				return services.type.setTypes(data);				
			}
		})
		.then(function(data){
			responseHandler(200, req, res);
		});
}
router.all('/create'	, routes.creat);

routes.upload = function(req, res, next) {
	var data = tools.createData(req);
	data.renameFolder = config.dbFolder;
	data.fileConflict = "backup";
	services.initial.uploadDB(data)
		.then(function(data){
			responseHandler(200,data.dbInfo , req, res);
		});
}
router.all('/upload'	, routes.upload);

module.exports = router;


