var Promise =  require("promise");
var sqlite3 = require('sqlite3').verbose();

var controller = {
	dbFile : require('../controller/dbFile.js'),
	dbController : require('../controller/dbController.js')	
};

// logger is special function so its not in the controller object
var logger = require("../controller/logger.js");


//var file = "./db/sqlite3.db";

var _checkAndCreate = function(data, callback){
	data.checkFile = data.dbFile;
	logger.debug(data.reqId, "Check Database "+data.checkFile+" exist or not...");

	var createFile=controller.dbFile.check(data)
			.then(function createFile(data){
				if(data.fileExists){
					throw "Database "+data.checkFile+" exist...";
				}else{
					data.createFile = data.dbFile;
					return controller.dbFile.createFile(data);
				}					
			});

	createFile.then(function(data){return controller.dbController.connectDB(data)})
		.then(function(data){return controller.dbController.initialDatabase(data);})
		.then(function(data){ return controller.dbController.closeDB(data); })
		.then(function(data){
			logger.debug(data.reqId, "finish initial Database!!");
			callback(null, data);
		});

	createFile.catch(function(err){ logger.warn(data.reqId, err); callback(null, data); });

}
exports.checkAndCreate = Promise.denodeify(_checkAndCreate);


var _getCurrencies = function(data, callback){
	controller.dbController.connectDB(data)
		.then(function(data){ return controller.dbController.getCurrencies(data); })
		.then(function(data){ return controller.dbController.closeDB(data); })
		.then(function(data){ callback(null ,data); })
		.catch(function(err){ logger.error(data.reqId, err); callback(null, data); });
}
exports.getCurrencies = Promise.denodeify(_getCurrencies);

var _setCurrencies = function(data, callback){
	controller.dbController.connectDB(data)
		.then(function(data){ return controller.dbController.setCurrencies(data); })
		.then(function(data){ return controller.dbController.closeDB(data); })
		.then(function(data){ callback(null ,data); })
		.catch(function(err){ logger.error(data.reqId, err); callback(null, data); });
}
exports.setCurrencies = Promise.denodeify(_setCurrencies);

var _uploadDB = function(data, callback){
	controller.dbFile.upload(data)
		.then(function(data){ return controller.dbController.checkDBisCorrect(data); })
		.then(function(data){ callback(null ,data); })
		.catch(function(err){ logger.error(data.reqId, err); callback(null, data); });
}
exports.uploadDB = Promise.denodeify(_uploadDB);