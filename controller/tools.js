var config      = require("../config.js");

var _createData = function(req) {
  var _data = {};
  _data.reqId = req.reqId;
  _data.request = req;

  let _uid = req['headers']['auth-uid'];

  if (req.body.db) {
    _data.dbFile = config.dbFolder + 'users/' + _uid + '/' + req.body.db + '/database.db' ;
    _data.dbFileName = req.body.db;
  }

  return _data;
};
exports.createData = _createData;