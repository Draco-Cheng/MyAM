var Promise    =  require("promise");

var controller = {
	dbFile : require('../controller/dbFile.js'),
	dbController : require('../controller/dbController.js')	
};

// logger is special function so its not in the controller object
var logger   = require("../controller/logger.js");

var _checkDB = function(data){
	return controller.dbFile.checkDB(data);
}
exports.checkDB = _checkDB;

var _checkAndCreate = function(data, callback){
	var _checkDB = controller.dbFile.checkDB(data);
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

var _uploadDB = function(data, callback){
	controller.dbFile.upload(data)
		.then(function(data){ return controller.dbController.checkDBisCorrect(data); })
		.then(function(data){ callback(null ,data); })
		.catch(function(err){ logger.error(data.reqId, err); callback(null, data); });
}
exports.uploadDB = Promise.denodeify(_uploadDB);