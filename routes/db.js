"use strict";
var express = require('express');
var dateFormat = require('dateformat');
var fs = require('fs');
var dateFormat = require('dateformat');
var router = express.Router();

var responseHandler = require('../controller/responseHandler.js');
var tools = require('../controller/tools.js');

var services = {};
services.initial = require('../services/initial.js');
services.dbService = require('../services/dbService.js');
services.currency = require('../services/currency.js');
services.type = require('../services/type.js');


var config = require("../config.js");

var routes = {};

// logger is special function so its not in the controller object
var logger = require("../controller/logger.js");

routes.check = function(req, res, next) {
  var data = tools.createData(req);
  if (!data.dbFile) return responseHandler(406, req, res);

  services.initial.checkDB(data)
    .nodeify(function(err, data) {
      if (err) {
        responseHandler(err.code, req, res);
      } else {
        var _res = { dbExists: data.fileExists };
        responseHandler(200, _res, req, res);
      }
    });
}
router.all('/check', routes.check);

routes.dbList = async(req, res, next) => {
  try {

    var data = tools.createData(req);

    data['responseObj'] = {};
    data['error'] = null;

    data['meta'] = { uid: data['uid'] };
    await services.dbService.dbList(data);

    if (data['error'])
      return responseHandler(data['error'], req, res);
    else
      return responseHandler(200, data['responseObj'], req, res);
  } catch (e) {
    console.error(e.stack);
    return responseHandler(500, req, res);
  }
}

router.all('/dbList', routes.dbList);

routes.creat = function(req, res, next) {
  var data = tools.createData(req);
  if (!data.dbFile || !req.body.mainCurrenciesType)
    return responseHandler(406, req, res);

  services.initial.checkAndCreate(data)
    .then(function(data) {
      if (data['error']) {
        throw responseHandler(data['error'], req, res);
      } else {
        logger.info(data.reqId, "set currencies...");
        data.type = req.body.mainCurrenciesType.toUpperCase();
        data.main = true;
        data.memo = "Initialize";
        data.rate = 1;
        data.date = dateFormat(new Date(), "yyyy-mm-dd");
        data.quickSelect = true;
        return services.currency.setCurrencies(data);
      }
    })
    .then(function(data) {
      if (data.code) {
        throw responseHandler(data.code, req, res);
      } else {
        logger.info(data.reqId, "set types...");
        data.type_label = "Unclassified";
        data.cashType = 0;
        data.master = false;
        data.showInMap = true;
        data.quickSelect = true;
        return services.type.setTypes(data);
      }
    })
    .then(function(data) {
      responseHandler(200, req, res);
    });
}
router.all('/create', routes.creat);

routes.upload = async(req, res, next) => {
  // This api is special case (multipart-form)
  // There is some router task write in 'controller/dbFile.js > function:upload'

  var data = tools.createData(req);

  await services.initial.uploadDB(data);

  responseHandler(data['error'] || 200, req, res);
}
router.all('/upload', routes.upload);

routes.rename = async(req, res, next) => {
  var data = tools.createData(req);
  let _newDbName = req.body.newDbName;

  let _meta = data['meta'] = {};
  data['responseObj'] = {};

  if (data['dbName'] && _newDbName && data['dbName'] != _newDbName) {

    data['meta'] = {
      'dbName': data['dbName'],
      'newDbName': _newDbName
    };

    await services.dbService.renameDb(data);

    if (data['error']) {
      data['error']['message'] ? responseHandler(data['error']['code'], data['error']['message'], req, res) : responseHandler(data['error']['code'], req, res);
    } else {
      responseHandler(200, req, res);
    }
  } else {
    responseHandler(406, req, res);
  }
}
router.all('/rename', routes.rename);

routes.del = async function(req, res, next) {
  var data = tools.createData(req);

  await services.dbService.delDB(data);

  if (data['error'])
    responseHandler(data['error']['code'], data['error']['message'], req, res);
  else
    responseHandler(200, req, res);
}
router.all('/del', routes.del);

routes.backup = function(req, res, next) {
  var data = tools.createData(req);
  services.dbService.backupDB(data)
    .then(function(data) {
      responseHandler(200, req, res);
    });
}
router.all('/backup', routes.backup);

routes.download = async function(req, res, next) {
  let data = tools.createData(req);

  let _dbFilePath = data['dbFile'];
  let _dbName = data['dbPath'].split('/').pop();
  let _fileName = (req.body.breakpoint && req.body.breakpoint.replace(/\.db/, '') || dateFormat(Date.now(), "yyyymmdd-HHMM")) + '-' + _dbName + '.db';


  data['meta'] = { 'path': _dbFilePath };

  await services.dbService.checkPathExist(data);

  if (data['resault']) {
    res.setHeader('Content-Disposition', 'attachment; name="' + _fileName + '"; filename="' + _fileName + '"');
    res.setHeader('x-filename', _fileName);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, x-filename');

    const filestream = fs.createReadStream(_dbFilePath);
    filestream.pipe(res);
  } else {
    responseHandler(401, req, res);
  }
}
router.all('/download', routes.download);

routes.breakpointList = function(req, res, next) {
  var data = tools.createData(req);
  let _meta = data['meta'] = {};
  data['responseObj'] = {};

  if (req.body.uid != data.uid) {
    // permission check
  }

  _meta['uid'] = data['uid'];
  _meta['database'] = req.body.db;

  services.dbService.breackPointDbList(data)
    .then(function(data) {
      var _list = Object.keys(data['responseObj']['breackPointList']).filter(function(ele) {
        if (!ele.isDir)
          return true;
      }).map(function(ele) {
        return ele;
      });

      responseHandler(200, _list, req, res);
    })
}
router.all('/breakpoint/list', routes.breakpointList);

routes.delBreakpoint = async function(req, res, next) {
  var data = tools.createData(req);

  if (req.body.breakpoint)
    await services.dbService.delBreakponitDb(data);
  else
    return responseHandler(406, req, res);

  if (data['error'])
    responseHandler(data['error']['code'], data['error']['message'], req, res);
  else
    responseHandler(200, req, res);
}
router.all('/breakpoint/del', routes.delBreakpoint);

module.exports = router;
