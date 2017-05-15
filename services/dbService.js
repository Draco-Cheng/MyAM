var Promise = require("promise");
var controller = {
  dbFile: require('../controller/dbFile.js')
};
var fs = require('fs');
var dateFormat = require('dateformat');
// logger is special function so its not in the controller object
var logger = require('../controller/logger.js');
var config = require('../config.js');


exports.dbList = async data => {
  logger.debug(data.reqId, 'Check Database Folder ' + (data['uid'] || 'All') + ' exist or not...');
  let _meta = data['meta'];
  let _responseObj = data['responseObj'];

  _meta['path'] = config.dbFolder + 'users/' + (_meta['uid'] ? _meta['uid'] + '/' : '');

  let _pool = [];

  let _list = await controller.dbFile.readdir(data);
  _list.forEach(ele => {
    ele.isDir && _pool.push(ele.name);
  })
  _responseObj['dbList'] = _pool;

  return data;
}

exports.breackPointDbList = async data => {
  logger.debug(data.reqId, 'Check breackPointDbList Database Folder ' + (data['uid'] || 'All') + ' exist or not...');
  let _meta = data['meta'];
  let _responseObj = data['responseObj'];

  _meta['path'] = config.dbFolder + 'users/' + _meta['uid'] + '/' + _meta['database'] + '/breakpoint/';


  let _pool = [];

  let _list = await controller.dbFile.readdir(data);

  _list.forEach(ele => {
    !ele.isDir && _pool.push(ele.name);
  })
  _responseObj['dbList'] = _pool;

  return data;
}


var _backupDB = function(data, callback) {
  data = data || {};
  logger.debug(data.reqId, "Check Database Folder" + data.dbFileName + " exist or not...");

  controller.dbFile.checkFile({ checkFile: config.dbFolder + data.dbFileName })
    .then(function(_tempData) {
      if (_tempData.fileExists) {
        if (controller.dbFile.createFolderSync(config.backupFolder + data.dbFileName))
          return controller.dbFile.copyFile(config.dbFolder + data.dbFileName, config.backupFolder + data.dbFileName + "/" + dateFormat(Date.now(), "yyyymmdd") + "-bk-" + data.dbFileName);
      }
      callback();
    })
    .then(function(data) { callback(); })
    .catch(console.error);

}
exports.backupDB = Promise.denodeify(_backupDB);


exports.renameDb = async data => {
  let _path = data['meta']['path'];
  let _targetPath = data['meta']['targetPath'];

  logger.debug(data.reqId, "Check Database Folder" + _path + " exist or not...");

  if (!fs.existsSync(_path)) {
    data['error'] = {
      code: 412,
      message: 'DB_NOT_EXIST'
    };
    return data;
  }

  logger.debug(data.reqId, "Check Target Database Folder" + _targetPath + " exist or not...");

  if (fs.existsSync(_targetPath)) {
    data['error'] = {
      code: 409,
      message: 'DB_TARGET_ALREADY_EXIST'
    };
    return data;
  }

  data['meta'] = {
    'source': _path,
    'target': _targetPath
  };

  await controller.dbFile.renameFile(data)

  if (data['resault']) {
    return data;
  } else {
    data['error'] = {
      code: 500
    };
    return data;
  }
}

exports.delDB = async data => {
  logger.debug(data['reqId'], 'Check Database Folder ' + data['dbPath'] + ' exist or not...');

  if (!fs.existsSync(data['dbPath'])) {
    data['error'] = {
      code: 412,
      message: 'DB_NOT_FOUND'
    };
    return data;
  }

  data['meta'] = {
    'delPath': data['dbPath']
  };

  await controller.dbFile.removeFolder(data);

  return data;

  /*
      if (controller.dbFile.createFolderSync(config.backupFolder + data.dbFileName))
      controller.dbFile.copyFile(config.dbFolder + data.dbFileName, config.backupFolder + data.dbFileName + "/" + dateFormat(Date.now(), "yyyymmdd") + "-bk-delete-" + data.dbFileName)
      .then(function() {
        setTimeout(function() {
          controller.dbFile.renameFile(config.backupFolder + data.dbFileName, config.backupFolder + "[legecy-" + Date.now() + "]" + data.dbFileName);
          fs.unlinkSync(config.dbFolder + data.dbFileName);
          callback();
        })
      });
  */
}

exports.delBreakponitDb = async data => {
    logger.debug(data['reqId'], 'Check Breakponit Database ' + data['dbFile'] + ' exist or not...');

    if (!fs.existsSync(data['dbFile'])) {
      data['error'] = {
        code: 412,
        message: 'DB_NOT_FOUND'
      };
      return data;
    }

    data['meta'] = {
      'file': data['dbFile']
    };

    await controller.dbFile.unlinkFile(data);

    return data;
  }
  /*var _downloadDB = function(data, callback) {
    data = data || {};

    if (!fs.existsSync(data.dbFileName)) {
      data.code = 412;
      return callback(data)
    }

    var _fileName = config.uploadTempDir + dateFormat(Date.now(), "yyyymmdd-HHMM") + "-" + data.dbFileName;

    controller.dbFile.copyFile(config.dbFolder + data.dbFileName, _fileName)
      .then(function() {
        data.downloadLink = _fileName.replace("./public/", "/");
        callback(null, data);
        setTimeout(function() {
          fs.unlinkSync(_fileName);
        }, 1000 * 60 * 30)
      });

  }
  exports.downloadDB = Promise.denodeify(_downloadDB);*/

exports.checkPathExist = async data => {
  const _path = data['meta']['path'];

  data['resault'] = !!fs.existsSync(_path);
  return data;

}


//***************************** syncDB *****************************
var _syncTimeout = {};
var _syncList = [];
var _syncDB = function(data) {
  if (_syncList.indexOf(data.dbFileName) == -1)
    _syncList.push(data.dbFileName);
}
exports.syncDB = Promise.denodeify(_syncDB);

process.on('uncaughtException', function(err) { process.exit(); });
process.on('SIGINT', function(err) { process.exit(); });
process.on('SIGHUP', function(err) { process.exit(); });
process.on('exit', function(err) {
  _syncList.forEach(function(dbName) {
    logger.debug("syncDB Database Folder" + dbName + " ...");
    if (fs.existsSync(config.dbFolder + dbName))
      if (controller.dbFile.createFolderSync(config.backupFolder + dbName))
        fs.writeFileSync(config.backupFolder + dbName + "/sync-" + dbName, fs.readFileSync(config.dbFolder + dbName));
  })
});
