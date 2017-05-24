"use strict";

var express = require('express');
var router = express.Router();

var responseHandler = require('../controller/responseHandler.js');
var tools = require('../controller/tools.js');

var services = {};
services.currency = require('../services/currency.js');
services.dbService = require('../services/dbService.js');

var routes = {};

routes.get = function(req, res, next) {
  var data = tools.createData(req);
  if (!data.dbFile) return responseHandler(406, req, res);

  services.currency.getCurrencies(data)
    .nodeify(function(err, data) {
      if (err) {
        responseHandler(err.code, req, res);
      } else {
        responseHandler(200, data.resault, req, res);
      }
    });
}
router.all('/get', routes.get);

routes.set = async function(req, res, next) {
  var data = tools.createData(req);
  data.cid = req.body.cid;
  data.to_cid = req.body.to_cid;
  data.type = req.body.type.toUpperCase();
  data.memo = req.body.memo;
  data.rate = req.body.rate;
  data.date = req.body.date;
  data.main = req.body.main;
  data.quickSelect = req.body.quickSelect;

  if (!data.dbFile || (!data.cid && (!data.type || !data.rate)))
    return responseHandler(406, req, res);

  if ((!data.main && !data.to_cid) || (!data.cid && data.main && data.to_cid))
    return responseHandler(424, req, res);

  await services.currency.setCurrencies(data);

  if (data['error'])
    return responseHandler(data['error'], req, res);
  
  responseHandler(200, { cid: data.cid }, req, res);
  services.dbService.syncDB(data);
}
router.all('/set', routes.set);

routes.del = function(req, res, next) {
  var data = tools.createData(req);
  data.del_cid = req.body.del_cid;

  if (!data.dbFile || !data.del_cid)
    return responseHandler(406, req, res);

  services.currency.delCurrencies(data)
    .then(function(data, err) {
      if (err) {
        if (err.message)
          responseHandler(err.code, err.message, req, res);
        else
          responseHandler(err.code, req, res);
      } else {
        responseHandler(200, req, res);
        services.dbService.syncDB(data);
      }
    });
}
router.all('/del', routes.del);

module.exports = router;
