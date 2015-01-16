var Promise =  require("promise");

var controller = {
	dbController : require('../controller/dbController.js'),
	dbFile : require('../controller/dbFile.js')
};

// logger is special function so its not in the controller object
var logger = require("../controller/logger.js");



/*
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
exports.getTypeMaps = Promise.denodeify(_getTypeMaps);*/

var _setRecord = function(data, callback){
	var _checkDB = controller.dbFile.checkDB(data);

	_checkDB.then(function(data){ return controller.dbController.connectDB(data);})
			.then(function(data){ return controller.dbController.setRecord(data); })
			.then(function(data){ return controller.dbController.closeDB(data); })
			.then(function(data){
				callback(null, data);
			});

	_checkDB.catch(function(data){
		callback(data)
	});
}
exports.setRecord = Promise.denodeify(_setRecord);

var _setRecordTypes = function(data, callback){
	var _checkDB = controller.dbFile.checkDB(data);

	_checkDB.then(function(data){ return controller.dbController.connectDB(data);})
			.then(function(data){ return controller.dbController.getRecordTypeMap(data);})
			.then(function(data){ 
				//parse what we need to add and what have to delete
				data.tids_add = JSON.parse(data.tids_json || "[]").map(function(i){return parseInt(i)})
				data.tids_del = [];
				data.resault.pop().forEach(function(_obj){
					if( parseInt(_obj.rid) ==  data.rid ){
						var _index = data.tids_add.indexOf(_obj.tid);
						if( _index === -1 )
							data.tids_del.push(_obj.tid);
						else 
							delete data.tids_add[_index]
					}
				})

				data.tids_add = data.tids_add.filter(function(i){return i!==undefined });

				return controller.dbController.setRecordTypeMap(data);
			})
			.then(function(data){ return controller.dbController.closeDB(data);})
			.then(function(data){
				callback(null, data);
			});

	_checkDB.catch(function(data){
		console.log(data)
		callback(data)
	});
}
exports.setRecordTypes = Promise.denodeify(_setRecordTypes);