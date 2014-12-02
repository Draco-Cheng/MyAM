"use strict";
var express = require('express');
var router = express.Router();
var services  = {};
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

			res.statusCode = 200;
			res.json(_list);
		})

}

	
router.get('/dbList'	, routes.dbList);	

module.exports = router;