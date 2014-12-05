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



routes.dbList = function(req, res, next) {
	var data = {};
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
	data.dbFile = config.dbFolder + req.body.dbId;

	services.initial.checkAndCreate(data)
		.then(function(data){
			if(data.dbFileExists){
				throw responseHandler(409, req, res);
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


module.exports = router;