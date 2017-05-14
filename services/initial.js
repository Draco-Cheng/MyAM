var Promise = require("promise");

var controller = {
  dbFile: require('../controller/dbFile.js'),
  dbController: require('../controller/dbController.js')
};

// logger is special function so its not in the controller object
var logger = require("../controller/logger.js");

var config = require("../config.js");

var _checkDB = function(data) {
  return controller.dbFile.checkDB(data);
}
exports.checkDB = _checkDB;

exports.checkAndCreate = async data => {
  try {

    await controller.dbFile.checkDB(data);

    if (data['resault']['isExist']) {
      data['error'] = {
        'code': 409,
        'message': 'DB_NAME_CONFLICT'
      };
    } else {
      data['meta'] = { path: data['dbPath'] };
      await controller.dbFile.createdir(data);
      await controller.dbController.connectDB(data);
      await controller.dbController.initialDatabase(data);
      await controller.dbController.closeDB(data);

      logger.debug(data.reqId, "finish initial Database!!");
    }

    return data;
  } catch (e) {
    console.log(e.stack)
  }
}

exports.uploadDB = async data => {
  try {
    await controller.dbFile.upload(data);

    if (data['error']) return data;

    const _dbName = data['resault']['name'];
    data['dbPath'] = config['dbFolder'] + 'users/' + data['uid'] + '/' + _dbName;
    data['dbFile'] = data['dbPath'] + '/database.db';

    const _tempPath = data['resault']['file']['path'];

    await controller.dbFile.checkDB(data);

    if (data['resault']['isExist']) {
      data['error'] = {
        code: 409,
        message: 'DB_NAME_CONFLICT'
      }

      data['meta'] = { 'deleteFile': _tempPath };
      await controller.dbFile.unlink(data);
      return data;
    }

    data['meta'] = { 'dbFile': _tempPath };

    await controller.dbController.checkDBisCorrect(data);

    let _checkResault = data['resault'];

    if (_checkResault['isCorrect']) {
      controller.dbFile.createFolderSync(data['dbPath']);

      data['meta'] = {};
      data['meta']['source'] = _tempPath;
      data['meta']['target'] = data['dbFile'];

      await controller.dbFile.renameFile(data);

    } else {
      data['error'] = {
        code: 406,
        message: 'DB_CHECK_FAIL'
      };
      data['meta'] = { 'deleteFile': _tempPath };
      await controller.dbFile.unlink(data);
    }

    return data;
  } catch (e) {
    console.error(e);
  }

}
