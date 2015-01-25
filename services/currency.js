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
		.then(function(data){

			if(data.to_cid){
				var _tempData = {
					db : data.db,
					reqId : data.reqId,
					cid : data.to_cid,
					limit : 1
				}

				return controller.dbController.getCurrencies(_tempData);				
			}else
				return new Promise(function(resolve, reject){resolve(data)});

		})
		.then(function(tempData){
			
			if(data.to_cid){
				var _resault = tempData.resault.pop().length;
				if(_resault)
					return controller.dbController.setCurrencies(data);
				else{
					data.code = 424;
					throw data;
				}
			}else{
				return controller.dbController.setCurrencies(data);				
			}


				
		})
		.nodeify(function(err){
			controller.dbController.closeDB(data).then(function(){
				err && logger.error(data.reqId, err);
				callback(err , data);
			});
		});

}
exports.setCurrencies = Promise.denodeify(_setCurrencies);

var _delCurrencies = function(data, callback){
	data.limit = 1;

	controller.dbController.connectDB(data)
		.then(function(data){
			data.cid = data.del_cid;
			return controller.dbController.getRecord(data);
		})
		.then(function(data){ 
			var _resault = data.resault.pop().length;

			data.to_cid = data.del_cid;
			delete data.cid;

			if(_resault){
				data.code = 424;
				data.message = "record_dependencies";
				throw data;
			}
			else
				return controller.dbController.getCurrencies(data);
		})
		.then(function(data){
			var _resault = data.resault.pop().length;
			data.to_cid = data.del_cid;
			delete data.to_cid;

			if(_resault){
				data.code = 424;
				data.message = "currency_dependencies";
				throw data;
			}else
				return controller.dbController.delCurrencies(data);
		})
		.nodeify(function(err){
			controller.dbController.closeDB(data).then(function(){
				err && logger.error(data.reqId, err);
				callback(err , data);
			});
		});

}
exports.delCurrencies = Promise.denodeify(_delCurrencies);