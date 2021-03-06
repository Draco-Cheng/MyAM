var config = require('../config.js');

var _createData = function(req, uid) {
  var _data = {};
  _data.reqId = req.reqId;
  _data.request = req;

  let _uid = uid || req['headers']['auth-uid'];

  _data.uid = _uid;
  _data.authUid = req['headers']['auth-uid'];
  _data.permission = req['permission'] || 0;

  if (_uid && req.body.db) {
    _data.dbName = req.body.db;
    _data.userPath = config.dbFolder + 'users/' + _uid;
    _data.dbPath = _data.userPath + '/' + req.body.db;

    if (req.body.breakpoint) {
      _data.dbFileName = req.body.breakpoint;
      _data.dbFile = _data.dbPath + '/breakpoint/' + req.body.breakpoint;
    } else {
      _data.dbFileName = 'database.db';
      _data.dbFile = _data.dbPath + '/' + _data.dbFileName;
    }
  }

  return _data;
};
exports.createData = _createData;
