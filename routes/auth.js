'use strict';

var express = require('express');
var router = express.Router();

var responseHandler = require('../controller/responseHandler.js');
var tools = require('../controller/tools.js');

var authServ = require('../services/auth.js');
var dbServ = require('../services/dbService.js');

var routes = {};

routes.login = async function(req, res, next) {
  var data = tools.createData(req);

  data['responseObj'] = {};
  data['error'] = null;

  const _loginMeta = {};
  ['acc', 'uid', 'token', 'salt', 'keep'].forEach(key => {
    if (req['body'][key] !== null && req['body'][key] !== undefined)
      _loginMeta[key] = req['body'][key];
  });

  data['meta'] = _loginMeta;

  if (data['meta']['uid'])
    await authServ.loginByToken(data);
  else
    await authServ.login(data);

  if (data['error']) {
    return responseHandler(data['error']['code'] || 403, req, res);
  }

  const _getDbListMeta = {
    'uid': data.uid
  };

  data['meta'] = _getDbListMeta;
  await dbServ.dbList(data);

  responseHandler(200, data['responseObj'], req, res);

  // checkBackUp is async function
  // but not block the login so just pass by and no await
  return dbServ.checkBackUp(data);
}
router.all('/login', routes.login);


routes.logout = async function(req, res, next) {
  var data = tools.createData(req);

  data['error'] = null;

  await authServ.logout(data);

  if (data['error']) {
    return responseHandler(data['error']['code'] || 403, req, res);
  }

  return responseHandler(200, req, res);
}
router.all('/logout', routes.logout);

routes.register = async function(req, res, next) {
  var data = tools.createData(req);

  data['responseObj'] = {};
  data['error'] = null;

  const _loginMeta = {};
  ['name', 'account', 'token', 'mail'].forEach(key => {
    if (req['body'][key])
      _loginMeta[key] = req['body'][key];
  });

  if (Object.keys(_loginMeta).length != 4)
    return responseHandler(406, req, res);

  data['meta'] = _loginMeta;

  await authServ.register(data);

  return responseHandler(data['error'] || 200, req, res);
}
router.all('/register', routes.register);
module.exports = router;
