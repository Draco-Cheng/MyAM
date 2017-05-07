const config = require("../config.js");
const controller = {
  dbController: require('../controller/dbController.js'),
  dbFile: require('../controller/dbFile.js'),
  encrypt: require('../controller/crypt.js').encrypt
};

let authCache = {};

// logger is special function so its not in the controller object
var logger = require("../controller/logger.js");

exports.check = ( header ) => {
  console.log(header)
  let _uid = header['auth-uid'];
  let _salt = header['auth-salt'];
  let _token = header['auth-token'];

  if( authCache[_uid] ) {
    if(controller.encrypt(authCache[_uid]['token'] + _salt) == _token)
      return true;
  }

  return false;
}

exports.login = async(data) => {
  let _meta = data['meta'];
  let _resMeta = data['resMeta'];

  let _acc = _meta['acc'];
  let _token = _meta['token'];
  let _salt = _meta['salt'];
  let _keep = _meta['keep'];

  data['dbFile'] = config['dbFolder'] + 'sys.db'

  // connect databse
  await controller.dbFile.checkDB(data);
  await controller.dbController.connectDB(data);

  // get user profile 
  await controller.dbController.getUser(data);
  let _resault = data['resault'][0] ? data['resault'][0][0] : null;

  console.log('_resault', data['resault'])
  if (_resault && controller.encrypt(_resault['token'] + _salt) == _token) {
    // login success ------------------------------------------------
    let _clientIp = data['request']['ip'];
    let _uid = data['uid'] = _resault['uid'];

    // set login in cache
    authCache[_uid] = {
      token: controller.encrypt(_salt + _resault['token']),
      permission: _resault['permission'],
      status: _resault['status'],
      breakpoint: _resault['breakpoint'],
      ip: _clientIp,
      timestamp: Date.now()
    };

    // set login res
    _resMeta['uid'] = _uid;
    _resMeta['name'] = _resault['name'];
    _resMeta['permission'] = _resault['permission'];
    _resMeta['status'] = _resault['status'];
    _resMeta['mail'] = _resault['mail'];
    _resMeta['date'] = _resault['date'];
    _resMeta['breakpoint'] = _resault['breakpoint'];

    // update login status in database
    data['meta'] = {};
    data['meta']['uid'] = _uid;
    data['meta']['last_login_info'] = _clientIp + '|' + Date.now();

    if (_keep) {
      data['meta']['keep_login_info'] = _clientIp + '|' + controller.encrypt(_salt + _salt + _resault['token']);
    }
    await controller.dbController.setUser(data);

    await controller.dbController.closeDB(data);
  } else {
    data['error'] = 'LOGIN_FAIL';
    // login fail ------------------------------------------------
    await controller.dbController.closeDB(data);
  }


  return data;
}
