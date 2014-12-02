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
	var _dbFile = data.dbFile;
	logger.debug("Check Database "+data.dbFile+" exist or not...");

	var createFile=controller.dbFile.check(data)
			.then(function createFile(data){
				if(data.dbFileExists){
					throw "Database "+data.dbFile+" exist...";
				}else
					return controller.dbFile.createFile(data);
			});

	createFile.then(function(data){return controller.dbController.connectDB(data)})
		.then(function(data){return controller.dbController.initialDatabase(data);})
		.then(function(data){ return controller.dbController.closeDB(data); })
		.then(function(data){
			logger.debug("finish initial Database!!");
			callback(null, data);
		});

	createFile.catch(function(err){
		logger.debug(err);
		callback(null, data);
	})
}
exports.checkAndCreate = Promise.denodeify(_checkAndCreate);


var _getCurrencies = function(data, callback){
	controller.dbController.connectDB(data)
		.then(function(data){ return controller.dbController.getCurrencies(data); })
		.then(function(data){ return controller.dbController.closeDB(data); })
		.then(function(data){ callback(null ,data); })
}
exports.getCurrencies = Promise.denodeify(_getCurrencies);

var _setCurrencies = function(data, callback){
	controller.dbController.connectDB(data)
		.then(function(data){ return controller.dbController.setCurrencies(data); })
		.then(function(data){ return controller.dbController.closeDB(data); })
		.then(function(data){ callback(null ,data); });
}
exports.setCurrencies = Promise.denodeify(_setCurrencies);


/*exports.checkAndCreate({ dbFile : file }).then(function(){
	_getCurrencies({dbFile : file, cid : 1},function(X,json){
		 json.to_cid = 2;
		 json.name = "TWD";
		 json.rate = 1;
		 json.date = Date.now();
		 json.showup = 1;
		_setCurrencies(json, function(X,json){
			console.log("!!!!!!!!!!!",X,json.resault[0])
		})
	});
});*/