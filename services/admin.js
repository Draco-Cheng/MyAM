const config = require('../config.js');

var logger = require('../controller/logger.js');

const controller = {
  dbController: require('../controller/dbController.js'),
  dbFile: require('../controller/dbFile.js'),
  encrypt: require('../controller/crypt.js').encrypt
};

let authCache = {};

exports.getUserPermission = async function(data) {
  try {
    let _targetUid = data['meta']['targetUid'];
    let _responseObj = data['responseObj'];

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
    data['meta'] = { uid: _targetUid };
    await controller.dbController.getUser(data);

    let _resault = data['resault'] ? data['resault'][0] : null;

    data['resault'] = {
      permission: _resault ? _resault['permission'] : null
    };

    await controller.dbController.closeDB(data);

    return data;

  } catch (e) {
    logger.error(e);
    data['error'] = { code: 500 };
  }
  return data;
}

exports.setUser = async function(data) {
  try {

    data['dbFile'] = config['`dbFolder'] + 'sys.db';

    const _meta = data['meta'];
    const _uid = _meta['uid'];

    let _newUserParameter = {};

    // connect databse
    await controller.dbFile.checkDB(data);
    await controller.dbController.connectDB(data);


    ['token', 'permission', 'status'].forEach(key => {
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
