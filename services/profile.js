var controller = {
  dbFile: require('../controller/dbFile.js'),
  dbController: require('../controller/dbController.js'),
  encrypt: require('../controller/crypt.js').encrypt
};

var config = require('../config.js');

var logger = require('../controller/logger.js');

exports.set = async function(data) {
  try {
    const _uid = data['meta']['uid'];
    const _meta = data['meta'];

    let _newUserParameter = {};

    data['dbFile'] = config['dbFolder'] + 'sys.db';

    // connect databse
    await controller.dbFile.checkDB(data);
    await controller.dbController.connectDB(data);

    // get user database
    if (_meta['token'] && _meta['token2']) {

      let _userMeta = { 'uid': _uid };
      data['meta'] = _userMeta;

      await controller.dbController.getUser(data);

      let _userToken = data['resault'] ? data['resault'][0]['token'] : null;

      if (_userToken && controller.encrypt(_userToken) == _meta['token']) {
        _newUserParameter['token'] = _meta['token2'];
        _newUserParameter['keep_login_info'] = null;
      } else {
        data['error'] = {
          code: 403,
          message: 'TOKEN_FAIL'
        }
        return data;
      }
    }

    ['mail', 'name', 'permission', 'status', 'breakpoint'].forEach(key => {
      if (_meta[key] !== undefined)
        _newUserParameter[key] = _meta[key];
    })

    if (Object.keys(_newUserParameter) == 0) {
      return data;
    }

    _newUserParameter['uid'] = _uid;

    data['meta'] = _newUserParameter;

    await controller.dbController.setUser(data);
    await controller.dbController.closeDB(data);

  } catch (e) {
    logger.error(e);
    data['error'] = { code: 500 };
  }
  return data;
}


exports.get = async function(data) {
  try {
    data['dbFile'] = config['dbFolder'] + 'sys.db';

    let _responseUser = data['responseObj']['user'] = [];

    // connect databse
    await controller.dbFile.checkDB(data);
    await controller.dbController.connectDB(data);

    data['meta'] = { uid: data['meta']['uid'] };
    await controller.dbController.getUser(data);

    let _resault = data['resault'];

    _resault.forEach(row => {
      let _uobj = {};
      // set login res
      _uobj['uid'] = row['uid'];
      _uobj['name'] = row['name'];
      _uobj['permission'] = row['permission'];
      _uobj['status'] = row['status'];
      _uobj['mail'] = row['mail'];
      _uobj['date'] = row['date'];
      _uobj['breakpoint'] = row['breakpoint'];

      _responseUser.push(_uobj);
    })

    await controller.dbController.closeDB(data);
  } catch (e) {
    logger.error(e);
    data['error'] = { code: 500 };
  }
  return data;
}
