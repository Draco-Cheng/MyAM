'use strict';

var express = require('express');
var router = express.Router();

var responseHandler = require('../controller/responseHandler.js');
var tools = require('../controller/tools.js');

var services = {};
services.record = require('../services/record.js');
services.dbService = require('../services/dbService.js');

var routes = {};

routes.del = async function(req, res, next) {
  var data = tools.createData(req);
  data.del_rid = req.body.rid;

  if (!data.dbFile || !data.del_rid)
    return responseHandler(406, req, res);

  await services.record.delRecord(data);

  if (data['error']) {
    responseHandler(data['error'], req, res);
  } else {
    responseHandler(200, req, res);
    services.dbService.syncDB(data);
  }
}
router.all('/del', routes.del);

routes.set = async function(req, res, next) {
  var data = tools.createData(req);
  data.rid = req.body.rid;
  data.cashType = req.body.cashType;
  data.cid = req.body.cid;
  data.value = req.body.value;
  data.memo = req.body.memo;
  data.date = req.body.date;

  if (!data.dbFile || (!data.rid && (!data.cid || !data.value || !data.date)))
    return responseHandler(406, req, res);

  await services.record.setRecord(data);
  if (data['error']) {
    responseHandler(err.code, req, res);
  } else {
    responseHandler(200, data.resault, req, res);
    services.dbService.syncDB(data);
  }
}
router.all('/set', routes.set);

routes.setTypes = async function(req, res, next) {
  var data = tools.createData(req);
  data.rid = req.body.rid;
  data.tids_json = req.body.tids_json;

  if (!data.dbFile || !data.rid || !data.tids_json)
    return responseHandler(406, req, res);

  await services.record.setRecordTypes(data);
  if (data['error']) {
    responseHandler(data['error'], req, res);
  } else {
    responseHandler(200, req, res);
    services.dbService.syncDB(data);
  }
}
router.all('/setTypes', routes.setTypes);

routes.get = async function(req, res, next) {
  var data = tools.createData(req);
  data.rid = req.body.rid;
  data.rids_json = req.body.rids_json;
  data.tids_json = req.body.tids_json;
  data.cid = req.body.cid;
  data.value_greater = req.body.value_greater;
  data.value_less = req.body.value_less;
  data.memo = req.body.memo;
  data.start_date = req.body.start_date;
  data.end_date = req.body.end_date;
  data.limit = req.body.limit;
  data.cashType = req.body.cashType;
  data.type_query_set = req.body.type_query_set;

  data.orderBy = req.body.orderBy instanceof Array ? req.body.orderBy : null;

  await services.record.getRecord(data);

  if (data['error']) {
    responseHandler(data['error'], req, res);
  } else {
    responseHandler(200, data.resault, req, res);
  }
}
router.all('/get', routes.get);

routes.getTypes = async function(req, res, next) {
  var data = tools.createData(req);
  data.rids = req.body.rids_json ? JSON.parse(req.body.rids_json) : [];
  data.tids = req.body.tids_json ? JSON.parse(req.body.tids_json) : [];

  if (!data.dbFile)
    return responseHandler(406, req, res);

  await services.record.getRecordTypes(data);
  if (data['error']) {
    responseHandler(data['error'], req, res);
  } else {
    responseHandler(200, data.resault, req, res);
  }
}
router.all('/getTypes', routes.getTypes);

module.exports = router;
