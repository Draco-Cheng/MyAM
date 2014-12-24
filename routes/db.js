"use strict";
var express = require('express');
var router = express.Router();

var responseHandler = require('../controller/responseHandler.js');
var services  = {};
    services.initial = require('../services/initial.js');
	services.dbService = require('../services/dbService.js');

var config = require("../config.js");

var routes = {};


/*
 * GET home page.
 */

routes.check = function(req, res, next) {
	var data = {};
	data.reqId = req.reqId;
	data.request = req ;
	data.checkFile =  config.dbFolder + req.body.checkFile;

	services.initial.check(data)
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
	var data = {};
	data.reqId = req.reqId;
	data.path = config.dbFolder;

	services.dbService.dbList(data)
		.then(function(data){
			var _list = data.fileList.filter(function(ele){
			  if(!ele.isDir && ele.name.substring(ele.name.length-3)===".db")
			  	return true;
			}).map(function(ele){
				return ele.name;
			});

			responseHandler(200,_list, req, res);
		})

}

router.get('/dbList'	, routes.dbList);

routes.creat = function(req, res, next) {
	if(!req.body.dbId || !req.body.mainCurrenciesType){
		return responseHandler(406, req, res);
	}

	var data = {};
	data.reqId = req.reqId;
	data.dbFile = config.dbFolder + req.body.dbId;

	services.initial.checkAndCreate(data)
		.then(function(data){
			if(data.code){
				throw responseHandler(data.code, req, res);
			}else{
				data.cid = Date.now();
				data.to_cid = data.cid;
				data.main = 1;
				data.type = req.body.mainCurrenciesType.toUpperCase();
				data.memo = "initial_currence";
				data.rate = 1;
				data.date = data.cid;
				data.showup = 1;
				return services.initial.setCurrencies(data);				
			}
		})
		.then(function(data){
			responseHandler(200, req, res);
		});


}
router.all('/create'	, routes.creat);

routes.upload = function(req, res, next) {
	var data = {};
	data.reqId = req.reqId;
	data.request = req ;
	data.renameFolder = config.dbFolder;
	data.fileConflict = "backup";
	services.initial.uploadDB(data)
		.then(function(data){
			responseHandler(200,data.dbInfo , req, res);
		});
}
router.all('/upload'	, routes.upload);

module.exports = router;


