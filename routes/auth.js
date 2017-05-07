"use strict";

var express = require('express');
var router = express.Router();

var responseHandler = require('../controller/responseHandler.js');
var tools = require('../controller/tools.js');

var authServ = require('../services/auth.js');
var dbServ = require('../services/dbService.js');

var routes = {};

routes.login = async(req, res, next) => {
  var data = tools.createData(req);

  data['resMeta'] = {};
  data['error'] = null;

  const _loginMeta = {};
  ['acc', 'uid', 'token', 'salt', 'keep'].forEach(key => {
    if (req['body'][key] !== null && req['body'][key] !== undefined)
      _loginMeta[key] = req['body'][key];
  });

  data['meta'] = _loginMeta;

  if(data['meta']['uid'])
    await authServ.loginByToken(data);
  else
    await authServ.login(data);

  if (data['error']) {
    return responseHandler(403, req, res);
  }

  const _getDbListMeta = {
    'uid': data.uid
  };
  data['meta'] = _getDbListMeta;
  await dbServ.dbList(data);

  return responseHandler(200, data['resMeta'], req, res);
}
router.all('/login', routes.login);

module.exports = router;
