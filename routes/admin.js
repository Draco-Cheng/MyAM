'use strict';

var express = require('express');
var router = express.Router();

var responseHandler = require('../controller/responseHandler.js');
var tools = require('../controller/tools.js');

var profileServ = require('../services/profile.js');
var adminServ = require('../services/admin.js');

var routes = {};

var checkPermissionWithTarget = async function(data, req, res, next) {
  const _targetUid = req.body.target_uid;
  const _permission = data['permission'];

  if (!_targetUid)
    return false;
  
  data['meta'] = { targetUid: _targetUid };
  await adminServ.getUserPermission(data);

  const _targetPermission = data['resault']['permission'];

  return _permission > _targetPermission;
};

var isAdmin = function(data) {
  const _permission = data['permission'];
  return _permission >= 999;
};

routes.userList = async function(req, res, next) {
  let data = tools.createData(req);

  if (!isAdmin(data))
    return responseHandler(405, req, res);

  data['responseObj'] = {};

  // get user list
  data['meta'] = {};
  await profileServ.get(data);

  if (data['error'])
    responseHandler(data['error'], req, res);
  else
    responseHandler(200, data['responseObj']['user'], req, res);
}
router.all('/userList', routes.userList);

routes.setUser = async function(req, res, next) {
  var data = tools.createData(req);

  if (!isAdmin(data) || !(await checkPermissionWithTarget(data, req, res, next)))
    return responseHandler(405, req, res);

  data['responseObj'] = {};
  data['error'] = null;

  const _profileMeta = {
    uid: req['body']['target_uid']
  };

  ['token', 'status', 'permission'].forEach(key => {
    if (req['body'][key] !== null && req['body'][key] !== undefined)
      _profileMeta[key] = req['body'][key];
  });


  if (!_profileMeta['uid'] || Object.keys(_profileMeta).length < 2 || _profileMeta['permission'] >= data['permission'])
    return responseHandler(406, req, res);

  data['meta'] = _profileMeta;

  await adminServ.setUser(data);

  return responseHandler(data['error'] || 200, req, res);
}
router.all('/setUser', routes.setUser);

module.exports = router;
