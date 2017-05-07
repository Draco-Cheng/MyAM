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

  const _loginMeta = {
    'acc': req.body.acc,
    'token': req.body.token,
    'salt': req.body.salt,
    'keep': req.body.keep
  };
  data['meta'] = _loginMeta;
  await authServ.login(data);

  if (data['error'])
    return responseHandler(403, req, res);

  const _getDbListMeta = {
    'uid': data.uid
  };
  data['meta'] = _getDbListMeta;
  await dbServ.dbList(data);

  return responseHandler(200, data['resMeta'], req, res);
}
router.all('/login', routes.login);

module.exports = router;
