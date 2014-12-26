var config = require("../config.js");

var _createData = function(req){
	var _data = {};
	_data.reqId = req.reqId;
	_data.request = req;

	if(req.body.db)
		_data.dbFile =  config.dbFolder + req.body.db;

	return _data;
};
exports.createData = _createData;