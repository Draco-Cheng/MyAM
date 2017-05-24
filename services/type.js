var Promise    =  require("promise");

var controller = {
	dbController : require('../controller/dbController.js'),
	dbFile : require('../controller/dbFile.js')
};

// logger is special function so its not in the controller object
var logger    = require("../controller/logger.js");

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
			.then(function(data){ 
				if(data.tid)
					return controller.dbController.getTypes(data);
				else
					return new Promise(function(resolve, reject){resolve(data)});
			})
			.then(function(data){ 
				if(data.tid && data.resault.push().length === 0 )
					return new Promise(function(resolve, reject){resolve(data)});
				else
					return controller.dbController.setTypes(data);
			})
			.then(function(data){ return controller.dbController.closeDB(data); })
			.then(function(data){
				callback(null, data);
			});

	_checkDB.catch(function(data){
		callback(data)
	});
}
exports.setTypes = Promise.denodeify(_setTypes);

exports.delTypes = async data => {
  try {

    data['error'] || await controller.dbFile.checkDB(data);
    data['error'] || await controller.dbController.connectDB(data);
    if (data['error']) return data;

    const _tempData = {
      db: data.db,
      reqId: data.reqId,
      tid: data['meta']['del_tid'],
      limit: 1
    }

    await controller.dbController.getRecordTypeMap(_tempData);

    if (_tempData.resault.length) {
      data['error'] = {
        code: 424,
        message: 'RECORD_DEPENDENCIES'
      };
      return data;
    } else {
      await controller.dbController.delTypeMaps(data)
    }

    data['error'] || await controller.dbController.delTypes(data);
    data['error'] || await controller.dbController.closeDB(data);

    return data;


  } catch (e) { logger.error(data.reqId, e.stack) }
}

var _delTypeMaps = function(data, callback){
	var _checkDB = controller.dbFile.checkDB(data);
	_checkDB.then(function(data){ return controller.dbController.connectDB(data);})
			.then(function(data){ return controller.dbController.delTypeMaps(data); })
			.then(function(data){ return controller.dbController.closeDB(data); })
			.then(function(data){
				callback(null, data);
			});

	_checkDB.catch(function(data){
		callback(data)
	});
}
exports.delTypeMaps = Promise.denodeify(_delTypeMaps);

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
				if(data['resault'].length === 0 && data.tid !== data.sub_tid)
					return controller.dbController.setTypeMaps(data);
				else
					return new Promise(function(resolve, reject){resolve(data)});
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