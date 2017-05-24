var Promise = require("promise");

var controller = {
  dbController: require('../controller/dbController.js'),
  dbFile: require('../controller/dbFile.js')
};

// logger is special function so its not in the controller object
var logger = require("../controller/logger.js");

var _getTypes = function(data, callback) {
  var _checkDB = controller.dbFile.checkDB(data);

  _checkDB.then(function(data) {
      return controller.dbController.connectDB(data);
    })
    .then(function(data) {
      return controller.dbController.getTypes(data);
    })
    .then(function(data) {
      return controller.dbController.closeDB(data);
    })
    .then(function(data) {
      callback(null, data);
    });

  _checkDB.catch(function(data) {
    callback(data)
  });
}
exports.getTypes = Promise.denodeify(_getTypes);

var _setTypes = function(data, callback) {
  var _checkDB = controller.dbFile.checkDB(data);

  _checkDB.then(function(data) {
      return controller.dbController.connectDB(data);
    })
    .then(function(data) {
      if (data.tid)
        return controller.dbController.getTypes(data);
      else
        return new Promise(function(resolve, reject) { resolve(data) });
    })
    .then(function(data) {
      if (data.tid && data.resault.push().length === 0)
        return new Promise(function(resolve, reject) { resolve(data) });
      else
        return controller.dbController.setTypes(data);
    })
    .then(function(data) {
      return controller.dbController.closeDB(data);
    })
    .then(function(data) {
      callback(null, data);
    });

  _checkDB.catch(function(data) {
    callback(data)
  });
}
exports.setTypes = Promise.denodeify(_setTypes);

exports.delTypes = async data => {
  try {

    let _delTid = data['meta']['del_tid'];

    await controller.dbFile.checkDB(data);
    await controller.dbController.connectDB(data);

    //*****************************
    // check record dependency
    const _tempData = {
      db: data.db,
      reqId: data.reqId,
      tid: _delTid,
      limit: 1
    }

    await controller.dbController.getRecordTypeMap(_tempData);
    if (_tempData.resault.length) {
      data['error'] = {
        code: 424,
        message: 'RECORD_DEPENDENCIES'
      };
      return data;
    }

    //*****************************
    // unlink tid in TypeMaps
    data['meta'] = { del_tid: _delTid };
    await controller.dbController.delTypeMaps(data)


    await controller.dbController.delTypes(data);
    await controller.dbController.closeDB(data);

    return data;


  } catch (e) { logger.error(data.reqId, e.stack) }
}

exports.delTypeMaps = async function(data, callback) {
  try {
    await controller.dbFile.checkDB(data);
    await controller.dbController.connectDB(data);
    await controller.dbController.delTypeMaps(data);
    await controller.dbController.closeDB(data);
  } catch (e) {
    logger.error(e);
    data['error'] = { code: 500 };
  }
  return data;
}

var _getTypeMaps = function(data, callback) {
  var _checkDB = controller.dbFile.checkDB(data);

  _checkDB.then(function(data) {
      return controller.dbController.connectDB(data);
    })
    .then(function(data) {
      return controller.dbController.getTypeMaps(data);
    })
    .then(function(data) {
      return controller.dbController.closeDB(data);
    })
    .then(function(data) {
      callback(null, data);
    });

  _checkDB.catch(function(data) {
    callback(data)
  });
}
exports.getTypeMaps = Promise.denodeify(_getTypeMaps);

var _setTypeMaps = function(data, callback) {
  var _checkDB = controller.dbFile.checkDB(data);

  _checkDB.then(function(data) {
      return controller.dbController.connectDB(data);
    })
    .then(function(data) {
      return controller.dbController.getTypeMaps(data);
    })
    .then(function(data) {
      if (data['resault'].length === 0 && data.tid !== data.sub_tid)
        return controller.dbController.setTypeMaps(data);
      else
        return new Promise(function(resolve, reject) { resolve(data) });
    })
    .then(function(data) {
      return controller.dbController.closeDB(data);
    })
    .then(function(data) {
      callback(null, data);
    });

  _checkDB.catch(function(data) {
    callback(data)
  });
}
exports.setTypeMaps = Promise.denodeify(_setTypeMaps);
