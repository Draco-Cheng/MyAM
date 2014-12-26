var Promise =  require("promise");

var controller = {
	dbController : require('../controller/dbController.js'),
	dbFile : require('../controller/dbFile.js')
};

// logger is special function so its not in the controller object
var logger = require("../controller/logger.js");

var _getCurrencies = function(data, callback){
	var _checkDB = controller.dbFile.checkDB(data);

	_checkDB.then(function(data){ return controller.dbController.connectDB(data);})
			.then(function(data){ return controller.dbController.getCurrencies(data); })
			.then(function(data){ return controller.dbController.closeDB(data); })
			.then(function(data){
				callback(null, data);
			});

	_checkDB.catch(function(data){
		callback(data)
	});
}
exports.getCurrencies = Promise.denodeify(_getCurrencies);

var _setCurrencies = function(data, callback){
	controller.dbController.connectDB(data)
		.then(function(data){ return controller.dbController.setCurrencies(data); })
		.then(function(data){ return controller.dbController.closeDB(data); })
		.nodeify(function(err, data){
			if(err)	logger.error(data.reqId, err);
			callback(null, err || data);
		});
}
exports.setCurrencies = Promise.denodeify(_setCurrencies);