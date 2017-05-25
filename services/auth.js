const config = require('../config.js');

var logger = require('../controller/logger.js');

const controller = {
  dbController: require('../controller/dbController.js'),
  dbFile: require('../controller/dbFile.js'),
  encrypt: require('../controller/crypt.js').encrypt
};

let authCache = {};

exports.check = (header) => {
  let _uid = header['auth-uid'];
  let _salt = header['auth-salt'];
  let _token = header['auth-token'];

  let _reObj = {
    permission: 0,
    status: 0
  };

  if (authCache[_uid]) {
    if (authCache[_uid]['timestamp'] < _salt && controller.encrypt(authCache[_uid]['token'] + _salt) == _token) {
      authCache[_uid]['timestamp'] = _salt;
      _reObj['status'] = authCache[_uid]['status'];
      _reObj['permission'] = authCache[_uid]['permission'];
    }
  }
  return _reObj;
}

exports.login = async function(data) {
  try {
    let _meta = data['meta'];
    let _responseObj = data['responseObj'];

    let _acc = _meta['acc'];
    let _token = _meta['token'];
    let _salt = _meta['salt'];
    let _keep = _meta['keep'];

    data['dbFile'] = config['dbFolder'] + 'sys.db';

    // connect databse
    await controller.dbFile.checkDB(data);

    if (!data['resault']['isExist']) {
      data['error'] = {
        code: 500,
        message: 'SYS_DB_NOT_FOUND'
      }
      return data;
    }

    await controller.dbController.connectDB(data);

    // get user profile 
    await controller.dbController.getUser(data);

    let _resault = data['resault'] ? data['resault'][0] : null;

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
      _responseObj['uid'] = _uid;
      _responseObj['name'] = _resault['name'];
      _responseObj['permission'] = _resault['permission'];
      _responseObj['status'] = _resault['status'];
      _responseObj['mail'] = _resault['mail'];
      _responseObj['date'] = _resault['date'];
      _responseObj['breakpoint'] = _resault['breakpoint'];

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

  } catch (e) {
    logger.error(e);
    data['error'] = { code: 500 };
  }
  return data;
}


exports.loginByToken = async function(data) {
  try {
    let _meta = data['meta'];
    let _responseObj = data['responseObj'];
    let _token = _meta['token'];
    let _salt = _meta['salt'];
    let _keep = _meta['keep'];

    data['dbFile'] = config['dbFolder'] + 'sys.db';

    // connect databse
    await controller.dbFile.checkDB(data);
    await controller.dbController.connectDB(data);

    // get user profile 
    await controller.dbController.getUser(data);
    let _resault = data['resault'] ? data['resault'][0] : null;
    let _clientIp = data['request']['ip'];

    if (_resault && _resault['keep_login_info']) {
      let [_keep_login_ip, _keep_login_token] = _resault['keep_login_info'].split('|');
      if (_keep_login_ip == _clientIp && controller.encrypt(_keep_login_token + _salt) == _token) {


        // login success ------------------------------------------------
        let _uid = data['uid'] = _resault['uid'];

        // set login in cache
        authCache[_uid] = {
          token: controller.encrypt(_salt + _keep_login_token),
          permission: _resault['permission'],
          status: _resault['status'],
          breakpoint: _resault['breakpoint'],
          ip: _clientIp,
          timestamp: Date.now()
        };

        // set login res
        _responseObj['uid'] = _uid;
        _responseObj['name'] = _resault['name'];
        _responseObj['permission'] = _resault['permission'];
        _responseObj['status'] = _resault['status'];
        _responseObj['mail'] = _resault['mail'];
        _responseObj['date'] = _resault['date'];
        _responseObj['breakpoint'] = _resault['breakpoint'];

        // update login status in database
        data['meta'] = {};
        data['meta']['uid'] = _uid;
        data['meta']['last_login_info'] = _clientIp + '|' + Date.now();
        data['meta']['keep_login_info'] = _clientIp + '|' + controller.encrypt(_salt + _salt + _keep_login_token);

        await controller.dbController.setUser(data);

        await controller.dbController.closeDB(data);
      } else {
        data['error'] = { code: 403, message: 'LOGIN_FAIL' };
      }
    } else {
      data['error'] = { code: 403, message: 'LOGIN_FAIL' };
      // login fail ------------------------------------------------
      await controller.dbController.closeDB(data);
    }

  } catch (e) {
    logger.error(e);
    data['error'] = { code: 500 };
  }
  return data;
}

exports.logout = async function(data) {
  try {
    const _uid = data['uid'];

    data['dbFile'] = config['dbFolder'] + 'sys.db';

    // connect databse
    await controller.dbFile.checkDB(data);
    await controller.dbController.connectDB(data);

    // update login status in database
    data['meta'] = {};
    data['meta']['uid'] = _uid;
    data['meta']['keep_login_info'] = null;

    await controller.dbController.setUser(data);

    delete authCache[_uid];
  } catch (e) {
    logger.error(e);
    data['error'] = { code: 500 };
  }
  return data;
}
