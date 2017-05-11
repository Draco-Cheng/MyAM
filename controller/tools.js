var config = require("../config.js");

var _createData = function(req, uid) {
  var _data = {};
  _data.reqId = req.reqId;
  _data.request = req;

  let _uid = uid || req['headers']['auth-uid'];

  _data.uid = _uid;

  if (req.body.db) {
    _data.dbPath = config.dbFolder + 'users/' + _uid + '/' + req.body.db;
    _data.dbFile = _data.dbPath + '/database.db';
    _data.dbFileName = 'database.db';
  }

  return _data;
};
exports.createData = _createData;
