"use strict";

var express = require('express');
var router = express.Router();

var responseHandler = require('../controller/responseHandler.js');
var tools = require('../controller/tools.js');

var profileServ = require('../services/profile.js');

var routes = {};

routes.set = async(req, res, next) => {
  try {

    var data = tools.createData(req);

    data['responseObj'] = {};
    data['error'] = null;

    const _profileMeta = {
      uid: data['uid']
    };

    ['token', 'token2', 'mail', 'name', 'breakpoint'].forEach(key => {
      if (req['body'][key] !== null && req['body'][key] !== undefined)
        _profileMeta[key] = req['body'][key];
    });

    data['meta'] = _profileMeta;

    await profileServ.set(data);

    return responseHandler(data['error'] || 200, req, res);
  } catch (e) {
    console.error(e.stack);
    return responseHandler(500, req, res);
  }
}
router.all('/set', routes.set);


routes.get = async(req, res, next) => {
  try {

    var data = tools.createData(req);

    data['responseObj'] = {};
    data['error'] = null;


    data['meta'] = { uid: data['uid'] };
    await profileServ.get(data);

    if (data['error'])
      return responseHandler(data['error'], req, res);
    else
      return responseHandler(200, data['responseObj'], req, res);
  } catch (e) {
    console.error(e.stack);
    return responseHandler(500, req, res);
  }
}
router.all('/get', routes.get);

module.exports = router;
