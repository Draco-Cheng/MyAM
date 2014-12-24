var Promise =  require("promise");
var sqlite3 = require('sqlite3').verbose();

var controller = {
	dbFile : require('../controller/dbFile.js'),
	dbController : require('../controller/dbController.js')	
};

// logger is special function so its not in the controller object
var logger = require("../controller/logger.js");


var _check = function(data){
	return new Promise(function(resolve, reject){
		logger.debug(data.reqId, "Check Database "+data.checkFile+" exist or not...");

		controller.dbFile.check(data).then(function(data){
			if(!data.fileExists){
				var _msg = "Database "+data.checkFile+" not exist...";
				logger.warn(data.reqId, _msg);
				data.message = _msg;
				data.code = 412;
				reject(data)
			}else{
				var _msg = "Database "+data.checkFile+" exist...";
				logger.warn(data.reqId, _msg);
				data.message = _msg;
				data.createFile = data.dbFile;
				resolve(data);
			}
		});
	});
}
exports.check = _check;

var _checkAndCreate = function(data, callback){
	data.checkFile = data.dbFile;
	var _checkDB=_check(data);

	_checkDB.catch(function(data){
			delete data.code;
			return controller.dbController.connectDB(data)
		})
		.then(function(data){return controller.dbController.initialDatabase(data);})
		.then(function(data){ return controller.dbController.closeDB(data); })
		.then(function(data){
			logger.debug(data.reqId, "finish initial Database!!");
			callback(null, data);
		});

	_checkDB.then(function(data){
		data.code = 409; 
		callback(null, data);
	});

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