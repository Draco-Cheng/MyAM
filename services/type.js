var Promise =  require("promise");

var controller = {
	dbController : require('../controller/dbController.js'),
	dbFile : require('../controller/dbFile.js')
};

// logger is special function so its not in the controller object
var logger = require("../controller/logger.js");

var _getTypes = function(data, callback){
	var _checkDB = controller.dbFile.checkDB(data);

	_checkDB.then(function(data){ return controller.dbController.connectDB(data);})
			.then(function(data){ return controller.dbController.getTypes(data); })
			.then(function(data){ return controller.dbController.closeDB(data); })
			.then(function(data){
				callback(null, data);
			});

	_checkDB.catch(function(data){
		callback(data)
	});
}
exports.getTypes = Promise.denodeify(_getTypes);

var _setTypes = function(data, callback){
	var _checkDB = controller.dbFile.checkDB(data);

	_checkDB.then(function(data){ return controller.dbController.connectDB(data);})
			.then(function(data){ return controller.dbController.setTypes(data); })
			.then(function(data){ return controller.dbController.closeDB(data); })
			.then(function(data){
				callback(null, data);
			});

	_checkDB.catch(function(data){
		callback(data)
	});
}
exports.setTypes = Promise.denodeify(_setTypes);

var _getTypeMaps = function(data, callback){
	var _checkDB = controller.dbFile.checkDB(data);

	_checkDB.then(function(data){ return controller.dbController.connectDB(data);})
			.then(function(data){ return controller.dbController.getTypeMaps(data); })
			.then(function(data){ return controller.dbController.closeDB(data); })
			.then(function(data){
				callback(null, data);
			});

	_checkDB.catch(function(data){
		callback(data)
	});
}
exports.getTypeMaps = Promise.denodeify(_getTypeMaps);

var _setTypeMaps = function(data, callback){
	var _checkDB = controller.dbFile.checkDB(data);

	_checkDB.then(function(data){ return controller.dbController.connectDB(data);})
			.then(function(data){ return controller.dbController.getTypeMaps(data); })
			.then(function(data){ 
				if(data.resault[0].length === 0)
					return controller.dbController.setTypeMaps(data);
			})
			.then(function(data){ return controller.dbController.closeDB(data); })
			.then(function(data){
				callback(null, data);
			});

	_checkDB.catch(function(data){
		callback(data)
	});
}
exports.setTypeMaps = Promise.denodeify(_setTypeMaps);