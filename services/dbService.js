var Promise =  require("promise");
var controller = {
	dbFile : require('../controller/dbFile.js')
};
var fs = require('fs');
var dateFormat = require('dateformat');
// logger is special function so its not in the controller object
var logger = require("../controller/logger.js");
var config = require("../config.js");


var _dbList = function(data, callback){
	data = data || {};
	logger.debug(data.reqId,"Check Database Folder"+data.path+" exist or not...");

	controller.dbFile.readdir(data)
		.then(function(data){
			callback && callback(null, data);
		})
		.catch(console.error);

}
exports.dbList = Promise.denodeify(_dbList);


var _syncDB = function(data, callback){
	data = data || {};
	logger.debug(data.reqId,"Check Database Folder"+data.path+" exist or not...");

	controller.dbFile.checkFile({checkFile : config.dbFolder+data.dbFileName})
		.then(function(data){
			if(	controller.dbFile.createFolder(config.backupFolder+data.dbFileName))
				return controller.dbFile.copyFile(config.dbFolder+data.dbFileName, config.backupFolder+data.dbFileName+"/"+data.dbFileName);
			callback();
		})
		.then(function(data){callback();})
		.catch(console.error);

}
exports.syncDB = Promise.denodeify(_syncDB);

var _backupDB = function(data, callback){
	data = data || {};
	logger.debug(data.reqId,"Check Database Folder"+data.path+" exist or not...");

	controller.dbFile.checkFile({checkFile : config.dbFolder+data.dbFileName})
		.then(function(data){
			if(	controller.dbFile.createFolder(config.backupFolder+data.dbFileName))
				return controller.dbFile.copyFile(config.dbFolder+data.dbFileName, config.backupFolder+data.dbFileName+"/"+ dateFormat(Date.now(),"yyyymmdd")+"bk-"+data.dbFileName);
			callback();
		})
		.then(function(data){callback();})
		.catch(console.error);

}
exports.backupDB = Promise.denodeify(_backupDB);


var _renameDB = function(data, callback){
	data = data || {};
	logger.debug(data.reqId,"Check Database Folder"+data.path+" exist or not...");

	if(!fs.existsSync(config.dbFolder+data.dbFileName)){
		data.code = 412;
		callback(data)
	}

	if(fs.existsSync(config.dbFolder+data.dbFileRename)){
		data.code = 409;
		callback(data)
	}


	if(controller.dbFile.renameFile(config.dbFolder+data.dbFileName, config.dbFolder+data.dbFileRename)){
		if(fs.existsSync(config.backupFolder+data.dbFileName))
			controller.dbFile.renameFile(config.backupFolder+data.dbFileName, config.backupFolder+data.dbFileRename);

		callback();
	}else{
		data.code = 500;
		callback(data);
	}			
}
exports.renameDB = Promise.denodeify(_renameDB);


var _delDB = function(data, callback){
	data = data || {};
	logger.debug(data.reqId,"Check Database Folder"+data.path+" exist or not...");

	if(!fs.existsSync(config.dbFolder+data.dbFileName)){
		data.code = 412;
		callback(data)
	}

	controller.dbFile.copyFile(config.dbFolder+data.dbFileName, config.backupFolder+data.dbFileName+"/"+ dateFormat(Date.now(),"yyyymmdd")+"bk-delete-"+data.dbFileName)
		.then(function(){
			fs.unlinkSync(config.dbFolder+data.dbFileName);
			callback();
		});		
}
exports.delDB = Promise.denodeify(_delDB);