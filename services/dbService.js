var Promise =  require("promise");
var controller = {
	dbFile : require('../controller/dbFile.js')
};

// logger is special function so its not in the controller object
var logger = require("../controller/logger.js");

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