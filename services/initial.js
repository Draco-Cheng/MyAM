var Promise = require("promise");

var controller = {
  dbFile: require('../controller/dbFile.js'),
  dbController: require('../controller/dbController.js')
};

// logger is special function so its not in the controller object
var logger = require("../controller/logger.js");

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
    console.error(e.stack)
  }
}

var _uploadDB = function(data, callback) {
  controller.dbFile.upload(data)
    .then(function(data) {
      return controller.dbController.checkDBisCorrect(data);
    })
    .then(function(data) { callback(null, data); })
    .catch(function(err) {
      logger.error(data.reqId, err);
      callback(null, data);
    });
}
exports.uploadDB = Promise.denodeify(_uploadDB);
